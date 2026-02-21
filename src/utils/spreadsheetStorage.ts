// Spreadsheet Storage Utility for managing user spreadsheets
import { DocumentState } from '../types/documentState';
import { serializeDocument, deserializeDocument } from './documentSerializer';
import { getOwnerLinks, getCollaborationLink } from './collaborationSystem';
import { safeSetItem, limitSpreadsheetCount } from './storageManager';

// Re-export DocumentState as SpreadsheetData for compatibility or just use DocumentState
export type SpreadsheetData = DocumentState;

const STORAGE_KEY_PREFIX = 'spreadsheet_';
const RECENT_SHEETS_KEY = 'recent_sheets_';

/**
 * Generate a unique ID for a spreadsheet
 */
export function generateSpreadsheetId(): string {
  return `sheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save a spreadsheet to localStorage using the unified serializer
 */
export function saveSpreadsheet(
  documentState: DocumentState,
): DocumentState {
  const data: DocumentState = {
    ...documentState,
    metadata: {
      ...documentState.metadata,
      updatedAt: new Date().toISOString()
    }
  };

  // Serialize using the unified serializer
  const serialized = serializeDocument(data);

  // Save the spreadsheet (quota-safe)
  safeSetItem(
    `${STORAGE_KEY_PREFIX}${data.documentId}`,
    serialized
  );

  // Update recent sheets list
  if (data.metadata.owner) {
    updateRecentSheets(data.metadata.owner, data.documentId);
  }

  return data;
}

/**
 * Load a spreadsheet from localStorage
 */
export function loadSpreadsheet(id: string): DocumentState | null {
  const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
  if (!data) return null;

  try {
    return deserializeDocument(data);
  } catch (error) {
    console.error('Failed to parse spreadsheet data:', error);
    return null;
  }
}

/**
 * Get all recent sheets for a user
 */
export function getRecentSheets(userEmail: string): DocumentState[] {
  const recentIds = getRecentSheetIds(userEmail);
  const sheets: DocumentState[] = [];

  for (const id of recentIds) {
    const sheet = loadSpreadsheet(id);
    if (sheet) {
      sheets.push(sheet);
    }
  }

  // Sort by last modified (most recent first)
  return sheets.sort(
    (a, b) => {
      const dateA = new Date(a.metadata.updatedAt || 0).getTime();
      const dateB = new Date(b.metadata.updatedAt || 0).getTime();
      return dateB - dateA;
    }
  );
}

/**
 * Get recent sheet IDs for a user
 */
function getRecentSheetIds(userEmail: string): string[] {
  const data = localStorage.getItem(`${RECENT_SHEETS_KEY}${userEmail}`);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

/**
 * Update the recent sheets list for a user
 */
function updateRecentSheets(userEmail: string, sheetId: string): void {
  let recentIds = getRecentSheetIds(userEmail);

  // Remove the sheet if it already exists
  recentIds = recentIds.filter(id => id !== sheetId);

  // Add to the beginning
  recentIds.unshift(sheetId);

  safeSetItem(
    `${RECENT_SHEETS_KEY}${userEmail}`,
    JSON.stringify(recentIds)
  );

  // Keep recent list capped at 20 to prevent unbounded storage growth
  limitSpreadsheetCount(userEmail, 20);
}

/**
 * Record when a sheet was reopened (viewed from dashboard)
 */
export function markSheetReopened(userEmail: string, sheetId: string): void {
  try {
    const key = `${RECENT_SHEETS_KEY}${userEmail}:meta`;
    const raw = localStorage.getItem(key);
    const meta = raw ? JSON.parse(raw) : {};
    meta[sheetId] = {
      ...(meta[sheetId] || {}),
      lastOpenedAt: new Date().toISOString(),
    };
    safeSetItem(key, JSON.stringify(meta));
  } catch {
    // noop
  }
}

/**
 * Get recent sheet metadata including lastOpenedAt and lastEdited info
 */
export function getRecentSheetsWithMeta(userEmail: string): Array<DocumentState & { lastOpenedAt?: string; wasReopened?: boolean; wasEdited?: boolean; wasShared?: boolean; }> {
  const sheets = getRecentSheets(userEmail);
  const key = `${RECENT_SHEETS_KEY}${userEmail}:meta`;
  let meta: Record<string, any> = {};
  try {
    const raw = localStorage.getItem(key);
    meta = raw ? JSON.parse(raw) : {};
  } catch {
    meta = {};
  }

  // Build a set of spreadsheet IDs that the user has shared via collaboration links
  const sharedSheetIds = new Set<string>();
  try {
    const ownerLinkIds = getOwnerLinks(userEmail);
    for (const linkId of ownerLinkIds) {
      const link = getCollaborationLink(linkId);
      if (link) sharedSheetIds.add(link.spreadsheetId);
    }
  } catch {
    // ignore
  }

  return sheets.map(s => {
    const m = meta[s.documentId] || {};
    const lastOpenedAt: string | undefined = m.lastOpenedAt;
    const wasReopened = !!lastOpenedAt;
    // Only show "Edited" if lastModified is AFTER lastOpenedAt
    const lastModified = s.metadata.updatedAt;
    const wasEdited = !!(lastOpenedAt && lastModified &&
      (new Date(lastModified).getTime() - new Date(lastOpenedAt).getTime()) > 2000);
    const wasShared = sharedSheetIds.has(s.documentId);
    return { ...s, lastOpenedAt, wasReopened, wasEdited, wasShared };
  });
}

/**
 * Delete a spreadsheet
 */
export function deleteSpreadsheet(id: string, userEmail: string): void {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
  // Also clear sheet-level cache for this document
  localStorage.removeItem(`sheets:data:${id}`);
  localStorage.removeItem(`sheets:hash:${id}`);
  localStorage.removeItem(`sheets:timestamp:${id}`);

  // Remove from recent sheets
  let recentIds = getRecentSheetIds(userEmail);
  recentIds = recentIds.filter(sheetId => sheetId !== id);
  safeSetItem(
    `${RECENT_SHEETS_KEY}${userEmail}`,
    JSON.stringify(recentIds)
  );
}

/**
 * Get the last active spreadsheet for a user (for auto-restore)
 */
export function getLastActiveSpreadsheet(userEmail: string): DocumentState | null {
  const recentSheets = getRecentSheets(userEmail);
  return recentSheets.length > 0 ? recentSheets[0] : null;
}

/**
 * Clear any cached data for a new blank spreadsheet
 */
export function clearNewSpreadsheetCache(id: string): void {
  // Remove any existing cache for this ID
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
}

/**
 * Auto-save current spreadsheet
 * NOTE: This usually is now handled by DocumentStateContext via saveToIPFS/saveDocument
 * But if Dashboard or other components call this, we map it to saveSpreadsheet
 */
export function autoSaveSpreadsheet(
  id: string,
  title: string,
  userEmail: string,
  // Accept simplified args or DocumentState?
  // To keep compatibility with potential callers, we might need a bridge,
  // but better to force update callers.
  // I will change the signature to expect DocumentState or just remove it if logic is identical to saveSpreadsheet.
  documentState: DocumentState
): void {
  saveSpreadsheet(documentState);
}

/**
 * Format date for display
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
