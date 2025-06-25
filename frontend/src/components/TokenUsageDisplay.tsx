import React from 'react';
import './TokenUsageDisplay.css';

export interface TokenUsageDisplayProps {
  currentTokens: number;
  dailyTokensRemaining: number;
  hasBlessing: boolean;
}

const TokenUsageDisplay: React.FC<TokenUsageDisplayProps> = ({
  currentTokens,
  dailyTokensRemaining,
  hasBlessing
}) => {
  const formatTokenCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="token-usage-display">
      <div className="token-info">
        <div className="token-section">
          <h3>Available Timeshards</h3>
          <div className="token-count">
            {formatTokenCount(currentTokens)}
            <span className="token-label">TS</span>
          </div>
        </div>

        {hasBlessing && (
          <div className="token-section blessing-active">
            <h3>Daily Timeshards</h3>
            <div className="token-count">
              {formatTokenCount(dailyTokensRemaining)}
              <span className="token-label">TS</span>
              <span className="blessing-indicator">✨</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenUsageDisplay; 