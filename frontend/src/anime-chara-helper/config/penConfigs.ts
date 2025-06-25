import { PenConfiguration, BrushSettings } from '../types'

// Default brush settings template
const createDefaultSettings = (overrides: Partial<BrushSettings> = {}): BrushSettings => ({
  size: 5,
  opacity: 100,
  hardness: 80,
  tipShape: 'round',
  pressureSensitivity: false,
  spacing: 25,
  scattering: 0,
  rotation: 0,
  flowRate: 100,
  smoothing: 0,
  tapering: {
    enabled: false,
    startTaper: 0,
    endTaper: 0
  },
  ...overrides
})

export const PEN_CONFIGURATIONS: PenConfiguration[] = [
  // === BASIC TOOLS ===
  {
    id: 'basic-brush',
    name: 'Basic Brush',
    tool: 'brush',
    category: 'basic',
    description: 'Standard brush for general drawing',
    icon: '🖌️',
    minSize: 1,
    maxSize: 100,
    supportsTexture: true,
    supportsPressure: true,
    defaultSettings: createDefaultSettings({
      size: 10,
      opacity: 80,
      hardness: 70,
      pressureSensitivity: true
    })
  },
  {
    id: 'pencil',
    name: 'Pencil',
    tool: 'pencil',
    category: 'basic',
    description: 'Traditional pencil for sketching',
    icon: '✏️',
    minSize: 0.5,
    maxSize: 20,
    supportsTexture: true,
    supportsPressure: true,
    defaultSettings: createDefaultSettings({
      size: 2,
      opacity: 60,
      hardness: 90,
      pressureSensitivity: true,
      spacing: 15,
      texturePath: '/textures/pencil-grain.png'
    })
  },
  {
    id: 'marker',
    name: 'Marker',
    tool: 'marker',
    category: 'basic',
    description: 'Smooth marker for bold strokes',
    icon: '🖊️',
    minSize: 3,
    maxSize: 50,
    supportsTexture: false,
    supportsPressure: false,
    defaultSettings: createDefaultSettings({
      size: 15,
      opacity: 70,
      hardness: 30,
      tipShape: 'diagonal',
      flowRate: 80
    })
  },
  {
    id: 'airbrush',
    name: 'Airbrush',
    tool: 'airbrush',
    category: 'basic',
    description: 'Soft airbrush for gradual shading',
    icon: '💨',
    minSize: 5,
    maxSize: 200,
    supportsTexture: false,
    supportsPressure: true,
    defaultSettings: createDefaultSettings({
      size: 30,
      opacity: 30,
      hardness: 0,
      pressureSensitivity: true,
      flowRate: 50,
      smoothing: 80
    })
  },

  // === DETAIL TOOLS ===
  {
    id: 'fine-liner',
    name: 'Fine Liner',
    tool: 'fine-liner',
    category: 'detail',
    description: 'Ultra-precise tool for eyelashes, hair strands, and fine details',
    icon: '🖋️',
    minSize: 0.1,
    maxSize: 3,
    supportsTexture: false,
    supportsPressure: true,
    defaultSettings: createDefaultSettings({
      size: 0.5,
      opacity: 95,
      hardness: 95,
      pressureSensitivity: true,
      spacing: 5,
      smoothing: 20,
      tapering: {
        enabled: true,
        startTaper: 10,
        endTaper: 30
      }
    })
  },
  {
    id: 'detail-brush',
    name: 'Detail Brush',
    tool: 'detail-brush',
    category: 'detail',
    description: 'Small brush for tiny highlights and micro-details',
    icon: '✨',
    minSize: 0.2,
    maxSize: 8,
    supportsTexture: true,
    supportsPressure: true,
    defaultSettings: createDefaultSettings({
      size: 1.5,
      opacity: 85,
      hardness: 80,
      pressureSensitivity: true,
      spacing: 20,
      smoothing: 40
    })
  },
  {
    id: 'calligraphy',
    name: 'Calligraphy Pen',
    tool: 'calligraphy',
    category: 'detail',
    description: 'Variable width pen that responds to stroke direction and pressure',
    icon: '🖋️',
    minSize: 0.5,
    maxSize: 20,
    supportsTexture: false,
    supportsPressure: true,
    defaultSettings: createDefaultSettings({
      size: 8,
      opacity: 90,
      hardness: 85,
      tipShape: 'diagonal',
      pressureSensitivity: true,
      spacing: 10,
      tapering: {
        enabled: true,
        startTaper: 20,
        endTaper: 20
      }
    })
  },
  {
    id: 'pixel-brush',
    name: 'Pixel Brush',
    tool: 'pixel-brush',
    category: 'detail',
    description: 'Perfect for pixel-art style details and crisp edges',
    icon: '⬛',
    minSize: 1,
    maxSize: 10,
    supportsTexture: false,
    supportsPressure: false,
    defaultSettings: createDefaultSettings({
      size: 1,
      opacity: 100,
      hardness: 100,
      tipShape: 'square',
      spacing: 100,
      smoothing: 0
    })
  },

  // === TEXTURE TOOLS ===
  {
    id: 'texture-brush',
    name: 'Texture Brush',
    tool: 'texture-brush',
    category: 'texture',
    description: 'Specialized for hair texture, fabric patterns, and surface details',
    icon: '🌾',
    minSize: 3,
    maxSize: 50,
    supportsTexture: true,
    supportsPressure: true,
    defaultSettings: createDefaultSettings({
      size: 12,
      opacity: 60,
      hardness: 60,
      pressureSensitivity: true,
      spacing: 40,
      scattering: 20,
      rotation: 15,
      texturePath: '/textures/hair-texture.png'
    })
  },

  // === ERASERS ===
  {
    id: 'basic-eraser',
    name: 'Basic Eraser',
    tool: 'eraser',
    category: 'basic',
    description: 'Standard eraser for general corrections',
    icon: '🗑️',
    minSize: 2,
    maxSize: 100,
    supportsTexture: false,
    supportsPressure: true,
    defaultSettings: createDefaultSettings({
      size: 15,
      opacity: 100,
      hardness: 70,
      pressureSensitivity: true
    })
  },
  {
    id: 'precision-eraser',
    name: 'Precision Eraser',
    tool: 'precision-eraser',
    category: 'detail',
    description: 'Ultra-precise eraser for detailed corrections',
    icon: '🎯',
    minSize: 0.5,
    maxSize: 10,
    supportsTexture: false,
    supportsPressure: true,
    defaultSettings: createDefaultSettings({
      size: 2,
      opacity: 100,
      hardness: 90,
      pressureSensitivity: true,
      spacing: 10
    })
  },
  {
    id: 'soft-eraser',
    name: 'Soft Eraser',
    tool: 'soft-eraser',
    category: 'effects',
    description: 'Gradual eraser for smooth blending and soft corrections',
    icon: '☁️',
    minSize: 5,
    maxSize: 100,
    supportsTexture: false,
    supportsPressure: true,
    defaultSettings: createDefaultSettings({
      size: 25,
      opacity: 50,
      hardness: 20,
      pressureSensitivity: true,
      flowRate: 60,
      smoothing: 60
    })
  },
  {
    id: 'highlight-eraser',
    name: 'Highlight Eraser',
    tool: 'highlight-eraser',
    category: 'effects',
    description: 'Creates highlights and light effects by selective erasing',
    icon: '⭐',
    minSize: 1,
    maxSize: 30,
    supportsTexture: true,
    supportsPressure: true,
    defaultSettings: createDefaultSettings({
      size: 8,
      opacity: 80,
      hardness: 60,
      pressureSensitivity: true,
      spacing: 30,
      tapering: {
        enabled: true,
        startTaper: 0,
        endTaper: 50
      }
    })
  }
]

// Helper functions
export const getPenConfig = (toolId: string): PenConfiguration | undefined => {
  return PEN_CONFIGURATIONS.find(config => config.id === toolId)
}

export const getPensByCategory = (category: string): PenConfiguration[] => {
  return PEN_CONFIGURATIONS.filter(config => config.category === category)
}

export const getDetailPens = (): PenConfiguration[] => {
  return getPensByCategory('detail')
}

export const getBasicPens = (): PenConfiguration[] => {
  return getPensByCategory('basic')
}

// Presets for specific tasks
export const EYELASH_PRESET = {
  toolId: 'fine-liner',
  settings: createDefaultSettings({
    size: 0.3,
    opacity: 90,
    hardness: 95,
    pressureSensitivity: true,
    spacing: 3,
    smoothing: 15,
    tapering: {
      enabled: true,
      startTaper: 5,
      endTaper: 40
    }
  })
}

export const HAIR_STRAND_PRESET = {
  toolId: 'texture-brush',
  settings: createDefaultSettings({
    size: 2,
    opacity: 70,
    hardness: 80,
    pressureSensitivity: true,
    spacing: 15,
    scattering: 10,
    tapering: {
      enabled: true,
      startTaper: 0,
      endTaper: 20
    }
  })
}

export const HIGHLIGHT_PRESET = {
  toolId: 'detail-brush',
  settings: createDefaultSettings({
    size: 1,
    opacity: 95,
    hardness: 70,
    pressureSensitivity: true,
    spacing: 25,
    smoothing: 30
  })
} 