import React, { useState, useRef } from 'react';
import { IoArrowBack, IoSettings, IoImage } from 'react-icons/io5';
import { ActiveScreen } from './WritingHelperApp';
import AIAssistant from '../components/AIAssistant';

interface BackgroundSettings {
  type: 'solid' | 'gradient' | 'image';
  color: string;
  gradient: string;
  image: string;
  opacity: number;
}

interface WritingScreenProps {
  backgroundSettings: BackgroundSettings;
  onBackgroundChange: (settings: BackgroundSettings) => void;
  iconPositions: {
    writing: { x: number; y: number };
    report: { x: number; y: number };
  };
  onIconPositionChange: (section: 'writing' | 'report', position: { x: number; y: number }) => void;
  onScreenChange: (screen: ActiveScreen) => void;
  onBack?: () => void;
}

const WritingScreen: React.FC<WritingScreenProps> = ({
  backgroundSettings,
  onBackgroundChange,
  iconPositions,
  onIconPositionChange,
  onScreenChange,
  onBack
}) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [draggingIcon, setDraggingIcon] = useState<'writing' | 'report' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const screenRef = useRef<HTMLDivElement>(null);
  const [showAI, setShowAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background style generation
  const getBackgroundStyle = () => {
    switch (backgroundSettings.type) {
      case 'solid':
        return { backgroundColor: backgroundSettings.color };
      case 'gradient':
        return { background: backgroundSettings.gradient };
      case 'image':
        return {
          backgroundImage: `url(${backgroundSettings.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      default:
        return { background: backgroundSettings.gradient };
    }
  };

  // Icon dragging
  const handleIconMouseDown = (e: React.MouseEvent, section: 'writing' | 'report') => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingIcon(section);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingIcon && screenRef.current) {
      const screenRect = screenRef.current.getBoundingClientRect();
      const newPosition = {
        x: e.clientX - screenRect.left - dragOffset.x,
        y: e.clientY - screenRect.top - dragOffset.y
      };
      
      // Boundary checking
      if (newPosition.x >= 0 && newPosition.x <= screenRect.width - 200 &&
          newPosition.y >= 0 && newPosition.y <= screenRect.height - 100) {
        onIconPositionChange(draggingIcon, newPosition);
      }
    }
  };

  const handleMouseUp = () => {
    setDraggingIcon(null);
  };

  const handleIconClick = (section: 'writing' | 'report') => {
    if (!draggingIcon) {
      onScreenChange(section);
    }
  };

  // Background customization handlers
  const handleBackgroundTypeChange = (type: 'solid' | 'gradient' | 'image') => {
    onBackgroundChange({ ...backgroundSettings, type });
  };

  const handleColorChange = (color: string) => {
    onBackgroundChange({ ...backgroundSettings, color });
  };

  const handleGradientChange = (gradient: string) => {
    onBackgroundChange({ ...backgroundSettings, gradient });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onBackgroundChange({ ...backgroundSettings, image: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      ref={screenRef}
      className="writing-main-screen"
      style={{
        ...getBackgroundStyle(),
        opacity: backgroundSettings.opacity,
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Controls */}
      <div className="screen-controls">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            <IoArrowBack size={24} />
          </button>
        )}
        
        <button 
          className="customization-btn"
          onClick={() => setShowCustomization(!showCustomization)}
        >
          <IoSettings size={24} />
        </button>
      </div>

      {/* Background Customization Panel */}
      {showCustomization && (
        <div className="customization-panel">
          <h3>🎨 Customize Background</h3>
          
          <div className="bg-type-selector">
            <button 
              className={backgroundSettings.type === 'solid' ? 'active' : ''}
              onClick={() => handleBackgroundTypeChange('solid')}
            >
              Solid Color
            </button>
            <button 
              className={backgroundSettings.type === 'gradient' ? 'active' : ''}
              onClick={() => handleBackgroundTypeChange('gradient')}
            >
              Gradient
            </button>
            <button
              className={backgroundSettings.type === 'image' ? 'active' : ''}
              onClick={() => handleBackgroundTypeChange('image')}
            >
              Image
            </button>
        </div>

          {backgroundSettings.type === 'solid' && (
            <div className="color-picker">
              <input 
                type="color" 
                value={backgroundSettings.color}
                onChange={(e) => handleColorChange(e.target.value)}
              />
            </div>
          )}

          {backgroundSettings.type === 'gradient' && (
            <div className="gradient-presets">
              <button onClick={() => handleGradientChange('linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)')}>
                Dark Blue
              </button>
              <button onClick={() => handleGradientChange('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')}>
                Purple
              </button>
              <button onClick={() => handleGradientChange('linear-gradient(135deg, #f093fb 0%, #f5576c 100%)')}>
                Pink
              </button>
              <button onClick={() => handleGradientChange('linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)')}>
                Cyan
          </button>
            </div>
          )}

          {backgroundSettings.type === 'image' && (
            <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                onChange={handleImageUpload}
                id="bg-image-upload"
                />
              <label htmlFor="bg-image-upload" className="upload-btn">
                <IoImage size={20} />
                Upload Image
              </label>
            </div>
          )}

          <div className="opacity-slider">
            <label>Opacity: {Math.round(backgroundSettings.opacity * 100)}%</label>
            <input 
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={backgroundSettings.opacity}
              onChange={(e) => onBackgroundChange({ 
                ...backgroundSettings, 
                opacity: parseFloat(e.target.value) 
              })}
            />
          </div>
        </div>
      )}

      {/* Main Title */}
      <div className="main-title">
        <h1>✨ Creative Writing Workspace</h1>
        <p>Choose your writing mode to begin</p>
      </div>

      {/* Draggable Helper Buttons */}
      <div 
        className="helper-button writing-helper-btn"
        style={{
          position: 'absolute',
          left: iconPositions.writing.x,
          top: iconPositions.writing.y,
          cursor: draggingIcon === 'writing' ? 'grabbing' : 'grab'
        }}
        onMouseDown={(e) => handleIconMouseDown(e, 'writing')}
        onClick={() => handleIconClick('writing')}
      >
        <div className="button-content">
          <div className="button-icon">✍️</div>
          <div className="button-text">
            <h3>Writing Helper</h3>
            <p>Creative content, social posts, blogs</p>
            <div className="button-features">
              <span>📱 Post to Platforms</span>
              <span>🤖 AI Continuation</span>
              <span>📈 Trending Search</span>
              <span>🎮 Anime Collaboration</span>
            </div>
          </div>
        </div>
      </div>

      <div 
        className="helper-button report-helper-btn"
        style={{
          position: 'absolute',
          left: iconPositions.report.x,
          top: iconPositions.report.y,
          cursor: draggingIcon === 'report' ? 'grabbing' : 'grab'
        }}
        onMouseDown={(e) => handleIconMouseDown(e, 'report')}
        onClick={() => handleIconClick('report')}
      >
        <div className="button-content">
          <div className="button-icon">📊</div>
          <div className="button-text">
            <h3>Report Helper</h3>
            <p>Scientific papers, research, LaTeX</p>
            <div className="button-features">
              <span>🔬 Scientific Search</span>
              <span>📄 LaTeX Editor</span>
              <span>🛡️ Plagiarism Check</span>
              <span>📊 Chart Generation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <p>✨ Customize your workspace and choose your creative path</p>
        <div className="instruction-cards">
          <div className="instruction-card">
            <span className="instruction-icon">🎨</span>
            <span>Drag icons to reposition them</span>
          </div>
          <div className="instruction-card">
            <span className="instruction-icon">⚙️</span>
            <span>Use settings to customize background</span>
          </div>
          <div className="instruction-card">
            <span className="instruction-icon">✍️</span>
            <span>Click icons to enter different modes</span>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant 
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        mode="main"
        floatingMode={!showAI}
      />
    </div>
  );
};

export default WritingScreen; 