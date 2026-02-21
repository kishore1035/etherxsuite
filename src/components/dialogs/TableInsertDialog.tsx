import React, { useState, CSSProperties } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';

interface TableInsertDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (columns: number, rows: number) => void;
}

const GOLD = '#FFD700';
const GOLD_DARK = '#B8860B';
const GOLD_LIGHT = '#FFE566';

export function TableInsertDialog({ open, onClose, onInsert }: TableInsertDialogProps) {
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(5);

  const handleInsert = () => {
    if (columns > 0 && rows > 0) {
      onInsert(columns, rows);
      onClose();
    }
  };

  const handleCancel = () => {
    setColumns(3);
    setRows(5);
    onClose();
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    height: 32,
    padding: '0 10px',
    borderRadius: 7,
    border: `1.5px solid rgba(184,134,11,0.35)`,
    background: '#fffdf5',
    fontSize: 13,
    color: '#1a1a1a',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="!p-0 !gap-0 !max-w-[320px] w-[320px] overflow-hidden"
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(184,134,11,0.25)',
          border: '1.5px solid rgba(184,134,11,0.2)',
        }}
      >
        {/* Hide default close button */}
        <style>{`
          [data-slot="dialog-content"] > button[class*="absolute"] { display: none !important; }
        `}</style>

        {/* HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
          borderBottom: '1.5px solid rgba(184,134,11,0.18)',
          padding: '11px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_DARK})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(184,134,11,0.3)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#fff" strokeWidth="2.2" fill="none" />
                <line x1="3" y1="9" x2="21" y2="9" stroke="#fff" strokeWidth="1.5" />
                <line x1="3" y1="15" x2="21" y2="15" stroke="#fff" strokeWidth="1.5" />
                <line x1="9" y1="3" x2="9" y2="21" stroke="#fff" strokeWidth="1.5" />
                <line x1="15" y1="3" x2="15" y2="21" stroke="#fff" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a1a', letterSpacing: 0.2 }}>Insert Table</div>
              <div style={{ fontSize: 10, color: GOLD_DARK, marginTop: 1 }}>Set dimensions and insert</div>
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
        <div style={{ padding: '16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Columns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', minWidth: 60, textAlign: 'right' }}>Columns</label>
            <input
              type="number"
              min={1}
              max={26}
              value={columns}
              onChange={e => setColumns(Math.max(1, Math.min(26, parseInt(e.target.value) || 1)))}
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = GOLD_DARK; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(184,134,11,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.35)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
          {/* Rows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', minWidth: 60, textAlign: 'right' }}>Rows</label>
            <input
              type="number"
              min={1}
              max={100}
              value={rows}
              onChange={e => setRows(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = GOLD_DARK; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(184,134,11,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.35)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Visual preview grid */}
          <div style={{
            margin: '4px 0',
            padding: '10px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
            border: '1px solid rgba(184,134,11,0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: GOLD_DARK, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
              Preview — {columns} × {rows}
            </div>
            {Array.from({ length: Math.min(rows, 5) }).map((_, r) => (
              <div key={r} style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: Math.min(columns, 6) }).map((_, c) => (
                  <div key={c} style={{
                    width: 18, height: 12, borderRadius: 2,
                    background: r === 0 ? `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` : '#f5f5f5',
                    border: `1px solid rgba(184,134,11,${r === 0 ? '0.5' : '0.2'})`,
                  }} />
                ))}
                {columns > 6 && <span style={{ fontSize: 9, color: '#aaa', alignSelf: 'center' }}>+{columns - 6}</span>}
              </div>
            ))}
            {rows > 5 && <div style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>+{rows - 5} more rows</div>}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          padding: '9px 16px',
          borderTop: '1.5px solid rgba(184,134,11,0.12)',
          background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 7,
        }}>
          <button
            onClick={handleCancel}
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
            style={{
              padding: '5px 15px', borderRadius: 7,
              background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 50%, ${GOLD_DARK} 100%)`,
              border: `1.5px solid ${GOLD_DARK}`,
              color: '#5a3e00', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: '0 2px 8px rgba(184,134,11,0.3)',
              letterSpacing: 0.2,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(184,134,11,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(184,134,11,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >✦ Insert Table</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
