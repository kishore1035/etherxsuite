import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { SHAPE_CATEGORIES, ShapeType } from '../../types/shapes';
import { X } from 'lucide-react';

interface ShapesLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShape: (type: ShapeType) => void;
}

export function ShapesLibrary({ isOpen, onClose, onSelectShape }: ShapesLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState(0);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50" 
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Insert Shape</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Category sidebar */}
          <div className="w-40 border-r bg-gray-50 overflow-y-auto">
            {SHAPE_CATEGORIES.map((category, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(idx)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-200 ${
                  selectedCategory === idx ? 'bg-blue-100 text-blue-600 font-medium' : ''
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Shapes grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-5 gap-3">
              {SHAPE_CATEGORIES[selectedCategory].shapes.map((shape) => (
                <button
                  key={shape.type}
                  onClick={() => {
                    onSelectShape(shape.type);
                    onClose();
                  }}
                  className="flex flex-col items-center justify-center p-3 border rounded hover:bg-blue-50 hover:border-blue-400 transition-colors"
                  title={shape.label}
                >
                  <div className="text-3xl mb-1">{shape.icon}</div>
                  <div className="text-xs text-center text-gray-600">{shape.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-xs text-gray-600">
          Click a shape to select, then drag on the spreadsheet to draw it.
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
