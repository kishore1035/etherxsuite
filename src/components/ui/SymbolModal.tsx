import { useState } from 'react';

interface SymbolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (symbol: string) => void;
}

const GOLD = '#FFD700';
const GOLD_DARK = '#B8860B';
const GOLD_LIGHT = '#FFE566';

// 105 categorized symbols - 15 per category for perfect alignment
const SYMBOLS = {
  Arithmetic: [
    '+', '-', '×', '÷', '±', '∑', '∏', '√', '∫', '%', '∂', '∆', '∇', '◊', '∓'
  ],
  Logical: [
    '∧', '∨', '¬', '⇒', '⇔', '⊕', '⊤', '⊥', '∃', '∀', '⊻', '⊼', '⊽', '∄', '∅'
  ],
  Relational: [
    '=', '≠', '<', '>', '≤', '≥', '≈', '∞', '∝', '∈', '∉', '≡', '≢', '≪', '≫'
  ],
  Greek: [
    'α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'σ', 'φ', 'ω', 'Δ', 'Σ', 'Ω'
  ],
  Arrows: [
    '←', '→', '↑', '↓', '↔', '↕', '⇐', '⇒', '⇑', '⇓', '⇔', '↗', '↘', '↙', '↖'
  ],
  Symbols: [
    '✓', '✗', '★', '☆', '♠', '♣', '♥', '♦', '©', '®', '™', '§', '¶', '†', '‡'
  ],
  Sets: [
    '⊂', '⊃', '⊆', '⊇', '∅', '∩', '∪', '∖', '⊄', '⊅', '⊈', '⊉', '⊊', '⊋', '⊓'
  ]
};

export function SymbolModal({ isOpen, onClose, onInsert }: SymbolModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (selected) {
      onInsert(selected);
      setSelected(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: 620 }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(184,134,11,0.25)',
          overflow: 'hidden',
          border: '1.5px solid rgba(184,134,11,0.2)',
        }}>
          {/* HEADER */}
          <div style={{
            background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
            borderBottom: '1.5px solid rgba(184,134,11,0.18)',
            padding: '11px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_DARK})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(184,134,11,0.3)',
                fontSize: 16, color: '#fff', fontWeight: 700,
              }}>Ω</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a1a', letterSpacing: 0.2 }}>Insert Symbol</div>
                <div style={{ fontSize: 10, color: GOLD_DARK, marginTop: 1 }}>Click to select, then insert</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 26, height: 26, borderRadius: 6,
                background: 'rgba(184,134,11,0.08)',
                border: '1px solid rgba(184,134,11,0.2)',
                color: '#888', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, lineHeight: 1, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,134,11,0.15)'; e.currentTarget.style.color = GOLD_DARK; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(184,134,11,0.08)'; e.currentTarget.style.color = '#888'; }}
            >×</button>
          </div>

          {/* CONTENT */}
          <div style={{ padding: '12px 16px', maxHeight: 420, overflowY: 'auto', background: '#fff' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(SYMBOLS).map(([category, symbols]) => (
                <div key={category}>
                  {/* Category label — matches ShapesDropdown style */}
                  <div style={{
                    fontSize: 9.5, fontWeight: 700, color: GOLD_DARK,
                    letterSpacing: 1.2, textTransform: 'uppercase',
                    marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(184,134,11,0.35), transparent)' }} />
                    {category}
                    <div style={{ flex: 4, height: 1, background: 'linear-gradient(90deg, rgba(184,134,11,0.12), transparent)' }} />
                  </div>

                  {/* Symbol tiles */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {symbols.map(sym => {
                      const isSelected = selected === sym;
                      const isHov = hovered === sym;
                      return (
                        <button
                          key={sym}
                          type="button"
                          title={sym}
                          onClick={() => setSelected(sym)}
                          onMouseEnter={() => setHovered(sym)}
                          onMouseLeave={() => setHovered(null)}
                          style={{
                            width: 40, height: 40,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, borderRadius: 8, cursor: 'pointer',
                            transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                            border: isSelected
                              ? `1.5px solid ${GOLD_DARK}`
                              : isHov
                                ? '1.5px solid rgba(184,134,11,0.45)'
                                : '1.5px solid #e8e8e8',
                            background: isSelected
                              ? 'linear-gradient(135deg, #fffdf0 0%, #fff3b0 100%)'
                              : isHov
                                ? '#fffdf5'
                                : '#fafafa',
                            boxShadow: isSelected
                              ? '0 2px 8px rgba(184,134,11,0.2), inset 0 1px 0 rgba(255,255,255,0.9)'
                              : isHov
                                ? '0 2px 8px rgba(0,0,0,0.08)'
                                : 'none',
                            transform: isSelected ? 'scale(1.08)' : isHov ? 'scale(1.04)' : 'scale(1)',
                            color: isSelected ? GOLD_DARK : '#333',
                            fontWeight: isSelected ? 700 : 400,
                          }}
                        >{sym}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div style={{
            padding: '9px 16px',
            borderTop: '1.5px solid rgba(184,134,11,0.12)',
            background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 10, color: selected ? GOLD_DARK : '#aaa', fontStyle: selected ? 'normal' : 'italic' }}>
              {selected ? `✦ Selected: ${selected}` : 'No symbol selected'}
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <button
                onClick={onClose}
                style={{
                  padding: '5px 13px', borderRadius: 7,
                  background: '#fff', border: '1.5px solid #d1d5db',
                  color: '#555', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD_DARK; e.currentTarget.style.color = GOLD_DARK; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#555'; }}
              >Cancel</button>
              <button
                onClick={handleInsert}
                disabled={!selected}
                style={{
                  padding: '5px 15px', borderRadius: 7,
                  background: selected
                    ? `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 50%, ${GOLD_DARK} 100%)`
                    : '#f0f0f0',
                  border: selected ? `1.5px solid ${GOLD_DARK}` : '1.5px solid #ddd',
                  color: selected ? '#5a3e00' : '#aaa',
                  fontSize: 11, fontWeight: 700,
                  cursor: selected ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                  boxShadow: selected ? '0 2px 8px rgba(184,134,11,0.3)' : 'none',
                  letterSpacing: 0.2,
                }}
                onMouseEnter={e => { if (selected) { e.currentTarget.style.boxShadow = '0 4px 14px rgba(184,134,11,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { if (selected) { e.currentTarget.style.boxShadow = '0 2px 8px rgba(184,134,11,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
              >✦ Insert Symbol</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
