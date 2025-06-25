import React from 'react';
import { TestPrompt } from './types';
import './PromptPanel.css';

interface PromptPanelProps {
  prompt: TestPrompt;
  isWriting: boolean;
  onStart: () => void;
}

export const PromptPanel: React.FC<PromptPanelProps> = ({
  prompt,
  isWriting,
  onStart
}) => {
  return (
    <div className="prompt-panel">
      <div className="prompt-header">
        <h3>{prompt.title}</h3>
        <div className="prompt-meta">
          <span>Time Limit: {prompt.timeLimit} minutes</span>
          <span>Word Limit: {prompt.wordLimit} words</span>
        </div>
      </div>

      <div className="prompt-content">
        {prompt.context && (
          <div className="prompt-context">
            <h4>Background</h4>
            <p>{prompt.context}</p>
          </div>
        )}

        <div className="prompt-question">
          <h4>Question</h4>
          <p>{prompt.question}</p>
        </div>

        {prompt.instructions && (
          <div className="prompt-instructions">
            <h4>Instructions</h4>
            <ul>
              {prompt.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {!isWriting && (
        <button className="start-button" onClick={onStart}>
          Start Writing
        </button>
      )}
    </div>
  );
}; 