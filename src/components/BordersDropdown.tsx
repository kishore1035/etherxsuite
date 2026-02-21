import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export type BorderPreset =
  | "BOTTOM" | "TOP" | "LEFT" | "RIGHT" | "NONE" | "ALL"
  | "OUTSIDE" | "THICK_OUTSIDE" | "BOTTOM_DOUBLE" | "BOTTOM_THICK"
  | "TOP_BOTTOM" | "TOP_THICK_BOTTOM" | "TOP_DOUBLE_BOTTOM";

interface BordersDropdownProps {
  onApplyBorder: (preset: BorderPreset) => void;
  isDarkMode?: boolean;
}

const GOLD_DARK = '#B8860B';
const GOLD = '#FFD700';
const GOLD_LIGHT = '#FFE566';

const borderOptions: Array<{ label: string; preset: BorderPreset; icon: string }> = [
  { label: "Bottom Border", preset: "BOTTOM", icon: "⎯" },
  { label: "Top Border", preset: "TOP", icon: "‾" },
  { label: "Left Border", preset: "LEFT", icon: "|" },
  { label: "Right Border", preset: "RIGHT", icon: "|" },
  { label: "No Border", preset: "NONE", icon: "□" },
  { label: "All Borders", preset: "ALL", icon: "▦" },
  { label: "Outside Borders", preset: "OUTSIDE", icon: "⊡" },
  { label: "Thick Outside Borders", preset: "THICK_OUTSIDE", icon: "■" },
  { label: "Bottom Double Border", preset: "BOTTOM_DOUBLE", icon: "═" },
  { label: "Thick Bottom Border", preset: "BOTTOM_THICK", icon: "━" },
  { label: "Top and Bottom Border", preset: "TOP_BOTTOM", icon: "⊤⊥" },
  { label: "Top and Thick Bottom", preset: "TOP_THICK_BOTTOM", icon: "⊤━" },
  { label: "Top and Double Bottom", preset: "TOP_DOUBLE_BOTTOM", icon: "⊤═" },
];

export function BordersDropdown({ onApplyBorder, isDarkMode = false }: BordersDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleBorderClick = (preset: BorderPreset) => {
    onApplyBorder(preset);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1"
          style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
          <span className="text-xs">Borders</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="p-0 overflow-hidden"
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(184,134,11,0.25)',
          border: '1.5px solid rgba(184,134,11,0.2)',
          minWidth: 220,
        }}
      >
        {/* HEADER — matches ShapesDropdown */}
        <div style={{
          background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
          borderBottom: '1.5px solid rgba(184,134,11,0.18)',
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_DARK})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(184,134,11,0.3)',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#fff" strokeWidth="2.2" fill="none" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="#fff" strokeWidth="1.5" />
              <line x1="12" y1="3" x2="12" y2="21" stroke="#fff" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1a1a1a', letterSpacing: 0.2 }}>Cell Borders</div>
            <div style={{ fontSize: 9.5, color: GOLD_DARK, marginTop: 1 }}>Choose a border style</div>
          </div>
        </div>

        {/* ITEMS */}
        <div style={{ padding: '4px', maxHeight: 340, overflowY: 'auto' }}>
          {borderOptions.map((option) => (
            <DropdownMenuItem
              key={option.preset}
              onClick={() => handleBorderClick(option.preset)}
              className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
              style={{ color: '#1a1a1a', fontSize: 12.5 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #fffdf0 0%, #fff3b0 100%)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <span className="font-mono text-lg w-6 flex items-center justify-center" style={{ color: GOLD_DARK }}>
                {option.icon}
              </span>
              <span>{option.label}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
