import React from 'react';
import { IoClose } from 'react-icons/io5';
import './ContextPanel.css';

interface ContextPanelProps {
  context: string | null;
  onClose: () => void;
  children: React.ReactNode;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ context, onClose, children }) => {
  if (!context) return null;

  return (
    <aside className="context-panel">
      <div className="context-panel-header">
        <h3>{context.charAt(0).toUpperCase() + context.slice(1)}</h3>
        <button 
          className="close-button" 
          onClick={onClose}
          aria-label="Close panel"
        >
          <IoClose size={24} />
        </button>
      </div>
      <div className="context-panel-content">
        {children}
      </div>
    </aside>
  );
}; 