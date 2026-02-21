/**
 * COMPREHENSIVE EXPORT SERVICE
 * Integrates IPFS serialization, CSV, PDF, and JSON exports
 * Uses unified cell schema for consistent data representation
 */

import { DocumentState, SheetData } from '../types/documentState';
import { SerializedSheet, ExportOptions } from '../types/unifiedCell';
import {
  serializeSheetForIPFS,
  exportSheetToCSV,
  renderCellToPDF,
  downloadCSV
} from '../utils/unifiedExport';

// ============================================================================
// IPFS SERIALIZATION
// ============================================================================

/**
 * Serialize entire document for IPFS storage
 * Converts all sheets to unified cell schema
 */
export function serializeDocumentForIPFS(documentState: DocumentState): {
  documentId: string;
  metadata: any;
  sheets: SerializedSheet[];
} {
  console.log('🔄 Serializing document for IPFS...');

  const serializedSheets = documentState.sheets.map(sheet =>
    serializeSheetForIPFS(sheet)
  );

  console.log(`✅ Serialized ${serializedSheets.length} sheets for IPFS`);

  return {
    documentId: documentState.documentId,
    metadata: documentState.metadata,
    sheets: serializedSheets
  };
}

// ============================================================================
// CSV EXPORT
// ============================================================================

/**
 * Export document to CSV with unified schema
 * Includes styling annotations and proper type handling
 */
export function exportDocumentToCSV(
  documentState: DocumentState,
  filename?: string,
  options: ExportOptions = {}
): void {
  console.log('📄 Exporting document to CSV...');

  const defaultOptions: ExportOptions = {
    includeStyles: false,  // ✅ FIX: Don't include style annotations in CSV values
    includeFormulas: false,
    fallbackOnError: true,
    ...options
  };

  // Get active sheet or first sheet
  const activeSheet = documentState.sheets.find(s => s.sheetId === documentState.activeSheetId)
    || documentState.sheets[0];

  if (!activeSheet) {
    console.error('❌ No sheet to export');
    return;
  }

  // Serialize sheet to unified format
  const serializedSheet = serializeSheetForIPFS(activeSheet);

  // Convert to CSV
  const csvContent = exportSheetToCSV(serializedSheet, defaultOptions);

  // Generate filename if not provided
  const csvFilename = filename || `${documentState.metadata.title}_${new Date().toISOString().slice(0, 10)}.csv`;

  // Download
  downloadCSV(csvContent, csvFilename);

  console.log(`✅ CSV export complete: ${csvFilename}`);
}

/**
 * Export all sheets to separate CSV files (as ZIP)
 */
export async function exportAllSheetsToCSV(
  documentState: DocumentState,
  options: ExportOptions = {}
): Promise<void> {
  console.log('📄 Exporting all sheets to CSV...');

  // Check if JSZip is available
  const hasJSZip = typeof window !== 'undefined' && (window as any).JSZip;

  if (!hasJSZip) {
    console.warn('⚠️ JSZip not available, exporting active sheet only');
    exportDocumentToCSV(documentState, undefined, options);
    return;
  }

  const JSZip = (window as any).JSZip;
  const zip = new JSZip();

  // Export each sheet
  for (const sheet of documentState.sheets) {
    const serializedSheet = serializeSheetForIPFS(sheet);
    const csvContent = exportSheetToCSV(serializedSheet, options);
    zip.file(`${sheet.name}.csv`, csvContent);
  }

  // Generate ZIP
  const blob = await zip.generateAsync({ type: 'blob' });

  // Download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${documentState.metadata.title}_all_sheets.zip`;
  link.click();
  URL.revokeObjectURL(url);

  console.log('✅ All sheets exported as ZIP');
}

// ============================================================================
// PDF EXPORT
// ============================================================================

// Import jsPDF from installed package
import { jsPDF } from 'jspdf';

/**
 * Export document to PDF with images and styling
 * Requires jsPDF library
 */
export async function exportDocumentToPDF(
  documentState: DocumentState,
  filename?: string,
  options: ExportOptions = {}
): Promise<void> {
  console.log('📄 Exporting document to PDF...');

  // Create new jsPDF instance
  const pdfDoc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const defaultOptions: ExportOptions = {
    includeStyles: true,
    ipfsGateway: 'https://ipfs.io/ipfs/',
    maxImageSize: 5 * 1024 * 1024, // 5MB
    fallbackOnError: true,
    ...options
  };

  // Get active sheet
  const activeSheet = documentState.sheets.find(s => s.sheetId === documentState.activeSheetId)
    || documentState.sheets[0];

  if (!activeSheet) {
    console.error('❌ No sheet to export');
    return;
  }

  // Serialize sheet
  const serializedSheet = serializeSheetForIPFS(activeSheet);

  // Add title
  pdfDoc.setFontSize(16);
  pdfDoc.setTextColor('#000000');
  pdfDoc.text(documentState.metadata.title, 15, 15);

  pdfDoc.setFontSize(10);
  pdfDoc.setTextColor('#666666');
  pdfDoc.text(`Sheet: ${activeSheet.name}`, 15, 22);
  pdfDoc.text(`Exported: ${new Date().toLocaleString()}`, 15, 27);

  // ✅ FIX: Auto-calculate column widths based on content
  const startX = 10;
  const startY = 35;
  const cellHeight = 8;
  const pageWidth = 277; // A4 landscape usable width in mm

  // Find grid bounds
  let maxRow = 0;
  let maxCol = 0;

  // Build a map of cell values for width calculation
  const cellMap = new Map<string, string>();
  serializedSheet.cells.forEach(cell => {
    if (cell.type !== 'image') {
      maxRow = Math.max(maxRow, cell.row);
      const colIndex = columnToIndex(cell.col);
      maxCol = Math.max(maxCol, colIndex);
      cellMap.set(`${cell.col}${cell.row}`, cell.value || '');
    }
  });

  // Also check images for row/col bounds
  const imageData: Array<{ src: string, x: number, y: number, width: number, height: number }> = [];
  for (const sheet of documentState.sheets) {
    if (sheet.sheetId === activeSheet.sheetId) {
      (sheet.images || []).forEach(img => {
        if (img.src && (img.src.startsWith('data:') || img.src.startsWith('http'))) {
          imageData.push({ src: img.src, x: img.x || 0, y: img.y || 0, width: img.width || 100, height: img.height || 80 });
        }
      });
    }
  }

  console.log(`📊 PDF Grid: ${maxRow} rows × ${maxCol + 1} columns, ${imageData.length} images`);

  // ✅ FIX: Calculate per-column widths based on content length
  const colWidths: number[] = [];
  const totalCols = maxCol + 1;
  const minColWidth = 18;
  const maxColWidth = 55;

  for (let c = 0; c <= maxCol; c++) {
    const colLetter = String.fromCharCode(65 + c);
    let maxLen = 4; // minimum
    for (let r = 1; r <= maxRow; r++) {
      const val = cellMap.get(`${colLetter}${r}`) || '';
      maxLen = Math.max(maxLen, val.length);
    }
    // Scale: ~2mm per character, clamped
    colWidths.push(Math.min(maxColWidth, Math.max(minColWidth, maxLen * 1.8)));
  }

  // Scale widths to fit page if needed
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const scaleFactor = totalWidth > pageWidth ? pageWidth / totalWidth : 1;
  const scaledWidths = colWidths.map(w => w * scaleFactor);

  // Limit rows to fit on page
  const maxRowsPerPage = Math.floor((190 - startY) / cellHeight);
  const rowsToRender = Math.min(maxRow, maxRowsPerPage);

  // Draw grid
  pdfDoc.setDrawColor('#cccccc');
  pdfDoc.setLineWidth(0.1);

  for (let r = 0; r <= rowsToRender; r++) {
    let x = startX;
    for (let c = 0; c < scaledWidths.length; c++) {
      const y = startY + r * cellHeight;
      pdfDoc.rect(x, y, scaledWidths[c], cellHeight);
      x += scaledWidths[c];
    }
  }

  // Render text cells
  for (const cell of serializedSheet.cells) {
    if (cell.type === 'image') continue;
    if (cell.row > rowsToRender) continue;

    const colIndex = columnToIndex(cell.col);
    if (colIndex >= scaledWidths.length) continue;

    // Calculate x position
    let x = startX;
    for (let c = 0; c < colIndex; c++) x += scaledWidths[c];
    const y = startY + (cell.row - 1) * cellHeight;
    const colWidth = scaledWidths[colIndex];

    try {
      await renderCellToPDF(cell, pdfDoc, x, y, colWidth, cellHeight, defaultOptions);
    } catch (error) {
      console.error(`❌ Failed to render cell ${cell.col}${cell.row}:`, error);
    }
  }

  // ✅ FIX: Render images using base64 data URL directly (pixel coords → PDF mm)
  const pxToMm = 0.264583; // 1px = 0.264583mm at 96dpi
  for (const img of imageData) {
    try {
      const imgX = startX + img.x * pxToMm;
      const imgY = startY + img.y * pxToMm;
      const imgW = Math.max(20, img.width * pxToMm);
      const imgH = Math.max(15, img.height * pxToMm);

      if (img.src.startsWith('data:image/')) {
        const format = img.src.includes('image/png') ? 'PNG' : 'JPEG';
        pdfDoc.addImage(img.src, format, imgX, imgY, imgW, imgH);
        console.log(`✅ Embedded image at x=${imgX.toFixed(1)}mm, y=${imgY.toFixed(1)}mm`);
      }
    } catch (imgErr) {
      console.warn('⚠️ Could not embed image:', imgErr);
    }
  }

  // Add footer
  pdfDoc.setFontSize(8);
  pdfDoc.setTextColor('#999999');
  pdfDoc.text(
    `Generated by EtherX Excel`,
    15,
    200
  );

  // Save PDF
  const pdfFilename = filename || `${documentState.metadata.title}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdfDoc.save(pdfFilename);

  console.log(`✅ PDF export complete: ${pdfFilename}`);
  console.log(`   Rendered ${serializedSheet.cells.length} cells, ${imageData.length} images`);
  console.log(`   Grid: ${rowsToRender} rows × ${scaledWidths.length} columns`);
}

/**
 * Convert column letter to index (A = 0, Z = 25, AA = 26)
 */
function columnToIndex(column: string): number {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  return result - 1;
}

// ============================================================================
// XLSX EXPORT
// ============================================================================

/**
 * Export document to XLSX with full formatting (colors, bold, italic, font size)
 * Uses ExcelJS for rich formatting support
 */
export async function exportDocumentToXLSX(
  documentState: DocumentState,
  filename?: string
): Promise<void> {
  console.log('📊 ═══════════════════════════════════════');
  console.log('📊 XLSX EXPORT STARTING');
  console.log('📊 ═══════════════════════════════════════');

  // ── STEP 1: Get the active sheet from DocumentState (single source of truth) ──
  const activeSheet =
    documentState.sheets.find(s => s.sheetId === documentState.activeSheetId) ||
    documentState.sheets[0];

  if (!activeSheet) {
    console.error('❌ No sheet found in DocumentState');
    alert('No spreadsheet data to export.');
    return;
  }

  console.log(`📋 Exporting sheet: "${activeSheet.name}" (${activeSheet.sheetId})`);
  console.log(`📋 DocumentState cells: ${Object.keys(activeSheet.cells || {}).length}`);
  console.log(`📋 DocumentState images: ${activeSheet.images?.length || 0}`);

  // ── STEP 2: Get cell data from DocumentState ──
  const docCells: Record<string, any> = activeSheet.cells || {};

  // Also check window.__cellFormats for live formatting overrides
  const cellFormatsFromWindow = (window as any).__cellFormats as Record<string, any> | undefined;
  const cellFormats: Record<string, any> = cellFormatsFromWindow || {};

  console.log(`📋 Total cells to export: ${Object.keys(docCells).length}`);

  // ── STEP 3: Collect images from DocumentState + live window state ──
  const allImagesMap = new Map<string, any>();

  // From DocumentState
  (activeSheet.images || []).forEach(img => {
    if (img?.id && img?.src) allImagesMap.set(img.id, img);
  });

  // From live window (highest priority — most up-to-date position/size)
  const windowFloatingImages: any[] = (window as any).__floatingImages || [];
  windowFloatingImages.forEach(img => {
    if (img?.id && img?.src) allImagesMap.set(img.id, img);
  });

  const allImages = Array.from(allImagesMap.values());
  console.log(`🖼️ Total images to embed: ${allImages.length}`);

  // ── STEP 4: Build workbook ──
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EtherX Excel';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(activeSheet.name || 'Sheet1');

  // Find grid bounds
  let maxRow = 0;
  let maxCol = 0;

  Object.keys(docCells).forEach(key => {
    const match = key.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const col = columnLetterToNumber(match[1]);
      const row = parseInt(match[2], 10);
      maxRow = Math.max(maxRow, row);
      maxCol = Math.max(maxCol, col);
    }
  });

  console.log(`📊 Grid bounds: ${maxRow} rows × ${maxCol} cols`);

  // ── STEP 5: Write cells with formatting ──
  Object.entries(docCells).forEach(([key, rawCell]) => {
    const match = key.match(/^([A-Z]+)(\d+)$/);
    if (!match) return;

    const colLetter = match[1];
    const rowNum = parseInt(match[2], 10);
    const colNum = columnLetterToNumber(colLetter);

    const wsCell = worksheet.getCell(rowNum, colNum);

    // Extract value: handle both raw string and CellState object
    let value: any;
    if (rawCell === null || rawCell === undefined) {
      value = '';
    } else if (typeof rawCell === 'string' || typeof rawCell === 'number' || typeof rawCell === 'boolean') {
      value = rawCell;
    } else if (typeof rawCell === 'object') {
      value = rawCell.value ?? rawCell.displayValue ?? '';
    } else {
      value = String(rawCell);
    }

    if (value !== '' && value !== null && value !== undefined) {
      const numVal = Number(value);
      wsCell.value = (!isNaN(numVal) && String(value).trim() !== '') ? numVal : String(value);
    }

    // Apply formatting: prefer window.__cellFormats (live), then CellState style
    const fmt = cellFormats[key] || (typeof rawCell === 'object' ? (rawCell?.format || rawCell?.style || {}) : {});

    const style: any = {};

    // Font
    const font: any = {};
    if (fmt.bold) font.bold = true;
    if (fmt.italic) font.italic = true;
    if (fmt.underline) font.underline = true;
    if (fmt.fontSize) font.size = typeof fmt.fontSize === 'string' ? parseInt(fmt.fontSize) : fmt.fontSize;
    if (fmt.fontFamily) font.name = fmt.fontFamily;
    if (fmt.color && fmt.color !== '#000000') {
      font.color = { argb: hexToArgb(fmt.color) };
    }
    if (Object.keys(font).length > 0) style.font = font;

    // Fill (background color)
    if (fmt.backgroundColor && fmt.backgroundColor !== '#ffffff' && fmt.backgroundColor !== 'transparent') {
      style.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: hexToArgb(fmt.backgroundColor) }
      };
    }

    // Alignment
    if (fmt.textAlign || fmt.alignment) {
      style.alignment = {
        horizontal: (fmt.textAlign || fmt.alignment) as string,
        vertical: 'middle',
        wrapText: fmt.wrapText || false
      };
    }

    if (Object.keys(style).length > 0) {
      wsCell.style = style;
    }
  });

  // Auto-fit column widths (approximate)
  for (let c = 1; c <= maxCol; c++) {
    const col = worksheet.getColumn(c);
    let maxLen = 8;
    for (let r = 1; r <= maxRow; r++) {
      const val = String(worksheet.getCell(r, c).value || '');
      maxLen = Math.max(maxLen, val.length + 2);
    }
    col.width = Math.min(maxLen, 40);
  }

  // ── STEP 6: Embed images ──
  console.log(`🖼️ Embedding ${allImages.length} images into worksheet...`);
  for (const img of allImages) {
    try {
      if (!img.src) {
        console.warn('⚠️ Skipping image: no src', img.id);
        continue;
      }

      let base64Data: string;
      let extension: 'png' | 'jpeg' | 'gif' = 'png';

      if (img.src.startsWith('data:image/')) {
        if (img.src.includes('image/jpeg') || img.src.includes('image/jpg')) extension = 'jpeg';
        else if (img.src.includes('image/gif')) extension = 'gif';

        base64Data = img.src.split(',')[1];
        if (!base64Data) {
          console.warn('⚠️ Skipping image: malformed data URL', img.id);
          continue;
        }
      } else if (img.src.startsWith('http://') || img.src.startsWith('https://')) {
        console.log(`🌐 Fetching image from URL: ${img.src}`);
        const response = await fetch(img.src, { mode: 'cors' });
        if (!response.ok) {
          console.warn(`⚠️ Skipping image: fetch failed (${response.status})`, img.src);
          continue;
        }
        const blob = await response.blob();
        const ct = blob.type || '';
        if (ct.includes('jpeg') || ct.includes('jpg')) extension = 'jpeg';
        else if (ct.includes('gif')) extension = 'gif';
        else extension = 'png';

        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        console.warn('⚠️ Skipping image: unsupported src format', img.id, img.src.slice(0, 40));
        continue;
      }

      const imageId = workbook.addImage({ base64: base64Data, extension });
      const pxToEmu = 9525;
      const imgX = parseFloat(String(img.x || 0)) * pxToEmu;
      const imgY = parseFloat(String(img.y || 0)) * pxToEmu;

      (worksheet as any).addImage(imageId, {
        tl: { col: 0, row: 0, nativeColOff: imgX, nativeRowOff: imgY },
        ext: { width: parseFloat(String(img.width || 100)), height: parseFloat(String(img.height || 100)) },
        editAs: 'absolute'
      });

      console.log(`✅ Embedded image ${img.id} (${extension}) at x=${img.x}, y=${img.y}, ${img.width}×${img.height}px`);
    } catch (imgErr) {
      console.warn(`⚠️ Failed to embed image ${img.id}:`, imgErr);
    }
  }

  console.log(`✅ Export complete: ${Object.keys(docCells).length} cells, ${allImages.length} images embedded`);

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const xlsxFilename = filename || `${documentState.metadata?.title || 'Untitled'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = xlsxFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`✅ XLSX export complete: ${xlsxFilename}`);
}










/**
 * Convert column letter(s) to 1-based number (A=1, Z=26, AA=27)
 */
function columnLetterToNumber(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result;
}

/**
 * Convert hex color (#RRGGBB or #RGB) to ARGB string for ExcelJS (FFRRGGBB)
 */
function hexToArgb(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = clean[0] + clean[0];
    const g = clean[1] + clean[1];
    const b = clean[2] + clean[2];
    return `FF${r}${g}${b}`.toUpperCase();
  }
  if (clean.length === 6) {
    return `FF${clean}`.toUpperCase();
  }
  return 'FF000000';
}

// ============================================================================
// JSON EXPORT
// ============================================================================

/**
 * Export document as JSON (complete DocumentState)
 */
export function exportDocumentToJSON(
  documentState: DocumentState,
  filename?: string
): void {
  console.log('📄 Exporting document to JSON...');

  const json = JSON.stringify(documentState, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });

  const jsonFilename = filename || `${documentState.metadata.title}_${documentState.documentId}.json`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = jsonFilename;
  link.click();
  URL.revokeObjectURL(url);

  console.log(`✅ JSON export complete: ${jsonFilename}`);
  console.log(`   Size: ${(json.length / 1024).toFixed(2)} KB`);
}

/**
 * Export serialized document (unified schema) as JSON
 */
export function exportSerializedDocumentToJSON(
  documentState: DocumentState,
  filename?: string
): void {
  console.log('📄 Exporting serialized document to JSON...');

  const serialized = serializeDocumentForIPFS(documentState);
  const json = JSON.stringify(serialized, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });

  const jsonFilename = filename || `${documentState.metadata.title}_unified_${documentState.documentId}.json`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = jsonFilename;
  link.click();
  URL.revokeObjectURL(url);

  console.log(`✅ Serialized JSON export complete: ${jsonFilename}`);
  console.log(`   Size: ${(json.length / 1024).toFixed(2)} KB`);
}

// ============================================================================
// EXCEL EXPORT (.xlsx)
// ============================================================================

/**
 * Export document to Excel format (.xlsx)
 * Requires exceljs library
 */
export async function exportDocumentToExcel(
  documentState: DocumentState,
  filename?: string,
  options: ExportOptions = {}
): Promise<void> {
  console.log('📄 Exporting document to Excel (.xlsx)...');

  // Check if ExcelJS is available
  const hasExcelJS = typeof window !== 'undefined' && (window as any).ExcelJS;

  if (!hasExcelJS) {
    console.error('❌ ExcelJS library not loaded');
    alert('Excel export requires ExcelJS library.');
    return;
  }

  const ExcelJS = (window as any).ExcelJS;
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'EtherX Excel';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Add each sheet
  for (const sheet of documentState.sheets) {
    const worksheet = workbook.addWorksheet(sheet.name);
    const serializedSheet = serializeSheetForIPFS(sheet);

    // Add cells
    serializedSheet.cells.forEach(cell => {
      const colIndex = columnToIndex(cell.col) + 1; // ExcelJS uses 1-based
      const excelCell = worksheet.getCell(cell.row, colIndex);

      // Set value
      switch (cell.type) {
        case 'number':
          excelCell.value = parseFloat(cell.value) || 0;
          break;
        case 'formula':
          excelCell.value = { formula: cell.meta?.formula?.replace(/^=/, '') || cell.value };
          break;
        case 'checkbox':
          excelCell.value = cell.meta?.checked || cell.value === 'true';
          break;
        case 'image':
          excelCell.value = `IMAGE(${cell.meta?.ipfsCid || cell.value})`;
          break;
        case 'file':
          excelCell.value = `FILE(${cell.meta?.fileName || cell.value})`;
          break;
        default:
          excelCell.value = cell.value;
      }

      // Apply styling
      if (cell.style) {
        excelCell.font = {
          name: cell.style.fontFamily || 'Arial',
          size: cell.style.fontSize || 11,
          bold: cell.style.bold,
          italic: cell.style.italic,
          underline: cell.style.underline,
          strike: cell.style.strikethrough,
          color: cell.style.textColor ? { argb: cell.style.textColor.replace('#', 'FF') } : undefined
        };

        excelCell.fill = cell.style.bgColor && cell.style.bgColor !== '#ffffff' ? {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: cell.style.bgColor.replace('#', 'FF') }
        } : undefined;

        excelCell.alignment = {
          horizontal: cell.style.alignment || 'left',
          vertical: cell.style.verticalAlignment || 'middle',
          wrapText: cell.style.wrapText
        };

        if (cell.style.numberFormat) {
          excelCell.numFmt = cell.style.numberFormat;
        }
      }
    });
  }

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const excelFilename = filename || `${documentState.metadata.title}.xlsx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = excelFilename;
  link.click();
  URL.revokeObjectURL(url);

  console.log(`✅ Excel export complete: ${excelFilename}`);
}

// ============================================================================
// EXPORT ALL FORMATS
// ============================================================================

/**
 * Export menu - show all available formats
 */
export interface ExportFormat {
  name: string;
  extension: string;
  description: string;
  handler: (documentState: DocumentState, filename?: string, options?: ExportOptions) => void | Promise<void>;
  requiresLibrary?: string;
}

export const EXPORT_FORMATS: ExportFormat[] = [
  {
    name: 'CSV',
    extension: '.csv',
    description: 'Text-only with style annotations',
    handler: exportDocumentToCSV
  },
  {
    name: 'PDF',
    extension: '.pdf',
    description: 'Visual document with images',
    handler: exportDocumentToPDF,
    requiresLibrary: 'jsPDF'
  },
  {
    name: 'JSON',
    extension: '.json',
    description: 'Complete document state',
    handler: exportDocumentToJSON
  },
  {
    name: 'JSON (Unified)',
    extension: '.json',
    description: 'Serialized with unified cell schema',
    handler: exportSerializedDocumentToJSON
  },
  {
    name: 'Excel',
    extension: '.xlsx',
    description: 'Excel workbook with formatting',
    handler: exportDocumentToExcel,
    requiresLibrary: 'ExcelJS'
  }
];
