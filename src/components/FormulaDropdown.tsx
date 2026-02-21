import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Plus, Minus, X as Times, Divide, Sigma, BarChart3, Hash, TrendingUp, TrendingDown, Calendar, Type, Percent } from 'lucide-react';
import { FORMULAS } from '../config/formulas';

export interface FormulaOption {
  id: string;
  name: string;
  syntax: string;
  description: string;
  icon: React.ReactNode;
  requiresRange: boolean;
  requiresMultipleCells?: boolean;
  argsCount?: number;
  category?: string;
}

const getFormulaIcon = (name: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    SUM: <Sigma className="w-4 h-4" />,
    AVERAGE: <BarChart3 className="w-4 h-4" />,
    COUNT: <Hash className="w-4 h-4" />,
    MIN: <TrendingDown className="w-4 h-4" />,
    MAX: <TrendingUp className="w-4 h-4" />,
    IF: <Calculator className="w-4 h-4" />,
    CONCAT: <Plus className="w-4 h-4" />,
    TODAY: <Calendar className="w-4 h-4" />,
    NOW: <Calendar className="w-4 h-4" />,
    MULTIPLY: <Times className="w-4 h-4" />,
    DIVIDE: <Divide className="w-4 h-4" />,
    ROUND: <Calculator className="w-4 h-4" />,
    LEN: <Type className="w-4 h-4" />,
    UPPER: <Type className="w-4 h-4" />,
    LOWER: <Type className="w-4 h-4" />,
  };
  return iconMap[name] || <Calculator className="w-4 h-4" />;
};

const FORMULA_OPTIONS: FormulaOption[] = FORMULAS.map(f => ({
  id: f.name,
  name: f.name,
  syntax: f.syntax,
  description: f.description,
  icon: getFormulaIcon(f.name),
  requiresRange: ['SUM', 'AVERAGE', 'COUNT', 'MIN', 'MAX'].includes(f.name),
  requiresMultipleCells: ['IF', 'CONCAT', 'VLOOKUP', 'HLOOKUP'].includes(f.name),
  category: f.category
}));

interface FormulaDropdownProps {
  position: { top: number; left: number };
  onSelect: (formula: FormulaOption) => void;
  onClose: () => void;
  searchText: string;
}

export function FormulaDropdown({ position, onSelect, onClose, searchText }: FormulaDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredFormulas = FORMULA_OPTIONS.filter(f =>
    f.name.toLowerCase().startsWith(searchText.toLowerCase()) ||
    f.name.toLowerCase().includes(searchText.toLowerCase()) ||
    f.description.toLowerCase().includes(searchText.toLowerCase())
  ).sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(searchText.toLowerCase());
    const bStarts = b.name.toLowerCase().startsWith(searchText.toLowerCase());
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.name.localeCompare(b.name);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredFormulas.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredFormulas.length) % filteredFormulas.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredFormulas[selectedIndex]) onSelect(filteredFormulas[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredFormulas, onSelect, onClose]);

  if (filteredFormulas.length === 0) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: 400,
        maxHeight: 400,
        zIndex: 10000,
        background: '#ffffff',
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(184,134,11,0.22)',
        border: '1.5px solid rgba(184,134,11,0.2)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
        borderBottom: '1.5px solid rgba(184,134,11,0.15)',
        padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'linear-gradient(135deg, #FFE566, #FFD700, #B8860B)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(184,134,11,0.3)',
        }}>
          <Sigma size={12} color="#fff" />
        </div>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
          {searchText ? `Formulas matching "${searchText}"` : 'Select a Formula'}
        </p>
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', maxHeight: 320 }}>
        {filteredFormulas.map((formula, index) => (
          <div
            key={formula.id}
            onClick={() => onSelect(formula)}
            onMouseEnter={() => setSelectedIndex(index)}
            style={{
              padding: '9px 14px',
              cursor: 'pointer',
              borderBottom: '1px solid #f3f3f3',
              background: index === selectedIndex
                ? 'linear-gradient(135deg, #fffdf0 0%, #fff3b0 100%)'
                : '#fff',
              transition: 'background 0.12s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ marginTop: 2, color: '#B8860B', flexShrink: 0 }}>{formula.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>{formula.name}</span>
                  {formula.category && (
                    <span style={{
                      fontSize: 10, color: '#B8860B',
                      background: 'rgba(184,134,11,0.1)',
                      border: '1px solid rgba(184,134,11,0.2)',
                      padding: '1px 6px', borderRadius: 4, fontWeight: 600,
                    }}>{formula.category}</span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: '#555', margin: '0 0 3px' }}>{formula.description}</p>
                <span style={{
                  fontSize: 10, color: '#888', fontFamily: 'monospace',
                  background: '#f5f5f5', border: '1px solid #e8e8e8',
                  padding: '1px 6px', borderRadius: 4, display: 'inline-block',
                }}>{formula.syntax}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
        borderTop: '1.5px solid rgba(184,134,11,0.15)',
        padding: '6px 14px',
      }}>
        <p style={{ fontSize: 10, color: '#B8860B', margin: 0 }}>↑↓ navigate · Enter select · Esc cancel</p>
      </div>
    </div>
  );
}
