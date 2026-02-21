import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DropdownOption {
  value: string;
  label: string;
  onClick: () => void;
}

interface RibbonDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  options: DropdownOption[];
}

export function RibbonDropdown({ isOpen, onClose, isDarkMode, triggerRef, options }: RibbonDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);

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

  if (!isOpen || !triggerRef.current) return null;

  const rect = triggerRef.current.getBoundingClientRect();
  const dropdownWidth = 200;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let left = rect.left;
  if (left + dropdownWidth > viewportWidth - 20) left = Math.max(10, viewportWidth - dropdownWidth - 20);
  let top = rect.bottom + 4;
  const estimatedDropdownHeight = options.length * 38 + 8;
  if (top + estimatedDropdownHeight > viewportHeight - 20) top = Math.max(10, rect.top - estimatedDropdownHeight - 4);
  const position = { top, left: Math.max(10, left) };

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top, left: position.left,
        minWidth: 200, maxWidth: 280,
        zIndex: 10000,
        background: '#ffffff',
        borderRadius: 10,
        boxShadow: '0 8px 28px rgba(0,0,0,0.13), 0 0 0 1.5px rgba(184,134,11,0.2)',
        border: '1.5px solid rgba(184,134,11,0.18)',
        overflow: 'hidden',
        padding: '4px 0',
      }}
    >
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => { option.onClick(); onClose(); }}
          onMouseEnter={() => setHoveredValue(option.value)}
          onMouseLeave={() => setHoveredValue(null)}
          style={{
            width: '100%', padding: '9px 14px',
            textAlign: 'left', fontSize: 13, color: '#1a1a1a',
            background: hoveredValue === option.value
              ? 'linear-gradient(135deg, #fffdf0 0%, #fff3b0 100%)'
              : '#fff',
            border: 'none', cursor: 'pointer',
            borderBottom: '1px solid #f5f5f5',
            whiteSpace: 'nowrap', transition: 'background 0.12s',
            display: 'block',
          }}
        >{option.label}</button>
      ))}
    </div>,
    document.body
  );
}