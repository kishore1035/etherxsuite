import React from 'react';
import { Shape, ShapeType } from '../../types/shapes';

interface ShapeRendererProps {
  shape: Shape;
  isSelected?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export function ShapeRenderer({ shape, isSelected, onMouseDown }: ShapeRendererProps) {
  const { x, y, width, height, rotation, style, text } = shape;
  
  const transform = `translate(${x}, ${y}) rotate(${rotation})`;
  const strokeDasharray = style.strokeStyle === 'dashed' ? '5,5' : style.strokeStyle === 'dotted' ? '2,2' : 'none';
  
  const commonProps = {
    fill: style.fill,
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
    strokeDasharray,
    opacity: style.opacity,
    filter: style.shadow ? `drop-shadow(${style.shadow.offsetX}px ${style.shadow.offsetY}px ${style.shadow.blur}px ${style.shadow.color})` : undefined,
  };

  const renderShape = () => {
    switch (shape.type) {
      // Basic Shapes
      case 'rectangle':
        return <rect width={width} height={height} {...commonProps} />;
      
      case 'rounded-rectangle':
        return <rect width={width} height={height} rx={style.cornerRadius || 8} ry={style.cornerRadius || 8} {...commonProps} />;
      
      case 'oval':
        return <ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} {...commonProps} />;
      
      case 'line':
        return <line x1={0} y1={height / 2} x2={width} y2={height / 2} {...commonProps} fill="none" />;
      
      case 'arrow':
        return (
          <g {...commonProps}>
            <line x1={0} y1={height / 2} x2={width - 10} y2={height / 2} fill="none" />
            <polygon points={`${width},${height / 2} ${width - 15},${height / 2 - 8} ${width - 15},${height / 2 + 8}`} />
          </g>
        );
      
      case 'double-arrow':
        return (
          <g {...commonProps}>
            <line x1={15} y1={height / 2} x2={width - 15} y2={height / 2} fill="none" />
            <polygon points={`0,${height / 2} 15,${height / 2 - 8} 15,${height / 2 + 8}`} />
            <polygon points={`${width},${height / 2} ${width - 15},${height / 2 - 8} ${width - 15},${height / 2 + 8}`} />
          </g>
        );
      
      case 'right-arrow':
        return (
          <polygon 
            points={`0,${height * 0.3} ${width * 0.7},${height * 0.3} ${width * 0.7},0 ${width},${height / 2} ${width * 0.7},${height} ${width * 0.7},${height * 0.7} 0,${height * 0.7}`}
            {...commonProps}
          />
        );
      
      case 'left-arrow':
        return (
          <polygon 
            points={`${width},${height * 0.3} ${width * 0.3},${height * 0.3} ${width * 0.3},0 0,${height / 2} ${width * 0.3},${height} ${width * 0.3},${height * 0.7} ${width},${height * 0.7}`}
            {...commonProps}
          />
        );
      
      case 'up-arrow':
        return (
          <polygon 
            points={`${width * 0.3},${height} ${width * 0.3},${height * 0.3} 0,${height * 0.3} ${width / 2},0 ${width},${height * 0.3} ${width * 0.7},${height * 0.3} ${width * 0.7},${height}`}
            {...commonProps}
          />
        );
      
      case 'down-arrow':
        return (
          <polygon 
            points={`${width * 0.3},0 ${width * 0.3},${height * 0.7} 0,${height * 0.7} ${width / 2},${height} ${width},${height * 0.7} ${width * 0.7},${height * 0.7} ${width * 0.7},0`}
            {...commonProps}
          />
        );
      
      // Geometric Shapes
      case 'triangle':
        return <polygon points={`0,${height} ${width},${height} ${width},0`} {...commonProps} />;
      
      case 'isosceles-triangle':
        return <polygon points={`${width / 2},0 ${width},${height} 0,${height}`} {...commonProps} />;
      
      case 'diamond':
        return <polygon points={`${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`} {...commonProps} />;
      
      case 'parallelogram':
        return <polygon points={`${width * 0.2},0 ${width},0 ${width * 0.8},${height} 0,${height}`} {...commonProps} />;
      
      case 'trapezoid':
        return <polygon points={`${width * 0.2},0 ${width * 0.8},0 ${width},${height} 0,${height}`} {...commonProps} />;
      
      // Callouts
      case 'rounded-callout':
        return (
          <g {...commonProps}>
            <rect width={width * 0.85} height={height * 0.8} rx={10} ry={10} />
            <polygon points={`${width * 0.15},${height * 0.8} ${width * 0.25},${height * 0.8} ${width * 0.1},${height}`} />
          </g>
        );
      
      case 'cloud-callout':
        return (
          <g {...commonProps}>
            <ellipse cx={width * 0.25} cy={height * 0.3} rx={width * 0.2} ry={height * 0.25} />
            <ellipse cx={width * 0.5} cy={height * 0.25} rx={width * 0.25} ry={height * 0.3} />
            <ellipse cx={width * 0.75} cy={height * 0.3} rx={width * 0.2} ry={height * 0.25} />
            <ellipse cx={width * 0.2} cy={height * 0.6} rx={width * 0.18} ry={height * 0.25} />
            <ellipse cx={width * 0.5} cy={height * 0.7} rx={width * 0.3} ry={height * 0.35} />
            <ellipse cx={width * 0.8} cy={height * 0.6} rx={width * 0.18} ry={height * 0.25} />
            <polygon points={`${width * 0.3},${height * 0.85} ${width * 0.4},${height * 0.85} ${width * 0.2},${height}`} />
          </g>
        );
      
      case 'oval-callout':
        return (
          <g {...commonProps}>
            <ellipse cx={width / 2} cy={height * 0.4} rx={width * 0.45} ry={height * 0.35} />
            <polygon points={`${width * 0.3},${height * 0.7} ${width * 0.4},${height * 0.7} ${width * 0.25},${height}`} />
          </g>
        );
      
      // Flowchart
      case 'flowchart-process':
        return <rect width={width} height={height} {...commonProps} />;
      
      case 'flowchart-decision':
        return <polygon points={`${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`} {...commonProps} />;
      
      case 'flowchart-terminator':
        return <rect width={width} height={height} rx={height / 2} ry={height / 2} {...commonProps} />;
      
      case 'flowchart-data':
        return <polygon points={`${width * 0.15},0 ${width},0 ${width * 0.85},${height} 0,${height}`} {...commonProps} />;
      
      case 'flowchart-predefined':
        return (
          <g {...commonProps}>
            <rect width={width} height={height} />
            <line x1={width * 0.15} y1={0} x2={width * 0.15} y2={height} stroke={style.stroke} strokeWidth={style.strokeWidth} />
            <line x1={width * 0.85} y1={0} x2={width * 0.85} y2={height} stroke={style.stroke} strokeWidth={style.strokeWidth} />
          </g>
        );
      
      // Stars & Banners
      case 'star-5':
        const starPoints = Array.from({ length: 10 }, (_, i) => {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const radius = i % 2 === 0 ? Math.min(width, height) / 2 : Math.min(width, height) / 4;
          return `${width / 2 + radius * Math.cos(angle)},${height / 2 + radius * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={starPoints} {...commonProps} />;
      
      case 'ribbon-banner':
        return (
          <g {...commonProps}>
            <path d={`M ${width * 0.1},${height * 0.3} Q ${width * 0.5},${height * 0.15} ${width * 0.9},${height * 0.3} L ${width * 0.9},${height * 0.7} Q ${width * 0.5},${height * 0.85} ${width * 0.1},${height * 0.7} Z`} />
            <polygon points={`${width * 0.15},${height * 0.7} ${width * 0.15},${height} ${width * 0.25},${height * 0.85}`} />
            <polygon points={`${width * 0.85},${height * 0.7} ${width * 0.85},${height} ${width * 0.75},${height * 0.85}`} />
          </g>
        );
      
      default:
        return <rect width={width} height={height} {...commonProps} />;
    }
  };

  // CRITICAL GUARD: Prevent hover-driven re-rendering
  const handleMouseEnter = () => {};
  const handleMouseLeave = () => {};

  return (
    <g 
      transform={transform} 
      onMouseDown={onMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // CRITICAL: NO cursor style - causes flickering on hover
      style={{ 
        pointerEvents: 'all',
        // CRITICAL: GPU acceleration for stable rendering
        willChange: 'transform',
      }}
      // CRITICAL: Prevent any hover-induced layout changes
      className="shape-element-stable shape"
    >
      {renderShape()}
      {text && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#000"
          fontSize="14"
          fontFamily="Calibri, sans-serif"
          pointerEvents="none"
        >
          {text}
        </text>
      )}
      {isSelected && (
        <>
          {/* Selection outline */}
          <rect
            width={width}
            height={height}
            fill="none"
            stroke="#0078d4"
            strokeWidth={2}
            strokeDasharray="4,4"
            pointerEvents="none"
          />
          {/* Resize handles */}
          {[
            { x: -4, y: -4 }, // top-left
            { x: width / 2 - 4, y: -4 }, // top-center
            { x: width - 4, y: -4 }, // top-right
            { x: width - 4, y: height / 2 - 4 }, // middle-right
            { x: width - 4, y: height - 4 }, // bottom-right
            { x: width / 2 - 4, y: height - 4 }, // bottom-center
            { x: -4, y: height - 4 }, // bottom-left
            { x: -4, y: height / 2 - 4 }, // middle-left
          ].map((pos, idx) => (
            <rect
              key={idx}
              x={pos.x}
              y={pos.y}
              width={8}
              height={8}
              fill="white"
              stroke="#0078d4"
              strokeWidth={1}
              style={{ cursor: 'nwse-resize' }}
              data-handle={idx}
            />
          ))}
          {/* Rotation handle */}
          <g>
            <line x1={width / 2} y1={-20} x2={width / 2} y2={-4} stroke="#0078d4" strokeWidth={1} />
            <circle cx={width / 2} cy={-24} r={4} fill="white" stroke="#0078d4" strokeWidth={1} style={{ cursor: 'grab' }} data-handle="rotate" />
          </g>
        </>
      )}
    </g>
  );
}
