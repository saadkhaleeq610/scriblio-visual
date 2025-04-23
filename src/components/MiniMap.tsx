
import { useRef, useEffect } from "react";
import { Canvas, Rect, util } from "fabric";

interface MiniMapProps {
  mainCanvas: Canvas | null;
}

const MiniMap = ({ mainCanvas }: MiniMapProps) => {
  const miniMapRef = useRef<HTMLCanvasElement>(null);
  const miniCanvasRef = useRef<Canvas | null>(null);
  const viewportRect = useRef<Rect | null>(null);

  // Set up mini map
  useEffect(() => {
    if (!miniMapRef.current || !mainCanvas) return;

    // Initialize mini canvas
    const miniCanvas = new Canvas(miniMapRef.current, {
      width: 150,
      height: 100,
      selection: false,
      renderOnAddRemove: false,
      enableRetinaScaling: false,
    });
    miniCanvasRef.current = miniCanvas;

    // Create viewport rectangle
    const vRect = new Rect({
      fill: 'rgba(0, 0, 0, 0.2)',
      stroke: '#8B5CF6',
      strokeWidth: 1,
      width: 50,
      height: 30,
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    });
    viewportRect.current = vRect;
    miniCanvas.add(vRect);

    // Update mini map on main canvas changes
    const updateMiniMap = () => {
      if (!miniCanvasRef.current || !mainCanvas) return;
      
      // Clear mini canvas except viewport rect
      miniCanvasRef.current.clear();
      
      // Create a scaled down version of main canvas
      const scaleFactor = 150 / mainCanvas.getWidth();
      const objects = mainCanvas.getObjects();
      
      // Add objects to mini canvas
      objects.forEach((obj) => {
        if (!miniCanvasRef.current) return;
        
        try {
          // Basic clone instead of using fabric.util.clone
          const clonedObj = new Rect({
            left: obj.left! * scaleFactor,
            top: obj.top! * scaleFactor,
            width: (obj.width || 0) * scaleFactor * (obj.scaleX || 1),
            height: (obj.height || 0) * scaleFactor * (obj.scaleY || 1),
            selectable: false,
            evented: false,
            stroke: obj.stroke as string,
            fill: obj.fill as string,
          });
          
          miniCanvasRef.current.add(clonedObj);
        } catch (e) {
          // Skip object if there's any error
        }
      });
      
      // Re-add viewport rectangle on top
      if (viewportRect.current) {
        miniCanvasRef.current.add(viewportRect.current);
        // Make the viewport rectangle appear on top
        miniCanvasRef.current.remove(viewportRect.current);
        miniCanvasRef.current.add(viewportRect.current);
      }
      
      miniCanvasRef.current.renderAll();
    };

    // Update viewport rectangle position
    const updateViewport = () => {
      if (!viewportRect.current || !mainCanvas || !miniCanvasRef.current) return;
      
      const vWidth = (mainCanvas.getWidth() / mainCanvas.getZoom()) * (150 / mainCanvas.getWidth());
      const vHeight = (mainCanvas.getHeight() / mainCanvas.getZoom()) * (100 / mainCanvas.getHeight());
      
      // Calculate viewport position
      const vLeft = (mainCanvas.viewportTransform![4] * -1) * (150 / mainCanvas.getWidth());
      const vTop = (mainCanvas.viewportTransform![5] * -1) * (100 / mainCanvas.getHeight());
      
      viewportRect.current.set({
        left: vLeft,
        top: vTop,
        width: vWidth,
        height: vHeight,
      });
      
      miniCanvasRef.current.renderAll();
    };

    // Add event listeners to main canvas
    mainCanvas.on('object:added', updateMiniMap);
    mainCanvas.on('object:removed', updateMiniMap);
    mainCanvas.on('object:modified', updateMiniMap);
    // Since these events don't exist in Fabric v6, we'll handle zoom separately
    
    // Initialize mini map
    updateMiniMap();
    updateViewport();

    return () => {
      if (miniCanvasRef.current) {
        miniCanvasRef.current.dispose();
      }
      
      mainCanvas.off('object:added', updateMiniMap);
      mainCanvas.off('object:removed', updateMiniMap);
      mainCanvas.off('object:modified', updateMiniMap);
    };
  }, [mainCanvas]);

  return (
    <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2">
      <canvas ref={miniMapRef} width={150} height={100} />
    </div>
  );
};

export default MiniMap;
