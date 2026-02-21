import React, { useState, useEffect, useRef } from 'react';
import { Header } from './Header';
import { RibbonTabs } from './RibbonTabs-new';
import { HomeTab } from './ribbon/HomeTab';
import { InsertTab } from './ribbon/InsertTab';
import { HelpTab } from './ribbon/HelpTab';
import { FormulaBar } from './FormulaBar';
import { SpreadsheetGrid } from './SpreadsheetGrid';
import { SheetTabsBar } from './SheetTabsBar';
import { WelcomeModal } from './WelcomeModal';
import { GuidedTour } from './GuidedTour';
import { GamesHub } from './GamesHub';
import { SpreadsheetProvider, useSpreadsheet } from '../contexts/SpreadsheetContext';
import { UndoRedoProvider } from '../contexts/UndoRedoContext';
import { ClipboardProvider } from '../contexts/ClipboardContext';
import { CollaborationProvider } from '../contexts/CollaborationContext';
import { User } from '../types/spreadsheet';
import { trackActivity } from '../utils/notificationSystem';
import { clearSheetStorage, generateSheetUUID, initializeBlankSheet } from '../utils/sheetStorageManager';
// ✅ NEW: Import sync hook to keep documentState in sync with SpreadsheetContext
import { useSpreadsheetDocumentSync } from '../hooks/useSpreadsheetDocumentSync';
import { DocumentProvider, useDocumentState } from '../contexts/DocumentStateContext';
import { saveSpreadsheet } from '../utils/spreadsheetStorage';

function ExcelContent({
  activeTab,
  setActiveTab,
  spreadsheetId = 'default',
  spreadsheetTitle = 'Untitled',
  onTitleChange = () => { },
  user,
  userPermission = 'editor',
  onSpreadsheetIdChange = () => { },
  initialSheets,
  initialActiveSheetId,
  hasInitialData = false
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  spreadsheetId?: string;
  spreadsheetTitle?: string;
  onTitleChange?: (title: string) => void;
  user: User;
  userPermission?: 'editor' | 'viewer';
  onSpreadsheetIdChange?: (id: string) => void;
  initialSheets?: Array<{ id: string, name: string }>;
  initialActiveSheetId?: string;
  hasInitialData?: boolean;
}) {
  const { showFormulaBar, cellData, cellFormats } = useSpreadsheet();

  // ✅ NEW: Sync SpreadsheetContext with DocumentState
  // This ensures ALL changes (cells, images, shapes, charts) are captured in documentState
  const { state: documentState, documentReady, setActiveSheet } = useSpreadsheetDocumentSync();

  // Keep a ref to the latest document state for use in cleanup (save-on-unmount)
  const documentStateRef = useRef<any>(null);
  const spreadsheetIdRef = useRef<string>(spreadsheetId);
  const spreadsheetTitleRef = useRef<string>(spreadsheetTitle);
  const userEmailRef = useRef<string | undefined>(user?.email);

  useEffect(() => { documentStateRef.current = documentState; }, [documentState]);
  useEffect(() => { spreadsheetIdRef.current = spreadsheetId; }, [spreadsheetId]);
  useEffect(() => { spreadsheetTitleRef.current = spreadsheetTitle; }, [spreadsheetTitle]);
  useEffect(() => { userEmailRef.current = user?.email; }, [user?.email]);

  // Helper to perform a save with the latest state
  const performSave = (docState: any) => {
    const id = spreadsheetIdRef.current;
    const title = spreadsheetTitleRef.current;
    const email = userEmailRef.current;
    if (!email || !id || !docState) return;
    try {
      const dataToSave = {
        ...docState,
        documentId: id,
        metadata: {
          ...docState.metadata,
          owner: email,
          title,
          updatedAt: new Date().toISOString()
        }
      };
      saveSpreadsheet(dataToSave);
    } catch (error) {
      console.error('❌ Save failed:', error);
    }
  };

  // ✅ AUTO-SAVE: Periodically save spreadsheet to localStorage
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      // Only save if we have a valid user and document is ready
      if (user?.email && spreadsheetId && documentReady && documentState) {
        const cellCount = documentState.sheets.reduce((acc: number, sheet: any) => acc + Object.keys(sheet.cells || {}).length, 0);
        const imageCount = documentState.sheets.reduce((acc: number, sheet: any) => acc + (sheet.images || []).length, 0);
        const shapeCount = documentState.sheets.reduce((acc: number, sheet: any) => acc + (sheet.shapes || []).length, 0);
        performSave(documentState);
        console.log('⏱️ Auto-saved spreadsheet:', spreadsheetTitle, 'Cells:', cellCount, 'Images:', imageCount, 'Shapes:', shapeCount);
      }
    }, 5000); // Save every 5 seconds

    // ✅ SAVE-ON-UNMOUNT: Save immediately when navigating away from the spreadsheet
    return () => {
      clearInterval(autoSaveInterval);
      const latestState = documentStateRef.current;
      if (latestState && userEmailRef.current && spreadsheetIdRef.current) {
        console.log('💾 Saving on unmount before navigation...');
        performSave(latestState);
      }
    };
  }, [user?.email, spreadsheetId, spreadsheetTitle, documentState, documentReady]);

  const [sheets, setSheets] = useState(() => initialSheets || [
    { id: generateSheetUUID(), name: 'Sheet1' }
  ]);
  const [activeSheetId, setActiveSheetId] = useState(() => initialActiveSheetId || sheets[0].id);

  // Log document state readiness
  useEffect(() => {
    if (documentReady) {
      console.log('✅ DocumentState is ready and synced with SpreadsheetContext');
      console.log('📊 Current document structure:', {
        sheets: documentState.sheets.length,
        cells: Object.keys(documentState.sheets[0]?.cells || {}).length,
        images: documentState.sheets[0]?.images?.length || 0,
        shapes: documentState.sheets[0]?.shapes?.length || 0,
        charts: documentState.sheets[0]?.charts?.length || 0
      });
    }
  }, [documentReady, documentState]);

  // Sync active sheet ID globally whenever it changes
  // NOTE: We intentionally do NOT sync documentId back to spreadsheetId here.
  // Doing so would change the `key` on SpreadsheetProvider and cause a full remount (= flicker).
  // SpreadsheetProvider reads from DocumentState directly, so remounting it is unnecessary.
  useEffect(() => {
    if (documentState && documentState.sheets.length > 0) {
      // Sync active sheet if different
      if (documentState.activeSheetId && documentState.activeSheetId !== activeSheetId) {
        setActiveSheetId(documentState.activeSheetId);
        (window as any).__activeSheetId = documentState.activeSheetId;
      }

      // Sync sheets list if different
      const docSheets = documentState.sheets.map((s: any) => ({ id: s.sheetId, name: s.name }));
      const uiSheetsJson = JSON.stringify(sheets);
      const docSheetsJson = JSON.stringify(docSheets);

      if (uiSheetsJson !== docSheetsJson) {
        setSheets(docSheets);
        if (!docSheets.some((s: any) => s.id === activeSheetId)) {
          setActiveSheetId(documentState.activeSheetId || docSheets[0].id);
        }
      }
    }
  }, [documentState]);

  // Initialize the first sheet with empty data ONLY for blank sheets
  // Skip this for templates and imported documents to avoid overwriting their data
  useEffect(() => {
    if (!hasInitialData) {
      initializeBlankSheet(sheets[0].id);
    }
  }, []); // Run once on mount

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab isDarkMode={false} />;
      case 'insert':
        return <InsertTab />;
      case 'help':
        return <HelpTab isDarkMode={false} userId={user?.email || 'guest'} spreadsheetId={spreadsheetId} />;
      default:
        return <HomeTab isDarkMode={false} />;
    }
  };

  const handleAddSheet = () => {
    // Generate new UUID for the sheet
    const newSheetUUID = generateSheetUUID();
    const newSheetNumber = sheets.length + 1;
    const newSheet = {
      id: newSheetUUID, // Use UUID instead of simple counter
      name: `Sheet${newSheetNumber}`
    };

    // Initialize blank sheet with explicit empty data immediately
    initializeBlankSheet(newSheetUUID);

    setSheets([...sheets, newSheet]);
    setActiveSheetId(newSheet.id); // Set as active - this triggers load of empty data

    console.log(`\ud83c\udd95 Created new blank sheet: ${newSheetUUID}`);
  };

  const handleRenameSheet = (sheetId: string, newName: string) => {
    setSheets(sheets.map(sheet =>
      sheet.id === sheetId ? { ...sheet, name: newName } : sheet
    ));
  };

  // Update global activeSheetId whenever it changes for SpreadsheetGrid
  useEffect(() => {
    (window as any).__activeSheetId = activeSheetId;
    console.log(`🔄 Active sheet changed to: ${activeSheetId}`);
  }, [activeSheetId]);

  // Hydration of pending template data is now handled synchronously in ExcelSpreadsheet constructor 
  // to prevent flicker. The redundant useEffect has been removed.
  // IDs and initial data are passed as props to ensure consistent first render.

  return (
    <div
      className="h-screen flex flex-col bg-gray-50"
      style={{
        transform: 'scale(1.5)',
        transformOrigin: 'top left',
        width: '66.67%',
        height: '66.67%',
        position: 'relative'
      }}
    >
      <Header
        spreadsheetId={spreadsheetId}
        spreadsheetTitle={spreadsheetTitle}
        onTitleChange={onTitleChange}
      />
      <RibbonTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ribbon-tabs border-b border-gray-300 bg-white">
        {renderTabContent()}
      </div>
      {showFormulaBar && <FormulaBar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <SpreadsheetGrid />
        </div>
      </div>
    </div>
  );
}

interface ExcelSpreadsheetProps {
  user: User;
  onLogout: () => void;
  onBackToHome: () => void;
  importedData?: any;
  templateData?: any;
  currentSpreadsheet?: any;
  canEdit?: boolean;
}

export function ExcelSpreadsheet({ user, onLogout, onBackToHome, importedData, templateData: templateDataProp, currentSpreadsheet, canEdit = true }: ExcelSpreadsheetProps) {
  const [activeTab, setActiveTab] = useState<string>('home');
  // Generate a unique ID that changes when currentSpreadsheet changes
  // Support both DocumentState format (.documentId) and legacy format (.id)
  const [spreadsheetId, setSpreadsheetId] = useState(() => {
    if (currentSpreadsheet?.documentId) return currentSpreadsheet.documentId;
    if (currentSpreadsheet?.id) return currentSpreadsheet.id;
    if (importedData?.documentId) return importedData.documentId;
    if (templateDataProp?.template?.id) return `sheet_template_${templateDataProp.template.id}_${Date.now()}`;
    return `sheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  const [spreadsheetTitle, setSpreadsheetTitle] = useState(() => {
    if (currentSpreadsheet?.metadata?.title) return currentSpreadsheet.metadata.title;
    if (currentSpreadsheet?.title) return currentSpreadsheet.title;
    if (importedData?.metadata?.title) return importedData.metadata.title;
    if (templateDataProp?.template?.name) return templateDataProp.template.name;
    return "Untitled";
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [showGamesHub, setShowGamesHub] = useState(false);

  // Determine if this is a new blank spreadsheet (no data and titled "Untitled")
  // currentSpreadsheet is now a DocumentState (has .sheets), not the old format (.cellData)
  const currentSpreadsheetIsDocState = currentSpreadsheet?.sheets && Array.isArray(currentSpreadsheet.sheets);
  const currentSpreadsheetHasData = currentSpreadsheetIsDocState
    ? currentSpreadsheet.sheets.some((s: any) =>
      Object.keys(s.cells || {}).length > 0 ||
      (s.images || []).length > 0 ||
      (s.shapes || []).length > 0 ||
      (s.charts || []).length > 0
    )
    : !!(currentSpreadsheet?.cellData && Object.keys(currentSpreadsheet.cellData).length > 0);

  const isNewBlankSpreadsheet = currentSpreadsheet &&
    (currentSpreadsheet.metadata?.title || currentSpreadsheet.title) === "Untitled" &&
    !currentSpreadsheetHasData &&
    !importedData &&
    canEdit === true; // If canEdit is false, it's from a collab link, not a new sheet

  // Initialize data immediately based on the spreadsheet type
  let derivedInitialData: any = {};
  let derivedInitialDocument: any = undefined;
  let initialSheets = [{ id: 'sheet-1', name: 'Sheet1' }];
  let initialActiveSheetId = 'sheet-1';

  if (!isNewBlankSpreadsheet) {
    if (currentSpreadsheetIsDocState) {
      // ✅ NEW: currentSpreadsheet IS a DocumentState — use it directly as the initial document
      // This restores ALL data: cells, formatting, images, shapes, charts
      derivedInitialDocument = currentSpreadsheet;
      derivedInitialData = {};
      initialSheets = currentSpreadsheet.sheets.map((s: any) => ({ id: s.sheetId, name: s.name }));
      initialActiveSheetId = currentSpreadsheet.activeSheetId || initialSheets[0].id;
    } else if (currentSpreadsheet?.cellData) {
      // Legacy format fallback
      derivedInitialData = currentSpreadsheet.cellData;
    } else if (importedData) {
      // Check if it's a DocumentState (has sheets array)
      if (importedData.sheets && Array.isArray(importedData.sheets) && importedData.sheets.length > 0) {
        derivedInitialDocument = importedData;
        derivedInitialData = {};
        initialSheets = importedData.sheets.map((s: any) => ({ id: s.sheetId, name: s.name }));
        initialActiveSheetId = importedData.activeSheetId || initialSheets[0].id;
      } else {
        derivedInitialData = importedData;
      }
    }
  }

  // ✅ Template Hydration: read from prop (passed via React state, no localStorage needed)
  const pendingTemplate = templateDataProp;
  if (pendingTemplate) {
    const templateData = pendingTemplate;
    console.log('🚀 Synchronously hydrating template data during initialization:', templateData?.template?.name);

    const tempId = spreadsheetId;
    const tempTitle = templateData?.template?.name || spreadsheetTitle;

    const mappedCells: Record<string, any> = {};
    const flatCellData: Record<string, string> = {};

    if (templateData.cells) {
      Object.entries(templateData.cells).forEach(([key, cell]: [string, any]) => {
        if (typeof cell === 'string') {
          mappedCells[key] = { value: cell };
          flatCellData[key] = cell;
        } else if (cell !== null && typeof cell === 'object') {
          const style: any = {};
          if (cell.bold) style.bold = true;
          if (cell.italic) style.italic = true;
          if (cell.underline) style.underline = true;
          if (cell.color) style.color = cell.color;
          if (cell.backgroundColor) style.backgroundColor = cell.backgroundColor;
          if (cell.fontSize) style.fontSize = cell.fontSize;
          if (cell.fontFamily) style.fontFamily = cell.fontFamily;
          if (cell.textAlign) style.alignment = { horizontal: cell.textAlign };

          const val = 'value' in cell ? String(cell.value) : '';
          mappedCells[key] = { value: val, style: Object.keys(style).length > 0 ? style : undefined };
          flatCellData[key] = val;
        }
      });
    }

    derivedInitialDocument = {
      documentId: tempId,
      activeSheetId: 'sheet-1',
      metadata: {
        title: tempTitle,
        owner: user?.email || 'guest',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        theme: 'light',
        sheetCount: 1
      },
      sheets: [{
        sheetId: 'sheet-1',
        name: 'Sheet1',
        grid: { maxRows: 100, maxCols: 26, rowSizes: {}, columnSizes: {}, frozenRows: 0, frozenColumns: 0, showGridlines: true },
        cells: mappedCells,
        images: [], shapes: [], charts: [], conditionalFormatting: [], dataValidation: []
      }]
    };

    derivedInitialData = flatCellData;
    initialSheets = [{ id: 'sheet-1', name: 'Sheet1' }];
    initialActiveSheetId = 'sheet-1';
    console.log('✨ Template data hydrated from prop (no localStorage needed)');
  }

  const initialData = derivedInitialData;

  console.log('📊 ExcelSpreadsheet initializing:', {
    spreadsheetId,
    title: spreadsheetTitle,
    isNewBlankSpreadsheet,
    cellCount: Object.keys(initialData).length,
    isImportedDocument: !!derivedInitialDocument
  });

  // Track last spreadsheet ID to prevent duplicate notifications
  const lastTrackedId = useRef<string | null>(null);

  // Update when currentSpreadsheet changes and track activity
  useEffect(() => {
    if (currentSpreadsheet) {
      // Support both DocumentState format (.documentId) and legacy format (.id)
      const newId = currentSpreadsheet.documentId || currentSpreadsheet.id;
      const newTitle = currentSpreadsheet.metadata?.title || currentSpreadsheet.title;
      setSpreadsheetId(newId);
      setSpreadsheetTitle(newTitle);
      (window as any).__currentSpreadsheetId = newId;
      (window as any).__isNewBlankSpreadsheet = isNewBlankSpreadsheet;

      if (isNewBlankSpreadsheet) {
        clearSheetStorage(newId);
        initializeBlankSheet(newId);
      }

      // Only track 'open' if we haven't tracked this ID yet
      if (user?.email && lastTrackedId.current !== newId) {
        trackActivity(user.email, 'open', newId, newTitle);
        lastTrackedId.current = newId;
      }
    } else if (derivedInitialDocument) {
      if ((derivedInitialDocument as any).metadata?.title) {
        setSpreadsheetTitle((derivedInitialDocument as any).metadata.title);
      }
      if ((derivedInitialDocument as any).documentId) {
        setSpreadsheetId((derivedInitialDocument as any).documentId);
        (window as any).__currentSpreadsheetId = (derivedInitialDocument as any).documentId;
      }
    }
  }, [currentSpreadsheet, user?.email, isNewBlankSpreadsheet, derivedInitialDocument]);

  useEffect(() => {
    (window as any).__etherxCanEdit = canEdit;
  }, [canEdit]);

  useEffect(() => {
    const handleBeforeUnload = () => { };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // key={spreadsheetId} forces DocumentProvider to fully re-mount when switching sheets,
  // ensuring the new initialDocument is applied. `key` is always valid on JSX elements.
  const ProviderWithKey = DocumentProvider as any;

  return (
    <ProviderWithKey key={spreadsheetId} initialDocument={derivedInitialDocument}>
      <SpreadsheetProvider>
        <UndoRedoProvider>
          <ClipboardProvider>
            <CollaborationProvider
              documentId={spreadsheetId}
              userId={user.email}
              userName={user.name}
              userPermission={canEdit ? 'editor' : 'viewer'}
            >
              <ExcelContent
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                spreadsheetId={spreadsheetId}
                spreadsheetTitle={spreadsheetTitle}
                onTitleChange={setSpreadsheetTitle}
                onSpreadsheetIdChange={setSpreadsheetId}
                user={user}
                userPermission={canEdit ? 'editor' : 'viewer'}
                initialSheets={initialSheets}
                initialActiveSheetId={initialActiveSheetId}
                hasInitialData={!!derivedInitialDocument || Object.keys(initialData).length > 0}
              />

              <WelcomeModal
                open={showWelcomeModal}
                onClose={() => setShowWelcomeModal(false)}
                onStartTour={() => { setShowWelcomeModal(false); setShowGuidedTour(true); }}
                onOpenGames={() => { setShowWelcomeModal(false); setShowGamesHub(true); }}
                userName={user.name}
              />

              <GuidedTour
                active={showGuidedTour}
                onComplete={() => setShowGuidedTour(false)}
                onSkip={() => setShowGuidedTour(false)}
              />

              <GamesHub
                open={showGamesHub}
                onClose={() => setShowGamesHub(false)}
                onStartGame={(gameId) => { console.log('Starting game:', gameId); }}
              />
            </CollaborationProvider>
          </ClipboardProvider>
        </UndoRedoProvider>
        <div style={{ display: 'none' }} data-permission={canEdit ? 'editor' : 'viewer'} />
      </SpreadsheetProvider>
    </ProviderWithKey>
  );
}
