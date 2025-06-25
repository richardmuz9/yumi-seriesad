import React, { useState, useRef } from 'react'
import { AIColorSuggestion, ColorPalette, ImageAnalysisResult } from '../types'
import { IoCamera, IoColorPalette, IoSparkles, IoRefresh, IoEye } from 'react-icons/io5'
import './AIColorAssistant.css'

interface AIColorAssistantProps {
  onColorSelect: (color: string) => void
  onPaletteSelect: (palette: ColorPalette) => void
  currentImage?: string
  onAnalyze: (imageData: string) => Promise<ImageAnalysisResult>
}

export const AIColorAssistant: React.FC<AIColorAssistantProps> = ({
  onColorSelect,
  onPaletteSelect,
  currentImage,
  onAnalyze
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null)
  const [suggestions, setSuggestions] = useState<AIColorSuggestion[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'base' | 'accent' | 'highlight' | 'shadow'>('all')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setUploadedImage(imageData)
        analyzeImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true)
    try {
      const result = await onAnalyze(imageData)
      setAnalysisResult(result)
      generateSuggestions(result)
    } catch (error) {
      console.error('Failed to analyze image:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateSuggestions = (result: ImageAnalysisResult) => {
    const newSuggestions: AIColorSuggestion[] = []

    // Generate base color suggestions
    result.dominantColors.forEach((color, index) => {
      newSuggestions.push({
        color,
        reason: `Dominant color ${index + 1} from your image`,
        category: 'base',
        compatibility: 95 - index * 5
      })
    })

    // Generate accent suggestions based on color harmony
    result.recommendations.accentColors.forEach((color, index) => {
      newSuggestions.push({
        color,
        reason: `${result.colorHarmony} harmony accent`,
        category: 'accent',
        compatibility: 90 - index * 3
      })
    })

    // Generate highlight suggestions
    result.recommendations.hairColor.forEach((color, index) => {
      newSuggestions.push({
        color,
        reason: `Hair color suggestion`,
        category: 'highlight',
        compatibility: 85 - index * 2
      })
    })

    // Generate shadow suggestions (darker variants)
    result.dominantColors.forEach((color) => {
      const darkerColor = adjustColorBrightness(color, -30)
      newSuggestions.push({
        color: darkerColor,
        reason: 'Shadow variant for depth',
        category: 'shadow',
        compatibility: 80
      })
    })

    setSuggestions(newSuggestions)
  }

  const adjustColorBrightness = (color: string, amount: number): string => {
    // Simple brightness adjustment - in a real app, you'd use a color manipulation library
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.max(0, Math.min(255, (num >> 16) + amount))
    const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount))
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory)

  const predefinedPalettes: ColorPalette[] = [
    {
      id: 'maid_cafe',
      name: 'Maid Café',
      colors: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#7209b7'],
      category: 'theme',
      theme: 'maid_cafe'
    },
    {
      id: 'sakura_spring',
      name: 'Sakura Spring',
      colors: ['#ffb7c5', '#ffc0cb', '#ff69b4', '#ff1493', '#c71585'],
      category: 'pastel'
    },
    {
      id: 'ocean_breeze',
      name: 'Ocean Breeze',
      colors: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#667eea'],
      category: 'cool'
    },
    {
      id: 'sunset_warm',
      name: 'Sunset Warm',
      colors: ['#ff6b9d', '#c44569', '#f8b500', '#feca57', '#ff9ff3'],
      category: 'warm'
    },
    {
      id: 'gothic_dark',
      name: 'Gothic Dark',
      colors: ['#1a1a2e', '#16213e', '#533483', '#7209b7', '#2d1b69'],
      category: 'theme',
      theme: 'gothic'
    }
  ]

  return (
    <div className="ai-color-assistant">
      <div className="assistant-header">
        <h3>🎨 AI Color Assistant</h3>
        <div className="header-actions">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="upload-btn"
            disabled={isAnalyzing}
          >
            <IoCamera /> Upload Reference
          </button>
          {(currentImage || uploadedImage) && (
            <button
              onClick={() => analyzeImage(currentImage || uploadedImage!)}
              className="analyze-btn"
              disabled={isAnalyzing}
            >
              <IoSparkles /> {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="analysis-status">
          <div className="loading-spinner"></div>
          <span>Analyzing colors and harmony...</span>
        </div>
      )}

      {/* Image Preview */}
      {(uploadedImage || currentImage) && (
        <div className="image-preview">
          <img src={uploadedImage || currentImage} alt="Reference" />
          <div className="image-overlay">
            <IoEye />
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="analysis-results">
          <h4>🔍 Analysis Results</h4>
          <div className="color-harmony">
            <span className="harmony-label">Color Harmony:</span>
            <span className="harmony-type">{analysisResult.colorHarmony}</span>
          </div>
          <div className="dominant-colors">
            <span className="label">Dominant Colors:</span>
            <div className="color-row">
              {analysisResult.dominantColors.map((color, index) => (
                <div
                  key={index}
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => onColorSelect(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      {suggestions.length > 0 && (
        <div className="category-filter">
          <h4>🎯 AI Suggestions</h4>
          <div className="filter-buttons">
            {['all', 'base', 'accent', 'highlight', 'shadow'].map(category => (
              <button
                key={category}
                className={selectedCategory === category ? 'active' : ''}
                onClick={() => setSelectedCategory(category as any)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {filteredSuggestions.length > 0 && (
        <div className="ai-suggestions">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => onColorSelect(suggestion.color)}
            >
              <div
                className="suggestion-color"
                style={{ backgroundColor: suggestion.color }}
              />
              <div className="suggestion-info">
                <div className="suggestion-reason">{suggestion.reason}</div>
                <div className="suggestion-meta">
                  <span className="category">{suggestion.category}</span>
                  <span className="compatibility">{suggestion.compatibility}% match</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Predefined Palettes */}
      <div className="predefined-palettes">
        <h4>🎨 Theme Palettes</h4>
        <div className="palettes-grid">
          {predefinedPalettes.map(palette => (
            <div
              key={palette.id}
              className="palette-item"
              onClick={() => onPaletteSelect(palette)}
            >
              <div className="palette-colors">
                {palette.colors.map((color, index) => (
                  <div
                    key={index}
                    className="palette-color"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="palette-name">{palette.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => navigator.clipboard?.writeText(JSON.stringify(analysisResult))}>
          Copy Analysis
        </button>
        <button onClick={() => setSuggestions([])}>
          Clear Suggestions
        </button>
      </div>
    </div>
  )
} 