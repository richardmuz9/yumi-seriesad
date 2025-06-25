import React, { useState, useEffect } from 'react';
import './Timer.css';

interface TimerProps {
  initialTime: number; // in seconds
  isRunning: boolean;
  onTimeUp: () => void;
}

export const Timer: React.FC<TimerProps> = ({ initialTime, isRunning, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 300) return 'timer-red'; // Last 5 minutes
    if (timeLeft <= 600) return 'timer-yellow'; // Last 10 minutes
    return 'timer-green';
  };

  return (
    <div className={`timer ${getTimerColor()}`}>
      <span className="timer-label">Time Remaining:</span>
      <span className="timer-value">{formatTime(timeLeft)}</span>
    </div>
  );
}; 