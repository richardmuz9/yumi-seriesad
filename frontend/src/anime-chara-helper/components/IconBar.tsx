import React, { useState, useRef, useEffect } from 'react';
import { IconType } from 'react-icons';
import { 
  IoArrowBack, 
  IoPencil, 
  IoLayers, 
  IoTime, 
  IoDownload, 
  IoColorPalette,
  IoSearch,
  IoResize,
  IoChevronForward,
  IoChevronBack,
  IoBrush,
  IoColorWand,
  IoBody,
  IoLibrary,
  IoSettings,
  IoCloudUpload,
  IoSparkles,
  IoSave
} from 'react-icons/io5';
import { 
  RiRobot2Line, 
  RiMagicLine,
  RiEraserLine
} from 'react-icons/ri';
import { BsVectorPen, BsMagic, BsPalette2 } from 'react-icons/bs';
import { FaPalette, FaUserAlt, FaFeatherAlt, FaEdit } from 'react-icons/fa';
import { BiPencil, BiHighlight } from 'react-icons/bi';
import { TbEraser } from 'react-icons/tb';
import './IconBar.css';

interface IconBarProps {
  mode: 'creative' | 'ai-generate';
  context: string | null;
  setMode: (mode: 'creative' | 'ai-generate') => void;
  setContext: (context: string | null) => void;
  onBack: () => void;
  onToolChange?: (tool: string) => void;
  selectedTool?: string;
  onCustomizeToggle?: () => void;
  onFileUpload?: (files: File[]) => void;
  onYumiRefsToggle?: () => void;
  // NEW v1.2 props
  onCharacterLibraryToggle?: () => void;
  onAIColorAssistantToggle?: () => void;
  onSmartBrushToggle?: () => void;
  onVersionHistoryToggle?: () => void;
}

interface IconConfig {
  key: string;
  icon: IconType;
  label: string;
  action: 'mode' | 'context' | 'tool' | 'function';
  value: string;
  category?: 'navigation' | 'drawing' | 'ai' | 'panels' | 'creation' | 'utility' | 'v12';
}

const ICONS: IconConfig[] = [
  // Navigation
  { key: 'back', icon: IoArrowBack, label: 'Back', action: 'mode', value: 'back', category: 'navigation' },
  
  // Drawing modes
  { key: 'creative', icon: IoPencil, label: 'Draw', action: 'mode', value: 'creative', category: 'drawing' },
  
  // Basic drawing tools
  { key: 'brush', icon: IoBrush, label: 'Brush', action: 'tool', value: 'brush', category: 'drawing' },
  { key: 'pencil', icon: BiPencil, label: 'Pencil', action: 'tool', value: 'pencil', category: 'drawing' },
  { key: 'marker', icon: FaEdit, label: 'Marker', action: 'tool', value: 'marker', category: 'drawing' },
  { key: 'airbrush', icon: IoColorWand, label: 'Airbrush', action: 'tool', value: 'airbrush', category: 'drawing' },
  
  // Detail drawing tools
  { key: 'fine-liner', icon: FaFeatherAlt, label: 'Fine Liner (Eyelashes)', action: 'tool', value: 'fine-liner', category: 'drawing' },
  { key: 'detail-brush', icon: BiHighlight, label: 'Detail Brush', action: 'tool', value: 'detail-brush', category: 'drawing' },
  { key: 'texture-brush', icon: IoBrush, label: 'Texture Brush', action: 'tool', value: 'texture-brush', category: 'drawing' },
  
  // Erasers
  { key: 'eraser', icon: RiEraserLine, label: 'Eraser', action: 'tool', value: 'eraser', category: 'drawing' },
  { key: 'precision-eraser', icon: TbEraser, label: 'Precision Eraser', action: 'tool', value: 'precision-eraser', category: 'drawing' },
  
  // NEW v1.2: Creation Mode Tools
  { key: 'character-library', icon: IoLibrary, label: 'Character Library', action: 'function', value: 'character-library', category: 'v12' },
  { key: 'ai-color-assistant', icon: BsPalette2, label: 'AI Color Assistant', action: 'function', value: 'ai-color-assistant', category: 'v12' },
  { key: 'smart-brush', icon: IoSparkles, label: 'Smart Brush', action: 'function', value: 'smart-brush', category: 'v12' },
  { key: 'version-history', icon: IoSave, label: 'Version History', action: 'function', value: 'version-history', category: 'v12' },
  
  // Creation Tools (Templates & Poses)
  { key: 'templates', icon: FaPalette, label: 'Templates', action: 'context', value: 'templates', category: 'creation' },
  { key: 'poses', icon: FaUserAlt, label: 'Poses', action: 'context', value: 'poses', category: 'creation' },
  { key: 'yumi-refs', icon: IoLibrary, label: 'Yumi References', action: 'function', value: 'yumi-refs', category: 'creation' },
  
  // AI Tools
  { key: 'ai', icon: RiRobot2Line, label: 'AI Generate', action: 'mode', value: 'ai-generate', category: 'ai' },
  { key: 'ai-outline', icon: BsVectorPen, label: 'AI Outline', action: 'tool', value: 'ai-outline', category: 'ai' },
  { key: 'ai-brush', icon: IoColorWand, label: 'AI Brush', action: 'tool', value: 'ai-brush', category: 'ai' },
  { key: 'ai-eraser', icon: BsMagic, label: 'AI Eraser', action: 'tool', value: 'ai-eraser', category: 'ai' },
  
  // Search and reference
  { key: 'search', icon: IoSearch, label: 'Search Photos', action: 'context', value: 'search', category: 'panels' },
  
  // Utility
  { key: 'upload', icon: IoCloudUpload, label: 'Upload Files', action: 'function', value: 'upload', category: 'utility' },
  { key: 'customize', icon: IoSettings, label: 'Customize', action: 'function', value: 'customize', category: 'utility' },
  
  // Panels
  { key: 'layers', icon: IoLayers, label: 'Layers', action: 'context', value: 'layers', category: 'panels' },
  { key: 'palette', icon: IoColorPalette, label: 'Colors', action: 'context', value: 'palette', category: 'panels' },
  { key: 'history', icon: IoTime, label: 'History', action: 'context', value: 'history', category: 'panels' },
  { key: 'export', icon: IoDownload, label: 'Export', action: 'context', value: 'export', category: 'panels' },
];

export const IconBar: React.FC<IconBarProps> = ({ 
  mode, 
  context, 
  setMode, 
  setContext, 
  onBack, 
  onToolChange, 
  selectedTool,
  onCustomizeToggle,
  onFileUpload,
  onYumiRefsToggle,
  // NEW v1.2 props
  onCharacterLibraryToggle,
  onAIColorAssistantToggle,
  onSmartBrushToggle,
  onVersionHistoryToggle
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const iconBarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === iconBarRef.current || (e.target as Element).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = iconBarRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
  };

  const handleClick = (icon: IconConfig) => {
    if (icon.key === 'back') {
      onBack();
      return;
    }

    if (icon.action === 'mode') {
      setMode(icon.value as 'creative' | 'ai-generate');
    } else if (icon.action === 'context') {
      // Toggle context panel if clicking the same icon
      setContext(context === icon.value ? null : icon.value);
    } else if (icon.action === 'tool') {
      onToolChange?.(icon.value);
    } else if (icon.action === 'function') {
      if (icon.key === 'upload') {
        fileInputRef.current?.click();
      } else if (icon.key === 'customize') {
        onCustomizeToggle?.();
      } else if (icon.key === 'yumi-refs') {
        onYumiRefsToggle?.();
      }
      // NEW v1.2: Handle new function calls
      else if (icon.key === 'character-library') {
        onCharacterLibraryToggle?.();
      } else if (icon.key === 'ai-color-assistant') {
        onAIColorAssistantToggle?.();
      } else if (icon.key === 'smart-brush') {
        onSmartBrushToggle?.();
      } else if (icon.key === 'version-history') {
        onVersionHistoryToggle?.();
      }
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getVisibleIcons = () => {
    if (mode === 'ai-generate') {
      return ICONS.filter(icon => 
        icon.category === 'navigation' || 
        icon.category === 'ai' || 
        icon.category === 'creation' ||
        icon.category === 'utility' ||
        icon.category === 'v12' ||
        icon.key === 'export' ||
        icon.key === 'search'
      );
    }
    return ICONS;
  };

  // Group icons by category for better organization
  const getGroupedIcons = () => {
    const visibleIcons = getVisibleIcons()
    const groups: { [key: string]: IconConfig[] } = {}
    
    visibleIcons.forEach(icon => {
      const category = icon.category || 'default'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(icon)
    })
    
    return groups
  };

  return (
    <nav 
      ref={iconBarRef}
      className={`icon-bar ${isCollapsed ? 'collapsed' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Drag Handle */}
      <div className="drag-handle">
        <div className="drag-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        className="collapse-toggle"
        onClick={toggleCollapse}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <IoChevronForward size={16} /> : <IoChevronBack size={16} />}
      </button>

      {/* Icons */}
      <div className="icons-container">
        {getVisibleIcons().map(icon => {
          const Icon = icon.icon;
          const isActive = 
            (icon.action === 'mode' && mode === icon.value) ||
            (icon.action === 'context' && context === icon.value) ||
            (icon.action === 'tool' && selectedTool === icon.value);

          return (
            <button
              key={icon.key}
              className={`icon-button ${isActive ? 'active' : ''} ${icon.category || ''}`}
              onClick={() => handleClick(icon)}
              title={icon.label}
            >
              <Icon size={isCollapsed ? 18 : 24} />
              {!isCollapsed && <span className="icon-label">{icon.label}</span>}
              {/* NEW v1.2: Add badge for new features */}
              {icon.category === 'v12' && !isCollapsed && (
                <span className="version-badge">v1.2</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Separators */}
      {!isCollapsed && (
        <div className="category-info">
          <div className="category-separator"></div>
          <span className="category-label">
            {mode === 'ai-generate' ? 'AI Mode' : 'Creative Mode v1.2'}
          </span>
        </div>
      )}
    </nav>
  );
}; 