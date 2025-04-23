import { useEffect, useRef, useState } from "react";
import { Canvas, Circle, IText, Rect, Point } from "fabric";
import { Button } from "@/components/ui/button";
import { Pencil, Square, Circle as CircleIcon, Type, Pointer, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import MiniMap from "./MiniMap";
import ColorPicker from "./ColorPicker";

type Tool = "select" | "draw" | "rectangle" | "circle" | "text";

interface ScriblioCanvasProps {
  boardId?: string;
}

const ScriblioCanvas = ({ boardId }: ScriblioCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [activeColor, setActiveColor] = useState("#8B5CF6");
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 56,
      backgroundColor: "#ffffff",
      selection: true,
    });

    canvas.preserveObjectStacking = true;
    canvas.uniformScaling = true;
    
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = 2;
    }

    const handleResize = () => {
      const scale = canvas.getZoom();
      const width = window.innerWidth;
      const height = window.innerHeight - 56;
      
      canvas.setDimensions({ width, height });
      canvas.setViewportTransform([scale, 0, 0, scale, canvas.viewportTransform![4], canvas.viewportTransform![5]]);
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);
    setFabricCanvas(canvas);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    fabricCanvas.selection = activeTool === "select";
    
    switch (activeTool) {
      case "select":
        fabricCanvas.defaultCursor = "default";
        fabricCanvas.hoverCursor = "move";
        break;
      case "draw":
        fabricCanvas.defaultCursor = "crosshair";
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = activeColor;
          fabricCanvas.freeDrawingBrush.width = 2;
        }
        break;
      default:
        fabricCanvas.defaultCursor = "crosshair";
    }

    fabricCanvas.off("mouse:down");
    fabricCanvas.off("mouse:move");
    fabricCanvas.off("mouse:up");

    if (activeTool === "rectangle" || activeTool === "circle") {
      let isDrawing = false;
      let startPoint: { x: number; y: number } | null = null;
      let activeShape: Rect | Circle | null = null;

      fabricCanvas.on("mouse:down", (options) => {
        isDrawing = true;
        const pointer = fabricCanvas.getPointer(options.e);
        startPoint = { x: pointer.x, y: pointer.y };

        if (activeTool === "rectangle") {
          activeShape = new Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: "transparent",
            stroke: activeColor,
            strokeWidth: 2,
          });
        } else {
          activeShape = new Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 0,
            fill: "transparent",
            stroke: activeColor,
            strokeWidth: 2,
          });
        }

        if (activeShape) {
          fabricCanvas.add(activeShape);
          fabricCanvas.setActiveObject(activeShape);
        }
      });

      fabricCanvas.on("mouse:move", (options) => {
        if (!isDrawing || !startPoint || !activeShape) return;
        
        const pointer = fabricCanvas.getPointer(options.e);
        
        if (activeTool === "rectangle") {
          const rect = activeShape as Rect;
          const width = Math.abs(pointer.x - startPoint.x);
          const height = Math.abs(pointer.y - startPoint.y);
          
          rect.set({
            left: Math.min(startPoint.x, pointer.x),
            top: Math.min(startPoint.y, pointer.y),
            width: width,
            height: height,
          });
        } else {
          const circle = activeShape as Circle;
          const radius = Math.sqrt(
            Math.pow(pointer.x - startPoint.x, 2) +
            Math.pow(pointer.y - startPoint.y, 2)
          ) / 2;
          
          circle.set({
            left: startPoint.x - radius,
            top: startPoint.y - radius,
            radius: radius,
          });
        }
        
        fabricCanvas.renderAll();
      });

      fabricCanvas.on("mouse:up", () => {
        isDrawing = false;
        startPoint = null;
        activeShape = null;
        fabricCanvas.renderAll();
      });
    }

    if (activeTool === "text") {
      fabricCanvas.on("mouse:down", (options) => {
        const pointer = fabricCanvas.getPointer(options.e);
        const text = new IText("Click to edit", {
          left: pointer.x,
          top: pointer.y,
          fill: activeColor,
          fontSize: 20,
          fontFamily: "Arial",
        });
        
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        text.enterEditing();
        setActiveTool("select");
      });
    }

  }, [activeTool, fabricCanvas, activeColor]);

  const handleClearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
  };

  const handleDeleteSelected = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      fabricCanvas.remove(activeObject);
    }
  };

  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    const zoom = fabricCanvas.getZoom();
    const center = { x: fabricCanvas.width! / 2, y: fabricCanvas.height! / 2 };
    fabricCanvas.zoomToPoint(new Point(center.x, center.y), zoom * 1.2);
  };

  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    const zoom = fabricCanvas.getZoom();
    const center = { x: fabricCanvas.width! / 2, y: fabricCanvas.height! / 2 };
    fabricCanvas.zoomToPoint(new Point(center.x, center.y), zoom * 0.8);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 scriblio-toolbar p-1.5 flex items-center space-x-2">
        <div className="flex space-x-1">
          <Button 
            variant={activeTool === "select" ? "default" : "outline"} 
            size="icon" 
            onClick={() => setActiveTool("select")}
          >
            <Pointer className="h-5 w-5" />
          </Button>
          <Button 
            variant={activeTool === "draw" ? "default" : "outline"} 
            size="icon" 
            onClick={() => setActiveTool("draw")}
          >
            <Pencil className="h-5 w-5" />
          </Button>
          <Button 
            variant={activeTool === "rectangle" ? "default" : "outline"} 
            size="icon" 
            onClick={() => setActiveTool("rectangle")}
          >
            <Square className="h-5 w-5" />
          </Button>
          <Button 
            variant={activeTool === "circle" ? "default" : "outline"} 
            size="icon" 
            onClick={() => setActiveTool("circle")}
          >
            <CircleIcon className="h-5 w-5" />
          </Button>
          <Button 
            variant={activeTool === "text" ? "default" : "outline"} 
            size="icon" 
            onClick={() => setActiveTool("text")}
          >
            <Type className="h-5 w-5" />
          </Button>
        </div>

        <div className="h-6 w-px bg-gray-200" />
        
        <ColorPicker color={activeColor} onChange={setActiveColor} />
        
        <div className="h-6 w-px bg-gray-200" />

        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleDeleteSelected}
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-full shadow-lg p-1.5 flex space-x-1">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
      </div>

      <MiniMap mainCanvas={fabricCanvas} />
      
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ScriblioCanvas;
