import React from "react";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";

interface FloatingDropdownProps {
  anchorRect: DOMRect | null;
  onClose: () => void;
  children: React.ReactNode;
}

export default function FloatingDropdown({ anchorRect, onClose, children }: FloatingDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  if (!anchorRect) return null;

  // Dropdown width hints (Insert=280, Delete=240, default=180)
  const dropdownWidth = 300; // use a safe upper bound for clamping
  const viewportWidth = window.innerWidth;
  const rawLeft = anchorRect.left;
  // Shift left so the dropdown doesn't overflow the right edge; keep at least 8px from right
  const clampedLeft = Math.min(rawLeft, viewportWidth - dropdownWidth - 8);

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: anchorRect.bottom + 4,
        left: clampedLeft,
        zIndex: 9999,
        background: "#ffffff",
        border: "1.5px solid rgba(184,134,11,0.22)",
        borderRadius: 10,
        boxShadow: "0 8px 28px rgba(0,0,0,0.13), 0 0 0 1.5px rgba(184,134,11,0.1)",
        padding: "4px 0",
        minWidth: 180,
      }}
    >
      {children}
    </div>,
    document.body
  );
}
