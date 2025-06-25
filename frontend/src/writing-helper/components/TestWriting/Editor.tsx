import React, { useState, useEffect } from 'react';
import './Editor.css';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  isEnabled: boolean;
  wordLimit: number;
}

export const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  isEnabled,
  wordLimit
}) => {
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [value]);

  return (
    <div className="test-editor">
      <div className="editor-header">
        <span className="word-count">
          Words: {wordCount} / {wordLimit}
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!isEnabled}
        placeholder={isEnabled ? "Start writing your essay here..." : "Click 'Start Writing' to begin"}
        className={`editor-textarea ${wordCount > wordLimit ? 'over-limit' : ''}`}
      />

      {wordCount > wordLimit && (
        <div className="word-limit-warning">
          You have exceeded the word limit by {wordCount - wordLimit} words
        </div>
      )}
    </div>
  );
}; 