import React, { useState, useEffect } from 'react';
import { useDocumentState } from '../../contexts/DocumentStateContext';

/** Renders the correct SVG path/shape for each shape type */
function ShapeSVG({ type, width, height, fill, stroke, strokeWidth }: {
    type: string;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
}) {
    const w = width;
    const h = height;
    const sw = strokeWidth;

    switch (type) {
        case 'rectangle':
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <rect x={sw / 2} y={sw / 2} width={w - sw} height={h - sw} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );

        case 'rounded-rectangle':
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <rect x={sw / 2} y={sw / 2} width={w - sw} height={h - sw} rx={12} ry={12} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );

        case 'oval':
        case 'circle':
        case 'ellipse':
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <ellipse cx={w / 2} cy={h / 2} rx={(w - sw) / 2} ry={(h - sw) / 2} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );

        case 'line':
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke={stroke} strokeWidth={sw * 1.5} strokeLinecap="round" />
                </svg>
            );

        case 'triangle': {
            // Right triangle
            const pts = `${sw},${h - sw} ${w - sw},${h - sw} ${w - sw},${sw}`;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'isosceles-triangle': {
            const pts = `${w / 2},${sw} ${w - sw},${h - sw} ${sw},${h - sw}`;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'diamond': {
            const pts = `${w / 2},${sw} ${w - sw},${h / 2} ${w / 2},${h - sw} ${sw},${h / 2}`;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'parallelogram': {
            const offset = w * 0.2;
            const pts = `${offset},${sw} ${w - sw},${sw} ${w - offset},${h - sw} ${sw},${h - sw}`;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'trapezoid': {
            const inset = w * 0.15;
            const pts = `${inset},${sw} ${w - inset},${sw} ${w - sw},${h - sw} ${sw},${h - sw}`;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'arrow':
        case 'right-arrow': {
            const ah = h * 0.35; // arrowhead height from center
            const ab = w * 0.35; // arrowhead base x
            const pts = `${sw},${h / 2 - ah * 0.6} ${ab},${h / 2 - ah * 0.6} ${ab},${sw} ${w - sw},${h / 2} ${ab},${h - sw} ${ab},${h / 2 + ah * 0.6} ${sw},${h / 2 + ah * 0.6}`;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'left-arrow': {
            const ah = h * 0.35;
            const ab = w * 0.65;
            const pts = `${w - sw},${h / 2 - ah * 0.6} ${ab},${h / 2 - ah * 0.6} ${ab},${sw} ${sw},${h / 2} ${ab},${h - sw} ${ab},${h / 2 + ah * 0.6} ${w - sw},${h / 2 + ah * 0.6}`;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'up-arrow': {
            const aw = w * 0.35;
            const ab = h * 0.35;
            const pts = `${w / 2 - aw * 0.6},${h - sw} ${w / 2 - aw * 0.6},${ab} ${sw},${ab} ${w / 2},${sw} ${w - sw},${ab} ${w / 2 + aw * 0.6},${ab} ${w / 2 + aw * 0.6},${h - sw}`;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'down-arrow': {
            const aw = w * 0.35;
            const ab = h * 0.65;
            const pts = `${w / 2 - aw * 0.6},${sw} ${w / 2 - aw * 0.6},${ab} ${sw},${ab} ${w / 2},${h - sw} ${w - sw},${ab} ${w / 2 + aw * 0.6},${ab} ${w / 2 + aw * 0.6},${sw}`;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'double-arrow': {
            const ah = h * 0.35;
            const ab1 = w * 0.25;
            const ab2 = w * 0.75;
            const pts = `${sw},${h / 2} ${ab1},${sw} ${ab1},${h / 2 - ah * 0.6} ${ab2},${h / 2 - ah * 0.6} ${ab2},${sw} ${w - sw},${h / 2} ${ab2},${h - sw} ${ab2},${h / 2 + ah * 0.6} ${ab1},${h / 2 + ah * 0.6} ${ab1},${h - sw}`;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'star-5':
        case 'star': {
            const cx = w / 2, cy = h / 2;
            const r1 = Math.min(w, h) / 2 - sw;
            const r2 = r1 * 0.4;
            const pts = Array.from({ length: 10 }, (_, i) => {
                const angle = (i * Math.PI / 5) - Math.PI / 2;
                const r = i % 2 === 0 ? r1 : r2;
                return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ');
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'rounded-callout': {
            const bh = h * 0.72;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <rect x={sw / 2} y={sw / 2} width={w - sw} height={bh - sw / 2} rx={8} ry={8} fill={fill} stroke={stroke} strokeWidth={sw} />
                    <polygon points={`${w * 0.25},${bh} ${w * 0.4},${bh} ${w * 0.3},${h - sw}`} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'oval-callout': {
            const bh = h * 0.72;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <ellipse cx={w / 2} cy={bh / 2} rx={(w - sw) / 2} ry={(bh - sw) / 2} fill={fill} stroke={stroke} strokeWidth={sw} />
                    <polygon points={`${w * 0.3},${bh * 0.9} ${w * 0.45},${bh * 0.9} ${w * 0.35},${h - sw}`} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'cloud-callout': {
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <ellipse cx={w * 0.28} cy={h * 0.38} rx={w * 0.2} ry={h * 0.2} fill={fill} stroke={stroke} strokeWidth={sw} />
                    <ellipse cx={w * 0.5} cy={h * 0.28} rx={w * 0.22} ry={h * 0.22} fill={fill} stroke={stroke} strokeWidth={sw} />
                    <ellipse cx={w * 0.72} cy={h * 0.38} rx={w * 0.2} ry={h * 0.2} fill={fill} stroke={stroke} strokeWidth={sw} />
                    <ellipse cx={w * 0.5} cy={h * 0.52} rx={w * 0.35} ry={h * 0.18} fill={fill} stroke={stroke} strokeWidth={sw} />
                    <polygon points={`${w * 0.3},${h * 0.65} ${w * 0.45},${h * 0.65} ${w * 0.35},${h - sw}`} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'flowchart-process':
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <rect x={sw / 2} y={sw / 2} width={w - sw} height={h - sw} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );

        case 'flowchart-decision': {
            const pts = `${w / 2},${sw} ${w - sw},${h / 2} ${w / 2},${h - sw} ${sw},${h / 2}`;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'flowchart-terminator':
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <rect x={sw / 2} y={sw / 2} width={w - sw} height={h - sw} rx={h / 2} ry={h / 2} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );

        case 'flowchart-data': {
            const offset = w * 0.15;
            const pts = `${offset},${sw} ${w - sw},${sw} ${w - offset},${h - sw} ${sw},${h - sw}`;
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
        }

        case 'flowchart-predefined':
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <rect x={sw / 2} y={sw / 2} width={w - sw} height={h - sw} fill={fill} stroke={stroke} strokeWidth={sw} />
                    <line x1={w * 0.15} y1={sw / 2} x2={w * 0.15} y2={h - sw / 2} stroke={stroke} strokeWidth={sw} />
                    <line x1={w * 0.85} y1={sw / 2} x2={w * 0.85} y2={h - sw / 2} stroke={stroke} strokeWidth={sw} />
                </svg>
            );

        default:
            // Fallback: rectangle
            return (
                <svg width={w} height={h} style={{ display: 'block' }}>
                    <rect x={sw / 2} y={sw / 2} width={w - sw} height={h - sw} fill={fill} stroke={stroke} strokeWidth={sw} />
                </svg>
            );
    }
}

export const ShapesLayer: React.FC = () => {
    const { state, updateShape, removeShape } = useDocumentState();
    const activeSheet = state.sheets.find(s => s.sheetId === state.activeSheetId);
    const shapes = activeSheet?.shapes || [];

    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

    // Clear selection when clicking outside
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.shape-container')) {
                setSelectedShapeId(null);
            }
        };
        document.addEventListener('mousedown', handleGlobalClick);
        return () => document.removeEventListener('mousedown', handleGlobalClick);
    }, []);

    if (!activeSheet || shapes.length === 0) return null;

    return (
        <div
            className="shapes-layer"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 15,
            }}
        >
            {shapes.map(shape => {
                const fill = (shape as any).fill || (shape as any).style?.fill || '#4472C4';
                const stroke = (shape as any).stroke || (shape as any).style?.stroke || '#2F5597';
                const strokeWidth = (shape as any).strokeWidth || (shape as any).style?.strokeWidth || 2;
                const shapeType = (shape as any).type || 'rectangle';
                const isSelected = selectedShapeId === shape.id;

                return (
                    <div
                        key={shape.id}
                        className={`shape-container ${isSelected ? 'selected' : ''}`}
                        style={{
                            position: 'absolute',
                            transform: `translate3d(${shape.x}px, ${shape.y}px, 0) rotate(${(shape as any).rotation || 0}deg)`,
                            width: shape.width,
                            height: shape.height,
                            opacity: (shape as any).opacity ?? 1,
                            zIndex: (shape as any).layer || (shape as any).zIndex || 10,
                            pointerEvents: 'auto',
                            cursor: 'move',
                            outline: isSelected ? '2px solid #0078d4' : 'none',
                            outlineOffset: '2px',
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            setSelectedShapeId(shape.id);

                            const startX = e.clientX;
                            const startY = e.clientY;
                            const startLeft = shape.x;
                            const startTop = shape.y;

                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaX = moveEvent.clientX - startX;
                                const deltaY = moveEvent.clientY - startY;
                                updateShape(state.activeSheetId, shape.id, {
                                    x: startLeft + deltaX,
                                    y: startTop + deltaY,
                                });
                            };

                            const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                            };

                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                        }}
                    >
                        {/* SVG Shape */}
                        <ShapeSVG
                            type={shapeType}
                            width={shape.width}
                            height={shape.height}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                        />

                        {/* Text Content */}
                        {(shape as any).text && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: (shape as any).textStyle?.color || 'white',
                                    fontFamily: (shape as any).textStyle?.fontFamily || 'Arial',
                                    fontSize: (shape as any).textStyle?.fontSize || 14,
                                    pointerEvents: 'none',
                                    padding: '4px',
                                    textAlign: 'center',
                                }}
                            >
                                {(shape as any).text}
                            </div>
                        )}

                        {/* Selection handles */}
                        {isSelected && (
                            <>
                                {/* SE Resize Handle */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        right: -5,
                                        bottom: -5,
                                        width: 10,
                                        height: 10,
                                        backgroundColor: 'white',
                                        border: '1px solid #0078d4',
                                        cursor: 'se-resize',
                                        zIndex: 1,
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        const startX = e.clientX;
                                        const startY = e.clientY;
                                        const startWidth = shape.width;
                                        const startHeight = shape.height;

                                        const handleResizeMove = (moveEvent: MouseEvent) => {
                                            const deltaX = moveEvent.clientX - startX;
                                            const deltaY = moveEvent.clientY - startY;
                                            updateShape(state.activeSheetId, shape.id, {
                                                width: Math.max(20, startWidth + deltaX),
                                                height: Math.max(20, startHeight + deltaY),
                                            });
                                        };

                                        const handleResizeUp = () => {
                                            document.removeEventListener('mousemove', handleResizeMove);
                                            document.removeEventListener('mouseup', handleResizeUp);
                                        };

                                        document.addEventListener('mousemove', handleResizeMove);
                                        document.addEventListener('mouseup', handleResizeUp);
                                    }}
                                />

                                {/* Delete Button */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: -10,
                                        right: -10,
                                        background: 'red',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: 20,
                                        height: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        zIndex: 1,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeShape(state.activeSheetId, shape.id);
                                        setSelectedShapeId(null);
                                    }}
                                >
                                    ×
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
