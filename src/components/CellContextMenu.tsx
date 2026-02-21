import { useEffect, useRef } from "react";
import {
  Copy, Scissors, Clipboard, Trash2,
  Bold, Italic, Underline, Palette, MessageSquare, ImagePlus,
} from "lucide-react";

interface CellContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onColor: () => void;
  onComment: () => void;
  onInsertImage: () => void;
}

export function CellContextMenu({
  x, y, onClose, onCopy, onCut, onPaste, onDelete,
  onBold, onItalic, onUnderline, onColor, onComment, onInsertImage,
}: CellContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const menuItems = [
    { icon: Copy, label: "Copy", action: onCopy, shortcut: "Ctrl+C" },
    { icon: Scissors, label: "Cut", action: onCut, shortcut: "Ctrl+X" },
    { icon: Clipboard, label: "Paste", action: onPaste, shortcut: "Ctrl+V" },
    { icon: Trash2, label: "Delete", action: onDelete, shortcut: "Del" },
    { divider: true },
    { icon: Bold, label: "Bold", action: onBold, shortcut: "Ctrl+B" },
    { icon: Italic, label: "Italic", action: onItalic, shortcut: "Ctrl+I" },
    { icon: Underline, label: "Underline", action: onUnderline, shortcut: "Ctrl+U" },
    { icon: Palette, label: "Color", action: onColor },
    { divider: true },
    { icon: MessageSquare, label: "Add Comment", action: onComment },
    { icon: ImagePlus, label: "Insert Image/GIF", action: onInsertImage },
  ];

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed', left: x, top: y, zIndex: 9999,
        background: '#ffffff',
        borderRadius: 10,
        boxShadow: '0 8px 28px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(184,134,11,0.2)',
        border: '1.5px solid rgba(184,134,11,0.18)',
        overflow: 'hidden',
        minWidth: 200,
        padding: '4px 0',
      }}
    >
      {menuItems.map((item, index) =>
        item.divider ? (
          <div key={index} style={{ height: 1, background: 'rgba(184,134,11,0.12)', margin: '3px 0' }} />
        ) : (
          <button
            key={index}
            onClick={() => { item.action!(); onClose(); }}
            style={{
              width: '100%', padding: '8px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#fff', border: 'none', cursor: 'pointer',
              fontSize: 13, color: '#1a1a1a', textAlign: 'left',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #fffdf0 0%, #fff3b0 100%)';
              const icon = e.currentTarget.querySelector('.ctx-icon') as HTMLElement;
              if (icon) icon.style.color = '#B8860B';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fff';
              const icon = e.currentTarget.querySelector('.ctx-icon') as HTMLElement;
              if (icon) icon.style.color = '#888';
            }}
          >
            {item.icon && (
              <span className="ctx-icon" style={{ color: '#888', display: 'flex', transition: 'color 0.12s' }}>
                <item.icon size={15} />
              </span>
            )}
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
              <span style={{ fontSize: 10, color: '#B8860B', fontWeight: 600, background: 'rgba(184,134,11,0.08)', padding: '1px 5px', borderRadius: 4 }}>
                {item.shortcut}
              </span>
            )}
          </button>
        )
      )}
    </div>
  );
}
