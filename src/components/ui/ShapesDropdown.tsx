import { useState } from 'react';

interface ShapesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShape: (shapeType: string) => void;
}

const SHAPES: { category: string; shapes: { type: string; label: string }[] }[] = [
  {
    category: 'Basic',
    shapes: [
      { type: 'rectangle', label: 'Rectangle' },
      { type: 'rounded-rectangle', label: 'Rounded Rect' },
      { type: 'oval', label: 'Oval' },
      { type: 'line', label: 'Line' },
    ]
  },
  {
    category: 'Geometric',
    shapes: [
      { type: 'triangle', label: 'Triangle' },
      { type: 'diamond', label: 'Diamond' },
      { type: 'parallelogram', label: 'Parallelogram' },
      { type: 'trapezoid', label: 'Trapezoid' },
    ]
  },
  {
    category: 'Arrows',
    shapes: [
      { type: 'arrow', label: 'Arrow' },
      { type: 'double-arrow', label: 'Double Arrow' },
      { type: 'right-arrow', label: 'Right Arrow' },
      { type: 'left-arrow', label: 'Left Arrow' },
      { type: 'up-arrow', label: 'Up Arrow' },
      { type: 'down-arrow', label: 'Down Arrow' },
    ]
  },
  {
    category: 'Stars',
    shapes: [{ type: 'star-5', label: '5-Point Star' }]
  },
  {
    category: 'Callouts',
    shapes: [
      { type: 'rounded-callout', label: 'Callout' },
      { type: 'cloud-callout', label: 'Cloud' },
    ]
  },
  {
    category: 'Flowchart',
    shapes: [
      { type: 'flowchart-process', label: 'Process' },
      { type: 'flowchart-decision', label: 'Decision' },
      { type: 'flowchart-terminator', label: 'Terminator' },
    ]
  },
];

const GOLD = '#FFD700';
const GOLD_DARK = '#B8860B';
const GOLD_LIGHT = '#FFE566';

function ShapePreview({ type }: { type: string }) {
  const w = 40, h = 32, sw = 1.2;
  const gradId = `g_${type.replace(/[^a-z]/g, '_')}`;

  const GradDef = () => (
    <defs>
      <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={GOLD_LIGHT} />
        <stop offset="50%" stopColor={GOLD} />
        <stop offset="100%" stopColor={GOLD_DARK} />
      </linearGradient>
    </defs>
  );

  const fill = `url(#${gradId})`;

  switch (type) {
    case 'rectangle':
      return <svg width={w} height={h}><GradDef /><rect x={2} y={2} width={w - 4} height={h - 4} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'rounded-rectangle':
      return <svg width={w} height={h}><GradDef /><rect x={2} y={2} width={w - 4} height={h - 4} rx={7} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'oval':
      return <svg width={w} height={h}><GradDef /><ellipse cx={w / 2} cy={h / 2} rx={(w - 4) / 2} ry={(h - 4) / 2} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'line':
      return <svg width={w} height={h}><GradDef /><line x1={3} y1={h / 2} x2={w - 3} y2={h / 2} stroke={GOLD} strokeWidth={2.5} strokeLinecap="round" /></svg>;
    case 'triangle':
      return <svg width={w} height={h}><GradDef /><polygon points={`${w / 2},3 ${w - 3},${h - 3} 3,${h - 3}`} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'diamond':
      return <svg width={w} height={h}><GradDef /><polygon points={`${w / 2},3 ${w - 3},${h / 2} ${w / 2},${h - 3} 3,${h / 2}`} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'parallelogram':
      return <svg width={w} height={h}><GradDef /><polygon points={`9,3 ${w - 3},3 ${w - 9},${h - 3} 3,${h - 3}`} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'trapezoid':
      return <svg width={w} height={h}><GradDef /><polygon points={`7,3 ${w - 7},3 ${w - 3},${h - 3} 3,${h - 3}`} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'arrow':
    case 'right-arrow':
      return <svg width={w} height={h}><GradDef /><polygon points={`3,${h / 2 - 4} ${w - 11},${h / 2 - 4} ${w - 11},3 ${w - 3},${h / 2} ${w - 11},${h - 3} ${w - 11},${h / 2 + 4} 3,${h / 2 + 4}`} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'left-arrow':
      return <svg width={w} height={h}><GradDef /><polygon points={`${w - 3},${h / 2 - 4} 11,${h / 2 - 4} 11,3 3,${h / 2} 11,${h - 3} 11,${h / 2 + 4} ${w - 3},${h / 2 + 4}`} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'up-arrow':
      return <svg width={w} height={h}><GradDef /><polygon points={`${w / 2 - 4},${h - 3} ${w / 2 - 4},11 3,11 ${w / 2},3 ${w - 3},11 ${w / 2 + 4},11 ${w / 2 + 4},${h - 3}`} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'down-arrow':
      return <svg width={w} height={h}><GradDef /><polygon points={`${w / 2 - 4},3 ${w / 2 - 4},${h - 11} 3,${h - 11} ${w / 2},${h - 3} ${w - 3},${h - 11} ${w / 2 + 4},${h - 11} ${w / 2 + 4},3`} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'double-arrow':
      return <svg width={w} height={h}><GradDef /><polygon points={`3,${h / 2} 11,3 11,${h / 2 - 4} ${w - 11},${h / 2 - 4} ${w - 11},3 ${w - 3},${h / 2} ${w - 11},${h - 3} ${w - 11},${h / 2 + 4} 11,${h / 2 + 4} 11,${h - 3}`} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'star-5': {
      const cx = w / 2, cy = h / 2, r1 = Math.min(w, h) / 2 - 2, r2 = r1 * 0.42;
      const pts = Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI / 5) - Math.PI / 2; const r = i % 2 === 0 ? r1 : r2; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }).join(' ');
      return <svg width={w} height={h}><GradDef /><polygon points={pts} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    }
    case 'rounded-callout':
      return <svg width={w} height={h}><GradDef /><rect x={2} y={2} width={w - 4} height={h - 9} rx={5} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /><polygon points={`8,${h - 7} 15,${h - 7} 11,${h - 1}`} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'cloud-callout':
      return <svg width={w} height={h}><GradDef /><ellipse cx={10} cy={12} rx={7} ry={6} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /><ellipse cx={19} cy={9} rx={8} ry={7} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /><ellipse cx={28} cy={12} rx={7} ry={6} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /><ellipse cx={w / 2} cy={16} rx={13} ry={6} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /><polygon points={`10,${h - 6} 17,${h - 6} 13,${h - 1}`} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'flowchart-process':
      return <svg width={w} height={h}><GradDef /><rect x={2} y={2} width={w - 4} height={h - 4} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'flowchart-decision':
      return <svg width={w} height={h}><GradDef /><polygon points={`${w / 2},3 ${w - 3},${h / 2} ${w / 2},${h - 3} 3,${h / 2}`} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    case 'flowchart-terminator':
      return <svg width={w} height={h}><GradDef /><rect x={2} y={2} width={w - 4} height={h - 4} rx={13} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
    default:
      return <svg width={w} height={h}><GradDef /><rect x={2} y={2} width={w - 4} height={h - 4} fill={fill} stroke={GOLD_DARK} strokeWidth={sw} /></svg>;
  }
}

export function ShapesDropdown({ isOpen, onClose, onSelectShape }: ShapesDropdownProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (selectedType) {
      onSelectShape(selectedType);
      setSelectedType(null);
      onClose();
    }
  };

  const selectedLabel = SHAPES.flatMap(c => c.shapes).find(s => s.type === selectedType)?.label;

  return (
    <div style={{ width: 520 }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(184,134,11,0.25)',
        overflow: 'hidden',
        border: '1.5px solid rgba(184,134,11,0.2)',
      }}>
        {/* HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
          borderBottom: '1.5px solid rgba(184,134,11,0.18)',
          padding: '11px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #FFE566, #FFD700, #B8860B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(184,134,11,0.3)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 22,20 2,20" fill="#fff" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a1a', letterSpacing: 0.2 }}>Insert Shape</div>
              <div style={{ fontSize: 10, color: '#B8860B', marginTop: 1 }}>Click to select, then insert</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 26, height: 26, borderRadius: 6,
              background: 'rgba(184,134,11,0.08)',
              border: '1px solid rgba(184,134,11,0.2)',
              color: '#888',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, lineHeight: 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,134,11,0.15)'; e.currentTarget.style.color = '#B8860B'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(184,134,11,0.08)'; e.currentTarget.style.color = '#888'; }}
          >×</button>
        </div>

        {/* CONTENT */}
        <div style={{ padding: '12px 16px', maxHeight: 400, overflowY: 'auto', background: '#fff' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SHAPES.map(({ category, shapes }) => (
              <div key={category}>
                {/* Category label */}
                <div style={{
                  fontSize: 9.5, fontWeight: 700, color: '#B8860B',
                  letterSpacing: 1.2, textTransform: 'uppercase',
                  marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(184,134,11,0.35), transparent)' }} />
                  {category}
                  <div style={{ flex: 4, height: 1, background: 'linear-gradient(90deg, rgba(184,134,11,0.12), transparent)' }} />
                </div>

                {/* Shape tiles */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {shapes.map((shape) => {
                    const isSelected = selectedType === shape.type;
                    const isHovered = hoveredType === shape.type;
                    return (
                      <button
                        key={shape.type}
                        type="button"
                        title={shape.label}
                        onClick={() => setSelectedType(shape.type)}
                        onMouseEnter={() => setHoveredType(shape.type)}
                        onMouseLeave={() => setHoveredType(null)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          padding: '7px 5px 5px', borderRadius: 8, width: 70, cursor: 'pointer',
                          transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                          border: isSelected
                            ? '1.5px solid #B8860B'
                            : isHovered
                              ? '1.5px solid rgba(184,134,11,0.45)'
                              : '1.5px solid #e8e8e8',
                          background: isSelected
                            ? 'linear-gradient(135deg, #fffdf0 0%, #fff3b0 100%)'
                            : isHovered
                              ? '#fffdf5'
                              : '#fafafa',
                          boxShadow: isSelected
                            ? '0 2px 8px rgba(184,134,11,0.2), inset 0 1px 0 rgba(255,255,255,0.9)'
                            : isHovered
                              ? '0 2px 8px rgba(0,0,0,0.08)'
                              : 'none',
                          transform: isSelected ? 'scale(1.05)' : isHovered ? 'scale(1.03)' : 'scale(1)',
                        }}
                      >
                        <ShapePreview type={shape.type} />
                        <span style={{
                          fontSize: 9.5,
                          color: isSelected ? '#8B6914' : '#555',
                          textAlign: 'center', lineHeight: 1.2,
                          fontWeight: isSelected ? 600 : 400,
                        }}>
                          {shape.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          padding: '9px 16px',
          borderTop: '1.5px solid rgba(184,134,11,0.12)',
          background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 10, color: selectedType ? '#B8860B' : '#aaa', fontStyle: selectedType ? 'normal' : 'italic' }}>
            {selectedType ? `✦ ${selectedLabel}` : 'No shape selected'}
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <button
              onClick={onClose}
              style={{
                padding: '5px 13px', borderRadius: 7,
                background: '#fff', border: '1.5px solid #d1d5db',
                color: '#555', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.color = '#B8860B'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#555'; }}
            >Cancel</button>
            <button
              onClick={handleInsert}
              disabled={!selectedType}
              style={{
                padding: '5px 15px', borderRadius: 7,
                background: selectedType ? 'linear-gradient(135deg, #FFE566 0%, #FFD700 50%, #B8860B 100%)' : '#f0f0f0',
                border: selectedType ? '1.5px solid #B8860B' : '1.5px solid #ddd',
                color: selectedType ? '#5a3e00' : '#aaa',
                fontSize: 11, fontWeight: 700,
                cursor: selectedType ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
                boxShadow: selectedType ? '0 2px 8px rgba(184,134,11,0.3)' : 'none',
                letterSpacing: 0.2,
              }}
              onMouseEnter={e => { if (selectedType) { e.currentTarget.style.boxShadow = '0 4px 14px rgba(184,134,11,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { if (selectedType) { e.currentTarget.style.boxShadow = '0 2px 8px rgba(184,134,11,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >✦ Insert Shape</button>
          </div>
        </div>
      </div>
    </div>
  );
}
