
import ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';
import { DocumentState, SheetState } from '../types/documentState';

// Helper to generate a new DocumentState structure
function createEmptyDocumentState(title: string, owner: string): DocumentState {
    return {
        documentId: `doc_${Date.now()}_${uuidv4()}`,
        metadata: {
            title,
            owner,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            theme: 'light',
            sheetCount: 1
        },
        sheets: [],
        activeSheetId: '',
    };
}

/**
 * Parses a CSV file content into a DocumentState
 */
export async function parseCSV(content: string, fileName: string, owner: string = ''): Promise<DocumentState> {
    const doc = createEmptyDocumentState(fileName.replace(/\.csv$/i, ''), owner);

    const sheetId = `sheet_${Date.now()}_${uuidv4()}`;
    const cells: Record<string, any> = {};

    // Robust CSV parsing (handling quotes)
    // This is a simple implementation, for production consider a library like PapaParse
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentVal = '';
    let insideQuote = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (char === '"') {
            if (insideQuote && nextChar === '"') {
                currentVal += '"';
                i++; // Skip next quote
            } else {
                insideQuote = !insideQuote;
            }
        } else if (char === ',' && !insideQuote) {
            currentRow.push(currentVal.trim());
            currentVal = '';
        } else if ((char === '\r' || char === '\n') && !insideQuote) {
            if (char === '\r' && nextChar === '\n') i++; // Skip \n
            currentRow.push(currentVal.trim());
            rows.push(currentRow);
            currentRow = [];
            currentVal = '';
        } else {
            currentVal += char;
        }
    }
    if (currentVal || currentRow.length > 0) {
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
    }

    // Convert rows to cell map
    rows.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            const colLetter = getColumnLetter(colIndex);
            const cellKey = `${colLetter}${rowIndex + 1}`;
            if (cellValue) {
                // Try to detect numbers
                const numValue = Number(cellValue);
                if (!isNaN(numValue) && cellValue.trim() !== '') {
                    cells[cellKey] = { value: cellValue, type: 'number' };
                } else {
                    cells[cellKey] = { value: cellValue, type: 'string' };
                }
            }
        });
    });

    const sheet: SheetState = {
        sheetId,
        name: 'Sheet1',
        cells,
        images: [],
        shapes: [],
        charts: [],
        conditionalFormatting: [],
        dataValidation: [],
        grid: {
            rowSizes: {},
            columnSizes: {},
            maxRows: 100,
            maxCols: 26,
            frozenRows: 0,
            frozenColumns: 0,
            showGridlines: true
        }
    };

    doc.sheets.push(sheet);
    doc.activeSheetId = sheetId;

    return doc;
}

/**
 * Parses an XLSX file buffer into a DocumentState using ExcelJS
 */
export async function parseXLSX(buffer: ArrayBuffer, fileName: string, owner: string = ''): Promise<DocumentState> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const doc = createEmptyDocumentState(fileName.replace(/\.xlsx$/i, ''), owner);

    workbook.eachSheet((worksheet, sheetId) => {
        const newSheetId = `sheet_${Date.now()}_${sheetId}_${uuidv4()}`;
        const cells: Record<string, any> = {};
        const columnSizes: Record<string, number> = {};
        const rowSizes: Record<string, number> = {};

        // Process Columns
        worksheet.columns?.forEach((col, index) => {
            if (col.width) {
                // ExcelJS width is char count approx, we usually use pixels. 
                // Approx conversion: width * 7 or 8. Let's use 8.
                columnSizes[index] = Math.round(col.width * 8);
            }
        });

        // Process Rows
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (row.height) {
                rowSizes[rowNumber] = row.height;
            }

            row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                const colLetter = getColumnLetter(colNumber - 1); // 0-indexed for our helper
                const cellKey = `${colLetter}${rowNumber}`;

                let value = cell.text || '';
                if (cell.value !== null && cell.value !== undefined) {
                    // Handle formulas, rich text, etc roughly
                    if (typeof cell.value === 'object') {
                        if ('result' in cell.value) {
                            value = String(cell.value.result);
                        } else if ('richText' in cell.value) {
                            value = cell.text;
                        } else {
                            value = String(cell.value);
                        }
                    } else {
                        value = String(cell.value);
                    }
                }

                // Basic Style Extraction
                const style: any = {};
                if (cell.font) {
                    if (cell.font.bold) style.bold = true;
                    if (cell.font.italic) style.italic = true;
                    if (cell.font.underline) style.underline = true;
                    if (cell.font.color?.argb) {
                        // ARGB to HEX
                        style.color = argbToHex(cell.font.color.argb);
                    }
                    if (cell.font.size) style.fontSize = cell.font.size;
                    if (cell.font.name) style.fontFamily = cell.font.name;
                }
                if (cell.fill && cell.fill.type === 'pattern' && cell.fill.fgColor?.argb) {
                    style.backgroundColor = argbToHex(cell.fill.fgColor.argb);
                }
                if (cell.alignment) {
                    if (cell.alignment.horizontal) style.alignment = { horizontal: cell.alignment.horizontal };
                }

                cells[cellKey] = {
                    value,
                    style: Object.keys(style).length > 0 ? style : undefined,
                    // We can infer type
                    type: isNaN(Number(value)) ? 'string' : 'number'
                };
            });
        });

        // Initialize images array for this sheet
        const sheetImages: any[] = [];

        // Process Images
        worksheet.getImages().forEach((imageRef) => {
            try {
                // imageRef has generic type, cast or inspect
                const imgId = imageRef.imageId;
                const range = imageRef.range;

                // Retrieve image data from workbook
                // workbook.getImage(id) returns { name, type, buffer, extension }
                // Note: type is mime type (e.g., 'image/png'), extension is 'png'
                const image = workbook.getImage(Number(imgId)) as any;

                if (image && range) {
                    // Calculate X position (sum of column widths before the image anchor)
                    let x = 0;
                    for (let c = 0; c < range.tl.col; c++) {
                        x += (columnSizes[c] || 64); // Fixed index: 0-based matches loop
                    }
                    if (range.tl.nativeColOff) {
                        x += Math.round(range.tl.nativeColOff / 9525);
                    }

                    // Calculate Y position (sum of row heights before the image anchor)
                    let y = 0;
                    for (let r = 0; r < range.tl.row; r++) {
                        y += (rowSizes[r + 1] || 20); // rowSizes is 1-based (Excel rows)
                    }
                    if (range.tl.nativeRowOff) {
                        y += Math.round(range.tl.nativeRowOff / 9525);
                    }

                    // Calculate Width and Height
                    // If ext is present (extent), use it. Otherwise calculate from br (bottom-right)
                    let width = 0;
                    let height = 0;

                    // Type assertion for range to access 'ext' if it exists in internal model
                    const rangeAny = range as any;

                    if (rangeAny.ext) {
                        width = Math.round(rangeAny.ext.width / 9525);
                        height = Math.round(rangeAny.ext.height / 9525);
                    } else if (range.br) {
                        // Robust calculation: Width = X2 - X1
                        // X2 = Sum(cols 0 to br.col-1) + br.offset
                        let x2 = 0;
                        for (let c = 0; c < range.br.col; c++) {
                            x2 += (columnSizes[c] || 64); // Fixed index
                        }
                        if (range.br.nativeColOff) {
                            x2 += Math.round(range.br.nativeColOff / 9525);
                        }
                        width = x2 - x;

                        // Robust calculation: Height = Y2 - Y1
                        let y2 = 0;
                        for (let r = 0; r < range.br.row; r++) {
                            y2 += (rowSizes[r + 1] || 20);
                        }
                        if (range.br.nativeRowOff) {
                            y2 += Math.round(range.br.nativeRowOff / 9525);
                        }
                        height = y2 - y;
                    }

                    // Fallback defaults if calculation failed or resulted in 0
                    if (width <= 0) width = 100;
                    if (height <= 0) height = 100;

                    // Convert Buffer to Base64
                    let base64 = '';
                    if (image.buffer) {
                        // Browser environment: buffer is likely ArrayBuffer
                        const bytes = new Uint8Array(image.buffer);
                        let binary = '';
                        for (let i = 0; i < bytes.byteLength; i++) {
                            binary += String.fromCharCode(bytes[i]);
                        }
                        // Use extension if type is missing or strange
                        const mimeType = image.type || `image/${image.extension || 'png'}`;
                        base64 = `data:${mimeType};base64,${window.btoa(binary)}`;
                    }

                    if (base64) {
                        sheetImages.push({
                            id: `img_${uuidv4()}`,
                            src: base64,
                            x,
                            y,
                            width,
                            height,
                            rotation: 0,
                            opacity: 1,
                            layer: 1
                        });
                    }
                }
            } catch (err) {
                console.warn('Failed to extract image:', err);
            }
        });

        const sheet: SheetState = {
            sheetId: newSheetId,
            name: worksheet.name,
            cells,
            images: sheetImages,
            shapes: [],
            charts: [],
            conditionalFormatting: [],
            dataValidation: [],
            grid: {
                rowSizes,
                columnSizes,
                maxRows: Math.max(Object.keys(rowSizes).length + 10, 100),
                maxCols: Math.max(Object.keys(columnSizes).length + 5, 26),
                frozenRows: 0,
                frozenColumns: 0,
                showGridlines: true
            }
        };

        // Initialize images array if not present in the variable scope yet 
        // (Wait, I used 'sheet.images.push' above but 'sheet' is defined BELOW. 
        // I need to define 'images' array BEFORE loop)

        doc.sheets.push(sheet);
    });

    if (doc.sheets.length > 0) {
        doc.activeSheetId = doc.sheets[0].sheetId;
    }

    return doc;
}


// --- Helpers ---

function getColumnLetter(colIndex: number): string {
    let label = '';
    let num = colIndex;
    while (num >= 0) {
        label = String.fromCharCode(65 + (num % 26)) + label;
        num = Math.floor(num / 26) - 1;
    }
    return label;
}

function argbToHex(argb: string): string {
    if (!argb) return '#000000';
    if (argb.length === 8) {
        return '#' + argb.substring(2); // Strip Alpha generic
    }
    return '#' + argb;
}

export async function importFile(file: File, owner: string = ''): Promise<DocumentState> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
        const text = await file.text();
        return parseCSV(text, file.name, owner);
    } else if (extension === 'xlsx' || extension === 'xls') {
        const buffer = await file.arrayBuffer();
        return parseXLSX(buffer, file.name, owner);
    } else {
        throw new Error('Unsupported file type');
    }
}
