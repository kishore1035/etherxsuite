import React, { useState, useRef, RefObject } from 'react';
import { createPortal } from 'react-dom';

interface SortDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (option: string) => void;
  isDarkMode: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

const sortOptions = [
  { value: 'az', label: 'Sort A to Z (Ascending)' },
  { value: 'za', label: 'Sort Z to A (Descending)' },
  { value: 'num-asc', label: 'Sort Smallest to Largest' },
  { value: 'num-desc', label: 'Sort Largest to Smallest' },
];

export function SortDropdown({ isOpen, onClose, onAction, isDarkMode, triggerRef }: SortDropdownProps) {
  const [selectedOption, setSelectedOption] = useState(sortOptions[0].value);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updatePosition = () => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({ top: rect.bottom + 8, left: rect.left });
      }
    };
    if (isOpen) {
      requestAnimationFrame(updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, triggerRef]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const handleAction = () => { onAction(selectedOption); onClose(); };

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top, left: position.left,
        width: 280, zIndex: 10000,
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
      }}>
        Sort Options
      </div>

      {/* Options */}
      <div style={{ padding: '10px 14px', background: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sortOptions.map(option => (
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
                name="sortOption"
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
        >Apply Sort</button>
      </div>
    </div>,
    document.body
  );
}
