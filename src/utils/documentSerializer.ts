import { DocumentState, SheetState, CellState, GridConfig } from '../types/documentState';

/**
 * Serializes the DocumentState to a JSON string.
 * This is the Single Source of Truth for all saves/exports.
 */
export const serializeDocument = (state: DocumentState): string => {
    // We might want to optimize or clean up the state before saving
    // For now, straight JSON serialization is sufficient as our state is JSON-safe
    return JSON.stringify(state, null, 2);
};

/**
 * Deserializes a JSON string into a DocumentState.
 * Validates the structure and provides defaults for missing fields.
 */
export const deserializeDocument = (json: string): DocumentState => {
    try {
        const parsed = JSON.parse(json);

        // Basic validation
        if (!parsed || typeof parsed !== 'object') {
            throw new Error('Invalid document format: not an object');
        }

        // Ensure strict DocumentState structure with defaults
        const doc: DocumentState = {
            documentId: parsed.documentId || `doc_${Date.now()}`,
            activeSheetId: parsed.activeSheetId || 'sheet-1',
            metadata: {
                title: parsed.metadata?.title || 'Untitled',
                owner: parsed.metadata?.owner || 'guest',
                createdAt: parsed.metadata?.createdAt || new Date().toISOString(),
                updatedAt: parsed.metadata?.updatedAt || new Date().toISOString(),
                theme: parsed.metadata?.theme || 'light',
                sheetCount: parsed.metadata?.sheetCount || (parsed.sheets ? parsed.sheets.length : 1),
                version: parsed.metadata?.version || '1.0'
            },
            sheets: Array.isArray(parsed.sheets)
                ? parsed.sheets.map((s: any) => sanitizeSheet(s))
                : [createDefaultSheet()]
        };

        return doc;
    } catch (error) {
        console.error('Failed to deserialize document:', error);
        // Return a fresh empty document on failure, or rethrow? 
        // For now, let's return a default document to prevent crash, but log heavily.
        return createDefaultDocument();
    }
};

const createDefaultDocument = (): DocumentState => {
    return {
        documentId: `doc_${Date.now()}`,
        activeSheetId: 'sheet-1',
        metadata: {
            title: 'Untitled',
            owner: 'guest',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            theme: 'light',
            sheetCount: 1,
            version: '1.0'
        },
        sheets: [createDefaultSheet()]
    };
};

const createDefaultSheet = (): SheetState => {
    return {
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
    };
};

const sanitizeSheet = (s: any): SheetState => {
    // Ensure all required arrays/objects exist
    return {
        sheetId: s.sheetId || `sheet_${Date.now()}_${Math.random()}`,
        name: s.name || 'Sheet',
        protected: !!s.protected,
        protectionPassword: s.protectionPassword,
        grid: {
            maxRows: s.grid?.maxRows || 100,
            maxCols: s.grid?.maxCols || 26,
            rowSizes: s.grid?.rowSizes || {},
            columnSizes: s.grid?.columnSizes || {},
            frozenRows: s.grid?.frozenRows || 0,
            frozenColumns: s.grid?.frozenColumns || 0,
            showGridlines: s.grid?.showGridlines !== false, // default true
        },
        cells: s.cells || {},
        images: Array.isArray(s.images) ? s.images : [],
        shapes: Array.isArray(s.shapes) ? s.shapes : [],
        charts: Array.isArray(s.charts) ? s.charts : [],
        conditionalFormatting: Array.isArray(s.conditionalFormatting) ? s.conditionalFormatting : [],
        dataValidation: Array.isArray(s.dataValidation) ? s.dataValidation : [],
        mergedCells: Array.isArray(s.mergedCells) ? s.mergedCells : []
    };
};
