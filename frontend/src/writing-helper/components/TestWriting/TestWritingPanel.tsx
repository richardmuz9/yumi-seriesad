import React, { useState, useEffect } from 'react';
import { ExamType, TestPrompt, FeedbackReport } from './types';
import { Timer } from './Timer';
import { PromptPanel } from './PromptPanel';
import { Editor } from './Editor';
import { FeedbackPanel } from './FeedbackPanel';
import { getPrompt, submitEssay } from '../../../services/testWritingService';
import './TestWritingPanel.css';

export const TestWritingPanel: React.FC = () => {
  const [examType, setExamType] = useState<ExamType>('TOEFL');
  const [prompt, setPrompt] = useState<TestPrompt | null>(null);
  const [essay, setEssay] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPrompt();
  }, [examType]);

  const loadPrompt = async () => {
    const newPrompt = await getPrompt(examType);
    setPrompt(newPrompt);
    setTimeRemaining(newPrompt.timeLimit * 60); // Convert minutes to seconds
    setEssay('');
    setFeedback(null);
  };

  const handleStart = () => {
    setIsWriting(true);
  };

  const handleSubmit = async () => {
    if (!prompt) return;

    setIsSubmitting(true);
    try {
      const report = await submitEssay({
        examType,
        promptId: prompt.id,
        essay,
        timeSpent: prompt.timeLimit * 60 - timeRemaining
      });
      setFeedback(report);
      setIsWriting(false);
    } catch (error) {
      console.error('Failed to submit essay:', error);
      // Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  return (
    <div className="test-writing-panel">
      <div className="test-writing-header">
        <select
          value={examType}
          onChange={(e) => setExamType(e.target.value as ExamType)}
          disabled={isWriting}
        >
          <option value="TOEFL">TOEFL iBT Writing</option>
          <option value="EJU">EJU Writing</option>
          <option value="COMMON">Common Test</option>
        </select>

        {prompt && (
          <Timer
            initialTime={timeRemaining}
            isRunning={isWriting}
            onTimeUp={handleTimeUp}
          />
        )}
      </div>

      <div className="test-writing-content">
        <div className="test-writing-main">
          {prompt && (
            <>
              <PromptPanel
                prompt={prompt}
                isWriting={isWriting}
                onStart={handleStart}
              />
              
              <Editor
                value={essay}
                onChange={setEssay}
                isEnabled={isWriting}
                wordLimit={prompt.wordLimit}
              />

              {isWriting && (
                <button
                  className="submit-button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Essay'}
                </button>
              )}
            </>
          )}
        </div>

        {feedback && (
          <FeedbackPanel
            feedback={feedback}
            essay={essay}
          />
        )}
      </div>
    </div>
  );
}; 