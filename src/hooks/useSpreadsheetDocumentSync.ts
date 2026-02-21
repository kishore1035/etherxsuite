/**
 * SPREADSHEET TO DOCUMENT STATE SYNC
 * Syncs all spreadsheet operations to documentState
 * Ensures EVERY change updates the single source of truth
 */

import { useEffect, useRef } from 'react';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { useDocumentState } from '../contexts/DocumentStateContext';

/**
 * Hook to sync SpreadsheetContext with DocumentState
 * Call this in App.tsx to ensure all changes are captured
 */
export function useSpreadsheetDocumentSync() {
  const spreadsheet = useSpreadsheet();
  // useDocumentState may throw if the hook is used outside of a DocumentProvider.
  // Wrap the call so the app degrades gracefully instead of crashing.
  let state: any;
  let dispatch: any;
  let updateCell: any;
  let setCellStyle: any;
  let addImage: any;
  let addShape: any;
  let addChart: any;
  let setActiveSheet: any;

  // Safe context access
  let docCtx: any;
  try {
    docCtx = useDocumentState();
    state = docCtx.state;
    dispatch = docCtx.dispatch;
    updateCell = docCtx.updateCell;
    setCellStyle = docCtx.setCellStyle;
    addImage = docCtx.addImage;
    addShape = docCtx.addShape;
    addChart = docCtx.addChart;
    setActiveSheet = docCtx.setActiveSheet;
  } catch (err) {
    console.warn('useSpreadsheetDocumentSync: DocumentProvider not found. Sync disabled.');
    return {
      state: undefined,
      documentReady: false,
    };
  }

  const activeSheet = state.sheets.find((s: any) => s.sheetId === state.activeSheetId) || state.sheets[0];
  const sheetId = activeSheet?.sheetId || 'sheet-1';

  // Refs to prevent infinite loops
  const isSyncingFromDoc = useRef(false);
  // Track the last documentId we hydrated from, to avoid re-hydrating the same doc
  const lastHydratedDocId = useRef<string | null>(null);

  // ============================================================================
  // REVERSE SYNC: DocumentState -> SpreadsheetContext (Initial Load & Updates)
  // ============================================================================
  useEffect(() => {
    if (!state || !state.sheets || state.sheets.length === 0) return;

    const currentSheet = state.sheets.find((s: any) => s.sheetId === state.activeSheetId) || state.sheets[0];
    if (!currentSheet) return;

    // Skip if we already hydrated this document
    if (lastHydratedDocId.current === state.documentId) return;

    const uiCellCount = Object.keys(spreadsheet.cellData).length;
    const docCellCount = Object.keys(currentSheet.cells || {}).length;
    const docImageCount = (currentSheet.images || []).length;
    const docShapeCount = (currentSheet.shapes || []).length;
    const docChartCount = (currentSheet.charts || []).length;

    // Hydrate if doc has any data (cells, images, shapes, or charts)
    const hasDocData = docCellCount > 0 || docImageCount > 0 || docShapeCount > 0 || docChartCount > 0;

    if (hasDocData) {
      console.log('🔄 Hydrating UI from DocumentState...', {
        cells: docCellCount,
        images: docImageCount,
        shapes: docShapeCount,
        charts: docChartCount,
        documentId: state.documentId
      });
      isSyncingFromDoc.current = true;
      lastHydratedDocId.current = state.documentId;

      // 1. Cells & Formatting
      if (docCellCount > 0 && uiCellCount === 0) {
        const newCellData: any = {};
        const newCellFormats: any = {};

        Object.entries(currentSheet.cells).forEach(([key, cell]: [string, any]) => {
          if (cell.value !== undefined && cell.value !== null && cell.value !== '') {
            newCellData[key] = cell.value;
          }
          if (cell.style) {
            const format: any = {};
            if (cell.style.bold) format.bold = true;
            if (cell.style.italic) format.italic = true;
            if (cell.style.underline) format.underline = true;
            if (cell.style.color) format.color = cell.style.color;
            if (cell.style.backgroundColor) format.backgroundColor = cell.style.backgroundColor;
            if (cell.style.fontSize) format.fontSize = cell.style.fontSize;
            if (cell.style.fontFamily) format.fontFamily = cell.style.fontFamily;
            if (cell.style.alignment?.horizontal) format.textAlign = cell.style.alignment.horizontal;
            if (Object.keys(format).length > 0) {
              newCellFormats[key] = format;
            }
          }
        });

        spreadsheet.setCellData(newCellData);
        spreadsheet.setCellFormats(newCellFormats);
      }

      // 2. Grid Config (row/column sizes)
      if (currentSheet.grid) {
        if (currentSheet.grid.rowSizes) {
          Object.entries(currentSheet.grid.rowSizes).forEach(([row, size]) => {
            spreadsheet.setRowHeight(Number(row), Number(size));
          });
        }
        if (currentSheet.grid.columnSizes) {
          Object.entries(currentSheet.grid.columnSizes).forEach(([col, size]) => {
            spreadsheet.setColumnWidth(Number(col), Number(size));
          });
        }
      }

      // 3. Images — dispatch back into DocumentState so ImagesLayer renders them
      // (They are already in DocumentState from initial load, so this is a no-op
      //  unless the context was re-initialized empty. The key={spreadsheetId} on
      //  DocumentProvider ensures the initial state is correct on reopen.)
      // We log them for verification:
      if (docImageCount > 0) {
        console.log(`🖼️ DocumentState has ${docImageCount} image(s) ready to render`);
      }
      if (docShapeCount > 0) {
        console.log(`🔺 DocumentState has ${docShapeCount} shape(s) ready to render`);
      }
      if (docChartCount > 0) {
        console.log(`📊 DocumentState has ${docChartCount} chart(s) ready to render`);
      }

      setTimeout(() => {
        isSyncingFromDoc.current = false;
      }, 500);
    }
  }, [state.documentId]);


  // ============================================================================
  // FORWARD SYNC: SpreadsheetContext -> DocumentState (Live Updates)
  // ============================================================================

  // 1. Sync Cell Data
  useEffect(() => {
    if (isSyncingFromDoc.current) return;
    if (!spreadsheet.cellData || !activeSheet) return;

    Object.entries(spreadsheet.cellData).forEach(([key, value]) => {
      const currentCell = activeSheet.cells[key];
      if (!currentCell || currentCell.value !== value) {
        updateCell(sheetId, key, {
          value: String(value),
          type: 'string' // Inferred
        });
      }
    });
  }, [spreadsheet.cellData, sheetId, activeSheet, updateCell]);

  // 2. Sync Cell Formats
  useEffect(() => {
    if (isSyncingFromDoc.current) return;
    if (!spreadsheet.cellFormats || !activeSheet) return;

    Object.entries(spreadsheet.cellFormats).forEach(([key, formatArg]) => {
      const format = formatArg as any;
      const style: any = {};
      if (format.bold) style.bold = true;
      if (format.italic) style.italic = true;
      if (format.underline) style.underline = true;
      if (format.color) style.color = format.color;
      if (format.backgroundColor) style.backgroundColor = format.backgroundColor;
      if (format.fontSize) style.fontSize = typeof format.fontSize === 'string' ? parseInt(format.fontSize) : format.fontSize;
      if (format.fontFamily) style.fontFamily = format.fontFamily;
      if (format.textAlign) style.alignment = { horizontal: format.textAlign };

      setCellStyle(sheetId, key, style);
    });
  }, [spreadsheet.cellFormats, sheetId, activeSheet, setCellStyle]);




  return {
    state,
    documentReady: activeSheet !== undefined,
    setActiveSheet
  };
}

// ... useDocumentSaveHandler
export function useDocumentSaveHandler() {
  const { state, saveToIPFS } = useDocumentState();
  const handleSave = async () => {
    console.log('💾 Saving complete documentState...');
    return await saveToIPFS();
  };
  return { handleSave, documentState: state };
}
