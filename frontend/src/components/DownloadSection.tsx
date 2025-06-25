import React from 'react';
import { DOWNLOADS } from '../constants/downloads';
import { IoLogoWindows, IoLogoApple } from 'react-icons/io5';
import './DownloadSection.css';

interface DownloadCardProps {
  icon: React.ReactNode;
  title: string;
  url: string;
  filename: string;
  requirements: string;
  features: string[];
  isRecommended?: boolean;
}

const DownloadCard: React.FC<DownloadCardProps> = ({
  icon,
  title,
  url,
  filename,
  requirements,
  features,
  isRecommended
}) => (
  <div className={`download-card ${isRecommended ? 'recommended' : ''}`}>
    {isRecommended && (
      <div className="recommended-badge">
        ⭐ Recommended
      </div>
    )}
    <div className="download-card-icon">
      {icon}
    </div>
    <div className="download-card-content">
      <h3>{title}</h3>
      <p className="requirements">{requirements}</p>
      <ul className="features">
        {features.map((feature, index) => (
          <li key={index}>✓ {feature}</li>
        ))}
      </ul>
      <a
        href={url}
        download={filename}
        className="download-button"
        onClick={() => {
          // Track download event
          try {
            if (window.gtag) {
              window.gtag('event', 'download', {
                event_category: 'installer',
                event_label: filename
              });
            }
          } catch (error) {
            console.error('Failed to track download:', error);
          }
        }}
      >
        Download for {title}
      </a>
    </div>
  </div>
);

export const DownloadSection: React.FC = () => {
  // Detect OS for recommendation
  const isWindows = navigator.platform.toLowerCase().includes('win');
  const isMac = navigator.platform.toLowerCase().includes('mac');

  return (
    <div className="download-section">
      <h2>Download Yumi Series</h2>
      
      <div className="download-tabs">
        <button className="tab-button active">Desktop Apps</button>
        <button className="tab-button">Mobile Apps</button>
        <button className="tab-button">Web App</button>
      </div>

      <div className="download-grid">
        <DownloadCard
          icon={<IoLogoWindows size={48} />}
          title="Windows"
          url={DOWNLOADS.WINDOWS.url}
          filename={DOWNLOADS.WINDOWS.filename}
          requirements={DOWNLOADS.WINDOWS.requirements}
          features={DOWNLOADS.WINDOWS.features}
          isRecommended={isWindows}
        />

        <DownloadCard
          icon={<IoLogoApple size={48} />}
          title="macOS"
          url={DOWNLOADS.MACOS.url}
          filename={DOWNLOADS.MACOS.filename}
          requirements={DOWNLOADS.MACOS.requirements}
          features={DOWNLOADS.MACOS.features}
          isRecommended={isMac}
        />
      </div>

      <div className="download-notes">
        <p>
          <strong>Note:</strong> By downloading, you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}; 