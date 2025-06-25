import React from 'react';
import { LayerData, BlendMode } from '../types';
import { IoEye, IoEyeOff, IoLockClosed, IoLockOpen, IoTrash, IoAdd } from 'react-icons/io5';

interface LayersPanelProps {
  layers: LayerData[];
  activeLayerId: string;
  onAddLayer: () => void;
  onUpdateLayer: (layerId: string, updates: Partial<LayerData>) => void;
  onDeleteLayer: (layerId: string) => void;
  onSelectLayer: (layerId: string) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  onAddLayer,
  onUpdateLayer,
  onDeleteLayer,
  onSelectLayer
}) => {
  return (
    <div className="layers-panel">
      <div className="layers-header">
        <h3>Layers</h3>
        <button 
          className="add-layer-btn"
          onClick={onAddLayer}
          title="Add new layer"
        >
          <IoAdd size={20} />
        </button>
      </div>
      
      <div className="layers-list">
        {layers.map(layer => (
          <div 
            key={layer.id}
            className={`layer-item ${layer.id === activeLayerId ? 'active' : ''}`}
            onClick={() => onSelectLayer(layer.id)}
          >
            <div className="layer-controls">
              <button
                className={`visibility-btn ${layer.visible ? 'visible' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateLayer(layer.id, { visible: !layer.visible });
                }}
                title={layer.visible ? 'Hide layer' : 'Show layer'}
              >
                {layer.visible ? <IoEye size={16} /> : <IoEyeOff size={16} />}
              </button>
              
              <button
                className={`lock-btn ${layer.locked ? 'locked' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateLayer(layer.id, { locked: !layer.locked });
                }}
                title={layer.locked ? 'Unlock layer' : 'Lock layer'}
              >
                {layer.locked ? <IoLockClosed size={16} /> : <IoLockOpen size={16} />}
              </button>
            </div>
            
            <input
              type="text"
              value={layer.name}
              onChange={(e) => onUpdateLayer(layer.id, { name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="layer-name-input"
            />
            
            <div className="layer-settings">
              <input
                type="range"
                min="0"
                max="100"
                value={layer.opacity}
                onChange={(e) => onUpdateLayer(layer.id, { opacity: parseInt(e.target.value) })}
                onClick={(e) => e.stopPropagation()}
                className="opacity-slider"
                title={`Opacity: ${layer.opacity}%`}
              />
              
              <select
                value={layer.blendMode}
                onChange={(e) => onUpdateLayer(layer.id, { blendMode: e.target.value as BlendMode })}
                onClick={(e) => e.stopPropagation()}
                className="blend-mode-select"
              >
                <option value="normal">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
              </select>
              
              {layers.length > 1 && (
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLayer(layer.id);
                  }}
                  title="Delete layer"
                >
                  <IoTrash size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 