
export interface DocumentState {
  documentId: string;
  activeSheetId: string; // Added: Required for tracking active sheet
  metadata: DocumentMetadata;
  sheets: SheetState[];

  // Optional features used in Context
  versionHistory?: any[];
  settings?: any;
}

export interface DocumentMetadata {
  documentId?: string; // Added for compatibility with Context
  title: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  theme: 'light' | 'dark';
  sheetCount: number;
  version?: string; // Added
}

export interface SheetState {
  sheetId: string;
  name: string;

  // Protection features
  protected?: boolean;
  cellLocks?: Record<string, boolean>;
  protectionPassword?: string; // Added

  grid: GridConfig;

  cells: Record<string, CellState>; // "A1" -> CellState

  images: ImageState[];
  shapes: ShapeState[];
  charts: ChartState[];

  mergedCells?: string[]; // "A1:B2" format
  conditionalFormatting: ConditionalFormat[];
  dataValidation: DataValidation[];

  zoom?: number; // Added for export support
}

export interface GridConfig {
  maxRows: number;
  maxCols: number;
  rows?: number; // Alias
  columns?: number; // Alias
  rowSizes: Record<number, number>; // rowValue -> height
  columnSizes: Record<number, number>; // colValue -> width
  defaultRowHeight?: number; // Added
  defaultColWidth?: number; // Added
  defaultColumnWidth?: number; // Alias
  frozenRows: number;
  frozenColumns: number;
  showGridlines: boolean;
  showRowHeaders?: boolean; // Added
  showColumnHeaders?: boolean; // Added
}

export interface CellState {
  value: string;
  formula?: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'error' | 'string';
  style?: CellStyle;

  // Metadata for unified export
  comment?: {
    text: string;
    author?: string;
    timestamp?: string;
  };
  hyperlink?: string;
  locked?: boolean;
  validation?: any;
  mergedWith?: string;
  isMergeParent?: boolean;
  mergeSpan?: { rows: number; cols: number };
}

export interface CellStyle {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string; // Text color
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  isLink?: boolean;
  linkUrl?: string;
  textDecoration?: string;
  border?: CellBorders;
  alignment?: { horizontal?: string; vertical?: string; wrapText?: boolean }; // Added for compatibility
}

export interface CellBorders {
  top?: BorderStyle;
  right?: BorderStyle;
  bottom?: BorderStyle;
  left?: BorderStyle;
}

export interface BorderStyle {
  style: 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted';
  color: string;
}

export interface ImageState {
  id: string;
  src: string; // Base64 or URL
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  layer: number;
}

export interface ShapeState {
  id: string;
  type: string; // 'rect', 'circle', 'triangle', etc.
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  layer: number;
  text?: string;
  textStyle?: CellStyle;
}

export interface ChartState {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter';
  x: number;
  y: number;
  width: number;
  height: number;
  dataRange: string; // "A1:B10"
  options: any; // Chart.js or Recharts options
}

export interface ConditionalFormat {
  id?: string; // Added
  type: string;
  range: string;
  rule?: any;
  format?: any; // Context uses format
}

export interface DataValidation {
  range: string;
  rule: any;
}

// Aliases for compatibility with DocumentStateContext.tsx
export type SheetData = SheetState;
export type CellData = CellState;
export type ImageObject = ImageState;
export type ShapeObject = ShapeState;
export type ChartObject = ChartState;

// Action types
export type DocumentAction =
  | { type: 'SET_DOCUMENT'; payload: DocumentState }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'UPDATE_METADATA'; payload: Partial<DocumentMetadata> }
  | { type: 'ADD_SHEET'; payload: SheetState }
  | { type: 'REMOVE_SHEET'; payload: string }
  | { type: 'RENAME_SHEET'; payload: { sheetId: string; name: string } }
  | { type: 'SET_ACTIVE_SHEET'; payload: string }
  | { type: 'UPDATE_CELL'; payload: { sheetId: string; cellKey: string; data: Partial<CellState> } }
  | { type: 'UPDATE_CELLS'; payload: { sheetId: string; cells: Record<string, CellState> } }
  | { type: 'UPDATE_CELL_STYLE'; payload: { sheetId: string; cellKey: string; style: Partial<CellStyle> } } // Check context if it uses cellKey
  | { type: 'SET_CELL_STYLE'; payload: { sheetId: string; cellKey: string; style: Partial<CellStyle> } }
  | { type: 'SET_CELL_STYLES'; payload: { sheetId: string; cellKeys: string[]; style: Partial<CellStyle> } }
  | { type: 'ADD_IMAGE'; payload: { sheetId: string; image: ImageState } }
  | { type: 'UPDATE_IMAGE'; payload: { sheetId: string; imageId: string; updates: Partial<ImageState> } }
  | { type: 'REMOVE_IMAGE'; payload: { sheetId: string; imageId: string } }
  | { type: 'ADD_SHAPE'; payload: { sheetId: string; shape: ShapeState } }
  | { type: 'UPDATE_SHAPE'; payload: { sheetId: string; shapeId: string; updates: Partial<ShapeState> } }
  | { type: 'REMOVE_SHAPE'; payload: { sheetId: string; shapeId: string } }
  | { type: 'ADD_CHART'; payload: { sheetId: string; chart: ChartState } }
  | { type: 'UPDATE_CHART'; payload: { sheetId: string; chartId: string; updates: Partial<ChartState> } }
  | { type: 'REMOVE_CHART'; payload: { sheetId: string; chartId: string } }
  | { type: 'SET_ROW_SIZE'; payload: { sheetId: string; rowIndex: number; size: number } }
  | { type: 'SET_COLUMN_SIZE'; payload: { sheetId: string; colIndex: number; size: number } }
  | { type: 'UPDATE_GRID_CONFIG'; payload: { sheetId: string; config: Partial<GridConfig> } }
  | { type: 'ADD_CONDITIONAL_FORMAT'; payload: { sheetId: string; format: ConditionalFormat } }
  | { type: 'REMOVE_CONDITIONAL_FORMAT'; payload: { sheetId: string; formatId: string } }
  | { type: 'SET_DATA_VALIDATION'; payload: { sheetId: string; cellKey: string; validation: DataValidation } }
  | { type: 'SET_SPARKLINE'; payload: { sheetId: string; cellKey: string; sparkline: any } }
  | { type: 'PROTECT_SHEET'; payload: { sheetId: string; protected: boolean; password?: string } }
  | { type: 'LOCK_CELLS'; payload: { sheetId: string; cellKeys: string[]; locked: boolean } }
  | { type: 'ENSURE_SHEET'; payload: string }
  | { type: 'RESTORE_FROM_IPFS'; payload: DocumentState };
