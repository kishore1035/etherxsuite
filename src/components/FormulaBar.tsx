import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, Sigma } from 'lucide-react';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { FormulaBuilder, FormulaDefinition, FORMULAS } from './FormulaBuilder';
import { evaluateFormula, isFormulaComplete } from '../utils/formulaEngine2';

interface FormulaBarProps {
  isDarkMode?: boolean;
}

const GOLD_DARK = '#B8860B';
const GOLD = '#FFD700';
const CREAM = '#fffdf0';
const CREAM_DEEP = '#fff8d6';

/** Convert column index (0-based) to letters (A, B…Z, AA …) */
function indexToColLabel(n: number): string {
  let label = '';
  let num = n;
  while (num >= 0) {
    label = String.fromCharCode(65 + (num % 26)) + label;
    num = Math.floor(num / 26) - 1;
  }
  return label;
}

export function FormulaBar({ isDarkMode = false }: FormulaBarProps) {
  const {
    selectedCell, cellData, setCellData, getCellKey,
    setIsFormulaMode, setFormulaSelectionCells, setActiveFormula,
    isFormulaMode, formulaSelectionCells, activeFormula,
  } = useSpreadsheet();

  const [showFormulaBuilder, setShowFormulaBuilder] = useState(false);
  const [builderPosition, setBuilderPosition] = useState({ x: 0, y: 0 });
  const [formulaInput, setFormulaInput] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredFormulas, setFilteredFormulas] = useState<FormulaDefinition[]>(FORMULAS);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const formulaButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const originalValueRef = useRef('');  // snapshot when user focuses — for X cancel
  /** Always holds the latest formulaInput value (avoids stale closure in useEffect) */
  const formulaInputRef = useRef(formulaInput);
  formulaInputRef.current = formulaInput;
  /** Track if we are actively selecting cells after an open paren */
  const cellSelectingRef = useRef(false);

  const cellKey = selectedCell ? getCellKey(selectedCell.row, selectedCell.col) : '';
  const displayCell = selectedCell
    ? `${indexToColLabel(selectedCell.col)}${selectedCell.row + 1}`
    : 'A1';

  // ─── Sync input when selected cell or cellData changes (not while typing) ──
  useEffect(() => {
    if (!isFocused) {
      setFormulaInput(cellKey ? (cellData[cellKey] ?? '') : '');
    }
  }, [cellKey, cellData, isFocused]);

  // ─── Cell-click insertion in formula mode ──────────────────────────────────
  // When isFormulaMode is true, clicking a cell should insert its reference
  // into the formula input at the current cursor position.
  // NOTE: We do NOT gate on isFocused here because clicking a cell may briefly
  // blur the formula input even when e.preventDefault() is called.
  useEffect(() => {
    if (!isFormulaMode) return;

    const lastLen = formulaSelectionCells.length;
    if (lastLen === 0) return;

    // The last cell clicked
    const lastRef = formulaSelectionCells[lastLen - 1];
    if (!lastRef) return;

    // Insert the reference at cursor position in the input
    const el = inputRef.current;
    if (!el) return;

    // Use saved cursor position if input is not focused, otherwise read it live.
    // Use formulaInputRef.current.length (not formulaInput) to avoid stale closure.
    const start = (document.activeElement === el ? el.selectionStart : null) ?? formulaInputRef.current.length;
    const end = (document.activeElement === el ? el.selectionEnd : null) ?? formulaInputRef.current.length;

    const before = formulaInputRef.current.slice(0, start);
    const after = formulaInputRef.current.slice(end);

    let insertion = lastRef;
    // If the char right before cursor is an alpha/digit (another ref) append as range
    if (/[A-Za-z0-9]$/.test(before)) {
      insertion = ':' + lastRef;
    }

    const newVal = before + insertion + after;
    setFormulaInput(newVal);
    setIsFocused(true);

    // Re-focus and reposition cursor after inserted text
    setTimeout(() => {
      el.focus();
      const newPos = (start as number) + insertion.length;
      el.setSelectionRange(newPos, newPos);
    }, 0);

    // Prevent duplicate insertions by clearing the selection list
    setFormulaSelectionCells([]);
  }, [formulaSelectionCells]);

  // ─── Handle formula input change ───────────────────────────────────────────
  const handleFormulaChange = (value: string) => {
    setFormulaInput(value);

    if (value.startsWith('=')) {
      if (!isFormulaMode) {
        setIsFormulaMode(true);
        setFormulaSelectionCells([]);
      }
      // Autocomplete: show function list after = or =partial
      const body = value.slice(1).toUpperCase().trim();
      // Show autocomplete only when we are typing the function name (no open paren yet)
      const insideParen = (value.match(/\(/g) || []).length > (value.match(/\)/g) || []).length;
      if (!insideParen) {
        const matches = body.length === 0
          ? FORMULAS
          : FORMULAS.filter(f => f.name.startsWith(body));
        setFilteredFormulas(matches.length > 0 ? matches : FORMULAS);
        setActiveSuggestionIndex(0);
        setShowAutocomplete(true);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      if (isFormulaMode) setIsFormulaMode(false);
      setShowAutocomplete(false);
    }
  };

  // ─── Σ button ───────────────────────────────────────────────────────────────
  const handleFormulaButtonClick = () => {
    if (formulaButtonRef.current) {
      const rect = formulaButtonRef.current.getBoundingClientRect();
      setBuilderPosition({ x: Math.max(10, rect.left), y: Math.max(10, rect.bottom + 5) });
    }
    setShowFormulaBuilder(true);
  };

  const handleSelectFormula = (formula: FormulaDefinition) => {
    const newVal = `=${formula.name}(`;
    setFormulaInput(newVal);
    setActiveFormula(formula.name);
    setIsFormulaMode(true);
    setFormulaSelectionCells([]);
    setShowFormulaBuilder(false);
    setShowAutocomplete(false);
    setTimeout(() => {
      inputRef.current?.focus();
      const len = newVal.length;
      inputRef.current?.setSelectionRange(len, len);
    }, 50);
  };

  // ─── Commit (✓ / Enter) ─────────────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (!cellKey) return;

    const raw = formulaInput.trim();

    if (raw.startsWith('=')) {
      // Evaluate to verify — but ALWAYS store the raw formula string in cellData
      // so it can be re-evaluated whenever the sheet changes
      setCellData(prev => ({ ...prev, [cellKey]: raw }));
    } else {
      setCellData(prev => ({ ...prev, [cellKey]: raw }));
    }

    setIsFormulaMode(false);
    setFormulaSelectionCells([]);
    setActiveFormula(null);
    setShowAutocomplete(false);
    setIsFocused(false);
    inputRef.current?.blur();
  }, [cellKey, formulaInput, setCellData, setIsFormulaMode, setFormulaSelectionCells, setActiveFormula]);

  // ─── Cancel (X / Esc) ───────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    const restored = originalValueRef.current;
    setFormulaInput(restored);
    if (cellKey) setCellData(prev => ({ ...prev, [cellKey]: restored }));

    setIsFormulaMode(false);
    setFormulaSelectionCells([]);
    setActiveFormula(null);
    setShowAutocomplete(false);
    setIsFocused(false);
    inputRef.current?.blur();
  }, [cellKey, setCellData, setIsFormulaMode, setFormulaSelectionCells, setActiveFormula]);

  // ─── Keyboard ───────────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If autocomplete is showing and a suggestion is selected, apply it
      if (showAutocomplete && filteredFormulas[activeSuggestionIndex]) {
        const f = filteredFormulas[activeSuggestionIndex];
        const newVal = `=${f.name}(`;
        setFormulaInput(newVal);
        setActiveFormula(f.name);
        setIsFormulaMode(true);
        setFormulaSelectionCells([]);
        setShowAutocomplete(false);
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.setSelectionRange(newVal.length, newVal.length);
        }, 0);
        return;
      }
      handleConfirm();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
      return;
    }

    if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(i => Math.min(i + 1, filteredFormulas.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const sel = filteredFormulas[activeSuggestionIndex];
        if (sel) {
          const newVal = `=${sel.name}(`;
          setFormulaInput(newVal);
          setActiveFormula(sel.name);
          setIsFormulaMode(true);
          setFormulaSelectionCells([]);
          setShowAutocomplete(false);
        }
      }
    }

    // When = is typed, turn on formula mode
    if (e.key === '=') {
      setIsFormulaMode(true);
      setFormulaSelectionCells([]);
    }
  };

  // ─── Global Esc listener ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFormulaMode) {
        e.preventDefault(); e.stopPropagation();
        handleCancel();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [isFormulaMode, handleCancel]);

  // ─── Style vars ─────────────────────────────────────────────────────────────
  const isActive = isFocused || isFormulaMode;
  const bg = isDarkMode ? '#000000' : '#ffffff';
  const borderColor = isActive
    ? GOLD_DARK
    : (isDarkMode ? '#374151' : 'rgba(184,134,11,0.18)');

  return (
    <>
      <div
        className="h-9 flex items-center px-2 gap-2 border-b"
        style={{
          background: bg,
          borderColor,
          borderBottomWidth: isActive ? '2px' : '1px',
          transition: 'border-color 0.2s ease',
        }}
      >
        {/* Cell reference box */}
        <div
          className="flex items-center justify-center rounded-none px-2"
          style={{
            minWidth: 56,
            height: 28,
            background: isDarkMode ? '#1a1a1a' : CREAM,
            border: `1.5px solid ${isDarkMode ? '#4b5563' : 'rgba(184,134,11,0.35)'}`,
            color: isDarkMode ? '#FFD700' : GOLD_DARK,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            fontFamily: 'monospace',
          }}
        >
          {displayCell}
        </div>

        {/* Σ Formula button */}
        <button
          ref={formulaButtonRef}
          onClick={handleFormulaButtonClick}
          className="flex items-center justify-center rounded-none transition-all"
          style={{
            width: 28, height: 28,
            background: `linear-gradient(135deg, #FFE566, ${GOLD}, ${GOLD_DARK})`,
            border: `1.5px solid ${GOLD_DARK}`,
            boxShadow: '0 2px 6px rgba(184,134,11,0.25)',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(184,134,11,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(184,134,11,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          title="Insert Function"
        >
          <Sigma className="w-3.5 h-3.5" style={{ color: '#fff' }} />
        </button>

        {/* Cancel button (X) — active when formula bar is focused or in formula mode */}
        <button
          onMouseDown={(e) => { e.preventDefault(); handleCancel(); }}
          className="flex items-center justify-center rounded-none transition-all"
          style={{
            width: 28, height: 28,
            background: 'transparent',
            border: '1.5px solid transparent',
            opacity: isActive ? 1 : 0.3,
            cursor: isActive ? 'pointer' : 'default',
            flexShrink: 0,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { if (isActive) { e.currentTarget.style.background = '#fff0f0'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)'; } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
          title="Cancel (Esc) — discard changes"
        >
          <X className="w-3.5 h-3.5" style={{ color: isDarkMode ? '#ef4444' : '#dc2626' }} />
        </button>

        {/* Confirm button (✓) — active when formula bar is focused or in formula mode */}
        <button
          onMouseDown={(e) => { e.preventDefault(); handleConfirm(); }}
          className="flex items-center justify-center rounded-none transition-all"
          style={{
            width: 28, height: 28,
            background: 'transparent',
            border: '1.5px solid transparent',
            opacity: isActive ? 1 : 0.3,
            cursor: isActive ? 'pointer' : 'default',
            flexShrink: 0,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { if (isActive) { e.currentTarget.style.background = '#f0fff4'; e.currentTarget.style.borderColor = 'rgba(5,150,105,0.3)'; } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
          title="Confirm (Enter) — apply value"
        >
          <Check className="w-3.5 h-3.5" style={{ color: isDarkMode ? '#10B981' : '#059669' }} />
        </button>

        {/* Vertical divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(184,134,11,0.2)', flexShrink: 0 }} />

        {/* Formula input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            id="formula-bar-input"
            name="formula-bar"
            autoComplete="off"
            type="text"
            value={formulaInput}
            onChange={(e) => handleFormulaChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              originalValueRef.current = formulaInput; // snapshot for cancel
              if (formulaInput.startsWith('=')) {
                setIsFormulaMode(true);
              }
            }}
            onBlur={() => {
              const raw = formulaInput.trim();
              if (!raw.startsWith('=')) {
                // Plain text (not a formula): commit the value and fully exit
                // formula mode immediately. This prevents the colored reference-cell
                // highlights from showing up when the user clicks another cell after
                // typing plain text in the formula bar.
                if (cellKey) {
                  setCellData(prev => ({ ...prev, [cellKey]: raw }));
                }
                setIsFormulaMode(false);
                setFormulaSelectionCells([]);
                setActiveFormula(null);
                setShowAutocomplete(false);
              }
              // For formulas starting with '=': leave isFormulaMode active here.
              // Cell clicks will blur the input first, but formula mode must remain
              // true so the cell-click handler can insert the cell reference.
              // Small delay so clicking X/✓ buttons fires before isFocused clears.
              setTimeout(() => setIsFocused(false), 150);
            }}
            placeholder="Enter formula or value..."
            className="w-full h-7 px-2 text-sm border-none outline-none rounded-none"
            style={{
              background: isDarkMode ? '#1a1a1a' : '#ffffff',
              color: formulaInput.startsWith('=')
                ? (isDarkMode ? '#60a5fa' : '#1d4ed8')
                : (isDarkMode ? '#FFFFFF' : '#1a1a1a'),
              fontWeight: formulaInput.startsWith('=') ? 600 : 400,
              fontFamily: formulaInput.startsWith('=') ? 'monospace' : 'inherit',
              borderLeft: isActive ? `3px solid ${GOLD_DARK}` : '3px solid transparent',
              paddingLeft: 8,
              transition: 'border-left-color 0.2s ease',
            }}
          />

          {/* Autocomplete dropdown */}
          {showAutocomplete && formulaInput.startsWith('=') && (
            <div
              className="absolute left-0 right-0 z-50 max-h-48 overflow-auto rounded-none border shadow-lg"
              style={{
                top: '100%',
                marginTop: 4,
                background: isDarkMode ? '#0b0b0b' : '#ffffff',
                border: `1.5px solid rgba(184,134,11,0.3)`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                minWidth: '280px',
              }}
            >
              {filteredFormulas.map((f, idx) => (
                <div
                  key={f.name}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const newVal = `=${f.name}(`;
                    setFormulaInput(newVal);
                    setActiveFormula(f.name);
                    setIsFormulaMode(true);
                    setFormulaSelectionCells([]);
                    setShowAutocomplete(false);
                    setTimeout(() => {
                      inputRef.current?.focus();
                      inputRef.current?.setSelectionRange(newVal.length, newVal.length);
                    }, 50);
                  }}
                  className="px-3 py-1.5 cursor-pointer text-xs flex items-center gap-2"
                  style={{
                    background: idx === activeSuggestionIndex
                      ? `linear-gradient(135deg, ${CREAM} 0%, ${CREAM_DEEP} 100%)`
                      : (isDarkMode ? '#0b0b0b' : '#ffffff'),
                    color: idx === activeSuggestionIndex ? GOLD_DARK : (isDarkMode ? '#e5e7eb' : '#1a1a1a'),
                    borderBottom: `1px solid ${isDarkMode ? '#222' : 'rgba(184,134,11,0.08)'}`,
                  }}
                  title={f.description}
                >
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', minWidth: 80 }}>{f.name}</span>
                  <span style={{ opacity: 0.65, fontSize: 10 }}>— {f.syntax}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formula mode badge */}
        {isFormulaMode && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-semibold"
            style={{
              background: `linear-gradient(135deg, ${CREAM} 0%, ${CREAM_DEEP} 100%)`,
              border: `1.5px solid rgba(184,134,11,0.35)`,
              color: GOLD_DARK,
              letterSpacing: 0.3,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10 }}>✦</span>
            {activeFormula ? `${activeFormula}` : 'Formula'}
          </div>
        )}

        {/* Cell-select mode hint */}
        {isFormulaMode && isFocused && (
          <div
            className="text-xs px-2 py-0.5 rounded-none"
            style={{ color: GOLD_DARK, opacity: 0.7, fontSize: 10, flexShrink: 0 }}
          >
            Click cells to insert
          </div>
        )}
      </div>

      <FormulaBuilder
        show={showFormulaBuilder}
        position={builderPosition}
        onClose={() => setShowFormulaBuilder(false)}
        onSelectFormula={handleSelectFormula}
      />
    </>
  );
}
