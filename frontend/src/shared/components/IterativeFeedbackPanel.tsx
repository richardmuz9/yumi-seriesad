import React, { useState, useEffect } from 'react'
import { 
  CreativeVersion, 
  CreativeFeedback, 
  IterativeFeedbackProps,
  CreativeFeedbackOption 
} from '../types/creativeModes'
import { getPersonalityGuide } from '../services/yumiPersonalityService'
import './IterativeFeedbackPanel.css'

export const IterativeFeedbackPanel: React.FC<IterativeFeedbackProps> = ({
  versions,
  onVersionSelect,
  onRequestRefinement,
  currentPersonality,
  refinementSuggestions
}) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>('')
  const [showRefinementOptions, setShowRefinementOptions] = useState(false)
  const [activeFeedback, setActiveFeedback] = useState<CreativeFeedback | null>(null)
  
  const personalityGuide = getPersonalityGuide(currentPersonality)

  useEffect(() => {
    if (versions.length > 0 && !selectedVersionId) {
      setSelectedVersionId(versions[0].id)
    }
  }, [versions])

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersionId(versionId)
    onVersionSelect(versionId)
  }

  const generateSmartFeedback = (): CreativeFeedback[] => {
    const feedbacks: CreativeFeedback[] = []
    
    // Mood refinement options
    if (personalityGuide) {
      feedbacks.push({
        type: 'mood',
        question: `${personalityGuide.name} suggests adjusting the mood. What feeling should we capture?`,
        priority: 'high',
        options: personalityGuide.creativeSuggestions.mood.map(mood => ({
          id: mood,
          label: mood,
          emoji: getMoodEmoji(mood),
          description: `Make it more ${mood}`,
          personalityAlignment: [currentPersonality]
        }))
      })
    }

    // Style variations
    feedbacks.push({
      type: 'style',
      question: 'Want to try a different style approach?',
      priority: 'medium',
      options: [
        { id: 'softer', label: 'Softer', emoji: '💗', description: 'Gentler, more delicate approach' },
        { id: 'bolder', label: 'Bolder', emoji: '🔥', description: 'More dramatic and striking' },
        { id: 'playful', label: 'Playful', emoji: '🎯', description: 'Add fun, whimsical elements' },
        { id: 'elegant', label: 'Elegant', emoji: '✨', description: 'Refined and sophisticated' }
      ]
    })

    // Detail level
    feedbacks.push({
      type: 'detail',
      question: 'How much detail should we focus on?',
      priority: 'low',
      options: [
        { id: 'more_detail', label: 'More Detail', emoji: '🔍', description: 'Add intricate elements' },
        { id: 'simplify', label: 'Simplify', emoji: '⭕', description: 'Clean, minimalist approach' },
        { id: 'focus_face', label: 'Focus Face', emoji: '👁️', description: 'Emphasize facial expression' },
        { id: 'full_body', label: 'Full Scene', emoji: '🌟', description: 'Include background and context' }
      ]
    })

    return feedbacks
  }

  const getMoodEmoji = (mood: string): string => {
    const moodEmojis: Record<string, string> = {
      'excited': '🤩',
      'peaceful': '😌',
      'confident': '😎',
      'gentle': '🌸',
      'energetic': '⚡',
      'mysterious': '🌙',
      'cheerful': '😊',
      'determined': '💪',
      'dreamy': '💭',
      'fierce': '🔥'
    }
    return moodEmojis[mood] || '✨'
  }

  const getPersonalityFeedbackStyle = (): string => {
    if (!personalityGuide) return 'What would you like to adjust?'
    
    switch (personalityGuide.feedbackStyle) {
      case 'encouraging':
        return 'Looking great! Let\'s make it even better! What catches your eye?'
      case 'analytical':
        return 'Analyzing the current result. Which aspect requires optimization?'
      case 'playful':
        return 'Ooh, this is fun! What should we play with next?'
      case 'professional':
        return 'Good work. What refinements would enhance the outcome?'
      default:
        return 'How can we improve this together?'
    }
  }

  const selectedVersion = versions.find(v => v.id === selectedVersionId)
  const smartFeedbacks = generateSmartFeedback()

  return (
    <div className="iterative-feedback-panel">
      {/* Header with Personality Guide */}
      <div className="feedback-header">
        <div className="personality-guide">
          <span className="guide-avatar">
            {currentPersonality === 'otaku' && '🎌'}
            {currentPersonality === 'tsundere' && '😤'}
            {currentPersonality === 'teacher' && '👩‍🏫'}
            {currentPersonality === 'imouto' && '🌸'}
            {currentPersonality === 'classmate' && '👫'}
            {currentPersonality === 'kuudere' && '❄️'}
            {currentPersonality === 'genki' && '⚡'}
          </span>
          <div className="guide-message">
            <div className="guide-name">{personalityGuide?.name || 'Yumi'}</div>
            <div className="guide-text">{getPersonalityFeedbackStyle()}</div>
          </div>
        </div>
      </div>

      {/* Version Selector */}
      <div className="version-selector">
        <h4>🎨 Generated Versions</h4>
        <div className="version-grid">
          {versions.map((version, index) => (
            <div 
              key={version.id}
              className={`version-card ${selectedVersionId === version.id ? 'selected' : ''} ${version.type}`}
              onClick={() => handleVersionSelect(version.id)}
            >
              <div className="version-preview">
                {/* Content preview based on type */}
                {typeof version.content === 'string' && version.content.startsWith('http') ? (
                  <img src={version.content} alt={`Version ${index + 1}`} />
                ) : (
                  <div className="text-preview">
                    {typeof version.content === 'string' 
                      ? version.content.substring(0, 100) + '...'
                      : 'Generated Content'
                    }
                  </div>
                )}
                
                <div className="version-overlay">
                  <div className="version-type">
                    {version.type === 'main' && '🎯 Main'}
                    {version.type === 'alternative' && '✨ Alt'}
                    {version.type === 'user_edited' && '✏️ Edited'}
                  </div>
                  <div className="confidence-indicator">
                    <div 
                      className="confidence-bar"
                      style={{ width: `${version.metadata.aiConfidence * 100}%` }}
                    />
                    <span className="confidence-text">
                      {Math.round(version.metadata.aiConfidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="version-actions">
                <button 
                  className="action-btn primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVersionSelect(version.id)
                  }}
                >
                  Use This
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveFeedback(smartFeedbacks[0])
                    setShowRefinementOptions(true)
                  }}
                >
                  Refine
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Refinement Chips */}
      <div className="quick-refinements">
        <h4>⚡ Quick Adjustments</h4>
        <div className="refinement-chips">
          {refinementSuggestions.slice(0, 6).map((suggestion, index) => (
            <button
              key={index}
              className="refinement-chip"
              onClick={() => {
                const feedback: CreativeFeedback = {
                  type: 'theme',
                  question: `Apply: ${suggestion}`,
                  priority: 'medium',
                  options: [{ id: suggestion, label: suggestion, emoji: '✨' }]
                }
                onRequestRefinement(feedback)
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Smart Feedback Options */}
      {showRefinementOptions && activeFeedback && (
        <div className="feedback-modal">
          <div className="feedback-content">
            <div className="feedback-question">
              <h3>{activeFeedback.question}</h3>
              <button 
                className="close-feedback"
                onClick={() => setShowRefinementOptions(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="feedback-options">
              {activeFeedback.options.map(option => (
                <button
                  key={option.id}
                  className={`feedback-option ${option.personalityAlignment?.includes(currentPersonality) ? 'personality-match' : ''}`}
                  onClick={() => {
                    onRequestRefinement(activeFeedback)
                    setShowRefinementOptions(false)
                  }}
                >
                  <span className="option-emoji">{option.emoji}</span>
                  <div className="option-content">
                    <div className="option-label">{option.label}</div>
                    {option.description && (
                      <div className="option-description">{option.description}</div>
                    )}
                  </div>
                  {option.personalityAlignment?.includes(currentPersonality) && (
                    <div className="personality-match-indicator">
                      <span title={`${personalityGuide?.name} recommends this`}>⭐</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Personality-specific suggestion */}
            {personalityGuide && (
              <div className="personality-suggestion">
                <div className="suggestion-header">
                  <span className="guide-avatar">
                    {currentPersonality === 'otaku' && '🎌'}
                    {currentPersonality === 'tsundere' && '😤'}
                    {currentPersonality === 'teacher' && '👩‍🏫'}
                    {currentPersonality === 'imouto' && '🌸'}
                    {currentPersonality === 'classmate' && '👫'}
                    {currentPersonality === 'kuudere' && '❄️'}
                    {currentPersonality === 'genki' && '⚡'}
                  </span>
                  <strong>{personalityGuide.name} suggests:</strong>
                </div>
                <p>{personalityGuide.refinementApproach}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Smart Questions Button */}
      <div className="smart-questions">
        <button 
          className="smart-questions-btn"
          onClick={() => {
            setActiveFeedback(smartFeedbacks[0])
            setShowRefinementOptions(true)
          }}
        >
          <span className="btn-icon">🤔</span>
          <span className="btn-text">Ask {personalityGuide?.name || 'Yumi'} for Ideas</span>
        </button>
      </div>

      {/* Version Comparison */}
      {versions.length > 1 && (
        <div className="version-comparison">
          <button className="comparison-btn">
            <span>📊 Compare Versions</span>
          </button>
        </div>
      )}
    </div>
  )
} 