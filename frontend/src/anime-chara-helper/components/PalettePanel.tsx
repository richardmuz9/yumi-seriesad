import React, { useState } from 'react';
import { IoColorPalette, IoAdd } from 'react-icons/io5';

interface PalettePanelProps {
  color: string;
  onColorChange: (color: string) => void;
}

export const PalettePanel: React.FC<PalettePanelProps> = ({
  color,
  onColorChange
}) => {
  const [savedColors, setSavedColors] = useState<string[]>([
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#808080'
  ]);

  const addCurrentColor = () => {
    if (!savedColors.includes(color)) {
      setSavedColors(prev => [...prev, color]);
    }
  };

  return (
    <div className="palette-panel">
      <div className="palette-header">
        <h3>Color Palette</h3>
        <button 
          className="add-color-btn"
          onClick={addCurrentColor}
          title="Add current color"
        >
          <IoAdd size={20} />
        </button>
      </div>

      <div className="color-picker">
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="color-input"
        />
        <div className="color-preview" style={{ backgroundColor: color }}>
          <span>{color.toUpperCase()}</span>
        </div>
      </div>

      <div className="saved-colors">
        <h4>Saved Colors</h4>
        <div className="color-grid">
          {savedColors.map((savedColor, index) => (
            <button
              key={index}
              className="color-swatch"
              style={{ backgroundColor: savedColor }}
              onClick={() => onColorChange(savedColor)}
              title={savedColor}
            />
          ))}
        </div>
      </div>

      <div className="color-sliders">
        <div className="slider-group">
          <label>Red</label>
          <input
            type="range"
            min="0"
            max="255"
            value={parseInt(color.slice(1, 3), 16)}
            onChange={(e) => {
              const r = e.target.value.padStart(2, '0');
              const g = color.slice(3, 5);
              const b = color.slice(5, 7);
              onColorChange(`#${r}${g}${b}`);
            }}
          />
        </div>
        <div className="slider-group">
          <label>Green</label>
          <input
            type="range"
            min="0"
            max="255"
            value={parseInt(color.slice(3, 5), 16)}
            onChange={(e) => {
              const r = color.slice(1, 3);
              const g = e.target.value.padStart(2, '0');
              const b = color.slice(5, 7);
              onColorChange(`#${r}${g}${b}`);
            }}
          />
        </div>
        <div className="slider-group">
          <label>Blue</label>
          <input
            type="range"
            min="0"
            max="255"
            value={parseInt(color.slice(5, 7), 16)}
            onChange={(e) => {
              const r = color.slice(1, 3);
              const g = color.slice(3, 5);
              const b = e.target.value.padStart(2, '0');
              onColorChange(`#${r}${g}${b}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}; 