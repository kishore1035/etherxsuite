import { useEffect, useCallback, useRef } from 'react';
import { useRealtimeCollaboration } from '../contexts/RealtimeCollaborationContext';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';

/**
 * Hook to integrate real-time collaboration with spreadsheet state
 */
export function useSpreadsheetCollaboration(
  spreadsheetId: string | null,
  userId: string,
  userName: string,
  permission: 'viewer' | 'editor' = 'editor'
) {
  const {
    isConnected,
    collaborators,
    collaboratorCursors,
    connect,
    disconnect,
    broadcastCellChange,
    broadcastFormatChange,
    broadcastBulkChange,
    broadcastCursorMove,
    onCellChange,
    onFormatChange,
    onBulkChange,
    onStateSync
  } = useRealtimeCollaboration();

  const {
    cellData,
    setCellData,
    cellFormats,
    setCellFormats,
    floatingImages,
    setFloatingImages,
    floatingCharts,
    setFloatingCharts,
    floatingShapes,
    setFloatingShapes,
    floatingTextBoxes,
    setFloatingTextBoxes,
    shapes,
    setShapes,
    selectedCell,
    setSelectedCell
  } = useSpreadsheet();

  const isLocalChange = useRef(false);
  const lastBroadcastTime = useRef<{ [key: string]: number }>({});
  const BROADCAST_THROTTLE = 100; // ms

  /**
   * Connect to collaboration when spreadsheet ID is available
   */
  useEffect(() => {
    if (spreadsheetId && userId && userName) {
      connect(spreadsheetId, userId, userName, permission);

      return () => {
        disconnect();
      };
    }
  }, [spreadsheetId, userId, userName, permission, connect, disconnect]);

  /**
   * Broadcast cursor movement when selection changes
   */
  useEffect(() => {
    if (isConnected && selectedCell) {
      const now = Date.now();
      const lastTime = lastBroadcastTime.current['cursor'] || 0;
      
      if (now - lastTime > BROADCAST_THROTTLE) {
        broadcastCursorMove(selectedCell.row, selectedCell.col);
        lastBroadcastTime.current['cursor'] = now;
      }
    }
  }, [selectedCell, isConnected, broadcastCursorMove]);

  /**
   * Handle incoming cell changes from other users
   */
  useEffect(() => {
    const handleCellChange = (cellId: string, value: string, userId: string, userName: string) => {
      console.log(`📝 Cell change from ${userName}: ${cellId} = ${value}`);
      
      isLocalChange.current = true;
      setCellData(prev => ({
        ...prev,
        [cellId]: value
      }));
      isLocalChange.current = false;
    };

    onCellChange(handleCellChange);
  }, [onCellChange, setCellData]);

  /**
   * Handle incoming format changes from other users
   */
  useEffect(() => {
    const handleFormatChange = (cellId: string, format: any, userId: string, userName: string) => {
      console.log(`🎨 Format change from ${userName}: ${cellId}`);
      
      isLocalChange.current = true;
      setCellFormats(prev => ({
        ...prev,
        [cellId]: { ...prev[cellId], ...format }
      }));
      isLocalChange.current = false;
    };

    onFormatChange(handleFormatChange);
  }, [onFormatChange, setCellFormats]);

  /**
   * Handle incoming bulk changes from other users
   */
  useEffect(() => {
    const handleBulkChange = (changes: any, userId: string, userName: string) => {
      console.log(`📦 Bulk change from ${userName}`);
      
      isLocalChange.current = true;

      if (changes.cellData) {
        setCellData(prev => ({ ...prev, ...changes.cellData }));
      }
      if (changes.cellFormats) {
        setCellFormats(prev => ({ ...prev, ...changes.cellFormats }));
      }
      if (changes.floatingImages !== undefined) {
        setFloatingImages(changes.floatingImages);
      }
      if (changes.floatingCharts !== undefined) {
        setFloatingCharts(changes.floatingCharts);
      }
      if (changes.floatingShapes !== undefined) {
        setFloatingShapes(changes.floatingShapes);
      }
      if (changes.floatingTextBoxes !== undefined) {
        setFloatingTextBoxes(changes.floatingTextBoxes);
      }
      if (changes.shapes !== undefined) {
        setShapes(changes.shapes);
      }

      isLocalChange.current = false;
    };

    onBulkChange(handleBulkChange);
  }, [onBulkChange, setCellData, setCellFormats, setFloatingImages, setFloatingCharts, setFloatingShapes, setFloatingTextBoxes, setShapes]);

  /**
   * Handle full state sync from server
   */
  useEffect(() => {
    const handleStateSync = (state: any) => {
      console.log('🔄 Syncing full state from server');
      
      isLocalChange.current = true;

      if (state.cellData) setCellData(state.cellData);
      if (state.cellFormats) setCellFormats(state.cellFormats);
      if (state.floatingImages) setFloatingImages(state.floatingImages);
      if (state.floatingCharts) setFloatingCharts(state.floatingCharts);
      if (state.floatingShapes) setFloatingShapes(state.floatingShapes);
      if (state.floatingTextBoxes) setFloatingTextBoxes(state.floatingTextBoxes);
      if (state.shapes) setShapes(state.shapes);

      isLocalChange.current = false;
    };

    onStateSync(handleStateSync);
  }, [onStateSync, setCellData, setCellFormats, setFloatingImages, setFloatingCharts, setFloatingShapes, setFloatingTextBoxes, setShapes]);

  /**
   * Broadcast local cell data changes
   */
  const previousCellData = useRef(cellData);
  useEffect(() => {
    if (isLocalChange.current || !isConnected) return;

    // Find changes
    const changes: { [key: string]: string } = {};
    Object.keys(cellData).forEach(key => {
      if (cellData[key] !== previousCellData.current[key]) {
        changes[key] = cellData[key];
      }
    });

    // Broadcast individual changes
    Object.keys(changes).forEach(cellId => {
      const now = Date.now();
      const lastTime = lastBroadcastTime.current[`cell_${cellId}`] || 0;
      
      if (now - lastTime > BROADCAST_THROTTLE) {
        broadcastCellChange(cellId, changes[cellId]);
        lastBroadcastTime.current[`cell_${cellId}`] = now;
      }
    });

    previousCellData.current = cellData;
  }, [cellData, isConnected, broadcastCellChange]);

  /**
   * Broadcast local format changes
   */
  const previousCellFormats = useRef(cellFormats);
  useEffect(() => {
    if (isLocalChange.current || !isConnected) return;

    // Find changes
    const changes: { [key: string]: any } = {};
    Object.keys(cellFormats).forEach(key => {
      if (JSON.stringify(cellFormats[key]) !== JSON.stringify(previousCellFormats.current[key])) {
        changes[key] = cellFormats[key];
      }
    });

    // Broadcast individual changes
    Object.keys(changes).forEach(cellId => {
      const now = Date.now();
      const lastTime = lastBroadcastTime.current[`format_${cellId}`] || 0;
      
      if (now - lastTime > BROADCAST_THROTTLE) {
        broadcastFormatChange(cellId, changes[cellId]);
        lastBroadcastTime.current[`format_${cellId}`] = now;
      }
    });

    previousCellFormats.current = cellFormats;
  }, [cellFormats, isConnected, broadcastFormatChange]);

  /**
   * Broadcast bulk changes for images, charts, shapes, etc.
   */
  const previousFloatingData = useRef({
    floatingImages,
    floatingCharts,
    floatingShapes,
    floatingTextBoxes,
    shapes
  });

  useEffect(() => {
    if (isLocalChange.current || !isConnected) return;

    const hasChanges = 
      JSON.stringify(floatingImages) !== JSON.stringify(previousFloatingData.current.floatingImages) ||
      JSON.stringify(floatingCharts) !== JSON.stringify(previousFloatingData.current.floatingCharts) ||
      JSON.stringify(floatingShapes) !== JSON.stringify(previousFloatingData.current.floatingShapes) ||
      JSON.stringify(floatingTextBoxes) !== JSON.stringify(previousFloatingData.current.floatingTextBoxes) ||
      JSON.stringify(shapes) !== JSON.stringify(previousFloatingData.current.shapes);

    if (hasChanges) {
      const now = Date.now();
      const lastTime = lastBroadcastTime.current['bulk'] || 0;
      
      if (now - lastTime > BROADCAST_THROTTLE) {
        broadcastBulkChange({
          floatingImages,
          floatingCharts,
          floatingShapes,
          floatingTextBoxes,
          shapes
        });
        lastBroadcastTime.current['bulk'] = now;
      }

      previousFloatingData.current = {
        floatingImages,
        floatingCharts,
        floatingShapes,
        floatingTextBoxes,
        shapes
      };
    }
  }, [floatingImages, floatingCharts, floatingShapes, floatingTextBoxes, shapes, isConnected, broadcastBulkChange]);

  return {
    isConnected,
    collaborators,
    collaboratorCursors
  };
}
