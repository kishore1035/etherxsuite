import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Shape, ShapeType, DEFAULT_SHAPE_STYLE } from '../../types/shapes';
import { ShapeRenderer } from './ShapeRenderer';
import { ShapeFormatPanel } from './ShapeFormatPanel';

interface ShapeCanvasProps {
  shapes: Shape[];
  onShapesChange: (shapes: Shape[]) => void;
  drawingShapeType: ShapeType | null;
  onDrawingComplete: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

function ShapeCanvasComponent({ 
  shapes, 
  onShapesChange, 
  drawingShapeType, 
  onDrawingComplete,
  containerRef 
}: ShapeCanvasProps) {
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [shiftKey, setShiftKey] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const drawingOverlayRef = useRef<HTMLDivElement>(null);
  const drawingSvgRef = useRef<SVGSVGElement>(null);
  const previewShapeRef = useRef<SVGGElement>(null);
  const animationFrameRef = useRef<number>();
  
  // Use refs for drawing state to avoid re-renders - NEVER update state during mousemove
  const drawingStateRef = useRef({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  });
  
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    shapeId: string | null;
    handle: number | null;
    mode: 'drag' | 'resize' | 'rotate' | null;
  }>({
    startX: 0,
    startY: 0,
    shapeId: null,
    handle: null,
    mode: null
  });

  const selectedShape = shapes.find(s => s.id === selectedShapeId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftKey(true);
      
      // Delete selected shape with Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId) {
        e.preventDefault();
        e.stopPropagation();
        onShapesChange(shapes.filter(s => s.id !== selectedShapeId));
        setSelectedShapeId(null);
      }
      
      if (e.key === 'Escape') {
        setSelectedShapeId(null);
        if (drawingShapeType) onDrawingComplete();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftKey(false);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [selectedShapeId, shapes, drawingShapeType, onDrawingComplete, onShapesChange]);

  const getSVGCoordinates = (e: React.MouseEvent | MouseEvent, svgElement?: SVGSVGElement) => {
    const svg = svgElement || drawingSvgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const renderShapePath = (shape: Shape): string => {
    const { width: w, height: h, style } = shape;
    const fill = style.fill || DEFAULT_SHAPE_STYLE.fill;
    const stroke = style.stroke || DEFAULT_SHAPE_STYLE.stroke;
    const strokeWidth = style.strokeWidth || DEFAULT_SHAPE_STYLE.strokeWidth;
    const opacity = style.opacity !== undefined ? style.opacity : 0.5;

    // Simple path generation for common shapes - no handles or selection UI
    switch (shape.type) {
      case 'rectangle':
        return `<rect width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" rx="0" />`;
      case 'rounded-rectangle':
        return `<rect width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" rx="8" />`;
      case 'oval':
        return `<ellipse cx="${w/2}" cy="${h/2}" rx="${w/2}" ry="${h/2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
      case 'triangle':
      case 'isosceles-triangle':
        return `<polygon points="${w/2},0 ${w},${h} 0,${h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
      case 'diamond':
        return `<polygon points="${w/2},0 ${w},${h/2} ${w/2},${h} 0,${h/2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
      case 'parallelogram':
        return `<polygon points="${w*0.2},0 ${w},0 ${w*0.8},${h} 0,${h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
      case 'trapezoid':
        return `<polygon points="${w*0.2},0 ${w*0.8},0 ${w},${h} 0,${h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
      case 'star-5':
        return `<polygon points="${w/2},0 ${w*0.6},${h*0.35} ${w},${h*0.4} ${w*0.65},${h*0.65} ${w*0.75},${h} ${w/2},${h*0.8} ${w*0.25},${h} ${w*0.35},${h*0.65} 0,${h*0.4} ${w*0.4},${h*0.35}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
      case 'right-arrow':
        return `<polygon points="0,${h*0.25} ${w*0.7},${h*0.25} ${w*0.7},0 ${w},${h/2} ${w*0.7},${h} ${w*0.7},${h*0.75} 0,${h*0.75}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
      case 'line':
        return `<line x1="0" y1="${h}" x2="${w}" y2="0" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
      case 'flowchart-process':
        return `<rect width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" rx="0" />`;
      case 'flowchart-decision':
        return `<polygon points="${w/2},0 ${w},${h/2} ${w/2},${h} 0,${h/2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
      case 'flowchart-terminator':
        return `<rect width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" rx="${h/2}" />`;
      default:
        return `<rect width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
    }
  };

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!drawingShapeType || !drawingSvgRef.current) return;
    
    const coords = getSVGCoordinates(e, drawingSvgRef.current);
    drawingStateRef.current = {
      isDrawing: true,
      startX: coords.x,
      startY: coords.y,
      currentX: coords.x,
      currentY: coords.y
    };
  }, [drawingShapeType]);

  const updatePreviewShape = useCallback(() => {
    if (!previewShapeRef.current || !drawingShapeType) return;
    
    const { startX, startY, currentX, currentY } = drawingStateRef.current;
    let width = currentX - startX;
    let height = currentY - startY;
    
    // Maintain aspect ratio if shift is held
    if (shiftKey) {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width < 0 ? -size : size;
      height = height < 0 ? -size : size;
    }
    
    const x = width < 0 ? startX + width : startX;
    const y = height < 0 ? startY + height : startY;
    const w = Math.abs(width);
    const h = Math.abs(height);
    
    // CRITICAL: Direct DOM manipulation - bypasses React completely
    const previewShape: Shape = {
      id: 'preview',
      type: drawingShapeType,
      x: 0,
      y: 0,
      width: w,
      height: h,
      rotation: 0,
      style: { ...DEFAULT_SHAPE_STYLE, opacity: 0.5 },
      zIndex: 9999
    };
    
    // Update position via transform attribute
    previewShapeRef.current.setAttribute('transform', `translate(${x}, ${y})`);
    
    // Render shape path directly to innerHTML
    const svgPath = renderShapePath(previewShape);
    previewShapeRef.current.innerHTML = svgPath;
  }, [drawingShapeType, shiftKey]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!drawingStateRef.current.isDrawing || !drawingShapeType || !drawingSvgRef.current) return;
    
    // CRITICAL: Cancel any pending frame to ensure max 60 FPS
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // CRITICAL: Use requestAnimationFrame - updates happen at most once per frame
    animationFrameRef.current = requestAnimationFrame(() => {
      const coords = getSVGCoordinates(e, drawingSvgRef.current!);
      drawingStateRef.current.currentX = coords.x;
      drawingStateRef.current.currentY = coords.y;
      
      // CRITICAL: Direct DOM manipulation - NO React re-renders
      updatePreviewShape();
    });
  }, [drawingShapeType, updatePreviewShape]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!drawingStateRef.current.isDrawing || !drawingShapeType) return;
    
    const { startX, startY, currentX, currentY } = drawingStateRef.current;
    let width = currentX - startX;
    let height = currentY - startY;
    
    if (shiftKey) {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width < 0 ? -size : size;
      height = height < 0 ? -size : size;
    }
    
    const x = width < 0 ? startX + width : startX;
    const y = height < 0 ? startY + height : startY;
    const w = Math.abs(width);
    const h = Math.abs(height);
    
    // CRITICAL: Only commit to state on mouseup - NEVER during mousemove
    if (w > 5 && h > 5) {
      const newShape: Shape = {
        id: `shape_${Date.now()}`,
        type: drawingShapeType,
        x,
        y,
        width: w,
        height: h,
        rotation: 0,
        style: { ...DEFAULT_SHAPE_STYLE },
        zIndex: shapes.length
      };
      onShapesChange([...shapes, newShape]);
    }
    
    // Reset drawing state
    drawingStateRef.current.isDrawing = false;
    onDrawingComplete();
    
    // Clear preview
    if (previewShapeRef.current) {
      previewShapeRef.current.innerHTML = '';
    }
  }, [drawingShapeType, shiftKey, shapes, onShapesChange, onDrawingComplete]);



  const handleShapeMouseDown = (e: React.MouseEvent, shape: Shape) => {
    if (drawingShapeType) return;
    e.stopPropagation();
    const coords = getSVGCoordinates(e, svgRef.current!);
    const target = e.target as SVGElement;
    const handleAttr = target.getAttribute('data-handle');
    
    if (handleAttr && selectedShapeId === shape.id) {
      if (handleAttr === 'rotate') {
        setIsRotating(true);
        dragStateRef.current = {
          startX: coords.x,
          startY: coords.y,
          shapeId: shape.id,
          handle: null,
          mode: 'rotate'
        };
      } else {
        setIsResizing(true);
        dragStateRef.current = {
          startX: coords.x,
          startY: coords.y,
          shapeId: shape.id,
          handle: parseInt(handleAttr),
          mode: 'resize'
        };
      }
    } else {
      setSelectedShapeId(shape.id);
      setIsDragging(true);
      dragStateRef.current = {
        startX: coords.x - shape.x,
        startY: coords.y - shape.y,
        shapeId: shape.id,
        handle: null,
        mode: 'drag'
      };
    }
  };

  const handleShapeInteractionMove = (e: React.MouseEvent) => {
    const coords = getSVGCoordinates(e, svgRef.current!);
    
    if (isDragging && dragStateRef.current.shapeId && dragStateRef.current.mode === 'drag') {
      const shape = shapes.find(s => s.id === dragStateRef.current.shapeId);
      if (shape) {
        const newShapes = shapes.map(s =>
          s.id === dragStateRef.current.shapeId
            ? { ...s, x: coords.x - dragStateRef.current.startX, y: coords.y - dragStateRef.current.startY }
            : s
        );
        onShapesChange(newShapes);
      }
    } else if (isResizing && dragStateRef.current.shapeId && dragStateRef.current.mode === 'resize' && dragStateRef.current.handle !== null) {
      const shape = shapes.find(s => s.id === dragStateRef.current.shapeId);
      if (shape) {
        let newX = shape.x;
        let newY = shape.y;
        let newWidth = shape.width;
        let newHeight = shape.height;

        const handles = [
          { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 }, { dx: 1, dy: 0 },
          { dx: 1, dy: 1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 1 }, { dx: -1, dy: 0 }
        ];

        const handle = handles[dragStateRef.current.handle];
        
        if (handle.dx !== 0) {
          if (handle.dx < 0) {
            newX = coords.x;
            newWidth = shape.x + shape.width - coords.x;
          } else {
            newWidth = coords.x - shape.x;
          }
        }

        if (handle.dy !== 0) {
          if (handle.dy < 0) {
            newY = coords.y;
            newHeight = shape.y + shape.height - coords.y;
          } else {
            newHeight = coords.y - shape.y;
          }
        }

        if (shiftKey && handle.dx !== 0 && handle.dy !== 0) {
          const ratio = shape.width / shape.height;
          if (Math.abs(newWidth) / Math.abs(newHeight) > ratio) {
            newHeight = newWidth / ratio;
            if (handle.dy < 0) newY = shape.y + shape.height - Math.abs(newHeight);
          } else {
            newWidth = newHeight * ratio;
            if (handle.dx < 0) newX = shape.x + shape.width - Math.abs(newWidth);
          }
        }

        if (newWidth < 0) { newX += newWidth; newWidth = Math.abs(newWidth); }
        if (newHeight < 0) { newY += newHeight; newHeight = Math.abs(newHeight); }

        onShapesChange(shapes.map(s =>
          s.id === dragStateRef.current.shapeId
            ? { ...s, x: newX, y: newY, width: newWidth, height: newHeight }
            : s
        ));
      }
    } else if (isRotating && dragStateRef.current.shapeId && dragStateRef.current.mode === 'rotate') {
      const shape = shapes.find(s => s.id === dragStateRef.current.shapeId);
      if (shape) {
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const angle = Math.atan2(coords.y - centerY, coords.x - centerX) * (180 / Math.PI) + 90;
        onShapesChange(shapes.map(s =>
          s.id === dragStateRef.current.shapeId ? { ...s, rotation: Math.round(angle) } : s
        ));
      }
    }
  };

  const handleShapeInteractionUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    dragStateRef.current = {
      startX: 0,
      startY: 0,
      shapeId: null,
      handle: null,
      mode: null
    };
  };

  const cursor = drawingShapeType 
    ? 'crosshair' 
    : isDragging 
    ? 'move' 
    : isResizing 
    ? 'nwse-resize'
    : isRotating
    ? 'grab'
    : 'default';

  const handleShapeUpdate = (shapeId: string, updates: Partial<Shape>) => {
    const newShapes = shapes.map(s => s.id === shapeId ? { ...s, ...updates } : s);
    onShapesChange(newShapes);
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // CRITICAL: Attach native event listeners to drawing overlay when in drawing mode
  // This prevents React synthetic events and ensures no re-renders during drawing
  useEffect(() => {
    const overlay = drawingOverlayRef.current;
    if (!overlay || !drawingShapeType) return;

    // Use native DOM events - NOT React events
    overlay.addEventListener('mousedown', handleMouseDown);
    overlay.addEventListener('mousemove', handleMouseMove);
    overlay.addEventListener('mouseup', handleMouseUp);
    overlay.addEventListener('mouseleave', handleMouseUp);

    return () => {
      overlay.removeEventListener('mousedown', handleMouseDown);
      overlay.removeEventListener('mousemove', handleMouseMove);
      overlay.removeEventListener('mouseup', handleMouseUp);
      overlay.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [drawingShapeType, handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <>
      {/* SHAPES LAYER - Main SVG for all committed shapes */}
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // CRITICAL: SVG itself has no pointer events - only shapes capture events
          pointerEvents: 'none',
          cursor: drawingShapeType ? 'crosshair' : 'default',
          // Lower z-index to allow cell selection to show through
          zIndex: 5
        }}
      >
        {/* Render all shapes sorted by zIndex */}
        {[...shapes].sort((a, b) => a.zIndex - b.zIndex).map(shape => (
          <g 
            key={shape.id} 
            style={{ 
              pointerEvents: drawingShapeType ? 'none' : 'auto',
            }}
            // CRITICAL: Use data attribute for CSS cursor, not React state
            data-shape-id={shape.id}
            data-selected={shape.id === selectedShapeId ? 'true' : 'false'}
            className="shape-group"
          >
            <ShapeRenderer
              shape={shape}
              isSelected={shape.id === selectedShapeId}
              onMouseDown={(e) => handleShapeMouseDown(e, shape)}
            />
          </g>
        ))}
      </svg>

      {/* DEDICATED DRAWING OVERLAY - Always rendered, hidden when not in use */}
      <div
        ref={drawingOverlayRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // CRITICAL: Only capture events when in drawing mode
          pointerEvents: drawingShapeType ? 'auto' : 'none',
          cursor: drawingShapeType ? 'crosshair !important' : 'default',
          // CRITICAL: Above shapes layer to prevent any event conflicts
          zIndex: 15,
          // Transparent background
          backgroundColor: 'transparent',
          // CRITICAL: Hide completely when not drawing to prevent any interference
          display: drawingShapeType ? 'block' : 'none',
          // GPU acceleration for smooth rendering
          willChange: drawingShapeType ? 'transform' : 'auto',
          // Prevent any layout shifts
          contain: 'layout style paint'
        }}
      >
        {/* CRITICAL: Single SVG for preview - created once, never removed */}
        <svg
          ref={drawingSvgRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
            // GPU acceleration
            willChange: 'contents'
          }}
        >
          {/* CRITICAL: Preview shape element - always exists, updated via direct DOM manipulation */}
          <g ref={previewShapeRef} style={{ pointerEvents: 'none' }} />
        </svg>
      </div>

      {/* Interaction overlay for dragging/resizing/rotating existing shapes */}
      {(isDragging || isResizing || isRotating) && !drawingShapeType && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: isDragging ? 'move' : isResizing ? 'nwse-resize' : 'grab',
            zIndex: 11
          }}
          onMouseMove={handleShapeInteractionMove}
          onMouseUp={handleShapeInteractionUp}
          onMouseLeave={handleShapeInteractionUp}
        />
      )}

      {/* Format panel */}
      {selectedShape && (
        <ShapeFormatPanel
          shape={selectedShape}
          onUpdate={(updates) => handleShapeUpdate(selectedShape.id, updates)}
          onClose={() => setSelectedShapeId(null)}
          onDelete={() => {
            onShapesChange(shapes.filter(s => s.id !== selectedShape.id));
            setSelectedShapeId(null);
          }}
        />
      )}
    </>
  );
}

// Memoize component to prevent re-renders from parent - export both named and default
export const ShapeCanvas = memo(ShapeCanvasComponent, (prevProps, nextProps) => {
  // Only re-render if shapes array or drawingShapeType actually changed
  return (
    prevProps.shapes === nextProps.shapes &&
    prevProps.drawingShapeType === nextProps.drawingShapeType
  );
});

export default ShapeCanvas;
