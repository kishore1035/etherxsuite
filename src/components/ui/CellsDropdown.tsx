import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CellsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (option: string) => void;
  isDarkMode: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  title: string;
  options: { value: string; label: string }[];
}

export function CellsDropdown({ isOpen, onClose, onAction, isDarkMode, triggerRef, title, options }: CellsDropdownProps) {
  const [selectedOption, setSelectedOption] = useState(options[0]?.value || '');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 256;
      const viewportWidth = window.innerWidth;
      let left = rect.left;
      if (left + dropdownWidth > viewportWidth - 20) left = viewportWidth - dropdownWidth - 20;
      setPosition({ top: rect.bottom + 2, left: Math.max(10, left) });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const handleAction = () => { onAction(selectedOption); onClose(); };

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top, left: position.left,
        width: 256, zIndex: 9999,
        background: '#ffffff',
        borderRadius: 10,
        boxShadow: '0 8px 28px rgba(0,0,0,0.13), 0 0 0 1.5px rgba(184,134,11,0.2)',
        border: '1.5px solid rgba(184,134,11,0.18)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
        borderBottom: '1.5px solid rgba(184,134,11,0.15)',
        padding: '9px 14px',
        fontSize: 12, fontWeight: 700, color: '#1a1a1a',
      }}>{title}</div>

      {/* Options */}
      <div style={{ padding: '10px 14px', background: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {options.map(option => (
            <label key={option.value} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              cursor: 'pointer', fontSize: 13, color: '#1a1a1a',
              padding: '6px 8px', borderRadius: 7,
              background: selectedOption === option.value
                ? 'linear-gradient(135deg, #fffdf0 0%, #fff3b0 100%)'
                : 'transparent',
              border: selectedOption === option.value
                ? '1px solid rgba(184,134,11,0.3)'
                : '1px solid transparent',
              transition: 'all 0.12s',
            }}>
              <input
                type="radio"
                name="cellsOption"
                value={option.value}
                checked={selectedOption === option.value}
                onChange={e => setSelectedOption(e.target.value)}
                style={{ accentColor: '#B8860B', width: 14, height: 14 }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
        borderTop: '1.5px solid rgba(184,134,11,0.15)',
        padding: '8px 14px',
        display: 'flex', justifyContent: 'flex-end', gap: 7,
      }}>
        <button
          onClick={onClose}
          style={{
            padding: '5px 12px', borderRadius: 7,
            background: '#fff', border: '1.5px solid #d1d5db',
            color: '#555', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.color = '#B8860B'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#555'; }}
        >Cancel</button>
        <button
          onClick={handleAction}
          style={{
            padding: '5px 16px', borderRadius: 7,
            background: 'linear-gradient(135deg, #FFE566 0%, #FFD700 50%, #B8860B 100%)',
            border: '1.5px solid #B8860B', color: '#5a3e00',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(184,134,11,0.28)',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(184,134,11,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(184,134,11,0.28)'; }}
        >OK</button>
      </div>
    </div>,
    document.body
  );
}