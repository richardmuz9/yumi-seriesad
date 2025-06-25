import React from 'react';
import { FeedbackReport } from './types';
import './FeedbackPanel.css';

interface FeedbackPanelProps {
  feedback: FeedbackReport;
  essay: string;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  feedback,
  essay
}) => {
  return (
    <div className="feedback-panel">
      <div className="feedback-header">
        <h3>Essay Feedback</h3>
        <div className="feedback-score">
          <span>Score: {feedback.score}/100</span>
        </div>
      </div>

      <div className="feedback-content">
        <div className="feedback-section">
          <h4>Overall Assessment</h4>
          <p>{feedback.overallFeedback}</p>
        </div>

        <div className="feedback-section">
          <h4>Strengths</h4>
          <ul>
            {feedback.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>

        <div className="feedback-section">
          <h4>Areas for Improvement</h4>
          <ul>
            {feedback.improvements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>

        {feedback.grammarErrors.length > 0 && (
          <div className="feedback-section">
            <h4>Grammar and Usage</h4>
            <ul>
              {feedback.grammarErrors.map((error, index) => (
                <li key={index}>
                  <span className="error-context">{error.context}</span>
                  <span className="error-suggestion">{error.suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="feedback-section">
          <h4>Detailed Scoring</h4>
          <div className="score-breakdown">
            <div className="score-item">
              <span>Content</span>
              <div className="score-bar">
                <div 
                  className="score-fill"
                  style={{ width: `${feedback.scores.content}%` }}
                />
              </div>
              <span>{feedback.scores.content}/100</span>
            </div>
            <div className="score-item">
              <span>Organization</span>
              <div className="score-bar">
                <div 
                  className="score-fill"
                  style={{ width: `${feedback.scores.organization}%` }}
                />
              </div>
              <span>{feedback.scores.organization}/100</span>
            </div>
            <div className="score-item">
              <span>Language Use</span>
              <div className="score-bar">
                <div 
                  className="score-fill"
                  style={{ width: `${feedback.scores.languageUse}%` }}
                />
              </div>
              <span>{feedback.scores.languageUse}/100</span>
            </div>
            <div className="score-item">
              <span>Vocabulary</span>
              <div className="score-bar">
                <div 
                  className="score-fill"
                  style={{ width: `${feedback.scores.vocabulary}%` }}
                />
              </div>
              <span>{feedback.scores.vocabulary}/100</span>
            </div>
          </div>
        </div>

        <div className="feedback-section">
          <h4>Sample Response</h4>
          <p className="sample-response">{feedback.sampleResponse}</p>
        </div>
      </div>
    </div>
  );
}; 