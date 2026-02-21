import React, { useState, useEffect, useRef } from 'react';
import { useDocumentState } from '../../contexts/DocumentStateContext';

export const ImagesLayer: React.FC = () => {
    const { state, updateImage, removeImage } = useDocumentState();
    const activeSheet = state.sheets.find(s => s.sheetId === state.activeSheetId);
    const images = activeSheet?.images || [];

    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

    // Clear selection when clicking outside (handled by parent grid usually, but we can self-manage too)
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.image-container')) {
                setSelectedImageId(null);
            }
        };
        document.addEventListener('mousedown', handleGlobalClick);
        return () => document.removeEventListener('mousedown', handleGlobalClick);
    }, []);

    if (!activeSheet || images.length === 0) return null;

    return (
        <div
            className="images-layer"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none', // Allow clicks to pass through to grid for empty areas
                zIndex: 50 // Ensure it's above the grid (usually 15-30)
            }}
        >
            {images.map(image => (
                <div
                    key={image.id}
                    className={`image-container ${selectedImageId === image.id ? 'selected' : ''}`}
                    style={{
                        position: 'absolute',
                        transform: `translate3d(${image.x}px, ${image.y}px, 0) rotate(${image.rotation}deg)`,
                        width: image.width,
                        height: image.height,
                        opacity: image.opacity,
                        zIndex: image.layer,
                        pointerEvents: 'auto', // Re-enable pointer events for the image itself
                        cursor: 'move'
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        setSelectedImageId(image.id);

                        // Drag Logic
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startLeft = image.x;
                        const startTop = image.y;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            const deltaY = moveEvent.clientY - startY;
                            updateImage(state.activeSheetId, image.id, {
                                x: startLeft + deltaX,
                                y: startTop + deltaY
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
                    <img
                        src={image.src}
                        alt="Spreadsheet Image"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            border: selectedImageId === image.id ? '2px solid #0078d4' : 'none'
                        }}
                        draggable={false}
                    />

                    {/* Resize Handles (Only when selected) */}
                    {selectedImageId === image.id && (
                        <>
                            {/* SE Handle (Bottom-Right) */}
                            <div
                                style={{
                                    position: 'absolute',
                                    right: -5,
                                    bottom: -5,
                                    width: 10,
                                    height: 10,
                                    backgroundColor: 'white',
                                    border: '1px solid #0078d4',
                                    cursor: 'se-resize'
                                }}
                                onMouseDown={(e) => {
                                    e.stopPropagation(); // Prevent drag
                                    const startX = e.clientX;
                                    const startY = e.clientY;
                                    const startWidth = image.width;
                                    const startHeight = image.height;

                                    const handleResizeMove = (moveEvent: MouseEvent) => {
                                        const deltaX = moveEvent.clientX - startX;
                                        const deltaY = moveEvent.clientY - startY;
                                        updateImage(state.activeSheetId, image.id, {
                                            width: Math.max(20, startWidth + deltaX),
                                            height: Math.max(20, startHeight + deltaY)
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

                            {/* Delete Button (Top-Right) */}
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
                                    fontWeight: 'bold'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(state.activeSheetId, image.id);
                                    setSelectedImageId(null);
                                }}
                            >
                                ×
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};
