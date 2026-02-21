import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// ── Shapes-dropdown gold design tokens ──────────────────────────────────────
const GOLD = '#FFD700';
const GOLD_DARK = '#B8860B';
const GOLD_LIGHT = '#FFE566';
const HDR_BG = 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)';
const CTA_BG = `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 50%, ${GOLD_DARK} 100%)`;
const BORDER = `1.5px solid rgba(184,134,11,0.2)`;
const HDR_BORDER = `1.5px solid rgba(184,134,11,0.18)`;
const FTR_BORDER = `1.5px solid rgba(184,134,11,0.12)`;
const SHADOW = '0 8px 32px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(184,134,11,0.25)';
const ICON_BG = `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_DARK})`;
// ────────────────────────────────────────────────────────────────────────────

interface FeatureStep {
  title: string;
  description: string;
  icon: any;
  benefits?: string[];
  howTo?: string[];
}

interface FeatureInfoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle: string;
  steps: FeatureStep[];
  isDarkMode?: boolean;
}

export function FeatureInfoOverlay({
  isOpen,
  onClose,
  featureTitle,
  steps,
  isDarkMode = false,
}: FeatureInfoOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const IconComponent = step.icon;
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = () => { if (!isLast) { setCurrentStep(currentStep + 1); } else { onClose(); } };
  const handlePrevious = () => { if (!isFirst) { setCurrentStep(currentStep - 1); } };

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: 540,
          background: '#ffffff',
          borderRadius: 12,
          border: BORDER,
          boxShadow: SHADOW,
          overflow: 'hidden',
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ background: HDR_BG, borderBottom: HDR_BORDER, padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: icon badge + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: ICON_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(184,134,11,0.3)' }}>
              <IconComponent size={14} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a1a', letterSpacing: 0.2 }}>{featureTitle}</div>
              <div style={{ fontSize: 10, color: GOLD_DARK, marginTop: 1 }}>Step {currentStep + 1} of {steps.length}</div>
            </div>
          </div>

          {/* Right: progress dots + close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {steps.map((_, idx) => (
                <div key={idx} style={{
                  height: 6, borderRadius: 1,
                  width: idx === currentStep ? 20 : 6,
                  background: idx === currentStep ? GOLD_DARK : idx < currentStep ? '#15803d' : 'rgba(184,134,11,0.25)',
                  transition: 'all 0.2s ease',
                }} />
              ))}
            </div>
            <button
              onClick={onClose}
              style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.2)', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, lineHeight: 1, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,134,11,0.15)'; e.currentTarget.style.color = GOLD_DARK; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(184,134,11,0.08)'; e.currentTarget.style.color = '#888'; }}
            >×</button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: '20px 16px 14px', background: '#fff', maxHeight: 420, overflowY: 'auto' }}>
          {/* Icon + title */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 14, background: ICON_BG, marginBottom: 14, boxShadow: '0 6px 20px rgba(184,134,11,0.35)' }}>
              <IconComponent size={28} color="#fff" strokeWidth={2} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, letterSpacing: -0.3 }}>
              {step.title}
            </h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'rgba(0,0,0,0.6)', maxWidth: 460, margin: '0 auto' }}>
              {step.description}
            </p>
          </div>

          {/* Benefits */}
          {step.benefits && step.benefits.length > 0 && (
            <div style={{ marginBottom: 14, background: '#fffdf5', border: '1px solid rgba(184,134,11,0.15)', borderRadius: 8, padding: '10px 14px' }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: GOLD_DARK, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(184,134,11,0.35), transparent)` }} />
                ✦ Benefits
                <div style={{ flex: 4, height: 1, background: `linear-gradient(90deg, rgba(184,134,11,0.12), transparent)` }} />
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {step.benefits.map((benefit, idx) => (
                  <li key={idx} style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', paddingLeft: 16, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: GOLD_DARK, fontWeight: 700 }}>•</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How To */}
          {step.howTo && step.howTo.length > 0 && (
            <div style={{ background: '#fffdf5', border: '1px solid rgba(184,134,11,0.15)', borderRadius: 8, padding: '10px 14px' }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: GOLD_DARK, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(184,134,11,0.35), transparent)` }} />
                📝 How to Use
                <div style={{ flex: 4, height: 1, background: `linear-gradient(90deg, rgba(184,134,11,0.12), transparent)` }} />
              </h3>
              <ol style={{ padding: 0, paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {step.howTo.map((instruction, idx) => (
                  <li key={idx} style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', lineHeight: 1.55 }}>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ background: HDR_BG, borderTop: FTR_BORDER, padding: '9px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Previous */}
          <button
            onClick={handlePrevious}
            disabled={isFirst}
            style={{ padding: '5px 13px', borderRadius: 7, background: '#fff', border: `1.5px solid ${isFirst ? '#e5e7eb' : '#d1d5db'}`, color: isFirst ? '#bbb' : '#555', fontSize: 11, fontWeight: 600, cursor: isFirst ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s', opacity: isFirst ? 0.5 : 1 }}
            onMouseEnter={e => { if (!isFirst) { e.currentTarget.style.borderColor = GOLD_DARK; e.currentTarget.style.color = GOLD_DARK; } }}
            onMouseLeave={e => { if (!isFirst) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#555'; } }}
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
            Previous
          </button>

          {/* Step counter */}
          <span style={{ fontSize: 11, color: GOLD_DARK, fontWeight: 600 }}>
            {currentStep + 1} / {steps.length}
          </span>

          {/* Next / Done */}
          <button
            onClick={handleNext}
            style={{ padding: '5px 16px', borderRadius: 7, background: CTA_BG, border: `1.5px solid ${GOLD_DARK}`, color: '#5a3e00', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(184,134,11,0.28)', letterSpacing: 0.2 }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(184,134,11,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(184,134,11,0.28)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {isLast ? 'Done' : <>Next <ChevronRight size={14} strokeWidth={2.5} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
