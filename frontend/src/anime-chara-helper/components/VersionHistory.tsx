import React, { useState } from 'react'
import { VersionHistory as VersionHistoryType, CharacterVersion } from '../types'
import { IoChevronBack, IoChevronForward, IoSave, IoTrash, IoTime, IoCopy } from 'react-icons/io5'
import './VersionHistory.css'

interface VersionHistoryProps {
  history: VersionHistoryType
  onRevert: (versionId: string) => void
  onSaveVersion: (name: string, description: string) => void
  onDeleteVersion: (versionId: string) => void
  onCompareVersions: (version1: string, version2: string) => void
  currentCanvasData: string
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  history,
  onRevert,
  onSaveVersion,
  onDeleteVersion,
  onCompareVersions,
  currentCanvasData
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline')

  const currentVersion = history.versions[history.currentIndex]
  const canGoBack = history.currentIndex > 0
  const canGoForward = history.currentIndex < history.versions.length - 1

  const handleSaveVersion = () => {
    if (saveName.trim()) {
      onSaveVersion(saveName.trim(), saveDescription.trim())
      setSaveName('')
      setSaveDescription('')
      setShowSaveDialog(false)
    }
  }

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(prev => prev.filter(id => id !== versionId))
    } else if (selectedVersions.length < 2) {
      setSelectedVersions(prev => [...prev, versionId])
    } else {
      setSelectedVersions([versionId])
    }
  }

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompareVersions(selectedVersions[0], selectedVersions[1])
    }
  }

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const generateAutoName = (): string => {
    const count = history.versions.length + 1
    const now = new Date()
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `Version ${count} - ${time}`
  }

  return (
    <div className="version-history">
      <div className="history-header">
        <h3>📚 Version History</h3>
        <div className="header-actions">
          <button
            onClick={() => setViewMode(viewMode === 'timeline' ? 'grid' : 'timeline')}
            className="view-toggle"
            title={`Switch to ${viewMode === 'timeline' ? 'grid' : 'timeline'} view`}
          >
            {viewMode === 'timeline' ? '📋' : '📅'}
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="save-btn"
            title="Save Current Version"
          >
            <IoSave /> Save
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="navigation-controls">
        <button
          onClick={() => onRevert(history.versions[history.currentIndex - 1]?.id)}
          disabled={!canGoBack}
          className="nav-btn"
          title="Go to previous version"
        >
          <IoChevronBack />
        </button>
        
        <div className="current-version-info">
          <span className="version-indicator">
            {history.currentIndex + 1} of {history.versions.length}
          </span>
          {currentVersion && (
            <span className="version-name">{currentVersion.name}</span>
          )}
        </div>

        <button
          onClick={() => onRevert(history.versions[history.currentIndex + 1]?.id)}
          disabled={!canGoForward}
          className="nav-btn"
          title="Go to next version"
        >
          <IoChevronForward />
        </button>
      </div>

      {/* Compare Mode */}
      {selectedVersions.length > 0 && (
        <div className="compare-section">
          <div className="compare-header">
            <span>{selectedVersions.length}/2 selected for comparison</span>
            {selectedVersions.length === 2 && (
              <button onClick={handleCompare} className="compare-btn">
                Compare Versions
              </button>
            )}
            <button
              onClick={() => setSelectedVersions([])}
              className="clear-selection"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Version List */}
      <div className={`versions-container ${viewMode}`}>
        {viewMode === 'timeline' ? (
          <div className="timeline">
            {history.versions.map((version, index) => (
              <div
                key={version.id}
                className={`timeline-item ${index === history.currentIndex ? 'current' : ''} ${
                  selectedVersions.includes(version.id) ? 'selected' : ''
                }`}
                onClick={() => handleVersionSelect(version.id)}
              >
                <div className="timeline-marker">
                  {index === history.currentIndex && <div className="current-indicator" />}
                </div>
                
                <div className="timeline-content">
                  <div className="version-thumbnail">
                    <img src={version.thumbnail} alt={version.name} />
                  </div>
                  
                  <div className="version-details">
                    <h4>{version.name}</h4>
                    {version.description && (
                      <p className="version-description">{version.description}</p>
                    )}
                    
                    <div className="version-metadata">
                      <span className="timestamp">
                        <IoTime />
                        {formatTimeAgo(version.timestamp)}
                      </span>
                      
                      {version.metadata && (
                        <div className="metadata-tags">
                          {version.metadata.pose && (
                            <span className="tag">Pose: {version.metadata.pose}</span>
                          )}
                          {version.metadata.expression && (
                            <span className="tag">Expression: {version.metadata.expression}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="version-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRevert(version.id)
                        }}
                        className="action-btn revert"
                        title="Revert to this version"
                      >
                        Revert
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard?.writeText(version.canvasData)
                        }}
                        className="action-btn copy"
                        title="Copy version data"
                      >
                        <IoCopy />
                      </button>
                      
                      {index !== history.currentIndex && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteVersion(version.id)
                          }}
                          className="action-btn delete"
                          title="Delete this version"
                        >
                          <IoTrash />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid-view">
            {history.versions.map((version, index) => (
              <div
                key={version.id}
                className={`grid-item ${index === history.currentIndex ? 'current' : ''} ${
                  selectedVersions.includes(version.id) ? 'selected' : ''
                }`}
                onClick={() => handleVersionSelect(version.id)}
              >
                <div className="grid-thumbnail">
                  <img src={version.thumbnail} alt={version.name} />
                  {index === history.currentIndex && (
                    <div className="current-badge">Current</div>
                  )}
                </div>
                
                <div className="grid-info">
                  <h5>{version.name}</h5>
                  <span className="grid-timestamp">
                    {formatTimeAgo(version.timestamp)}
                  </span>
                </div>
                
                <div className="grid-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRevert(version.id)
                    }}
                    title="Revert"
                  >
                    ↶
                  </button>
                  
                  {index !== history.currentIndex && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteVersion(version.id)
                      }}
                      className="delete-grid"
                      title="Delete"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="history-stats">
        <div className="stat-item">
          <span className="stat-value">{history.versions.length}</span>
          <span className="stat-label">Total Versions</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{Math.round(history.versions.length / history.maxVersions * 100)}%</span>
          <span className="stat-label">Storage Used</span>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="save-dialog-overlay">
          <div className="save-dialog">
            <h3>Save New Version</h3>
            <div className="form-group">
              <label>Version Name</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder={generateAutoName()}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Describe what changed in this version..."
                rows={3}
              />
            </div>
            <div className="dialog-actions">
              <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
              <button
                onClick={handleSaveVersion}
                className="primary"
              >
                Save Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 