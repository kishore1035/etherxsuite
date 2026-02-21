import React, { createContext, useContext, useReducer, ReactNode, useRef } from 'react';
import { DocumentState, DocumentAction, SheetState, CellState, CellStyle, ImageState, ShapeState, ChartState } from '../types/documentState';
import { serializeDocument } from '../utils/documentSerializer';
import { safeSetItem, cleanupIPFSSnapshotBackups } from '../utils/storageManager';

interface DocumentContextType {
    state: DocumentState;
    dispatch: React.Dispatch<DocumentAction>;
    updateCell: (sheetId: string, cellKey: string, data: Partial<CellState>) => void;
    updateCells: (sheetId: string, cells: Record<string, Partial<CellState>>) => void;
    setCellStyle: (sheetId: string, cellKey: string, style: Partial<CellStyle>) => void;
    setCellStyles: (sheetId: string, cellKeys: string[], style: Partial<CellStyle>) => void;
    addImage: (sheetId: string, image: ImageState) => void;
    addChart: (sheetId: string, chart: ChartState) => void;
    addShape: (sheetId: string, shape: ShapeState) => void;
    updateImage: (sheetId: string, imageId: string, updates: Partial<ImageState>) => void;
    removeImage: (sheetId: string, imageId: string) => void;
    updateShape: (sheetId: string, shapeId: string, updates: Partial<ShapeState>) => void;
    removeShape: (sheetId: string, shapeId: string) => void;
    updateChart: (sheetId: string, chartId: string, updates: Partial<ChartState>) => void;
    removeChart: (sheetId: string, chartId: string) => void;
    updateGridConfig: (sheetId: string, config: Partial<SheetState['grid']>) => void;
    setActiveSheet: (sheetId: string) => void;
    saveToIPFS: () => Promise<string>;
    setCellValidation: (sheetId: string, cellKey: string, validation: any) => void;
    loadDocument: (document: DocumentState) => void;
}

const initialState: DocumentState = {
    documentId: 'default',
    activeSheetId: 'sheet-1',
    metadata: {
        title: 'Untitled',
        owner: 'guest',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        theme: 'light',
        sheetCount: 1
    },
    sheets: [
        {
            sheetId: 'sheet-1',
            name: 'Sheet1',
            grid: {
                maxRows: 100,
                maxCols: 26,
                rowSizes: {},
                columnSizes: {},
                frozenRows: 0,
                frozenColumns: 0,
                showGridlines: true
            },
            cells: {},
            images: [],
            shapes: [],
            charts: [],
            conditionalFormatting: [],
            dataValidation: []
        }
    ]
};

const DocumentStateContext = createContext<DocumentContextType | undefined>(undefined);

function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
    switch (action.type) {
        case 'SET_DOCUMENT':
        case 'RESTORE_FROM_IPFS':
            return action.payload;

        case 'SET_TITLE':
            return { ...state, metadata: { ...state.metadata, title: action.payload } };

        case 'SET_ACTIVE_SHEET':
            return { ...state, activeSheetId: action.payload };

        case 'UPDATE_CELL':
            return {
                ...state,
                sheets: state.sheets.map(sheet => {
                    if (sheet.sheetId !== action.payload.sheetId) return sheet;
                    const cellKey = action.payload.cellKey;
                    const existingCell = sheet.cells[cellKey] || { value: '' };
                    return {
                        ...sheet,
                        cells: {
                            ...sheet.cells,
                            [cellKey]: {
                                ...existingCell,
                                ...action.payload.data
                            }
                        }
                    };
                })
            };

        case 'UPDATE_CELLS':
            return {
                ...state,
                sheets: state.sheets.map(sheet => {
                    if (sheet.sheetId !== action.payload.sheetId) return sheet;
                    const newCells = { ...sheet.cells };
                    Object.entries(action.payload.cells).forEach(([key, data]) => {
                        newCells[key] = {
                            ...(newCells[key] || { value: '' }),
                            ...data
                        };
                    });
                    return { ...sheet, cells: newCells };
                })
            };

        case 'SET_CELL_STYLE':
            return {
                ...state,
                sheets: state.sheets.map(sheet => {
                    if (sheet.sheetId !== action.payload.sheetId) return sheet;
                    const cellKey = action.payload.cellKey;
                    const existingCell = sheet.cells[cellKey] || { value: '' };
                    return {
                        ...sheet,
                        cells: {
                            ...sheet.cells,
                            [cellKey]: {
                                ...existingCell,
                                style: {
                                    ...existingCell.style,
                                    ...action.payload.style
                                }
                            }
                        }
                    };
                })
            };

        case 'SET_CELL_STYLES':
            return {
                ...state,
                sheets: state.sheets.map(sheet => {
                    if (sheet.sheetId !== action.payload.sheetId) return sheet;
                    const newCells = { ...sheet.cells };
                    action.payload.cellKeys.forEach(key => {
                        const existingCell = newCells[key] || { value: '' };
                        newCells[key] = {
                            ...existingCell,
                            style: {
                                ...existingCell.style,
                                ...action.payload.style
                            }
                        };
                    });
                    return { ...sheet, cells: newCells };
                })
            };

        case 'SET_DATA_VALIDATION':
            return {
                ...state,
                sheets: state.sheets.map(sheet => {
                    if (sheet.sheetId !== action.payload.sheetId) return sheet;
                    const cellKey = action.payload.cellKey;
                    const existingCell = sheet.cells[cellKey] || { value: '' };
                    return {
                        ...sheet,
                        cells: {
                            ...sheet.cells,
                            [cellKey]: {
                                ...existingCell,
                                validation: action.payload.validation
                            }
                        }
                    };
                })
            };

        case 'ADD_IMAGE': {
            // Resolve sheetId: fall back to activeSheetId if the target sheet doesn't exist
            const targetSheetId = state.sheets.some(s => s.sheetId === action.payload.sheetId)
                ? action.payload.sheetId
                : state.activeSheetId;
            return {
                ...state,
                sheets: state.sheets.map(sheet =>
                    sheet.sheetId === targetSheetId
                        ? { ...sheet, images: [...sheet.images, action.payload.image] }
                        : sheet
                )
            };
        }

        case 'UPDATE_IMAGE': {
            const targetSheetId = state.sheets.some(s => s.sheetId === action.payload.sheetId)
                ? action.payload.sheetId
                : state.activeSheetId;
            return {
                ...state,
                sheets: state.sheets.map(sheet =>
                    sheet.sheetId === targetSheetId
                        ? {
                            ...sheet,
                            images: sheet.images.map(img =>
                                img.id === action.payload.imageId
                                    ? { ...img, ...action.payload.updates }
                                    : img
                            )
                        }
                        : sheet
                )
            };
        }

        case 'REMOVE_IMAGE': {
            const targetSheetId = state.sheets.some(s => s.sheetId === action.payload.sheetId)
                ? action.payload.sheetId
                : state.activeSheetId;
            return {
                ...state,
                sheets: state.sheets.map(sheet =>
                    sheet.sheetId === targetSheetId
                        ? { ...sheet, images: sheet.images.filter(img => img.id !== action.payload.imageId) }
                        : sheet
                )
            };
        }

        case 'ADD_SHAPE':
            return {
                ...state,
                sheets: state.sheets.map(sheet =>
                    sheet.sheetId === action.payload.sheetId
                        ? { ...sheet, shapes: [...sheet.shapes, action.payload.shape] }
                        : sheet
                )
            };

        case 'UPDATE_SHAPE':
            return {
                ...state,
                sheets: state.sheets.map(sheet =>
                    sheet.sheetId === action.payload.sheetId
                        ? {
                            ...sheet,
                            shapes: sheet.shapes.map(shp =>
                                shp.id === action.payload.shapeId
                                    ? { ...shp, ...action.payload.updates }
                                    : shp
                            )
                        }
                        : sheet
                )
            };

        case 'REMOVE_SHAPE':
            return {
                ...state,
                sheets: state.sheets.map(sheet =>
                    sheet.sheetId === action.payload.sheetId
                        ? { ...sheet, shapes: sheet.shapes.filter(shp => shp.id !== action.payload.shapeId) }
                        : sheet
                )
            };

        case 'ADD_CHART':
            return {
                ...state,
                sheets: state.sheets.map(sheet =>
                    sheet.sheetId === action.payload.sheetId
                        ? { ...sheet, charts: [...sheet.charts, action.payload.chart] }
                        : sheet
                )
            };

        case 'UPDATE_CHART':
            return {
                ...state,
                sheets: state.sheets.map(sheet =>
                    sheet.sheetId === action.payload.sheetId
                        ? {
                            ...sheet,
                            charts: sheet.charts.map(ch =>
                                ch.id === action.payload.chartId
                                    ? { ...ch, ...action.payload.updates }
                                    : ch
                            )
                        }
                        : sheet
                )
            };

        case 'ENSURE_SHEET':
            // If the sheet already exists, just make it active
            // If not, rename the FIRST sheet if it's the default 'sheet-1'
            // Otherwise add a new sheet
            const sheetExists = state.sheets.some(s => s.sheetId === action.payload);
            if (sheetExists) {
                return { ...state, activeSheetId: action.payload };
            }

            // If we only have the default 'sheet-1', rename it to the new UUID
            if (state.sheets.length === 1 && state.sheets[0].sheetId === 'sheet-1') {
                return {
                    ...state,
                    activeSheetId: action.payload,
                    sheets: [{ ...state.sheets[0], sheetId: action.payload }]
                };
            }

            // Otherwise add as new sheet
            const newSheet: SheetState = {
                sheetId: action.payload,
                name: `Sheet${state.sheets.length + 1}`,
                grid: { ...state.sheets[0].grid },
                cells: {},
                images: [],
                shapes: [],
                charts: [],
                conditionalFormatting: [],
                dataValidation: []
            };
            return {
                ...state,
                activeSheetId: action.payload,
                sheets: [...state.sheets, newSheet]
            };

        case 'REMOVE_CHART':
            return {
                ...state,
                sheets: state.sheets.map(sheet =>
                    sheet.sheetId === action.payload.sheetId
                        ? { ...sheet, charts: sheet.charts.filter(ch => ch.id !== action.payload.chartId) }
                        : sheet
                )
            };

        case 'UPDATE_GRID_CONFIG':
            return {
                ...state,
                sheets: state.sheets.map(sheet =>
                    sheet.sheetId === action.payload.sheetId
                        ? { ...sheet, grid: { ...sheet.grid, ...action.payload.config } }
                        : sheet
                )
            };

        default:
            return state;
    }
}

export const DocumentProvider = ({ children, initialDocument }: { children: ReactNode; initialDocument?: DocumentState }) => {
    const [state, dispatch] = useReducer(documentReducer, initialDocument || initialState);
    const hasCleanedUp = useRef(false);

    const loadDocument = (document: DocumentState) => {
        dispatch({ type: 'SET_DOCUMENT', payload: document });
    };

    const updateCell = (sheetId: string, cellKey: string, data: Partial<CellState>) => {
        dispatch({ type: 'UPDATE_CELL', payload: { sheetId, cellKey, data } });
    };

    const updateCells = (sheetId: string, cells: Record<string, Partial<CellState>>) => {
        dispatch({ type: 'UPDATE_CELLS', payload: { sheetId, cells } });
    };

    const setCellStyle = (sheetId: string, cellKey: string, style: Partial<CellStyle>) => {
        dispatch({ type: 'SET_CELL_STYLE', payload: { sheetId, cellKey, style } });
    };

    const setCellStyles = (sheetId: string, cellKeys: string[], style: Partial<CellStyle>) => {
        dispatch({ type: 'SET_CELL_STYLES', payload: { sheetId, cellKeys, style } });
    };

    const addImage = (sheetId: string, image: ImageState) => {
        dispatch({ type: 'ADD_IMAGE', payload: { sheetId, image } });
    };

    const updateImage = (sheetId: string, imageId: string, updates: Partial<ImageState>) => {
        dispatch({ type: 'UPDATE_IMAGE', payload: { sheetId, imageId, updates } });
    };

    const removeImage = (sheetId: string, imageId: string) => {
        dispatch({ type: 'REMOVE_IMAGE', payload: { sheetId, imageId } });
    };

    const addShape = (sheetId: string, shape: ShapeState) => {
        dispatch({ type: 'ADD_SHAPE', payload: { sheetId, shape } });
    };

    const updateShape = (sheetId: string, shapeId: string, updates: Partial<ShapeState>) => {
        dispatch({ type: 'UPDATE_SHAPE', payload: { sheetId, shapeId, updates } });
    };

    const removeShape = (sheetId: string, shapeId: string) => {
        dispatch({ type: 'REMOVE_SHAPE', payload: { sheetId, shapeId } });
    };

    const addChart = (sheetId: string, chart: ChartState) => {
        dispatch({ type: 'ADD_CHART', payload: { sheetId, chart } });
    };

    const updateChart = (sheetId: string, chartId: string, updates: Partial<ChartState>) => {
        dispatch({ type: 'UPDATE_CHART', payload: { sheetId, chartId, updates } });
    };

    const removeChart = (sheetId: string, chartId: string) => {
        dispatch({ type: 'REMOVE_CHART', payload: { sheetId, chartId } });
    };

    const updateGridConfig = (sheetId: string, config: Partial<SheetState['grid']>) => {
        dispatch({ type: 'UPDATE_GRID_CONFIG', payload: { sheetId, config } });
    };

    const setActiveSheet = (sheetId: string) => {
        dispatch({ type: 'SET_ACTIVE_SHEET', payload: sheetId });
    };

    const setCellValidation = (sheetId: string, cellKey: string, validation: any) => {
        dispatch({ type: 'SET_DATA_VALIDATION', payload: { sheetId, cellKey, validation } });
    };

    const saveToIPFS = async () => {
        console.log('💾 Preparing to save document...');

        let cellCount = 0;
        let imageCount = 0;
        let shapeCount = 0;
        let chartCount = 0;

        state.sheets.forEach(sheet => {
            cellCount += Object.keys(sheet.cells).length;
            imageCount += sheet.images.length;
            shapeCount += sheet.shapes.length;
            chartCount += sheet.charts.length;
        });

        console.log('--------------------------------------------------');
        console.log(`📊 SAVE DIAGNOSTICS:`);
        console.log(`📝 Cells Count: ${cellCount}`);
        console.log(`🖼️ Images Count: ${imageCount}`);
        console.log(`🔺 Shapes Count: ${shapeCount}`);
        console.log(`📊 Charts Count: ${chartCount}`);

        // Single Source of Truth Validation
        if (cellCount === 0 && imageCount === 0 && shapeCount === 0 && chartCount === 0) {
            console.warn('⚠️ WARNING: Document state appears empty! Verify data is being written to DocumentState.');
        } else {
            console.log('✅ DocumentState verification passed.');
        }
        console.log('--------------------------------------------------');

        try {
            const json = serializeDocument(state);
            console.log('Serialized Document Size:', json.length, 'bytes');

            // On first save, clean up any previously accumulated IPFS snapshot backup keys
            if (!hasCleanedUp.current) {
                hasCleanedUp.current = true;
                cleanupIPFSSnapshotBackups();
            }

            // Use a single fixed key per document instead of creating a new timestamped key every save
            // This prevents unbounded localStorage growth
            try {
                const backupKey = `ipfs_backup_${state.documentId}`;
                safeSetItem(backupKey, json);
            } catch (storageError) {
                console.warn('⚠️ LocalStorage backup failed (quota full, eviction unsuccessful). IPFS save not affected.', storageError);
            }

            return 'Qm_mock_cid_' + Date.now();
        } catch (error) {
            console.error('Failed to serialize document for save:', error);
            throw error;
        }
    };

    return (
        <DocumentStateContext.Provider value={{
            state,
            dispatch,
            loadDocument, // Add this
            updateCell,
            updateCells,
            setCellStyle,
            setCellStyles,
            addImage,
            updateImage,
            removeImage,
            addChart,
            updateChart,
            removeChart,
            addShape,
            updateShape,
            removeShape,
            updateGridConfig,
            setActiveSheet,
            saveToIPFS,
            setCellValidation
        }}>
            {children}
        </DocumentStateContext.Provider>
    );
};

export const useDocumentState = () => {
    const context = useContext(DocumentStateContext);
    if (context === undefined) {
        throw new Error('useDocumentState must be used within a DocumentProvider');
    }
    return context;
};
