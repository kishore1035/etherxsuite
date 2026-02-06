import React from 'react';
import { Shape, ShapeStyle } from '../../types/shapes';
import { X, Trash2 } from 'lucide-react';

interface ShapeFormatPanelProps {
  shape: Shape;
  onUpdate: (updates: Partial<Shape>) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function ShapeFormatPanel({ shape, onUpdate, onClose, onDelete }: ShapeFormatPanelProps) {
  const updateStyle = (styleUpdates: Partial<ShapeStyle>) => {
    onUpdate({
      style: { ...shape.style, ...styleUpdates }
    });
  };

  return (
    <div 
      className="fixed right-0 top-0 bottom-0 w-56 bg-white shadow-2xl overflow-y-auto" 
      style={{ 
        zIndex: 100,
        borderLeft: '2px solid',
        borderImage: 'linear-gradient(135deg, #ffffff 0%, #f0e68c 25%, #ffd700 50%, #f0e68c 75%, #ffffff 100%) 1',
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.5)'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-2 py-2 sticky top-0 bg-white z-10"
        style={{
          borderBottom: '1px solid',
          borderImage: 'linear-gradient(90deg, #ffffff 0%, #ffd700 50%, #ffffff 100%) 1'
        }}
      >
        <h3 className="font-semibold text-xs text-gray-700">
          Format Shape
        </h3>
        <button 
          onClick={onClose} 
          className="p-1 rounded transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0e68c 50%, #ffd700 100%)',
            boxShadow: '0 2px 4px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}
        >
          <X className="w-3 h-3 text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="px-2 py-2 space-y-2">
        {/* Delete Button - at top for visibility */}
        <div>
          <button
            onClick={onDelete}
            className="w-full px-2 py-2 rounded text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
            style={{
              background: 'linear-gradient(135deg, #ff4757 0%, #ee5a6f 100%)',
              color: '#fff',
              boxShadow: '0 3px 6px rgba(255, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 0, 0, 0.5)'
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Shape
          </button>
        </div>

        {/* Fill Color */}
        <div>
          <label className="block text-[10px] font-medium mb-1 text-gray-600">Fill</label>
          <div className="flex gap-1">
            <input
              type="color"
              value={shape.style.fill}
              onChange={(e) => updateStyle({ fill: e.target.value })}
              className="w-8 h-6 rounded cursor-pointer"
              style={{
                border: '1px solid #ffd700',
                boxShadow: '0 1px 3px rgba(255, 215, 0, 0.3)'
              }}
            />
            <input
              type="text"
              value={shape.style.fill}
              onChange={(e) => updateStyle({ fill: e.target.value })}
              className="flex-1 px-1.5 py-0.5 rounded text-[10px]"
              style={{
                border: '1px solid #f0e68c',
                boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
              }}
            />
          </div>
        </div>

        {/* Stroke Color */}
        <div>
          <label className="block text-[10px] font-medium mb-1 text-gray-600">Stroke</label>
          <div className="flex gap-1">
            <input
              type="color"
              value={shape.style.stroke}
              onChange={(e) => updateStyle({ stroke: e.target.value })}
              className="w-8 h-6 rounded cursor-pointer"
              style={{
                border: '1px solid #ffd700',
                boxShadow: '0 1px 3px rgba(255, 215, 0, 0.3)'
              }}
            />
            <input
              type="text"
              value={shape.style.stroke}
              onChange={(e) => updateStyle({ stroke: e.target.value })}
              className="flex-1 px-1.5 py-0.5 rounded text-[10px]"
              style={{
                border: '1px solid #f0e68c',
                boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
              }}
            />
          </div>
        </div>

        {/* Stroke Width */}
        <div>
          <label className="block text-[10px] font-medium mb-0.5 text-gray-600">
            Width: {shape.style.strokeWidth}px
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={shape.style.strokeWidth}
            onChange={(e) => updateStyle({ strokeWidth: parseFloat(e.target.value) })}
            className="w-full h-1"
            style={{
              accentColor: '#ffd700'
            }}
          />
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-[10px] font-medium mb-0.5 text-gray-600">
            Opacity: {Math.round(shape.style.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={shape.style.opacity}
            onChange={(e) => updateStyle({ opacity: parseFloat(e.target.value) })}
            className="w-full h-1"
            style={{
              accentColor: '#ffd700'
            }}
          />
        </div>

        {/* Shadow Toggle */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={!!shape.style.shadow}
              onChange={(e) => {
                if (e.target.checked) {
                  updateStyle({
                    shadow: { offsetX: 2, offsetY: 2, blur: 4, color: 'rgba(0,0,0,0.3)' }
                  });
                } else {
                  updateStyle({ shadow: undefined });
                }
              }}
              className="w-3 h-3"
              style={{ accentColor: '#ffd700' }}
            />
            <span className="text-gray-600">Shadow</span>
          </label>
        </div>

        {/* Position & Size */}
        <div 
          className="pt-2 mt-2"
          style={{
            borderTop: '1px solid',
            borderImage: 'linear-gradient(90deg, transparent 0%, #f0e68c 50%, transparent 100%) 1'
          }}
        >
          <h4 className="font-medium text-[10px] mb-1.5 text-gray-600">Position & Size</h4>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="text-[9px] text-gray-500">X</label>
              <input
                type="number"
                value={Math.round(shape.x)}
                onChange={(e) => onUpdate({ x: parseInt(e.target.value) })}
                className="w-full px-1.5 py-0.5 rounded text-[10px]"
                style={{
                  border: '1px solid #f0e68c',
                  boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
                }}
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500">Y</label>
              <input
                type="number"
                value={Math.round(shape.y)}
                onChange={(e) => onUpdate({ y: parseInt(e.target.value) })}
                className="w-full px-1.5 py-0.5 rounded text-[10px]"
                style={{
                  border: '1px solid #f0e68c',
                  boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
                }}
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500">W</label>
              <input
                type="number"
                value={Math.round(shape.width)}
                onChange={(e) => onUpdate({ width: parseInt(e.target.value) })}
                className="w-full px-1.5 py-0.5 rounded text-[10px]"
                style={{
                  border: '1px solid #f0e68c',
                  boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
                }}
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500">H</label>
              <input
                type="number"
                value={Math.round(shape.height)}
                onChange={(e) => onUpdate({ height: parseInt(e.target.value) })}
                className="w-full px-1.5 py-0.5 rounded text-[10px]"
                style={{
                  border: '1px solid #f0e68c',
                  boxShadow: '0 1px 2px rgba(255, 215, 0, 0.2)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-[10px] font-medium mb-0.5 text-gray-600">
            Rotation: {shape.rotation}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={shape.rotation}
            onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
            className="w-full h-1"
            style={{
              accentColor: '#ffd700'
            }}
          />
        </div>

        {/* Layer Buttons */}
        <div className="flex gap-1.5 pt-2">
          <button
            onClick={() => onUpdate({ zIndex: shape.zIndex + 1 })}
            className="flex-1 px-2 py-1.5 rounded text-[10px] font-medium transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0e68c 50%, #ffd700 100%)',
              color: '#333',
              boxShadow: '0 2px 4px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 215, 0, 0.4)'
            }}
          >
            Forward
          </button>
          <button
            onClick={() => onUpdate({ zIndex: Math.max(0, shape.zIndex - 1) })}
            className="flex-1 px-2 py-1.5 rounded text-[10px] font-medium transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
              color: '#333',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            Backward
          </button>
        </div>
      </div>
    </div>
  );
}
