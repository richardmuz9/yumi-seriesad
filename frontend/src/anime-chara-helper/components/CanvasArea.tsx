import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { CanvasState, LayerData, DrawingTool, BlendMode, AIDrawingOptions } from '../types';
import { IoColorPalette, IoResize, IoTrash, IoSearch, IoClose, IoBrush, IoColorWand } from 'react-icons/io5';
import { BsBrush, BsEraser, BsMagic } from 'react-icons/bs';
import ReferenceSearch from './ReferenceSearch';
import './CanvasArea.css';

export interface CanvasAreaProps {
  mode: 'creative' | 'ai-generate';
  tool: DrawingTool;
  color: string;
  size: number;
  opacity: number;
  blendMode: BlendMode;
  zoom: number;
  position: { x: number; y: number };
  activeLayer?: LayerData;
  onStateChange: (updates: Partial<CanvasState>) => void;
  layers: LayerData[];
  activeLayerId: string;
  onLayerChange: (layerId: string, canvas: HTMLCanvasElement) => void;
  width?: number;
  height?: number;
  // NEW v1.2: Smart brush props
  smartBrushActive?: boolean;
  smartBrushSettings?: any;
  brushSettings?: any;
}

export interface CanvasAreaRef {
  loadOutline: (url: string) => void;
  saveDrawing: () => string;
  clearCanvas: () => void;
  setDrawingMode: (enabled: boolean) => void;
  exportLayers: () => LayerData[];
  importLayers: (layers: LayerData[]) => void;
  regenerateRegion: (maskData: string) => Promise<void>;
  getCanvas: () => HTMLCanvasElement | null;
  undo: () => void;
  redo: () => void;
}

const CanvasArea = forwardRef<CanvasAreaRef, CanvasAreaProps>((props, ref) => {
  const {
    mode,
    tool: initialTool,
    color: initialColor,
    size: initialSize,
    opacity: initialOpacity,
    blendMode: initialBlendMode,
    zoom,
    position,
    activeLayer,
    onStateChange,
    layers,
    activeLayerId,
    onLayerChange,
    width = 800,
    height = 600
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Layer management
  const [layerPanelVisible, setLayerPanelVisible] = useState(false);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [outlineImage, setOutlineImage] = useState<HTMLImageElement | null>(null);

  // Enhanced drawing settings
  const [currentTool, setCurrentTool] = useState<DrawingTool>(initialTool);
  const [brushColor, setBrushColor] = useState(initialColor);
  const [brushSize, setBrushSize] = useState(initialSize);
  const [brushOpacity, setBrushOpacity] = useState(initialOpacity);
  const [currentBlendMode, setCurrentBlendMode] = useState<BlendMode>(initialBlendMode);
  
  // AI and reference features
  const [referenceSearchVisible, setReferenceSearchVisible] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiStrength, setAIStrength] = useState(0.5);

  // Initialize layers
  useEffect(() => {
    if (layers.length === 0) {
      createNewLayer('Background');
    }
  }, []);

  const createNewLayer = (name: string = `Layer ${layers.length + 1}`) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = canvas.width;
    layerCanvas.height = canvas.height;
    
    const newLayer: LayerData = {
      id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      canvas: layerCanvas,
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      locked: false
    };

    onStateChange({
      layers: [...layers, newLayer]
    });
    onLayerChange(newLayer.id, layerCanvas);
    return newLayer;
  };

  const getActiveLayer = (): LayerData | null => {
    return layers.find(layer => layer.id === activeLayerId) || null;
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Clear main canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw outline if exists
    if (outlineImage) {
      const rect = canvas.getBoundingClientRect();
      context.drawImage(outlineImage, 0, 0, rect.width, rect.height);
    }

    // Composite all visible layers
    layers.forEach(layer => {
      if (layer.visible && layer.canvas) {
        context.save();
        context.globalAlpha = layer.opacity / 100;
        context.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
        context.drawImage(layer.canvas, 0, 0);
        context.restore();
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    // Scale for high DPI displays
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.lineCap = 'round';
    context.lineJoin = 'round';

    contextRef.current = context;
    redrawCanvas();
  }, [brushColor, brushSize, outlineImage, layers]);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingMode || !contextRef.current) return;

    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) return;

    setIsDrawing(true);
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const layerContext = activeLayer.canvas.getContext('2d');
    if (layerContext) {
      layerContext.beginPath();
      layerContext.moveTo(x, y);
      layerContext.lineCap = 'round';
      layerContext.lineJoin = 'round';
      layerContext.lineWidth = brushSize;
      
      if (currentTool === 'eraser') {
        layerContext.globalCompositeOperation = 'destination-out';
      } else {
        layerContext.globalCompositeOperation = 'source-over';
        layerContext.strokeStyle = brushColor;
      }
      
      layerContext.globalAlpha = brushOpacity / 100;
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (currentTool.startsWith('ai-')) {
      handleAIDraw(x, y);
    } else {
      const activeLayer = getActiveLayer();
      if (activeLayer && !activeLayer.locked) {
        const layerContext = activeLayer.canvas.getContext('2d');
        if (layerContext) {
          layerContext.lineTo(x, y);
          layerContext.stroke();
          redrawCanvas();
        }
      }
    }
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    
    const activeLayer = getActiveLayer();
    if (activeLayer) {
      const layerContext = activeLayer.canvas.getContext('2d');
      layerContext?.closePath();
    }
    
    setIsDrawing(false);
  };

  // Advanced layer operations
  const duplicateLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    const newLayer = createNewLayer(`${layer.name} copy`);
    if (newLayer) {
      const newContext = newLayer.canvas.getContext('2d');
      if (newContext) {
        newContext.drawImage(layer.canvas, 0, 0);
        redrawCanvas();
      }
    }
  };

  const deleteLayer = (layerId: string) => {
    if (layers.length <= 1) return; // Keep at least one layer
    
    onStateChange({
      layers: layers.filter(l => l.id !== layerId)
    });
    
    if (activeLayerId === layerId) {
      const remainingLayers = layers.filter(l => l.id !== layerId);
      onLayerChange(remainingLayers[0]?.id || '', remainingLayers[0]?.canvas || new HTMLCanvasElement());
    }
  };

  const toggleLayerVisibility = (layerId: string) => {
    onStateChange({
      layers: layers.map(layer => 
        layer.id === layerId 
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    });
    redrawCanvas();
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    onStateChange({
      layers: layers.map(layer => 
        layer.id === layerId 
          ? { ...layer, opacity: Math.max(0, Math.min(100, opacity)) }
          : layer
      )
    });
    redrawCanvas();
  };

  // Region regeneration using mask
  const regenerateRegion = async (designBrief: any) => {
    setIsAIProcessing(true);
    try {
      // Implementation of region regeneration
      // This would be similar to handleAIDraw but with a specific region
    } catch (error) {
      console.error('Region regeneration failed:', error);
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Touch events for mobile support
  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    startDrawing(mouseEvent as any);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    draw(mouseEvent as any);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    stopDrawing();
  };

  // AI drawing function
  const handleAIDraw = async (x: number, y: number) => {
    if (!isDrawing || !drawingMode || !contextRef.current) return;

    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) return;

    // Get the current region around the cursor
    const region = {
      x: Math.max(0, x - 50),
      y: Math.max(0, y - 50),
      width: 100,
      height: 100
    };

    setIsAIProcessing(true);

    try {
      // Get the current canvas state
      const imageData = canvasRef.current?.toDataURL();
      if (!imageData) return;

      // Call AI drawing API
      const response = await fetch('/api/anime-chara/ai-draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData,
          mode: currentTool.replace('ai-', '') as 'brush' | 'eraser' | 'color',
          strength: aiStrength,
          region
        })
      });

      if (!response.ok) {
        throw new Error('AI drawing failed');
      }

      const result = await response.json();
      
      // Create a new layer for the AI result
      const newLayer = createNewLayer('AI Drawing');
      if (newLayer) {
        const img = new Image();
        img.onload = () => {
          const newContext = newLayer.canvas.getContext('2d');
          if (newContext) {
            newContext.drawImage(img, 0, 0);
            redrawCanvas();
          }
        };
        img.src = `data:image/png;base64,${result.imageData}`;
      }
    } catch (error) {
      console.error('AI drawing failed:', error);
      // Show error to user
    } finally {
      setIsAIProcessing(false);
    }
  };

  useImperativeHandle(ref, () => ({
    loadOutline: (url: string) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.drawImage(img, 0, 0);
      };
      img.src = url;
    },
    saveDrawing: () => {
      return canvasRef.current?.toDataURL() || '';
    },
    clearCanvas: () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
      redrawCanvas();
    },
    setDrawingMode: (enabled: boolean) => {
      setDrawingMode(enabled);
    },
    exportLayers: () => layers,
    importLayers: (newLayers: LayerData[]) => {
      onStateChange({ layers: newLayers });
      redrawCanvas();
    },
    regenerateRegion: async (designBrief: any) => {
      setIsAIProcessing(true);
      try {
        // Implementation of region regeneration
        // This would be similar to handleAIDraw but with a specific region
      } catch (error) {
        console.error('Region regeneration failed:', error);
      } finally {
        setIsAIProcessing(false);
      }
    },
    getCanvas: () => canvasRef.current,
    undo: () => {
      // Implement undo logic
    },
    redo: () => {
      // Implement redo logic
    }
  }));

  if (mode === 'ai-generate') {
    return (
      <div className="canvas-area">
        <div className="ai-generate-placeholder">
          <h2>AI Generation Mode</h2>
          <p>Select options from the right panel to generate your character</p>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-area">
      <div className="drawing-tools">
        <button
          className={`tool-button ${currentTool === 'brush' ? 'active' : ''}`}
          onClick={() => setCurrentTool('brush')}
          title="Brush"
        >
          <BsBrush size={20} />
        </button>
        <button
          className={`tool-button ${currentTool === 'eraser' ? 'active' : ''}`}
          onClick={() => setCurrentTool('eraser')}
          title="Eraser"
        >
          <BsEraser size={20} />
        </button>

        
        <div className="tool-separator" />
        <div className="color-picker">
          <IoColorPalette size={20} />
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            title="Color"
          />
        </div>
        <div className="size-slider">
          <IoResize size={20} />
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            title="Size"
          />
        </div>
        <button
          className="tool-button"
          onClick={() => {
            redrawCanvas();
            onStateChange({ hasDrawing: false });
          }}
          title="Clear Canvas"
        >
          <IoTrash size={20} />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="drawing-canvas"
        style={{ cursor: isAIProcessing ? 'wait' : 'crosshair' }}
      />

      {referenceImage && (
        <div className="reference-image-container">
          <img src={referenceImage} alt="Reference" />
          <button 
            className="close-reference" 
            onClick={() => setReferenceImage(null)}
            title="Close Reference"
          >
            <IoClose size={20} />
          </button>
        </div>
      )}

      {referenceSearchVisible && (
        <ReferenceSearch
          onSelect={(url) => {
            setReferenceImage(url);
            setReferenceSearchVisible(false);
          }}
          onClose={() => setReferenceSearchVisible(false)}
        />
      )}
    </div>
  );
});

CanvasArea.displayName = 'CanvasArea';
export default CanvasArea; 