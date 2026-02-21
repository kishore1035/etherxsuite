import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface Sheet {
  id: string;
  name: string;
}

interface SheetTabsBarProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSheetChange: (sheetId: string) => void;
  onAddSheet: () => void;
  onRenameSheet?: (sheetId: string, newName: string) => void;
}

const GOLD_DARK = '#B8860B';
const CREAM = '#fffdf0';
const CREAM_DEEP = '#fff8d6';

export function SheetTabsBar({
  sheets,
  activeSheetId,
  onSheetChange,
  onAddSheet,
  onRenameSheet
}: SheetTabsBarProps) {
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleDoubleClick = (sheet: Sheet) => {
    setEditingSheetId(sheet.id);
    setEditName(sheet.name);
  };

  const handleRename = (sheetId: string) => {
    if (editName.trim() && onRenameSheet) {
      onRenameSheet(sheetId, editName.trim());
    }
    setEditingSheetId(null);
  };

  return (
    <div
      className="flex items-center h-8 border-t"
      style={{
        backgroundColor: CREAM,
        borderTopColor: 'rgba(184,134,11,0.18)',
        boxShadow: '0 -1px 0 0 rgba(184,134,11,0.12)',
      }}
      role="tablist"
      aria-label="Sheet tabs"
    >
      {/* Navigation buttons */}
      <div className="flex items-center border-r" style={{ borderColor: 'rgba(184,134,11,0.18)' }}>
        <button
          className="h-8 px-2 flex items-center justify-center disabled:opacity-30 transition-colors"
          style={{ color: '#888' }}
          disabled
          title="Scroll left"
          onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = CREAM_DEEP; e.currentTarget.style.color = GOLD_DARK; } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          className="h-8 px-2 flex items-center justify-center disabled:opacity-30 transition-colors"
          style={{ color: '#888' }}
          disabled
          title="Scroll right"
          onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = CREAM_DEEP; e.currentTarget.style.color = GOLD_DARK; } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sheet tabs */}
      <div className="flex-1 flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {sheets.map((sheet) => {
          const isActive = activeSheetId === sheet.id;
          return (
            <button
              key={sheet.id}
              role="tab"
              aria-selected={isActive}
              aria-label={`${sheet.name} sheet`}
              tabIndex={isActive ? 0 : -1}
              className="h-8 px-4 flex items-center cursor-pointer border-r relative transition-all"
              style={{
                borderColor: 'rgba(184,134,11,0.18)',
                background: isActive ? '#ffffff' : 'transparent',
                borderTop: isActive ? `2.5px solid ${GOLD_DARK}` : '2.5px solid transparent',
                marginBottom: isActive ? '-1px' : '0',
              }}
              onClick={() => onSheetChange(sheet.id)}
              onDoubleClick={() => handleDoubleClick(sheet)}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = CREAM_DEEP;
                  e.currentTarget.style.borderTopColor = 'rgba(184,134,11,0.35)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderTopColor = 'transparent';
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSheetChange(sheet.id);
                } else if (e.key === 'F2') {
                  handleDoubleClick(sheet);
                }
              }}
            >
              {editingSheetId === sheet.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRename(sheet.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(sheet.id);
                    if (e.key === 'Escape') setEditingSheetId(null);
                  }}
                  autoFocus
                  className="w-24 px-1 text-xs outline-none rounded-none"
                  style={{
                    border: `1.5px solid ${GOLD_DARK}`,
                    fontFamily: 'Calibri, sans-serif',
                    background: '#fffdf5',
                    color: '#1a1a1a',
                  }}
                />
              ) : (
                <span
                  className="text-xs select-none"
                  style={{
                    fontFamily: 'Calibri, sans-serif',
                    color: isActive ? GOLD_DARK : '#555555',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: isActive ? 0.2 : 0,
                  }}
                >
                  {sheet.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add sheet button */}
      <button
        onClick={onAddSheet}
        className="h-8 px-3 flex items-center gap-1.5 border-l transition-all"
        style={{
          borderColor: 'rgba(184,134,11,0.18)',
          color: '#888',
        }}
        title="Insert worksheet"
        aria-label="Add new sheet"
        tabIndex={0}
        onMouseEnter={e => {
          e.currentTarget.style.background = CREAM_DEEP;
          e.currentTarget.style.color = GOLD_DARK;
          e.currentTarget.style.borderLeftColor = 'rgba(184,134,11,0.35)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#888';
          e.currentTarget.style.borderLeftColor = 'rgba(184,134,11,0.18)';
        }}
      >
        <Plus className="w-3.5 h-3.5" style={{ color: 'inherit' }} />
        <span className="text-xs font-medium" style={{ color: 'inherit' }}>Sheet</span>
      </button>
    </div>
  );
}
