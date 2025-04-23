import { useEffect, useRef, useState } from "react";
import { Canvas, Circle, IText, Rect, Point } from "fabric";
import { Button } from "@/components/ui/button";
import { Pencil, Square, Circle as CircleIcon, Type, Pointer, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import MiniMap from "./MiniMap";

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

    // Initialize fabric canvas
    const canvas = new Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 56, // Subtract navbar height
      backgroundColor: "#ffffff",
      selection: true,
    });
    
    // Enable panning when no tool is active
    canvas.on('mouse:down', (opt) => {
      if (activeTool === 'select' && !opt.target) {
        canvas.defaultCursor = 'grabbing';
        canvas.renderAll();
      }
    });
    
    // Store previous mouse position for panning
    let lastPosX = 0;
    let lastPosY = 0;
    
    // Pan the canvas on drag
    canvas.on('mouse:move', (opt) => {
      if (canvas.defaultCursor === 'grabbing' && opt.e && 'clientX' in opt.e) {
        const e = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform!;
        
        if (lastPosX !== 0) {
          const deltaX = e.clientX - lastPosX;
          const deltaY = e.clientY - lastPosY;
          vpt[4] += deltaX;
          vpt[5] += deltaY;
          canvas.requestRenderAll();
        }
        
        lastPosX = e.clientX;
        lastPosY = e.clientY;
      }
    });
    
    // Reset cursor after panning
    canvas.on('mouse:up', () => {
      if (canvas.defaultCursor === 'grabbing') {
        canvas.defaultCursor = 'default';
        canvas.renderAll();
        // Reset last position
        lastPosX = 0;
        lastPosY = 0;
      }
    });

    // Set up free drawing brush - Make sure the freeDrawingBrush is initialized here
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = 2;
    }
    
    // Handle window resize
    const handleResize = () => {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight);
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);
    setFabricCanvas(canvas);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, []);

  // Update canvas mode when tool changes
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    // Update cursor based on active tool
    switch (activeTool) {
      case "select":
        fabricCanvas.defaultCursor = "default";
        break;
      case "draw":
        fabricCanvas.defaultCursor = "crosshair";
        // Make sure the freeDrawingBrush is available before setting its properties
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = activeColor;
          fabricCanvas.freeDrawingBrush.width = 2;
        }
        break;
      case "rectangle":
      case "circle":
      case "text":
        fabricCanvas.defaultCursor = "crosshair";
        break;
      default:
        fabricCanvas.defaultCursor = "default";
    }
    
    // Setup event listeners for shape creation
    if (activeTool !== "draw") {
      fabricCanvas.off("mouse:down");
      fabricCanvas.off("mouse:move");
      fabricCanvas.off("mouse:up");
    }

    if (activeTool === "rectangle") {
      let rect: Rect | null = null;
      let startPoint: { x: number; y: number } | null = null;

      fabricCanvas.on("mouse:down", (options) => {
        isDrawingRef.current = true;
        const pointer = fabricCanvas.getPointer(options.e);
        startPoint = { x: pointer.x, y: pointer.y };
        rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: "transparent",
          stroke: activeColor,
          strokeWidth: 2,
        });
        fabricCanvas.add(rect);
      });

      fabricCanvas.on("mouse:move", (options) => {
        if (!isDrawingRef.current || !startPoint || !rect) return;
        const pointer = fabricCanvas.getPointer(options.e);
        
        if (pointer.x < startPoint.x) {
          rect.set({ left: pointer.x });
        }
        if (pointer.y < startPoint.y) {
          rect.set({ top: pointer.y });
        }
        
        rect.set({
          width: Math.abs(pointer.x - startPoint.x),
          height: Math.abs(pointer.y - startPoint.y),
        });
        
        fabricCanvas.renderAll();
      });

      fabricCanvas.on("mouse:up", () => {
        isDrawingRef.current = false;
        startPoint = null;
        rect = null;
      });
    }

    if (activeTool === "circle") {
      let circle: Circle | null = null;
      let startPoint: { x: number; y: number } | null = null;

      fabricCanvas.on("mouse:down", (options) => {
        isDrawingRef.current = true;
        const pointer = fabricCanvas.getPointer(options.e);
        startPoint = { x: pointer.x, y: pointer.y };
        circle = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: "transparent",
          stroke: activeColor,
          strokeWidth: 2,
        });
        fabricCanvas.add(circle);
      });

      fabricCanvas.on("mouse:move", (options) => {
        if (!isDrawingRef.current || !startPoint || !circle) return;
        const pointer = fabricCanvas.getPointer(options.e);
        const dx = pointer.x - startPoint.x;
        const dy = pointer.y - startPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        
        circle.set({
          radius: radius / 2,
          left: startPoint.x - radius / 2,
          top: startPoint.y - radius / 2,
        });
        
        fabricCanvas.renderAll();
      });

      fabricCanvas.on("mouse:up", () => {
        isDrawingRef.current = false;
        startPoint = null;
        circle = null;
      });
    }

    if (activeTool === "text") {
      fabricCanvas.on("mouse:down", (options) => {
        const pointer = fabricCanvas.getPointer(options.e);
        const text = new IText("Click to edit text", {
          left: pointer.x,
          top: pointer.y,
          fontFamily: "Inter, sans-serif",
          fill: activeColor,
          fontSize: 18,
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        text.enterEditing();
        
        // Switch back to select tool after adding text
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
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 scriblio-toolbar p-1.5 flex space-x-1">
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
        <div className="border-r border-gray-200 h-8 mx-1"></div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleDeleteSelected}
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Color Selector */}
      <div className="absolute top-20 left-4 z-10 bg-white rounded-lg shadow-lg p-2 flex flex-col space-y-2">
        {["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"].map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded-full cursor-pointer ${
              activeColor === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setActiveColor(color)}
          />
        ))}
      </div>

      {/* Zoom Controls */}
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearCanvas}
        >
          Clear All
        </Button>
      </div>

      {/* Mini Map */}
      <MiniMap mainCanvas={fabricCanvas} />
      
      {/* Canvas */}
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ScriblioCanvas;
