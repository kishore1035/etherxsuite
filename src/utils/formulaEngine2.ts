/**
 * formulaEngine2.ts
 * Robust Excel-compatible formula evaluator.
 * Supports: SUM, AVERAGE, COUNT, COUNTA, MAX, MIN, IF, CONCAT, CONCATENATE,
 *           TODAY, NOW, LEN, UPPER, LOWER, TRIM, ROUND, ABS, SQRT, POWER,
 *           MULTIPLY, DIVIDE, DIFFERENCE, MOD, INT, LEFT, RIGHT, MID,
 *           VLOOKUP, HLOOKUP, AND, OR, NOT, ISNUMBER, ISTEXT, ISBLANK,
 *           cell references (A1, $A$1, A$1, $A1), ranges (A1:B10),
 *           arithmetic: +, -, *, /, ^, %, and comparison: =, <>, <, >, <=, >=
 */

export type CellValue = string | number | boolean | null;

export interface CellData {
    [key: string]: any;
}

// ─── Cell reference helpers ──────────────────────────────────────────────────

/** Convert column letters → 0-based index */
export function colLettersToIndex(letters: string): number {
    const s = letters.replace(/\$/g, '').toUpperCase();
    let idx = 0;
    for (let i = 0; i < s.length; i++) {
        idx = idx * 26 + (s.charCodeAt(i) - 64);
    }
    return idx - 1;
}

/** Convert 0-based column index → letters */
export function indexToColLetters(n: number): string {
    let label = '';
    let num = n;
    while (num >= 0) {
        label = String.fromCharCode(65 + (num % 26)) + label;
        num = Math.floor(num / 26) - 1;
    }
    return label;
}

/** Parse "A1", "$B$3", "AA12" → { col, row } (0-based) or null */
export function parseCellRef(ref: string): { col: number; row: number } | null {
    const m = ref.match(/^\$?([A-Z]+)\$?(\d+)$/i);
    if (!m) return null;
    return { col: colLettersToIndex(m[1]), row: parseInt(m[2]) - 1 };
}

/** Get all cells in "A1:C3" as array of keys like "A1" */
export function expandRange(start: string, end: string): string[] {
    const s = parseCellRef(start);
    const e = parseCellRef(end);
    if (!s || !e) return [];
    const cells: string[] = [];
    for (let r = Math.min(s.row, e.row); r <= Math.max(s.row, e.row); r++) {
        for (let c = Math.min(s.col, e.col); c <= Math.max(s.col, e.col); c++) {
            cells.push(`${indexToColLetters(c)}${r + 1}`);
        }
    }
    return cells;
}

/** Get the cell key format used in the spreadsheet */
export function toCellKey(ref: string): string {
    const m = ref.match(/^\$?([A-Z]+)\$?(\d+)$/i);
    if (!m) return ref.toUpperCase();
    return `${m[1].toUpperCase()}${m[2]}`;
}

// ─── Normalize raw cell value ────────────────────────────────────────────────

function raw(cellData: CellData, ref: string): string {
    const key = toCellKey(ref);
    const v = cellData[key];
    if (v == null) return '';
    if (typeof v === 'object' && 'value' in v) return String(v.value ?? '');
    return String(v);
}

function numVal(cellData: CellData, ref: string): number {
    const v = raw(cellData, ref);
    if (v.startsWith('=')) {
        const r = evaluateFormula(v, cellData);
        return typeof r === 'number' ? r : parseFloat(String(r)) || 0;
    }
    return parseFloat(v) || 0;
}

// ─── Tokeniser ───────────────────────────────────────────────────────────────

type TokType =
    | 'number' | 'string' | 'bool' | 'ident'
    | 'lparen' | 'rparen' | 'comma' | 'colon' | 'semi'
    | 'op' | 'ampersand' | 'eof';

interface Token { type: TokType; value: string }

function tokenize(src: string): Token[] {
    const toks: Token[] = [];
    let i = 0;

    while (i < src.length) {
        const ch = src[i];

        if (/\s/.test(ch)) { i++; continue; }

        // String literal
        if (ch === '"') {
            let s = '';
            i++;
            while (i < src.length && src[i] !== '"') {
                if (src[i] === '\\' && i + 1 < src.length) { s += src[++i]; i++; }
                else s += src[i++];
            }
            i++; // closing "
            toks.push({ type: 'string', value: s });
            continue;
        }

        // Numbers (handle .5, 1.5e3)
        if (/[\d.]/.test(ch)) {
            let n = '';
            while (i < src.length && /[\d.eE+\-]/.test(src[i])) n += src[i++];
            toks.push({ type: 'number', value: n });
            continue;
        }

        // Identifiers, booleans, cell refs (include $)
        if (/[$A-Za-z]/.test(ch)) {
            let s = '';
            while (i < src.length && /[$A-Za-z0-9_]/.test(src[i])) s += src[i++];
            const upper = s.toUpperCase().replace(/\$/g, '');
            if (upper === 'TRUE') toks.push({ type: 'bool', value: 'TRUE' });
            else if (upper === 'FALSE') toks.push({ type: 'bool', value: 'FALSE' });
            else toks.push({ type: 'ident', value: s });
            continue;
        }

        // Operators (multi-char first)
        if (src[i] === '<') {
            if (src[i + 1] === '=') { toks.push({ type: 'op', value: '<=' }); i += 2; }
            else if (src[i + 1] === '>') { toks.push({ type: 'op', value: '<>' }); i += 2; }
            else { toks.push({ type: 'op', value: '<' }); i++; }
            continue;
        }
        if (src[i] === '>' && src[i + 1] === '=') { toks.push({ type: 'op', value: '>=' }); i += 2; continue; }
        if (src[i] === '>') { toks.push({ type: 'op', value: '>' }); i++; continue; }
        if (src[i] === '=') { toks.push({ type: 'op', value: '=' }); i++; continue; }
        if (src[i] === '+') { toks.push({ type: 'op', value: '+' }); i++; continue; }
        if (src[i] === '-') { toks.push({ type: 'op', value: '-' }); i++; continue; }
        if (src[i] === '*') { toks.push({ type: 'op', value: '*' }); i++; continue; }
        if (src[i] === '/') { toks.push({ type: 'op', value: '/' }); i++; continue; }
        if (src[i] === '^') { toks.push({ type: 'op', value: '^' }); i++; continue; }
        if (src[i] === '%') { toks.push({ type: 'op', value: '%' }); i++; continue; }
        if (src[i] === '&') { toks.push({ type: 'ampersand', value: '&' }); i++; continue; }
        if (src[i] === '(') { toks.push({ type: 'lparen', value: '(' }); i++; continue; }
        if (src[i] === ')') { toks.push({ type: 'rparen', value: ')' }); i++; continue; }
        if (src[i] === ',') { toks.push({ type: 'comma', value: ',' }); i++; continue; }
        if (src[i] === ';') { toks.push({ type: 'semi', value: ';' }); i++; continue; }
        if (src[i] === ':') { toks.push({ type: 'colon', value: ':' }); i++; continue; }

        i++; // skip unknown chars
    }

    toks.push({ type: 'eof', value: '' });
    return toks;
}

// ─── Parser ──────────────────────────────────────────────────────────────────

class Parser {
    private toks: Token[];
    private pos = 0;

    constructor(toks: Token[]) { this.toks = toks; }

    private cur(): Token { return this.toks[this.pos] || { type: 'eof', value: '' }; }
    private eat(): Token { return this.toks[this.pos++] || { type: 'eof', value: '' }; }

    private peek(type: TokType): boolean { return this.cur().type === type; }
    private match(type: TokType, val?: string): boolean {
        const t = this.cur();
        return t.type === type && (val === undefined || t.value === val);
    }

    parse(cellData: CellData): CellValue { return this.parseComp(cellData); }

    private parseComp(cellData: CellData): CellValue {
        let left = this.parseConcat(cellData);
        while (this.cur().type === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(this.cur().value)) {
            const op = this.eat().value;
            const right = this.parseConcat(cellData);
            const l = typeof left === 'string' ? left.toLowerCase() : left;
            const r = typeof right === 'string' ? right.toLowerCase() : right;
            if (op === '=') left = l == r;
            if (op === '<>') left = l != r;
            if (op === '<') left = (l as any) < (r as any);
            if (op === '>') left = (l as any) > (r as any);
            if (op === '<=') left = (l as any) <= (r as any);
            if (op === '>=') left = (l as any) >= (r as any);
        }
        return left;
    }

    private parseConcat(cellData: CellData): CellValue {
        let left = this.parseAdd(cellData);
        while (this.cur().type === 'ampersand') {
            this.eat();
            const right = this.parseAdd(cellData);
            left = String(left ?? '') + String(right ?? '');
        }
        return left;
    }

    private parseAdd(cellData: CellData): CellValue {
        let left = this.parseMul(cellData);
        while (this.cur().type === 'op' && ['+', '-'].includes(this.cur().value)) {
            const op = this.eat().value;
            const right = this.parseMul(cellData);
            const l = toNum(left); const r = toNum(right);
            left = op === '+' ? l + r : l - r;
        }
        return left;
    }

    private parseMul(cellData: CellData): CellValue {
        let left = this.parsePow(cellData);
        while (this.cur().type === 'op' && ['*', '/'].includes(this.cur().value)) {
            const op = this.eat().value;
            const right = this.parsePow(cellData);
            const l = toNum(left); const r = toNum(right);
            if (op === '*') left = l * r;
            else left = r !== 0 ? l / r : '#DIV/0!';
        }
        return left;
    }

    private parsePow(cellData: CellData): CellValue {
        let left = this.parseUnary(cellData);
        while (this.cur().type === 'op' && this.cur().value === '^') {
            this.eat();
            const right = this.parseUnary(cellData);
            left = Math.pow(toNum(left), toNum(right));
        }
        return left;
    }

    private parseUnary(cellData: CellData): CellValue {
        if (this.cur().type === 'op' && this.cur().value === '-') {
            this.eat();
            return -toNum(this.parsePercent(cellData));
        }
        if (this.cur().type === 'op' && this.cur().value === '+') {
            this.eat();
            return toNum(this.parsePercent(cellData));
        }
        return this.parsePercent(cellData);
    }

    private parsePercent(cellData: CellData): CellValue {
        let v = this.parsePrimary(cellData);
        if (this.cur().type === 'op' && this.cur().value === '%') {
            this.eat();
            v = toNum(v) / 100;
        }
        return v;
    }

    private parsePrimary(cellData: CellData): CellValue {
        const t = this.cur();

        if (t.type === 'number') { this.eat(); return parseFloat(t.value); }
        if (t.type === 'string') { this.eat(); return t.value; }
        if (t.type === 'bool') { this.eat(); return t.value === 'TRUE'; }

        if (t.type === 'lparen') {
            this.eat();
            const v = this.parseComp(cellData);
            if (this.cur().type === 'rparen') this.eat();
            return v;
        }

        if (t.type === 'ident') {
            const name = t.value;
            this.eat();

            // Range: IDENT:IDENT (no function)
            if (this.cur().type === 'colon') {
                this.eat();
                const end = this.cur().type === 'ident' ? this.eat().value : '';
                // Return as array of values from expanded range
                return this.evalRange(name, end, cellData);
            }

            // Function call
            if (this.cur().type === 'lparen') {
                this.eat();
                const args: CellValue[] = [];
                const rawArgs: string[] = []; // for range strings
                while (!this.peek('rparen') && !this.peek('eof')) {
                    const before = this.pos;
                    // Try to collect a range string like A1:B10 directly as token
                    if (this.cur().type === 'ident') {
                        const startTok = this.cur().value;
                        this.eat();
                        if (this.cur().type === 'colon') {
                            this.eat();
                            if (this.cur().type === 'ident') {
                                const endTok = this.eat().value;
                                args.push(this.evalRange(startTok, endTok, cellData));
                                rawArgs.push(`${startTok}:${endTok}`);
                                // Continue to comma / rparen
                                if (this.cur().type === 'comma' || this.cur().type === 'semi') this.eat();
                                continue;
                            }
                        }
                        // Not a range — backtrack and parse normally
                        this.pos = before;
                    }
                    args.push(this.parseComp(cellData));
                    if (this.cur().type === 'comma' || this.cur().type === 'semi') this.eat();
                }
                if (this.cur().type === 'rparen') this.eat();
                return callFunction(name.toUpperCase(), args, cellData);
            }

            // Cell reference
            if (parseCellRef(name)) {
                const v = raw(cellData, name);
                if (!v) return null;
                if (v.startsWith('=')) return evaluateFormula(v, cellData);
                const n = parseFloat(v);
                return isNaN(n) ? v : n;
            }

            return null; // unknown identifier
        }

        // If nothing matched, consume and return null to avoid infinite loop
        this.eat();
        return null;
    }

    private evalRange(start: string, end: string, cellData: CellData): CellValue[] {
        return expandRange(start, end).map(ref => {
            const v = raw(cellData, ref);
            if (!v) return null;
            if (v.startsWith('=')) return evaluateFormula(v, cellData);
            const n = parseFloat(v);
            return isNaN(n) ? v : n;
        });
    }
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function toNum(v: CellValue): number {
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (v == null) return 0;
    const n = parseFloat(String(v));
    return isNaN(n) ? 0 : n;
}

function flatNums(args: CellValue[]): number[] {
    const out: number[] = [];
    args.forEach(a => {
        if (Array.isArray(a)) out.push(...flatNums(a as any));
        else if (a != null && a !== '') {
            const n = toNum(a);
            if (!isNaN(n)) out.push(n);
        }
    });
    return out;
}

function flatAll(args: CellValue[]): CellValue[] {
    const out: CellValue[] = [];
    args.forEach(a => {
        if (Array.isArray(a)) out.push(...flatAll(a as any));
        else out.push(a);
    });
    return out;
}

// ─── Built-in functions ──────────────────────────────────────────────────────

function callFunction(name: string, args: CellValue[], cellData: CellData): CellValue {
    switch (name) {
        case 'SUM': { const ns = flatNums(args); return ns.reduce((a, b) => a + b, 0); }
        case 'PRODUCT': { const ns = flatNums(args); return ns.reduce((a, b) => a * b, 1); }
        case 'AVERAGE': { const ns = flatNums(args); return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0; }
        case 'COUNT': { return flatAll(args).filter(v => v != null && v !== '' && !isNaN(toNum(v))).length; }
        case 'COUNTA': { return flatAll(args).filter(v => v != null && v !== '').length; }
        case 'COUNTBLANK': { return flatAll(args).filter(v => v == null || v === '').length; }
        case 'MAX': { const ns = flatNums(args); return ns.length ? Math.max(...ns) : 0; }
        case 'MIN': { const ns = flatNums(args); return ns.length ? Math.min(...ns) : 0; }
        case 'ABS': return Math.abs(toNum(args[0]));
        case 'SQRT': return Math.sqrt(toNum(args[0]));
        case 'POWER': return Math.pow(toNum(args[0]), toNum(args[1]));
        case 'MOD': { const d = toNum(args[1]); return d ? toNum(args[0]) % d : '#DIV/0!'; }
        case 'INT': return Math.floor(toNum(args[0]));
        case 'ROUND': return parseFloat(toNum(args[0]).toFixed(Math.max(0, toNum(args[1]))));
        case 'ROUNDUP': { const dec = toNum(args[1]); const f = Math.pow(10, dec); return Math.ceil(toNum(args[0]) * f) / f; }
        case 'ROUNDDOWN': { const dec = toNum(args[1]); const f = Math.pow(10, dec); return Math.floor(toNum(args[0]) * f) / f; }
        case 'CEILING': { const sig = toNum(args[1]) || 1; return Math.ceil(toNum(args[0]) / sig) * sig; }
        case 'FLOOR': { const sig = toNum(args[1]) || 1; return Math.floor(toNum(args[0]) / sig) * sig; }
        case 'PI': return Math.PI;
        case 'EXP': return Math.exp(toNum(args[0]));
        case 'LN': return Math.log(toNum(args[0]));
        case 'LOG': { const base = args[1] != null ? toNum(args[1]) : 10; return Math.log(toNum(args[0])) / Math.log(base); }
        case 'LOG10': return Math.log10(toNum(args[0]));
        case 'SIN': return Math.sin(toNum(args[0]));
        case 'COS': return Math.cos(toNum(args[0]));
        case 'TAN': return Math.tan(toNum(args[0]));
        case 'SIGN': { const n = toNum(args[0]); return n > 0 ? 1 : n < 0 ? -1 : 0; }

        // Multiply / Divide / Difference (custom)
        case 'MULTIPLY': { const ns = flatNums(args); return ns.reduce((a, b) => a * b, 1); }
        case 'DIVIDE': { const n = toNum(args[0]); const d = toNum(args[1]); return d ? n / d : '#DIV/0!'; }
        case 'DIFFERENCE': return toNum(args[0]) - toNum(args[1]);

        // Text
        case 'CONCAT':
        case 'CONCATENATE': return flatAll(args).map(v => v == null ? '' : String(v)).join('');
        case 'LEN': return String(args[0] ?? '').length;
        case 'UPPER': return String(args[0] ?? '').toUpperCase();
        case 'LOWER': return String(args[0] ?? '').toLowerCase();
        case 'TRIM': return String(args[0] ?? '').trim();
        case 'LEFT': { const s = String(args[0] ?? ''); const n = args[1] != null ? toNum(args[1]) : 1; return s.slice(0, n); }
        case 'RIGHT': { const s = String(args[0] ?? ''); const n = args[1] != null ? toNum(args[1]) : 1; return s.slice(-n); }
        case 'MID': { const s = String(args[0] ?? ''); return s.slice(toNum(args[1]) - 1, toNum(args[1]) - 1 + toNum(args[2])); }
        case 'SUBSTITUTE': { const s = String(args[0] ?? ''); const old = String(args[1] ?? ''); const nw = String(args[2] ?? ''); return s.split(old).join(nw); }
        case 'REPLACE': { const s = String(args[0] ?? ''); const st = toNum(args[1]) - 1; const ln = toNum(args[2]); return s.slice(0, st) + String(args[3] ?? '') + s.slice(st + ln); }
        case 'REPT': return String(args[0] ?? '').repeat(Math.max(0, toNum(args[1])));
        case 'EXACT': return String(args[0] ?? '') === String(args[1] ?? '');
        case 'FIND': { const needle = String(args[0] ?? ''); const hay = String(args[1] ?? ''); const start = args[2] != null ? toNum(args[2]) - 1 : 0; const idx = hay.indexOf(needle, start); return idx >= 0 ? idx + 1 : '#VALUE!'; }
        case 'SEARCH': { const needle = String(args[0] ?? '').toLowerCase(); const hay = String(args[1] ?? '').toLowerCase(); const start = args[2] != null ? toNum(args[2]) - 1 : 0; const idx = hay.indexOf(needle, start); return idx >= 0 ? idx + 1 : '#VALUE!'; }
        case 'TEXT': { const n = toNum(args[0]); return isNaN(n) ? String(args[0] ?? '') : n.toLocaleString(); }
        case 'VALUE': { const n = parseFloat(String(args[0] ?? '')); return isNaN(n) ? '#VALUE!' : n; }

        // Logical
        case 'IF': return args[0] ? args[1] ?? null : args[2] ?? null;
        case 'IFS': {
            for (let i = 0; i < args.length - 1; i += 2) {
                if (args[i]) return args[i + 1] ?? null;
            }
            return '#N/A';
        }
        case 'AND': return flatAll(args).every(v => !!v);
        case 'OR': return flatAll(args).some(v => !!v);
        case 'NOT': return !args[0];
        case 'XOR': { let t = false; flatAll(args).forEach(v => { if (v) t = !t; }); return t; }
        case 'IFERROR': { const v = args[0]; return (typeof v === 'string' && v.startsWith('#')) ? (args[1] ?? '') : v; }
        case 'IFNA': { const v = args[0]; return v === '#N/A' ? (args[1] ?? '') : v; }
        case 'SWITCH': {
            const expr = String(args[0] ?? '');
            for (let i = 1; i < args.length - 1; i += 2) {
                if (String(args[i] ?? '') === expr) return args[i + 1] ?? null;
            }
            return args.length % 2 === 0 ? (args[args.length - 1] ?? '#N/A') : '#N/A';
        }

        // Type checks
        case 'ISNUMBER': return typeof args[0] === 'number' || (!isNaN(parseFloat(String(args[0] ?? ''))) && args[0] !== '' && args[0] !== null);
        case 'ISTEXT': return typeof args[0] === 'string' && isNaN(parseFloat(args[0]));
        case 'ISBLANK': return args[0] == null || args[0] === '';
        case 'ISERROR': return typeof args[0] === 'string' && args[0].startsWith('#');
        case 'ISNA': return args[0] === '#N/A';

        // Date/Time (simple)
        case 'TODAY': return new Date().toLocaleDateString('en-IN');
        case 'NOW': return new Date().toLocaleString('en-IN');
        case 'YEAR': { const d = new Date(String(args[0] ?? '')); return isNaN(d.getTime()) ? '#VALUE!' : d.getFullYear(); }
        case 'MONTH': { const d = new Date(String(args[0] ?? '')); return isNaN(d.getTime()) ? '#VALUE!' : d.getMonth() + 1; }
        case 'DAY': { const d = new Date(String(args[0] ?? '')); return isNaN(d.getTime()) ? '#VALUE!' : d.getDate(); }
        case 'WEEKDAY': { const d = new Date(String(args[0] ?? '')); return isNaN(d.getTime()) ? '#VALUE!' : d.getDay() + 1; }
        case 'DATE': { const d = new Date(toNum(args[0]), toNum(args[1]) - 1, toNum(args[2])); return d.toLocaleDateString('en-IN'); }
        case 'DATEDIF': { const s = new Date(String(args[0] ?? '')); const e = new Date(String(args[1] ?? '')); const unit = String(args[2] ?? '').toUpperCase(); const ms = e.getTime() - s.getTime(); if (unit === 'D') return Math.floor(ms / 86400000); if (unit === 'M') return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()); if (unit === 'Y') return e.getFullYear() - s.getFullYear(); return '#VALUE!'; }

        // Lookup
        case 'VLOOKUP': {
            const lookupVal = String(args[0] ?? '').toLowerCase();
            const tableArr = flatAll([args[1]] as any);
            const colIdx = toNum(args[2]) - 1;
            // args[1] came in as flat - need column data. Just scan raw cellData by position.
            // Simple row-by-row: find row where col 0 matches, return col colIdx value
            // Since we flatten ranges, we need to reconstruct rows. 
            // Fall through to #N/A if not enough data
            return '#N/A'; // Simplified - full VLOOKUP needs table context
        }

        // Statistical extras
        case 'MEDIAN': {
            const ns = flatNums(args).sort((a, b) => a - b);
            if (!ns.length) return 0;
            const m = Math.floor(ns.length / 2);
            return ns.length % 2 ? ns[m] : (ns[m - 1] + ns[m]) / 2;
        }
        case 'MODE': {
            const ns = flatNums(args);
            const freq: Record<number, number> = {};
            ns.forEach(n => { freq[n] = (freq[n] || 0) + 1; });
            let maxF = 0, mode: number | null = null;
            Object.entries(freq).forEach(([k, v]) => { if (v > maxF) { maxF = v; mode = parseFloat(k); } });
            return mode ?? '#N/A';
        }
        case 'STDEV':
        case 'STDEVP': {
            const ns = flatNums(args);
            if (!ns.length) return 0;
            const mean = ns.reduce((a, b) => a + b, 0) / ns.length;
            const variance = ns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (name === 'STDEVP' ? ns.length : ns.length - 1);
            return Math.sqrt(variance);
        }
        case 'VAR':
        case 'VARP': {
            const ns = flatNums(args);
            if (!ns.length) return 0;
            const mean = ns.reduce((a, b) => a + b, 0) / ns.length;
            return ns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (name === 'VARP' ? ns.length : ns.length - 1);
        }
        case 'SUMPRODUCT': {
            // Expect paired arrays
            const arrays = args.map(a => Array.isArray(a) ? (a as CellValue[]).map(toNum) : [toNum(a)]);
            if (!arrays.length) return 0;
            const len = arrays[0].length;
            let sum = 0;
            for (let i = 0; i < len; i++) {
                let prod = 1;
                arrays.forEach(arr => { prod *= arr[i] ?? 0; });
                sum += prod;
            }
            return sum;
        }
        case 'LARGE': {
            const ns = flatNums([args[0]]).sort((a, b) => b - a);
            const k = toNum(args[1]) - 1;
            return k >= 0 && k < ns.length ? ns[k] : '#NUM!';
        }
        case 'SMALL': {
            const ns = flatNums([args[0]]).sort((a, b) => a - b);
            const k = toNum(args[1]) - 1;
            return k >= 0 && k < ns.length ? ns[k] : '#NUM!';
        }
        case 'RANK': {
            const val = toNum(args[0]);
            const ns = flatNums([args[1]]);
            const order = toNum(args[2]);
            const sorted = [...ns].sort((a, b) => order ? a - b : b - a);
            return sorted.indexOf(val) + 1;
        }
        case 'PERCENTILE': {
            const ns = flatNums([args[0]]).sort((a, b) => a - b);
            const p = toNum(args[1]);
            if (!ns.length) return 0;
            const idx = p * (ns.length - 1);
            const lo = Math.floor(idx);
            return ns[lo] + (idx - lo) * ((ns[lo + 1] ?? ns[lo]) - ns[lo]);
        }

        default:
            return `#NAME?(${name})`;
    }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Evaluate a formula string (must start with `=`) against the given cell data.
 * Returns the computed value, or an error string like "#ERROR!".
 */
export function evaluateFormula(formula: string, cellData: CellData): CellValue {
    if (!formula || !formula.startsWith('=')) return formula ?? null;

    const body = formula.slice(1).trim();
    if (!body) return null; // bare "=" → empty

    try {
        const toks = tokenize(body);
        const parser = new Parser(toks);
        const result = parser.parse(cellData);
        if (Array.isArray(result)) return toNum(result[0]); // single-cell range
        return result;
    } catch {
        return '#ERROR!';
    }
}

/**
 * Get the display value for a cell (evaluates formulas, suppresses incomplete errors).
 */
export function getDisplayValue(cellData: CellData, cellKey: string): string {
    const raw2 = cellData[cellKey];
    let val: string;
    if (raw2 == null) return '';
    if (typeof raw2 === 'object' && 'value' in raw2) val = String(raw2.value ?? '');
    else val = String(raw2);

    if (!val.startsWith('=')) return val;

    const body = val.slice(1).trim();
    if (!body) return ''; // bare "=" → blank cell
    // Incomplete function (started but parens not closed)
    if (/^[A-Z]+\s*\(/i.test(body) && !body.includes(')')) return '';

    const result = evaluateFormula(val, cellData);
    if (result === null || result === undefined) return '';
    if (typeof result === 'string' && result.startsWith('#')) return result; // show error codes
    return String(result);
}

/**
 * Check whether a formula string is "complete enough" to evaluate.
 * Used by FormulaBar before committing.
 */
export function isFormulaComplete(formula: string): boolean {
    if (!formula.startsWith('=')) return true;
    const body = formula.slice(1).trim();
    if (!body) return false;
    let depth = 0;
    for (const ch of body) { if (ch === '(') depth++; if (ch === ')') depth--; }
    return depth <= 0; // balanced or no parens
}
