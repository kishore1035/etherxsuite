import React, { useState, useRef } from 'react';
import { SymbolInsertDropdown } from '../ui/SymbolInsertDropdown';
import { ShapesLibrary } from '../shapes/ShapesLibrary';
import { ShapeType } from '../../types/shapes';
import { 
  Image, 
  Shapes,
  BarChart3,
  Link,
  Type,
  Hash,
  ArrowUpDown,
  Database,
  ChevronDown,
  Palette,
  Table
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
import { useSpreadsheet } from '../../contexts/SpreadsheetContext';
import FloatingDropdown from '../ui/FloatingDropdown';
import { TableSelector } from '../TableSelector';
import { ChartTypePicker } from '../ChartTypePicker';
import { ChartConfigDialog } from '../ChartConfigDialog';
import { SortDropdown } from '../ui/SortDropdown';
import { DataValidation } from '../DataValidation';
import { ConditionalFormattingPanel } from '../ConditionalFormattingPanel';
import { TableInsertDialog } from '../dialogs/TableInsertDialog';
import { detectTables, processChartData, type TableData, type ChartConfiguration } from '../../utils/chartDataProcessor';
import { toast } from 'sonner';

interface InsertTabProps {}

export function InsertTab({}: InsertTabProps) {
  const { 
    selectedCell, 
    selectedRange, 
    setFloatingImages, 
    setFloatingCharts, 
    setCellData, 
    getCellKey, 
    cellData, 
    setCellFormats, 
    setIsTextBoxMode, 
    setDrawingShapeType, 
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
    insertTable
  } = useSpreadsheet();
  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);
  const [linkAnchorRect, setLinkAnchorRect] = useState<DOMRect | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDisplayText, setLinkDisplayText] = useState('');
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);
  const [symbolAnchorRect, setSymbolAnchorRect] = useState<DOMRect | null>(null);
  const [isShapesLibraryOpen, setIsShapesLibraryOpen] = useState(false);
  
  // Chart workflow states
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [detectedTables, setDetectedTables] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [showChartTypePicker, setShowChartTypePicker] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<'column' | 'line' | 'pie' | null>(null);
  const [showChartConfig, setShowChartConfig] = useState(false);
  
  // Data features state
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const [showDataValidation, setShowDataValidation] = useState(false);
  const [showConditionalFormatting, setShowConditionalFormatting] = useState(false);
  const [showTableInsertDialog, setShowTableInsertDialog] = useState(false);
  
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
            opacity: 1
          };
          setFloatingImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Chart workflow handlers
  const handleInsertChartClick = () => {
    // Detect tables from current spreadsheet data
    const tables = detectTables(cellData);
    
    if (tables.length === 0) {
      toast.error('No tables found. Please create a table with headers and data first.');
      return;
    }
    
    setDetectedTables(tables);
    setShowTableSelector(true);
  };

  const handleTableSelected = (table: TableData) => {
    setSelectedTable(table);
    setShowTableSelector(false);
    setShowChartTypePicker(true);
  };

  const handleChartTypeSelected = (type: 'column' | 'line' | 'pie') => {
    setSelectedChartType(type);
    setShowChartTypePicker(false);
    setShowChartConfig(true);
  };

  const handleChartConfigConfirmed = (config: ChartConfiguration) => {
    if (!selectedTable) {
      console.error('No table selected');
      return;
    }
    
    console.log('Processing chart with config:', config);
    console.log('Selected table:', selectedTable);
    
    const chartData = processChartData(selectedTable, config);
    
    console.log('Processed chart data:', chartData);
    
    if (!chartData) {
      toast.error('Failed to process chart data. Please check your configuration.');
      return;
    }
    
    // Smart chart sizing based on table dimensions and data points
    const tableRows = selectedTable.endRow - selectedTable.startRow + 1;
    const tableCols = selectedTable.endCol - selectedTable.startCol + 1;
    const dataPointCount = chartData.labels.length;
    
    // Define min/max constraints for chart dimensions
    const MIN_WIDTH = 350;
    const MIN_HEIGHT = 250;
    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 500;
    
    // Calculate base dimensions
    // For very small tables (2-3 columns, 2-5 rows), use medium default
    // For larger tables, scale proportionally
    let calculatedWidth: number;
    let calculatedHeight: number;
    
    if (tableCols <= 3 && tableRows <= 5) {
      // Small table: use medium default size
      calculatedWidth = 450;
      calculatedHeight = 350;
    } else {
      // Larger table: scale based on data
      // Width: accommodate data points with spacing
      const pointSpacing = config.chartType === 'pie' ? 80 : 60;
      const baseWidth = 300;
      calculatedWidth = baseWidth + (dataPointCount * pointSpacing);
      
      // Height: accommodate vertical data range with legend/title/axes overhead
      // Reserve space: title(30) + legend(30) + x-axis(50) + y-axis-title(30) + bottom-padding(40) = 180px
      const chartOverhead = 180;
      const baseHeight = 200;
      const heightPerRow = 30;
      calculatedHeight = baseHeight + chartOverhead + (Math.min(tableRows, 10) * heightPerRow);
    }
    
    // Clamp to min/max bounds
    const finalWidth = Math.min(Math.max(calculatedWidth, MIN_WIDTH), MAX_WIDTH);
    const finalHeight = Math.min(Math.max(calculatedHeight, MIN_HEIGHT), MAX_HEIGHT);
    
    // Calculate safe position within viewport
    // Get viewport dimensions from the spreadsheet container
    const spreadsheetContainer = document.querySelector('.spreadsheet-container') || document.body;
    const containerRect = spreadsheetContainer.getBoundingClientRect();
    const viewportWidth = containerRect.width || window.innerWidth;
    const viewportHeight = containerRect.height || window.innerHeight;
    
    // Safety margin from edges
    const EDGE_MARGIN = 20;
    
    // Calculate initial position near the selected table
    // Table starts at startRow/startCol, convert to approximate pixel position
    const CELL_WIDTH = 100; // Approximate cell width
    const CELL_HEIGHT = 30; // Approximate cell height
    const HEADER_HEIGHT = 120; // Approximate header/ribbon height
    
    let initialX = selectedTable.startCol * CELL_WIDTH + EDGE_MARGIN;
    let initialY = selectedTable.startRow * CELL_HEIGHT + HEADER_HEIGHT;
    
    // Check if chart would overflow viewport bounds and adjust
    const chartRight = initialX + finalWidth;
    const chartBottom = initialY + finalHeight;
    
    // Adjust X position if chart overflows right edge
    if (chartRight > viewportWidth - EDGE_MARGIN) {
      initialX = Math.max(EDGE_MARGIN, viewportWidth - finalWidth - EDGE_MARGIN);
    }
    
    // Adjust Y position if chart overflows bottom edge
    if (chartBottom > viewportHeight - EDGE_MARGIN) {
      initialY = Math.max(HEADER_HEIGHT, viewportHeight - finalHeight - EDGE_MARGIN);
    }
    
    // Ensure minimum position (not off-screen to the left or top)
    initialX = Math.max(EDGE_MARGIN, initialX);
    initialY = Math.max(HEADER_HEIGHT, initialY);
    
    console.log('Chart sizing:', {
      tableRows,
      tableCols,
      dataPointCount,
      calculatedWidth,
      calculatedHeight,
      finalWidth,
      finalHeight,
      viewportWidth,
      viewportHeight,
      initialX,
      initialY,
      chartRight,
      chartBottom
    });
    
    // Create new chart with processed data
    const newChart = {
      id: `chart_${Date.now()}`,
      type: config.chartType,
      x: initialX,
      y: initialY,
      width: finalWidth,
      height: finalHeight,
      data: chartData.labels.map((label, index) => ({
        label,
        value: chartData.datasets[0]?.data[index] || 0
      })),
      dataRange: selectedTable.range,
      config,
      chartData
    };
    
    console.log('Creating chart:', newChart);
    
    setFloatingCharts(prev => {
      const updated = [...prev, newChart as any];
      console.log('Updated floating charts:', updated);
      return updated;
    });
    
    // Reset workflow states
    setShowChartConfig(false);
    setSelectedTable(null);
    setSelectedChartType(null);
    
    toast.success('Chart created successfully!');
  };
  
  const handleInsertChart = (chartType: 'column' | 'line' | 'pie') => {
    handleInsertChartClick();
  };

  const handleInsertTable = (columns: number, rows: number) => {
    insertTable(columns, rows);
    toast.success(`Table created with ${columns} columns and ${rows} rows`);
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
              <Image className="w-5 h-5" />
              <span className="text-xs">Pictures</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
              onClick={() => setIsShapesLibraryOpen(true)}
            >
              <Shapes className="w-5 h-5" />
              <span className="text-xs">Shapes</span>
            </Button>
          </div>
        </div>

        <Separator orientation="vertical" className="h-12" />

        <Separator orientation="vertical" className="h-12" />

        {/* Charts Group */}
        <div className="flex flex-col gap-1 min-w-fit">
          <div className="text-xs text-gray-700 mb-1">Charts</div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
              onClick={handleInsertChartClick}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Insert Chart</span>
            </Button>
          </div>
        </div>

        <Separator orientation="vertical" className="h-12" />

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
              <Table className="w-5 h-5" />
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
              <ArrowUpDown className="w-5 h-5" />
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
              <Database className="w-5 h-5" />
              <span className="text-xs">Remove Duplicates</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 flex-col gap-0.5 ${buttonClass}`}
              onClick={() => setShowDataValidation(true)}
            >
              <Database className="w-5 h-5" />
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
              <Palette className="w-5 h-5" />
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
            const sortColumn = selectedRange ? selectedRange.startCol : selectedCell!.col;
            
            sortData(sortColumn, order);
            toast.success(`Data sorted ${order === 'asc' ? 'ascending' : 'descending'}`);
            setShowSortDropdown(false);
          }}
          isDarkMode={false}
          triggerRef={sortButtonRef}
        />

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

        {/* Symbol Insert Dropdown */}
        {isSymbolDropdownOpen && (
          <FloatingDropdown anchorRect={symbolAnchorRect} onClose={() => setIsSymbolDropdownOpen(false)}>
            <SymbolInsertDropdown isOpen={isSymbolDropdownOpen} onClose={() => setIsSymbolDropdownOpen(false)} />
          </FloatingDropdown>
        )}
      </div>

    {isLinkDropdownOpen && (
        <FloatingDropdown anchorRect={linkAnchorRect} onClose={() => setIsLinkDropdownOpen(false)}>
          <div className="px-4 py-2 w-64">
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1" style={{ color: '#000000' }}>URL or File Path</label>
              <input
                type="text"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://example.com or C:\path\to\file"
                className="w-full px-2 py-1 border rounded text-sm border-gray-300 focus:border-blue-400 focus:outline-none"
                style={{ color: '#000000' }}
                autoFocus
              />
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1" style={{ color: '#000000' }}>Display Text (Optional)</label>
              <input
                type="text"
                value={linkDisplayText}
                onChange={e => setLinkDisplayText(e.target.value)}
                placeholder="Text to display in cell"
                className="w-full px-2 py-1 border rounded text-sm border-gray-300 focus:border-blue-400 focus:outline-none"
                style={{ color: '#000000' }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsLinkDropdownOpen(false);
                  setLinkUrl('');
                  setLinkDisplayText('');
                }}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                style={{ color: '#000000' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!linkUrl.trim()) return;
                  handleInsertLink(linkUrl.trim(), linkDisplayText.trim() || linkUrl.trim());
                  setIsLinkDropdownOpen(false);
                  setLinkUrl('');
                  setLinkDisplayText('');
                }}
                className={`px-3 py-1 rounded text-sm font-bold bg-black hover:bg-gray-900 border border-transparent shadow`}
                disabled={!linkUrl.trim()}
                style={{ 
                  opacity: linkUrl.trim() ? 1 : 0.5, 
                  pointerEvents: 'auto', 
                  color: '#000000',
                  background: linkUrl.trim() ? '#FFCF40' : '#d1d1d1',
                  border: '2px solid rgba(255, 207, 64, 0.3)'
                }}
              >
                Insert Link
              </button>
            </div>
          </div>
        </FloatingDropdown>
      )}

      {/* Chart Workflow Modals */}
      <TableSelector
        open={showTableSelector}
        onClose={() => setShowTableSelector(false)}
        tables={detectedTables}
        onSelectTable={handleTableSelected}
        isDarkMode={theme === 'dark'}
      />

      <ChartTypePicker
        open={showChartTypePicker}
        onClose={() => setShowChartTypePicker(false)}
        onSelectType={handleChartTypeSelected}
        isDarkMode={theme === 'dark'}
      />

      <ChartConfigDialog
        open={showChartConfig}
        onClose={() => setShowChartConfig(false)}
        onConfirm={handleChartConfigConfirmed}
        table={selectedTable}
        chartType={selectedChartType}
        isDarkMode={theme === 'dark'}
      />

      {/* Shapes Library Modal */}
      <ShapesLibrary
        isOpen={isShapesLibraryOpen}
        onClose={() => setIsShapesLibraryOpen(false)}
        onSelectShape={(type: ShapeType) => {
          setDrawingShapeType(type);
        }}
      />

      {/* Table Insert Dialog */}
      <TableInsertDialog
        open={showTableInsertDialog}
        onClose={() => setShowTableInsertDialog(false)}
        onInsert={handleInsertTable}
      />
    </div>
    </>
  );
}