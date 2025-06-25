import React, { useState, useRef } from 'react'
import { CharacterLibraryItem, CharacterVersion } from '../types'
import { IoAdd, IoTrash, IoEye, IoDownload, IoCopy, IoClose } from 'react-icons/io5'
import './CharacterLibrary.css'

interface CharacterLibraryProps {
  library: CharacterLibraryItem[]
  onSelect: (item: CharacterLibraryItem) => void
  onSave: (name: string, description: string) => void
  onDelete: (id: string) => void
  onDuplicate: (item: CharacterLibraryItem) => void
  onVersionSelect: (itemId: string, versionId: string) => void
  onClose: () => void
  currentCharacter?: CharacterLibraryItem
}

export const CharacterLibrary: React.FC<CharacterLibraryProps> = ({
  library,
  onSelect,
  onSave,
  onDelete,
  onDuplicate,
  onVersionSelect,
  onClose,
  currentCharacter
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [selectedItem, setSelectedItem] = useState<CharacterLibraryItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterTag, setFilterTag] = useState<string>('')
  const dragItemRef = useRef<HTMLDivElement>(null)

  const handleSave = () => {
    if (saveName.trim()) {
      onSave(saveName.trim(), saveDescription.trim())
      setSaveName('')
      setSaveDescription('')
      setShowSaveDialog(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, item: CharacterLibraryItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const filteredLibrary = library.filter(item => {
    if (!filterTag) return true
    return item.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
  })

  const allTags = Array.from(new Set(library.flatMap(item => item.tags)))

  return (
    <div className="character-library">
      <div className="library-header">
        <h3>🎭 Character Library</h3>
        <div className="header-actions">
          <button
            className="save-btn"
            onClick={() => setShowSaveDialog(true)}
            title="Save Current Character"
          >
            <IoAdd /> Save Current
          </button>
          <button className="close-btn" onClick={onClose}>
            <IoClose />
          </button>
        </div>
      </div>

      <div className="library-controls">
        <div className="filter-section">
          <select 
            value={filterTag} 
            onChange={(e) => setFilterTag(e.target.value)}
            className="filter-select"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        
        <div className="view-controls">
          <button 
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button 
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </div>

      <div className={`library-content ${viewMode}`}>
        {filteredLibrary.map(item => (
          <div
            key={item.id}
            className={`library-item ${currentCharacter?.id === item.id ? 'active' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onClick={() => setSelectedItem(item)}
          >
            <div className="item-thumbnail">
              <img src={item.thumbnail} alt={item.name} />
              <div className="version-indicator">
                {item.versions.length} versions
              </div>
            </div>
            
            <div className="item-info">
              <h4>{item.name}</h4>
              <div className="item-tags">
                {item.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="item-date">
                {new Date(item.lastModified).toLocaleDateString()}
              </div>
            </div>

            <div className="item-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(item)
                }}
                title="Load Character"
              >
                <IoEye />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate(item)
                }}
                title="Duplicate"
              >
                <IoCopy />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.id)
                }}
                title="Delete"
                className="delete-btn"
              >
                <IoTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Character Detail Modal */}
      {selectedItem && (
        <div className="character-detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedItem.name}</h3>
              <button onClick={() => setSelectedItem(null)}>
                <IoClose />
              </button>
            </div>
            
            <div className="versions-section">
              <h4>Versions ({selectedItem.versions.length})</h4>
              <div className="versions-grid">
                {selectedItem.versions.map(version => (
                  <div
                    key={version.id}
                    className={`version-item ${version.id === selectedItem.activeVersionId ? 'active' : ''}`}
                    onClick={() => onVersionSelect(selectedItem.id, version.id)}
                  >
                    <img src={version.thumbnail} alt={version.name} />
                    <div className="version-info">
                      <span className="version-name">{version.name}</span>
                      <span className="version-date">
                        {new Date(version.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="save-dialog-overlay">
          <div className="save-dialog">
            <h3>Save Character</h3>
            <div className="form-group">
              <label>Character Name</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter character name..."
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
              />
            </div>
            <div className="dialog-actions">
              <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
              <button onClick={handleSave} disabled={!saveName.trim()}>
                Save Character
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 