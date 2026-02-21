import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Check, Sparkles, Calculator, Layout, Grid3x3, Palette, BarChart3, Users, Database, FileSpreadsheet, Trophy } from "lucide-react";
import logoImage from "../../assets/Logo.png";

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

interface QuickTourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

interface TourStep {
  title: string;
  description: string;
  icon: any;
  target?: string;
}

export function QuickTourOverlay({ isOpen, onClose, isDarkMode = false }: QuickTourOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps: TourStep[] = [
    { title: "Welcome to EtherX Excel", description: "Let's take a quick tour of the main features. This will only take a minute.", icon: Sparkles },
    { title: "Formula Bar", description: "Enter formulas and functions here. Start with '=' to create a formula. We support 100+ Excel-compatible functions.", icon: Calculator, target: "formula-bar" },
    { title: "Ribbon Tabs", description: "All features are organized into tabs: Home for formatting, Insert for charts and shapes, View for display options, and Help for support.", icon: Layout, target: "ribbon-tabs" },
    { title: "Cell Grid", description: "Your data lives here. Click any cell to select it, double-click to edit, or drag to select multiple cells.", icon: Grid3x3, target: "cell-grid" },
    { title: "Formatting Tools", description: "Use the Home tab to format cells: change fonts, colors, alignment, number formats, and more.", icon: Palette, target: "home-tab" },
    { title: "Insert Charts", description: "Create beautiful visualizations from your data. Select cells and choose from bar, line, pie, scatter, and more chart types.", icon: BarChart3, target: "insert-tab" },
    { title: "Collaboration", description: "Click the share button to invite others. Generate view-only or edit links for real-time collaboration.", icon: Users, target: "collaboration-button" },
    { title: "Auto-Save to IPFS", description: "Your work is automatically saved to IPFS (decentralized storage) every 30 seconds. Watch the status indicator in the top right.", icon: Database, target: "save-status" },
    { title: "Templates", description: "Start fast with pre-built templates for budgets, invoices, project tracking, and more. Click 'Templates' in the dashboard.", icon: FileSpreadsheet, target: "templates" },
    { title: "You're All Set", description: "You now know the basics. Explore the Help tab anytime for detailed guides, keyboard shortcuts, and support.", icon: Trophy },
  ];

  const handleNext = () => { if (currentStep < tourSteps.length - 1) { setCurrentStep(currentStep + 1); } else { onClose(); } };
  const handlePrevious = () => { if (currentStep > 0) { setCurrentStep(currentStep - 1); } };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const IconComponent = step.icon;
  const isLast = currentStep === tourSteps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      {/* Card */}
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: 620,
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
              <Sparkles size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a1a', letterSpacing: 0.2 }}>Quick Tour</div>
              <div style={{ fontSize: 10, color: GOLD_DARK, marginTop: 1 }}>Step {currentStep + 1} of {tourSteps.length}</div>
            </div>
          </div>

          {/* Right: progress dots + close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {tourSteps.map((_, idx) => (
                <div key={idx} style={{
                  height: 6, borderRadius: 1,
                  width: idx === currentStep ? 24 : 6,
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
        <div style={{ padding: '32px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: '#fff' }}>
          {/* Logo on first step, gold icon badge on subsequent steps */}
          {currentStep === 0 ? (
            <div style={{ width: 140, height: 64, marginBottom: 20 }}>
              <img src={logoImage} alt="EtherX Excel" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 14, background: ICON_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 6px 20px rgba(184,134,11,0.35)' }}>
              <IconComponent size={30} color="#fff" strokeWidth={2} />
            </div>
          )}

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 10, letterSpacing: -0.3 }}>
            {step.title}
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(0,0,0,0.6)', maxWidth: 460 }}>
            {step.description}
          </p>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ background: HDR_BG, borderTop: FTR_BORDER, padding: '9px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
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

          {/* Skip */}
          <button
            onClick={onClose}
            style={{ padding: '5px 10px', background: 'transparent', border: 'none', color: 'rgba(0,0,0,0.38)', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', letterSpacing: 0.3 }}
            onMouseEnter={e => { e.currentTarget.style.color = GOLD_DARK; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,0,0,0.38)'; }}
          >
            Skip Tour
          </button>

          {/* Next / Finish */}
          <button
            onClick={handleNext}
            style={{ padding: '5px 16px', borderRadius: 7, background: CTA_BG, border: `1.5px solid ${GOLD_DARK}`, color: '#5a3e00', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(184,134,11,0.28)', letterSpacing: 0.2 }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(184,134,11,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(184,134,11,0.28)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {isLast ? (
              <><Check size={14} strokeWidth={2.5} /> Finish</>
            ) : (
              <>Next <ChevronRight size={14} strokeWidth={2.5} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
