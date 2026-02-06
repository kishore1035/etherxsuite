import { 
  Layout,
  Grid,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Code,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useSpreadsheet } from '../../contexts/SpreadsheetContext';
import { useState } from 'react';

interface ViewTabProps {}

export function ViewTab({}: ViewTabProps) {
  const { 
    showGridlines, 
    setShowGridlines, 
    showFormulaBar, 
    setShowFormulaBar, 
    showHeadings, 
    setShowHeadings,
    zoomLevel,
    setZoomLevel,
    freezePanes,
    setFreezePanes,
    selectedCell,
    selectedRange
  } = useSpreadsheet();
  const [showFreezePanesMenu, setShowFreezePanesMenu] = useState(false);
  const buttonClass = 'hover:bg-gray-50 text-gray-900 border border-yellow-600/20 hover:border-yellow-600/40 shadow-sm';
  
  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 10, 200));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 10, 50));
  const handleZoomReset = () => setZoomLevel(100);
  
  const handleFreezePanes = () => {
    if (!selectedCell && !selectedRange) return;
    if (freezePanes) {
      setFreezePanes(null);
    } else {
      const row = selectedRange ? selectedRange.startRow : selectedCell!.row;
      const col = selectedRange ? selectedRange.startCol : selectedCell!.col;
      setFreezePanes({ row, col });
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="flex items-center justify-center gap-4 sm:gap-6 px-2 sm:px-4 py-3" style={{ transform: 'scale(0.75)', transformOrigin: 'center top' }}>
      {/* Show Group */}
      <div className="flex flex-col gap-1 min-w-fit">
        <div className="text-xs text-gray-700 mb-1">Show</div>
        <div className="flex items-center gap-1">
          <label className="flex items-center gap-1 text-xs cursor-pointer text-gray-900">
            <input 
              type="checkbox" 
              className="w-3 h-3" 
              checked={showGridlines}
              onChange={(e) => setShowGridlines(e.target.checked)}
            />
            <span>Gridlines</span>
          </label>
          <label className="flex items-center gap-1 text-xs cursor-pointer ml-2 text-gray-900">
            <input 
              type="checkbox" 
              className="w-3 h-3" 
              checked={showFormulaBar}
              onChange={(e) => setShowFormulaBar(e.target.checked)}
            />
            <span>Formula Bar</span>
          </label>
          <label className="flex items-center gap-1 text-xs cursor-pointer ml-2 text-gray-900">
            <input 
              type="checkbox" 
              className="w-3 h-3" 
              checked={showHeadings}
              onChange={(e) => setShowHeadings(e.target.checked)}
            />
            <span>Headings</span>
          </label>
        </div>
      </div>
    </div>
    </div>
  );
}
