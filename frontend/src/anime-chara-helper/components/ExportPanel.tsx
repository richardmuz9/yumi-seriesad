import React, { useState } from 'react';
import { IoDownload, IoShare, IoClipboard } from 'react-icons/io5';

export const ExportPanel: React.FC = () => {
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(90);
  const [size, setSize] = useState(100);

  const handleExport = () => {
    // This is a placeholder. In a real implementation,
    // it would handle the actual export functionality.
    console.log('Exporting with settings:', { format, quality, size });
  };

  return (
    <div className="export-panel">
      <div className="export-header">
        <h3>Export</h3>
      </div>

      <div className="export-settings">
        <div className="setting-group">
          <label>Format</label>
          <select 
            value={format} 
            onChange={(e) => setFormat(e.target.value)}
            className="format-select"
          >
            <option value="png">PNG</option>
            <option value="jpg">JPEG</option>
            <option value="webp">WebP</option>
            <option value="svg">SVG</option>
          </select>
        </div>

        {format === 'jpg' && (
          <div className="setting-group">
            <label>Quality ({quality}%)</label>
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="quality-slider"
            />
          </div>
        )}

        <div className="setting-group">
          <label>Size ({size}%)</label>
          <input
            type="range"
            min="1"
            max="400"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="size-slider"
          />
        </div>
      </div>

      <div className="export-actions">
        <button 
          className="export-btn primary"
          onClick={handleExport}
        >
          <IoDownload size={20} />
          Export
        </button>

        <button className="export-btn">
          <IoShare size={20} />
          Share
        </button>

        <button className="export-btn">
          <IoClipboard size={20} />
          Copy
        </button>
      </div>

      <div className="export-preview">
        <h4>Preview</h4>
        <div className="preview-container">
          {/* Preview would be rendered here */}
          <div className="preview-placeholder">
            Preview not available
          </div>
        </div>
      </div>
    </div>
  );
}; 