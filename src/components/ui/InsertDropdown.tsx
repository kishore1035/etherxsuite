import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface InsertDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  onInsertCells: (option: string) => void;
  onInsertRows: () => void;
  onInsertColumns: () => void;
  onInsertSheet: () => void;
}

// Shared light-mode gold style tokens
const S = {
  panel: {
    background: '#ffffff',
    borderRadius: 10,
    boxShadow: '0 8px 28px rgba(0,0,0,0.13), 0 0 0 1.5px rgba(184,134,11,0.2)',
    border: '1.5px solid rgba(184,134,11,0.18)',
    overflow: 'hidden' as const,
  },
  header: {
    background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
    borderBottom: '1.5px solid rgba(184,134,11,0.15)',
    padding: '8px 14px',
    fontSize: 12, fontWeight: 700 as const, color: '#1a1a1a',
  },
  item: (hovered: boolean) => ({
    width: '100%', padding: '9px 14px', textAlign: 'left' as const,
    fontSize: 13, color: '#1a1a1a', cursor: 'pointer',
    background: hovered ? 'linear-gradient(135deg, #fffdf0 0%, #fff3b0 100%)' : '#fff',
    borderBottom: '1px solid #f3f3f3',
    transition: 'background 0.12s',
    display: 'block', border: 'none',
  }),
  footer: {
    background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
    borderTop: '1.5px solid rgba(184,134,11,0.15)',
    padding: '8px 14px',
    display: 'flex', justifyContent: 'flex-end', gap: 7,
  },
  btnCancel: {
    padding: '5px 12px', borderRadius: 7,
    background: '#fff', border: '1.5px solid #d1d5db',
    color: '#555', fontSize: 11, fontWeight: 600 as const, cursor: 'pointer',
  },
  btnOk: {
    padding: '5px 14px', borderRadius: 7,
    background: 'linear-gradient(135deg, #FFE566 0%, #FFD700 50%, #B8860B 100%)',
    border: '1.5px solid #B8860B', color: '#5a3e00',
    fontSize: 11, fontWeight: 700 as const, cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(184,134,11,0.28)',
  },
};

export function InsertDropdown({
  isOpen, onClose, isDarkMode, triggerRef,
  onInsertCells, onInsertRows, onInsertColumns, onInsertSheet
}: InsertDropdownProps) {
  const [showCellsDialog, setShowCellsDialog] = useState(false);
  const [selectedCellOption, setSelectedCellOption] = useState('shift-right');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        onClose(); setShowCellsDialog(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { showCellsDialog ? setShowCellsDialog(false) : onClose(); }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, showCellsDialog, onClose, triggerRef]);

  if (!isOpen || !triggerRef.current) return null;

  const rect = triggerRef.current.getBoundingClientRect();
  const dropdownWidth = showCellsDialog ? 280 : 200;
  const viewportWidth = window.innerWidth;
  let left = rect.left;
  if (left + dropdownWidth > viewportWidth - 20) left = viewportWidth - dropdownWidth - 20;
  const position = { top: rect.bottom + 2, left: Math.max(10, left) };

  const handleInsertCells = () => { onInsertCells(selectedCellOption); onClose(); setShowCellsDialog(false); };

  if (showCellsDialog) {
    return createPortal(
      <div ref={dropdownRef} style={{ ...S.panel, position: 'fixed', top: position.top, left: position.left, width: 280, zIndex: 10001 }}>
        <div style={S.header}>Insert Cells</div>
        <div style={{ padding: '12px 14px', background: '#fff' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {[
              { value: 'shift-right', label: 'Shift cells right' },
              { value: 'shift-down', label: 'Shift cells down' },
              { value: 'entire-row', label: 'Entire row' },
              { value: 'entire-column', label: 'Entire column' },
            ].map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#1a1a1a' }}>
                <input type="radio" name="insertOption" value={opt.value}
                  checked={selectedCellOption === opt.value}
                  onChange={e => setSelectedCellOption(e.target.value)}
                  style={{ accentColor: '#B8860B' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        <div style={S.footer}>
          <button style={S.btnCancel} onClick={() => setShowCellsDialog(false)}>Cancel</button>
          <button style={S.btnOk} onClick={handleInsertCells}>Add</button>
        </div>
      </div>,
      document.body
    );
  }

  const menuItems = [
    { key: 'cells', label: 'Insert Cells…', action: () => setShowCellsDialog(true) },
    { key: 'rows', label: 'Insert Sheet Rows', action: () => { onInsertRows(); onClose(); } },
    { key: 'cols', label: 'Insert Sheet Columns', action: () => { onInsertColumns(); onClose(); } },
    { key: 'sheet', label: 'Insert Sheet', action: () => { onInsertSheet(); onClose(); } },
  ];

  return createPortal(
    <div ref={dropdownRef} style={{ ...S.panel, position: 'fixed', top: position.top, left: position.left, width: 200, zIndex: 9999 }}>
      <div style={{ padding: '4px 0' }}>
        {menuItems.map(item => (
          <button
            key={item.key}
            onClick={item.action}
            onMouseEnter={() => setHoveredItem(item.key)}
            onMouseLeave={() => setHoveredItem(null)}
            style={S.item(hoveredItem === item.key)}
          >{item.label}</button>
        ))}
      </div>
    </div>,
    document.body
  );
}
