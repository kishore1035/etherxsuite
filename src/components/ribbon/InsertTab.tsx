import React, { useState, useRef } from 'react';
import { SymbolInsertDropdown } from '../ui/SymbolInsertDropdown';
import { ShapesDropdown } from '../ui/ShapesDropdown';
import {
  Image,
  Link,
  Hash,
  ArrowUpDown,
  Database,
  ChevronDown,
  Palette,
  Table,
  LineChart,
  BarChart3,
  PieChart,
  ScatterChart
} from 'lucide-react';
import { Icon3D, IconButton3D } from '../ui/Icon3D';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { SmallRibbonIcon } from '../ui/RibbonIcon';
import { useSpreadsheetWithHistory } from '../../hooks/useSpreadsheetWithHistory';
import { useDocumentState } from '../../contexts/DocumentStateContext';
import { ShapesLayer } from '../layers/ShapesLayer';
import FloatingDropdown from '../ui/FloatingDropdown';
import { SortDropdown } from '../ui/SortDropdown';
import { DataValidation } from '../DataValidation';
import { ConditionalFormattingPanel } from '../ConditionalFormattingPanel';
import { TableInsertDialog } from '../dialogs/TableInsertDialog';
import { toast } from 'sonner';

interface InsertTabProps { }

export function InsertTab({ }: InsertTabProps) {
  const {
    selectedCell,
    selectedRange,
    setFloatingImages,
    setCellData,
    getCellKey,
    cellData,
    setCellFormats,
    theme,
    applyValidation,
    removeValidationFromRange,
    getValidation,
    sortData,
    removeDuplicates,
    conditionalFormattingRules,
    addConditionalFormattingRule,
    updateConditionalFormattingRule,
    deleteConditionalFormattingRule,
    reorderConditionalFormattingRule,
    toggleConditionalFormattingRule,
    insertTable,
    showGridlines,
    setShowGridlines,
    showFormulaBar,
    setShowFormulaBar,
    showHeadings,
    setShowHeadings
  } = useSpreadsheetWithHistory();

  // ✅ CRITICAL: Get documentState to save visual elements
  const { state: documentState, addImage, addChart, addShape } = useDocumentState();
  // FIX: Use the actual sheet ID from window global, not documentState.activeSheetId
  const activeSheetId = (window as any).__activeSheetId || documentState.activeSheetId;

  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);
  const [linkAnchorRect, setLinkAnchorRect] = useState<DOMRect | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDisplayText, setLinkDisplayText] = useState('');
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);
  const [symbolAnchorRect, setSymbolAnchorRect] = useState<DOMRect | null>(null);

  // Data features state
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const [showDataValidation, setShowDataValidation] = useState(false);
  const [showConditionalFormatting, setShowConditionalFormatting] = useState(false);
  const [showTableInsertDialog, setShowTableInsertDialog] = useState(false);
  const [showChartDropdown, setShowChartDropdown] = useState(false);
  const chartButtonRef = useRef<HTMLButtonElement>(null);
  const [isShapesDropdownOpen, setIsShapesDropdownOpen] = useState(false);
  const [shapesAnchorRect, setShapesAnchorRect] = useState<DOMRect | null>(null);

  const openDropdown = (type: string, e: React.MouseEvent) => {
    e.preventDefault();
    console.log(`Opening ${type} dropdown`);
  };

  const buttonClass = 'hover:bg-gray-50 text-gray-900 border border-transparent hover:border-transparent shadow-sm transition-all duration-200';

  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          const newImage = {
            id: Date.now().toString(),
            src: imageUrl,
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            layer: 0
          };

          // ✅ CRITICAL: Add to documentState (Single Source of Truth)
          addImage(activeSheetId, {
            id: newImage.id,
            src: newImage.src,
            x: newImage.x,
            y: newImage.y,
            width: newImage.width,
            height: newImage.height,
            rotation: newImage.rotation,
            opacity: newImage.opacity,
            layer: 0
          });

          // ✅ Also save directly to localStorage so XLSX export can always find it
          try {
            const storageKey = `sheets:data:${activeSheetId}`;
            const existing = localStorage.getItem(storageKey);
            const parsed = existing ? JSON.parse(existing) : {};
            const existingImages: any[] = parsed.images || [];
            // Avoid duplicates
            if (!existingImages.find((img: any) => img.id === newImage.id)) {
              existingImages.push(newImage);
            }
            localStorage.setItem(storageKey, JSON.stringify({
              ...parsed,
              images: existingImages
            }));
            console.log(`✅ Image ${newImage.id} saved to localStorage for sheet ${activeSheetId}`);
          } catch (err) {
            console.warn('⚠️ Failed to save image to localStorage:', err);
          }

          console.log('✅ IMAGE ADDED TO DOCUMENT STATE - WILL BE SAVED:', newImage.id);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };



  const handleInsertTable = (columns: number, rows: number) => {
    insertTable(columns, rows);
    toast.success(`Table created with ${columns} columns and ${rows} rows`);
  };

  const handleInsertChart = (chartType: 'line' | 'bar' | 'pie' | 'scatter') => {
    if (!selectedRange) {
      toast.error('Please select a cell range first');
      return;
    }

    // Validate minimum size
    const rowCount = selectedRange.endRow - selectedRange.startRow + 1;
    const colCount = selectedRange.endCol - selectedRange.startCol + 1;

    if (rowCount < 2 && colCount < 2) {
      toast.error('Please select at least 2 rows or 2 columns of data');
      return;
    }

    // Extract data from selected range
    const dataRange = `${String.fromCharCode(65 + selectedRange.startCol)}${selectedRange.startRow + 1}:${String.fromCharCode(65 + selectedRange.endCol)}${selectedRange.endRow + 1}`;

    // Create chart object
    const chartId = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newChart = {
      id: chartId,
      chartType: chartType,
      dataRange: dataRange,
      x: 50,
      y: 50,
      width: 500,
      height: 350,
      options: {
        title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
        legend: {
          show: true,
          position: 'bottom' as const
        },
        xAxis: {
          showGridlines: true
        },
        yAxis: {
          showGridlines: true
        },
        colors: ['#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#FF4500']
      },
      layer: 1
    };

    console.log('📊 Creating chart:', newChart);
    console.log('📊 Active Sheet ID:', activeSheetId);

    // Add to documentState
    addChart(activeSheetId, newChart);
    console.log('📊 Chart added to documentState');

    toast.success(`${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart created`);
    setShowChartDropdown(false);
  };

  const handleInsertLink = (url: string, displayText: string) => {
    if (!selectedCell && !selectedRange) return;

    const row = selectedRange ? selectedRange.startRow : selectedCell!.row;
    const col = selectedRange ? selectedRange.startCol : selectedCell!.col;
    const cellKey = getCellKey(row, col);
    setCellData(prev => ({ ...prev, [cellKey]: displayText }));
    setCellFormats(prev => ({
      ...prev,
      [cellKey]: {
        ...prev[cellKey],
        isLink: true,
        linkUrl: url,
        color: '#0066cc',
        textDecoration: 'underline'
      }
    }));
  };

  return (
    <>
      <div className="flex justify-center w-full">
        <div className="flex items-center justify-center gap-4 sm:gap-6 px-2 sm:px-4 py-3" style={{ transform: 'scale(0.75)', transformOrigin: 'center top' }}>
          {/* Illustrations Group */}
          <div className="flex flex-col gap-1 min-w-fit">
            <div className="text-xs text-gray-700 mb-1">Illustrations</div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={handleInsertImage}
              >
                <SmallRibbonIcon icon={Image} size={18} />
                <span className="text-xs">Pictures</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={(e: React.MouseEvent) => {
                  setIsShapesDropdownOpen(true);
                  setShapesAnchorRect((e.target as HTMLElement).getBoundingClientRect());
                }}
              >
                <div className="w-5 h-5 flex items-center justify-center">◇</div>
                <span className="text-xs">Shapes</span>
              </Button>

            </div>
          </div>

          <Separator orientation="vertical" className="h-12" />

          {/* Sort & Data Tools Group */}
          <div className="flex flex-col gap-1 min-w-fit">
            <div className="text-xs text-gray-700 mb-1">Data Tools</div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => {
                  console.log('Table button clicked!');
                  setShowTableInsertDialog(true);
                }}
              >
                <SmallRibbonIcon icon={Table} size={18} />
                <span className="text-xs">Table</span>
              </Button>
              <Button
                ref={sortButtonRef}
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                disabled={!selectedRange && !selectedCell}
              >
                <SmallRibbonIcon icon={ArrowUpDown} size={18} />
                <span className="text-xs">Sort</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => {
                  if (!selectedRange) {
                    toast.error('Please select a range of cells');
                    return;
                  }
                  // Get all columns in the selected range
                  const columns: number[] = [];
                  for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
                    columns.push(col);
                  }

                  const originalRowCount = selectedRange.endRow - selectedRange.startRow + 1;
                  removeDuplicates(columns);

                  // Show success message
                  toast.success('Duplicate rows removed successfully');
                }}
                disabled={!selectedRange}
              >
                <SmallRibbonIcon icon={Database} size={18} />
                <span className="text-xs">Remove Duplicates</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => setShowDataValidation(true)}
              >
                <SmallRibbonIcon icon={Database} size={18} />
                <span className="text-xs">Data Validation</span>
              </Button>
            </div>
          </div>

          <Separator orientation="vertical" className="h-12" />

          {/* Conditional Formatting Group */}
          <div className="flex flex-col gap-1 min-w-fit">
            <div className="text-xs text-gray-700 mb-1">Formatting</div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={() => setShowConditionalFormatting(true)}
              >
                <SmallRibbonIcon icon={Palette} size={18} />
                <span className="text-xs">Conditional Formatting</span>
              </Button>
            </div>
          </div>

          <Separator orientation="vertical" className="h-12" />

          {/* Links Group */}
          <div className="flex flex-col gap-1 min-w-fit">
            <div className="text-xs text-gray-700 mb-1">Links</div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={(e: React.MouseEvent) => {
                  if (!selectedCell && !selectedRange) return;
                  setIsLinkDropdownOpen(true);
                  setLinkAnchorRect((e.target as HTMLElement).getBoundingClientRect());
                }}
                disabled={!selectedCell && !selectedRange}
              >
                <Link className="w-5 h-5" />
                <span className="text-xs">Link</span>
              </Button>
            </div>
          </div>

          <Separator orientation="vertical" className="h-12" />

          {/* Symbols Group */}
          <div className="flex flex-col gap-1 min-w-fit">
            <div className="text-xs text-gray-700 mb-1">Symbols</div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
                onClick={(e: React.MouseEvent) => {
                  if (!selectedCell && !selectedRange) return;
                  setIsSymbolDropdownOpen(true);
                  setSymbolAnchorRect((e.target as HTMLElement).getBoundingClientRect());
                }}
                disabled={!selectedCell && !selectedRange}
              >
                <Hash className="w-5 h-5" />
                <span className="text-xs">Symbols</span>
              </Button>
            </div>
          </div>

          <Separator orientation="vertical" className="h-12" />

          {/* Show Group */}
          <div className="flex flex-col gap-1 min-w-fit">
            <div className="text-xs text-gray-700 mb-1">Show</div>
            <div className="flex items-center gap-1">
              <label className="flex items-center gap-1 text-xs cursor-pointer text-gray-900">
                <input
                  type="checkbox"
                  className="w-3 h-3"
                  checked={showGridlines}
                  onChange={(e) => setShowGridlines(e.target.checked)}
                />
                <span>Gridlines</span>
              </label>
              <label className="flex items-center gap-1 text-xs cursor-pointer ml-2 text-gray-900">
                <input
                  type="checkbox"
                  className="w-3 h-3"
                  checked={showFormulaBar}
                  onChange={(e) => setShowFormulaBar(e.target.checked)}
                />
                <span>Formula Bar</span>
              </label>
              <label className="flex items-center gap-1 text-xs cursor-pointer ml-2 text-gray-900">
                <input
                  type="checkbox"
                  className="w-3 h-3"
                  checked={showHeadings}
                  onChange={(e) => setShowHeadings(e.target.checked)}
                />
                <span>Headings</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Dropdown */}
      <SortDropdown
        isOpen={showSortDropdown}
        onClose={() => setShowSortDropdown(false)}
        onAction={(option) => {
          if (!selectedRange && !selectedCell) {
            toast.error('Please select cells to sort');
            setShowSortDropdown(false);
            return;
          }

          const order = option === 'az' || option === 'num-asc' ? 'asc' : 'desc';
          let sortColumn;

          if (selectedRange) {
            // Use active cell's column if it's within the selected range
            if (
              selectedCell &&
              selectedCell.col >= selectedRange.startCol &&
              selectedCell.col <= selectedRange.endCol
            ) {
              sortColumn = selectedCell.col;
            } else {
              sortColumn = selectedRange.startCol;
            }
          } else {
            sortColumn = selectedCell!.col;
          }

          console.log('🔄 Sorting:', { sortColumn, order, selectedRange, selectedCell });
          sortData(sortColumn, order);
          toast.success(`Data sorted ${order === 'asc' ? 'A→Z' : 'Z→A'}`);
          setShowSortDropdown(false);
        }}
        isDarkMode={false}
        triggerRef={sortButtonRef}
      />

      {/* Symbol Insert Dropdown */}
      {isSymbolDropdownOpen && (
        <FloatingDropdown anchorRect={symbolAnchorRect} onClose={() => setIsSymbolDropdownOpen(false)}>
          <SymbolInsertDropdown isOpen={isSymbolDropdownOpen} onClose={() => setIsSymbolDropdownOpen(false)} />
        </FloatingDropdown>
      )}

      {/* Data Validation Dialog */}
      <DataValidation
        open={showDataValidation}
        onClose={() => setShowDataValidation(false)}
        currentValidation={selectedCell ? getValidation(getCellKey(selectedCell.row, selectedCell.col)) : undefined}
        selectedRange={selectedRange ? `${getCellKey(selectedRange.startRow, selectedRange.startCol)}:${getCellKey(selectedRange.endRow, selectedRange.endCol)}` : selectedCell ? getCellKey(selectedCell.row, selectedCell.col) : 'A1'}
        onApply={applyValidation}
        onRemove={removeValidationFromRange}
      />

      {/* Conditional Formatting Panel */}
      <ConditionalFormattingPanel
        open={showConditionalFormatting}
        onClose={() => setShowConditionalFormatting(false)}
        selectedRange={selectedRange ? `${getCellKey(selectedRange.startRow, selectedRange.startCol)}:${getCellKey(selectedRange.endRow, selectedRange.endCol)}` : selectedCell ? getCellKey(selectedCell.row, selectedCell.col) : 'A1'}
        existingRules={conditionalFormattingRules}
        onApplyRule={addConditionalFormattingRule}
        onUpdateRule={updateConditionalFormattingRule}
        onDeleteRule={deleteConditionalFormattingRule}
        onReorderRule={reorderConditionalFormattingRule}
        onToggleRule={toggleConditionalFormattingRule}
      />

      {/* Link Insert Dropdown */}
      {isLinkDropdownOpen && (
        <FloatingDropdown anchorRect={linkAnchorRect} onClose={() => setIsLinkDropdownOpen(false)}>
          <div style={{ width: 280, overflow: 'hidden', borderRadius: 10 }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
              borderBottom: '1.5px solid rgba(184,134,11,0.15)',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16, color: '#B8860B' }}>🔗</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Insert Link</span>
            </div>
            {/* Body */}
            <div style={{ padding: '12px 14px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>URL or File Path</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  autoFocus
                  style={{
                    width: '100%', padding: '6px 10px',
                    border: '1.5px solid rgba(184,134,11,0.3)',
                    borderRadius: 7, fontSize: 12, color: '#1a1a1a',
                    background: '#fffdf8', outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(184,134,11,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.3)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 4 }}>Display Text <span style={{ fontWeight: 400, color: '#999' }}>(optional)</span></label>
                <input
                  type="text"
                  value={linkDisplayText}
                  onChange={e => setLinkDisplayText(e.target.value)}
                  placeholder="Text to show in cell"
                  style={{
                    width: '100%', padding: '6px 10px',
                    border: '1.5px solid rgba(184,134,11,0.3)',
                    borderRadius: 7, fontSize: 12, color: '#1a1a1a',
                    background: '#fffdf8', outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(184,134,11,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.3)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            {/* Footer */}
            <div style={{
              background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
              borderTop: '1.5px solid rgba(184,134,11,0.15)',
              padding: '8px 14px',
              display: 'flex', justifyContent: 'flex-end', gap: 7,
            }}>
              <button
                onClick={() => { setIsLinkDropdownOpen(false); setLinkUrl(''); setLinkDisplayText(''); }}
                style={{
                  padding: '5px 12px', borderRadius: 7,
                  background: '#fff', border: '1.5px solid #d1d5db',
                  color: '#555', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.color = '#B8860B'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#555'; }}
              >Cancel</button>
              <button
                onClick={() => {
                  if (!linkUrl.trim()) return;
                  handleInsertLink(linkUrl.trim(), linkDisplayText.trim() || linkUrl.trim());
                  setIsLinkDropdownOpen(false); setLinkUrl(''); setLinkDisplayText('');
                }}
                disabled={!linkUrl.trim()}
                style={{
                  padding: '5px 16px', borderRadius: 7,
                  background: linkUrl.trim() ? 'linear-gradient(135deg, #FFE566 0%, #FFD700 50%, #B8860B 100%)' : '#e5e7eb',
                  border: linkUrl.trim() ? '1.5px solid #B8860B' : '1.5px solid #d1d5db',
                  color: linkUrl.trim() ? '#5a3e00' : '#9ca3af',
                  fontSize: 11, fontWeight: 700, cursor: linkUrl.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: linkUrl.trim() ? '0 2px 8px rgba(184,134,11,0.28)' : 'none',
                }}
              >Insert Link</button>
            </div>
          </div>
        </FloatingDropdown>
      )}

      {/* Table Insert Dialog */}
      <TableInsertDialog
        open={showTableInsertDialog}
        onClose={() => setShowTableInsertDialog(false)}
        onInsert={handleInsertTable}
      />

      {/* Shapes Dropdown */}
      {isShapesDropdownOpen && (
        <FloatingDropdown anchorRect={shapesAnchorRect} onClose={() => setIsShapesDropdownOpen(false)}>
          <ShapesDropdown
            isOpen={isShapesDropdownOpen}
            onClose={() => setIsShapesDropdownOpen(false)}
            onSelectShape={(shapeType) => {
              addShape(activeSheetId, {
                id: `shape_${Date.now()}`,
                type: shapeType,
                x: 200,
                y: 200,
                width: 120,
                height: 80,
                fill: '#4472C4',
                stroke: '#2F5597',
                strokeWidth: 2,
                rotation: 0,
                opacity: 1,
                layer: 5
              });
              toast.success(`Shape inserted`);
            }}
          />
        </FloatingDropdown>
      )}
    </>
  );
}