import { uploadToIPFS, getFromIPFS } from './pinataService';
import { DocumentState } from '../types/documentState';
import { serializeDocument, deserializeDocument } from './documentSerializer';
import { safeSetItem } from './storageManager';

// Wrapper for saving document state
// Replaces saveSpreadsheetState
export const saveDocument = async (
  state: DocumentState,
  userEmail: string,
  spreadsheetName: string = 'Untitled'
): Promise<string> => {

  // Ensure metadata is up to date
  const docToSave = {
    ...state,
    metadata: {
      ...state.metadata,
      title: spreadsheetName,
      updatedAt: new Date().toISOString(),
      owner: userEmail
    }
  };

  const serialized = serializeDocument(docToSave);

  // Use a fixed key per documentId (not timestamp) to prevent unbounded key accumulation
  const saveKey = `spreadsheet_${docToSave.documentId}`;
  safeSetItem(saveKey, serialized);

  // Store the key in user's spreadsheet list (deduplicated)
  const listKey = `sheets_${userEmail}`;
  const savedSheets: Array<{ name: string; hash: string; savedAt: string }> = JSON.parse(localStorage.getItem(listKey) || '[]');
  const existingIdx = savedSheets.findIndex(s => s.hash === saveKey);
  const entry = { name: spreadsheetName, hash: saveKey, savedAt: new Date().toISOString() };
  if (existingIdx >= 0) {
    savedSheets[existingIdx] = entry;
  } else {
    savedSheets.unshift(entry);
  }

  // Keep only last 10
  if (savedSheets.length > 10) savedSheets.splice(10);

  safeSetItem(listKey, JSON.stringify(savedSheets));

  return saveKey;
};

// Wrapper for loading document state
// Replaces loadSpreadsheetState
export const loadDocument = async (hash: string): Promise<DocumentState | null> => {
  try {
    let jsonString: string | null = null;

    // Check if it's an IPFS hash or localStorage key
    if (hash.startsWith('spreadsheet_') || hash.startsWith('autosave_')) {
      jsonString = localStorage.getItem(hash);
    } else {
      // Assume IPFS
      // Note: getFromIPFS returns JSON object usually, but deserializeDocument expects string?
      // Or getFromIPFS returns string? 
      // If getFromIPFS returns object, we need to stringify it or update deserialize.
      // deserializeDocument takes string.
      const data = await getFromIPFS(hash);
      if (data) {
        jsonString = typeof data === 'string' ? data : JSON.stringify(data);
      }
    }

    if (!jsonString) return null;

    return deserializeDocument(jsonString);
  } catch (error) {
    console.error('Error loading document:', error);
    return null;
  }
};

// Auto-save functionality
export const autoSaveDocument = async (
  state: DocumentState,
  userEmail: string,
  spreadsheetName: string = 'Untitled'
): Promise<void> => {
  try {
    const docToSave = {
      ...state,
      metadata: {
        ...state.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    // Use localStorage for auto-save with a fixed key (no new key per call)
    const serialized = serializeDocument(docToSave);
    const autosaveKey = `autosave_${userEmail}_${state.documentId}`;
    safeSetItem(autosaveKey, serialized);
    // Auto-save successful (silent)
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
};

// Get user's saved spreadsheets list (Metadata only)
export const getUserSpreadsheets = (userEmail: string): Array<{ name: string; hash: string; savedAt: string }> => {
  const savedSheets = localStorage.getItem(`sheets_${userEmail}`);
  return savedSheets ? JSON.parse(savedSheets) : [];
};

// Legacy compatibility exports if needed, but we should refactor consumers.
// I'll leave prepareExportData but it should take DocumentState
export const prepareExportData = (state: DocumentState) => {
  // For CSV/Export utilities that might expect simple structures
  // We can return the active sheet's cells 
  const activeSheet = state.sheets.find(s => s.sheetId === state.activeSheetId) || state.sheets[0];

  const cellData: Record<string, string> = {};
  Object.entries(activeSheet.cells).forEach(([key, cell]) => {
    if (cell.value) cellData[key] = cell.value;
  });

  return {
    cellData,
    metadata: state.metadata
  };
};
