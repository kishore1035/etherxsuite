import React, { useEffect, useRef, useState } from 'react';
import { FORMULAS, FormulaDefinition } from '../../config/formulas';

interface FormulaAutocompleteProps {
  searchText: string;
  position: { top: number; left: number };
  onSelect: (formula: FormulaDefinition) => void;
  onClose: () => void;
}

export function FormulaAutocomplete({ searchText, position, onSelect, onClose }: FormulaAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter formulas based on search text
  const filteredFormulas = FORMULAS.filter(f => 
    f.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Reset selection when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchText]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredFormulas.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredFormulas.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredFormulas[selectedIndex]) {
            onSelect(filteredFormulas[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredFormulas, selectedIndex, onSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = menuRef.current?.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (filteredFormulas.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[10000] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '320px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}
    >
      {filteredFormulas.map((formula, index) => (
        <div
          key={formula.name}
          className={`px-4 py-2 cursor-pointer transition-colors ${
            index === selectedIndex
              ? 'bg-gradient-to-r from-[#FFFEF5] to-[#FFF9E6]'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect(formula)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm text-gray-900">{formula.name}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {formula.category}
            </span>
          </div>
          <div className="text-xs text-gray-600 mb-1">{formula.description}</div>
          <div className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
            {formula.syntax}
          </div>
        </div>
      ))}
    </div>
  );
}
