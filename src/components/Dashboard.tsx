import { useState, useEffect, MouseEvent } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Menu } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import logoImage from "../assets/Logo.png";
import { getRecentSheetsWithMeta, formatDate, deleteSpreadsheet, type SpreadsheetData } from "../utils/spreadsheetStorage";
import { importFile } from "../services/importService";
import { generateTemplate } from "../services/templateService";
import { trackActivity } from "../utils/notificationSystem";
import { cleanupIPFSSnapshotBackups, evictStaleData } from "../utils/storageManager";
import { NotificationCenter } from "./NotificationCenter";
import { ProfileMenu } from "./ProfileMenu";
import { TemplatePickerDialog } from "./TemplatePickerDialog";
import { CollaborationPanel } from "./CollaborationPanel";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { PinnedTemplatesRow } from "./PinnedTemplatesRow";
import { SidebarNav } from "./SidebarNav";
import { SearchSortBar } from "./SearchSortBar";

interface DashboardProps {
  userName: string;
  userEmail: string;
  userPhone?: string;
  onNewSheet: () => void;
  onLoadTemplates: (templateData: any) => void;
  onImportFile?: (data: any) => void;
  onOpenSheet?: (sheetId: string) => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  onUpdateProfile?: (name: string, email: string, phone: string) => void;
}

export function Dashboard({
  userName,
  userEmail,
  userPhone,
  onNewSheet,
  onLoadTemplates,
  onImportFile,
  onOpenSheet,
  onOpenSettings,
  onLogout,
  onUpdateProfile,
}: DashboardProps) {
  const [recentSheets, setRecentSheets] = useState<Array<SpreadsheetData & { wasEdited?: boolean; wasReopened?: boolean; wasShared?: boolean }>>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [collaborationPanelOpen, setCollaborationPanelOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'recent' | 'name' | 'edited'>('recent');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  useEffect(() => {
    // Always apply dark mode
    document.documentElement.classList.add('dark');
    // Clean up accumulated junk from previous sessions to free storage quota
    cleanupIPFSSnapshotBackups();
    evictStaleData(512 * 1024); // Try to keep at least 512KB free
  }, []);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`favoriteTemplates:${userEmail}`);
    if (stored) {
      try {
        setFavoriteTemplateIds(new Set(JSON.parse(stored) as string[]));
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    }
  }, [userEmail]);

  // Save favorites to localStorage when they change
  const updateFavorites = (newFavorites: Set<string>) => {
    setFavoriteTemplateIds(newFavorites);
    localStorage.setItem(`favoriteTemplates:${userEmail}`, JSON.stringify(Array.from(newFavorites)));
  };

  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set<string>(favoriteTemplateIds);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    updateFavorites(newFavorites);
  };

  // Load recent sheets — refresh every time the dashboard mounts so timestamps are accurate
  useEffect(() => {
    const refresh = () => {
      const sheets = getRecentSheetsWithMeta(userEmail);
      setRecentSheets(sheets);
    };
    refresh();
    // Also listen for a custom event fired when the user saves and navigates back
    window.addEventListener('recentSheetsUpdated', refresh);
    // Poll every 5 seconds so any changes made in the editor are reflected promptly
    const interval = setInterval(refresh, 5000);
    return () => {
      window.removeEventListener('recentSheetsUpdated', refresh);
      clearInterval(interval);
    };
  }, [userEmail]);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<string | null>(null);

  const handleDeleteSheet = (e: MouseEvent, sheetId: string) => {
    e.stopPropagation();
    setSheetToDelete(sheetId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteSheet = () => {
    if (sheetToDelete) {
      const sheet = recentSheets.find(s => s.documentId === sheetToDelete);
      deleteSpreadsheet(sheetToDelete, userEmail);
      setRecentSheets(getRecentSheetsWithMeta(userEmail));
      // Track delete activity
      if (sheet) {
        trackActivity(userEmail, 'delete', sheetToDelete, sheet.metadata.title);
      }
      setSheetToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleOpenSheet = (sheetId: string) => {
    if (onOpenSheet) {
      const sheet = recentSheets.find(s => s.documentId === sheetId);
      onOpenSheet(sheetId);
      // Track open activity
      if (sheet) {
        trackActivity(userEmail, 'open', sheetId, sheet.metadata.title);
      }
    }
  };

  const handleFilterToggle = (filter: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveFilters(newFilters);
  };

  const getFilteredSheets = () => {
    let filtered = recentSheets;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sheet =>
        sheet.metadata.title.toLowerCase().includes(query)
      );
    }

    // Apply status filters (keys match the button labels from SearchSortBar)
    if (activeFilters.size > 0) {
      filtered = filtered.filter(sheet => {
        if (activeFilters.has('Edited') && !sheet.wasEdited) return false;
        if (activeFilters.has('Reopened') && !sheet.wasReopened) return false;
        if (activeFilters.has('Shared') && !sheet.wasShared) return false;
        return true;
      });
    }

    // Apply sorting
    const sorted = [...filtered];
    if (sortOption === 'name') {
      sorted.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));
    } else if (sortOption === 'edited') {
      sorted.sort((a, b) => new Date(b.metadata.updatedAt || 0).getTime() - new Date(a.metadata.updatedAt || 0).getTime());
    } else {
      // 'recent' - already sorted from storage
      sorted.sort((a, b) => new Date(b.metadata.updatedAt || 0).getTime() - new Date(a.metadata.updatedAt || 0).getTime());
    }

    return sorted;
  };

  const handleTemplateSelect = (templateData: any) => {
    if (onLoadTemplates) {
      onLoadTemplates(templateData);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      // Import dynamically or assume it is available if I add the import at top
      // But I need to add import at top first.
      const templateData = await generateTemplate(templateId);
      handleTemplateSelect(templateData);
    } catch (error) {
      console.error("Failed to load template:", error);
    }
  };

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xls,.xlsx';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        // Use the same importService as the spreadsheet editor — supports CSV and XLSX with full formatting
        const documentState = await importFile(file, userEmail);
        if (onImportFile) {
          onImportFile(documentState);
        }
      } catch (error) {
        console.error('❌ Import failed:', error);
        alert(`Import failed: ${error instanceof Error ? error.message : 'Unsupported file type. Please use .csv, .xls, or .xlsx'}`);
      }
    };
    input.click();
  };
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg)', color: 'var(--text)', transition: 'background-color 0.25s, color 0.25s' }}>
      {/* Left Sidebar - Desktop */}
      <div className="hidden lg:flex lg:w-64 flex-shrink-0" style={{ background: 'var(--surface)', borderRight: '2px solid rgba(255, 207, 64, 0.3)', boxShadow: 'var(--shadow)', transition: 'background-color 0.25s, border-color 0.25s, box-shadow 0.25s' }}>
        <SidebarNav activeItem={activeSidebarItem} onNavigate={setActiveSidebarItem} isDarkMode={true} />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)', transition: 'background-color 0.25s' }}>
        {/* Top Navigation Bar */}
        <div className="dashboard-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '80px',
          maxHeight: '80px',
          padding: '0 1.5rem',
          borderBottom: '1px solid rgba(255, 207, 64, 0.3)',
          background: 'var(--surface)',
          zIndex: 50,
          transition: 'background-color 0.25s, border-color 0.25s',
        }}>
          {/* Logo Wrapper */}
          <div className="logo-wrapper" style={{ display: 'flex', alignItems: 'center', height: '100%', marginLeft: '-12px' }}>
            <img
              src={logoImage}
              alt="Logo"
              style={{ height: '40px', width: 'auto', objectFit: 'contain', maxHeight: '64px' }}
            />
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 99998 }}>
            {/* Notification Center */}
            <div style={{ position: 'relative', zIndex: 99998 }}>
              <NotificationCenter userEmail={userEmail} isDarkMode={true} />
            </div>

            {/* Profile Menu */}
            <div style={{ position: 'relative', zIndex: 99998 }}>
              <ProfileMenu
                userName={userName}
                userEmail={userEmail}
                userPhone={userPhone}
                isDarkMode={true}
                onOpenSettings={() => onOpenSettings?.()}
                onOpenMySheets={() => {
                  const element = document.getElementById('recent-sheets-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                onOpenCollaboration={() => setCollaborationPanelOpen(true)}
                onLogout={() => onLogout?.()}
              />
            </div>

            {/* Hamburger Menu for Right Sidebar */}
            <Button
              variant="ghost"
              className="header-icon-button relative h-12 w-12 rounded-full p-0 transition-all duration-300"
              style={{
                border: "2px solid #4b5563",
              }}
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            >
              <div
                className="h-full w-full rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                }}
              >
                <Menu size={24} style={{ color: '#fbbf24' }} />
              </div>
            </Button>
          </div>
        </div>

        {/* Main Content Scroll Area with Right Panel */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          gap: '0',
          background: 'var(--bg)',
          transition: 'background-color 0.25s',
        }}>
          {/* Center Content Container */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'var(--bg)',
            transition: 'background-color 0.25s',
          }}>
            {/* Center Content Inner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                padding: '2rem 1.5rem',
                backgroundColor: '#0a0a0a',
                width: '100%',
              }}
            >
              {/* Welcome Header */}
              <div style={{ marginBottom: '3rem', position: 'relative' }}>
                {/* Semicircle Glow Effect */}
                <div style={{
                  position: 'absolute',
                  top: '-60px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80%',
                  height: '120px',
                  background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 207, 64, 0.15) 0%, transparent 50%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }} />
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                    margin: 0,
                    marginBottom: '0.5rem',
                    transition: 'color 0.25s',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Welcome back, {userName}!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    fontSize: '1rem',
                    color: 'var(--muted)',
                    margin: 0,
                    transition: 'color 0.25s',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  What would you like to work on today?
                </motion.p>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" style={{
                display: 'grid',
                gap: '1.5rem',
                marginBottom: '3rem',
              }}>
                <motion.div
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={onNewSheet}
                  style={{
                    padding: '2rem',
                    borderRadius: '1rem',
                    background: 'var(--surface)',
                    border: '2px solid rgba(255, 207, 64, 0.3)',
                    boxShadow: 'var(--shadow)',
                    cursor: 'pointer',
                    transition: 'background-color 0.25s, border-color 0.25s, box-shadow 0.25s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 207, 64, 0.6), 0 0 40px rgba(255, 207, 64, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow)';
                    e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.3)';
                  }}
                >
                  <img src="/icons/3d/plus.svg" alt="New Spreadsheet" className="dashboard-icon" />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)', margin: 0, marginBottom: '0.5rem', transition: 'color 0.25s' }}>
                    New Spreadsheet
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0, marginBottom: '1rem', transition: 'color 0.25s' }}>
                    Start with a blank sheet
                  </p>
                  <Button style={{ width: '100%' }}>Create New</Button>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setTemplateDialogOpen(true)}
                  style={{
                    padding: '2rem',
                    borderRadius: '1rem',
                    background: 'var(--surface)',
                    border: '2px solid rgba(255, 207, 64, 0.3)',
                    boxShadow: 'var(--shadow)',
                    cursor: 'pointer',
                    transition: 'background-color 0.25s, border-color 0.25s, box-shadow 0.25s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 207, 64, 0.6), 0 0 40px rgba(255, 207, 64, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow)';
                    e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.3)';
                  }}
                >
                  <img src="/icons/3d/sparkles.svg" alt="Use Templates" className="dashboard-icon" />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)', margin: 0, marginBottom: '0.5rem', transition: 'color 0.25s' }}>
                    Use Templates
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0, marginBottom: '1rem', transition: 'color 0.25s' }}>
                    Budget, tracking & more
                  </p>
                  <Button style={{ width: '100%' }}>Browse Templates</Button>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleImportFile}
                  style={{
                    padding: '2rem',
                    borderRadius: '1rem',
                    background: 'var(--surface)',
                    border: '2px solid rgba(255, 207, 64, 0.3)',
                    boxShadow: 'var(--shadow)',
                    cursor: 'pointer',
                    transition: 'background-color 0.25s, border-color 0.25s, box-shadow 0.25s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 207, 64, 0.6), 0 0 40px rgba(255, 207, 64, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow)';
                    e.currentTarget.style.borderColor = 'rgba(255, 207, 64, 0.3)';
                  }}
                >
                  <img src="/icons/3d/upload.svg" alt="Import File" className="dashboard-icon" />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)', margin: 0, marginBottom: '0.5rem', transition: 'color 0.25s' }}>
                    Import File
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0, marginBottom: '1rem', transition: 'color 0.25s' }}>
                    Upload CSV or Excel
                  </p>
                  <Button style={{ width: '100%' }}>Import File</Button>
                </motion.div>
              </div>

              {/* Pinned Templates */}
              <PinnedTemplatesRow
                onUseTemplate={handleUseTemplate}
                onViewAll={() => setTemplateDialogOpen(true)}
                favoriteTemplateIds={favoriteTemplateIds}
                onToggleFavorite={toggleFavorite}
              />

              {/* Search & Sort Bar */}
              <SearchSortBar
                onSearch={setSearchQuery}
                onSort={setSortOption}
                onFilterToggle={handleFilterToggle}
                activeFilters={activeFilters}
                isDarkMode={true}
              />

              {/* Recent Sheets */}
              {getFilteredSheets().length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{ marginTop: '3rem' }}
                >
                  <div
                    id="recent-sheets-section"
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', scrollMarginTop: '100px' }}
                  >
                    <img src="/icons/3d/clock.svg" alt="Recent" className="dashboard-icon" style={{ width: '32px', height: '32px', marginBottom: 0 }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#F0A500', margin: 0 }}>
                      Recent Spreadsheets
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#F0A500',
                      background: 'rgba(255, 207, 64, 0.1)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                    }}>
                      {getFilteredSheets().length}
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem',
                  }}>
                    {getFilteredSheets().map((sheet, index) => (
                      <motion.div
                        key={sheet.documentId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        onClick={() => handleOpenSheet(sheet.documentId)}
                        style={{
                          padding: '1.5rem',
                          borderRadius: '1rem',
                          background: 'rgba(255, 207, 64, 0.05)',
                          border: '1px solid rgba(255, 207, 64, 0.15)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.borderColor = 'rgba(255, 207, 64, 0.4)';
                          el.style.background = 'rgba(255, 207, 64, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.borderColor = 'rgba(255, 207, 64, 0.15)';
                          el.style.background = 'rgba(255, 207, 64, 0.05)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#F0A500', margin: 0 }}>
                              {sheet.metadata.title}
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '0.25rem 0 0 0' }}>
                              {formatDate(sheet.metadata.updatedAt || new Date().toISOString())}
                            </p>
                            {(sheet.wasEdited || sheet.wasReopened || sheet.wasShared) && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                                {sheet.wasEdited && (
                                  <span style={{
                                    fontSize: '0.65rem', fontWeight: 700,
                                    padding: '0.15rem 0.4rem',
                                    background: 'rgba(255, 207, 64, 0.15)',
                                    border: '1px solid rgba(255, 207, 64, 0.4)',
                                    color: '#FFCF40',
                                    letterSpacing: '0.04em',
                                  }}>EDITED</span>
                                )}
                                {sheet.wasReopened && (
                                  <span style={{
                                    fontSize: '0.65rem', fontWeight: 700,
                                    padding: '0.15rem 0.4rem',
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    border: '1px solid rgba(59, 130, 246, 0.4)',
                                    color: '#60a5fa',
                                    letterSpacing: '0.04em',
                                  }}>REOPENED</span>
                                )}
                                {sheet.wasShared && (
                                  <span style={{
                                    fontSize: '0.65rem', fontWeight: 700,
                                    padding: '0.15rem 0.4rem',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    color: '#34d399',
                                    letterSpacing: '0.04em',
                                  }}>SHARED</span>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSheet(e as any, sheet.documentId);
                            }}
                            style={{
                              background: 'rgba(255, 59, 48, 0.25)',
                              border: 'none',
                              borderRadius: '0.375rem',
                              color: '#FF3B30',
                              cursor: 'pointer',
                              padding: '0.375rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.2s',
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 59, 48, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 59, 48, 0.25)';
                            }}
                          >
                            <img src="/icons/3d/trash.svg" alt="Delete" style={{ width: '20px', height: '20px' }} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Features Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: '3rem' }}
              >
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#F0A500', margin: '0 0 1.5rem 0' }}>
                  Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{
                  display: 'grid',
                  gap: '1rem',
                }}>
                  {[
                    'Advanced Formulas',
                    'Conditional Formatting',
                    'Export/Import',
                    'Auto-Save',
                    'Keyboard Shortcuts',
                    'Data Validation',
                  ].map((feature, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '1rem',
                        borderRadius: '1rem',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 207, 64, 0.2)',
                        background: 'rgba(255, 207, 64, 0.05)',
                        color: '#F0A500',
                      }}
                    >
                      <p style={{ fontSize: '0.875rem', color: '#F0A500', margin: 0, fontWeight: 500 }}>{feature}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Empty State */}
              {getFilteredSheets().length === 0 && recentSheets.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    borderRadius: '1rem',
                    border: '2px dashed rgba(255, 207, 64, 0.2)',
                    marginTop: '3rem',
                  }}
                >
                  <img src="/icons/3d/file-spreadsheet.svg" alt="No sheets" style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#F0A500', margin: 0, marginBottom: '0.5rem' }}>
                    No recent sheets yet
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
                    Create a new spreadsheet or import a file to get started
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Quick Actions Panel - Slide-out Sidebar */}
          {rightSidebarOpen && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setRightSidebarOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 99990,
                }}
              />

              {/* Sidebar */}
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: '1px solid rgba(255, 207, 64, 0.1)',
                  backgroundColor: '#0a0a0a',
                  zIndex: 99991,
                  boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)',
                  padding: '1.25rem',
                }}
              >
                <QuickActionsPanel
                  onNewSheet={onNewSheet}
                  onImport={handleImportFile}
                  onBrowseTemplates={() => setTemplateDialogOpen(true)}
                  onClose={() => setRightSidebarOpen(false)}
                  recentSheetCount={recentSheets.length}
                  favoriteTemplateIds={favoriteTemplateIds}
                  onUseTemplate={handleUseTemplate}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Template Picker Dialog */}
      <TemplatePickerDialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        isDarkMode={true}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent style={{
          background: '#000000',
          border: '2px solid rgba(255, 207, 64, 0.3)',
          color: '#FFFFFF'
        }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#FFCF40' }}>Delete Spreadsheet?</DialogTitle>
            <DialogDescription style={{ color: '#CCCCCC' }}>
              Are you sure you want to delete this spreadsheet? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} style={{
              borderColor: 'rgba(255, 207, 64, 0.5)',
              color: '#000000',
              background: '#FFCF40',
              fontWeight: 'bold',
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSheet} style={{
              background: '#FF3B30',
              color: '#FFFFFF',
              border: 'none'
            }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collaboration Panel */}
      <CollaborationPanel
        isOpen={collaborationPanelOpen}
        onClose={() => setCollaborationPanelOpen(false)}
        userEmail={userEmail}
        isDarkMode={true}
      />
    </div>
  );
}
