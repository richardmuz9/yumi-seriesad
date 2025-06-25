import React from 'react';
import { IoArrowUndo, IoArrowRedo } from 'react-icons/io5';

export const HistoryPanel: React.FC = () => {
  // This is a placeholder component. In a real implementation,
  // it would track the canvas state history and allow undo/redo operations.
  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>History</h3>
        <div className="history-controls">
          <button className="undo-btn" title="Undo">
            <IoArrowUndo size={20} />
          </button>
          <button className="redo-btn" title="Redo">
            <IoArrowRedo size={20} />
          </button>
        </div>
      </div>
      
      <div className="history-list">
        <div className="history-item">
          <span className="history-action">Added Layer</span>
          <span className="history-time">Just now</span>
        </div>
        <div className="history-item">
          <span className="history-action">Changed Color</span>
          <span className="history-time">2m ago</span>
        </div>
        <div className="history-item">
          <span className="history-action">Drew Line</span>
          <span className="history-time">5m ago</span>
        </div>
      </div>
    </div>
  );
}; 