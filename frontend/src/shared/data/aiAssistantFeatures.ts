// AI Assistant v1.2 Features Data
export interface AIFeature {
  id: string
  name: string
  description: string
  category: 'creation' | 'writing' | 'analysis' | 'collaboration' | 'system'
  version: string
  isNew?: boolean
  examples: string[]
  tips: string[]
}

export interface YumiChatResponse {
  personality: string
  responses: {
    greeting: string[]
    helpOffers: string[]
    encouragement: string[]
    tips: string[]
    surprises: string[]
  }
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  version: string
  isNew?: boolean
  relatedFeatures: string[]
}

// AI Assistant Features (v1.2)
export const AI_ASSISTANT_FEATURES: AIFeature[] = [
  {
    id: 'character-library',
    name: 'Character Library',
    description: 'Save and organize your anime characters with drag-and-drop management',
    category: 'creation',
    version: '1.2',
    isNew: true,
    examples: [
      'Save character: "Magical Girl Sakura" with cherry blossom theme',
      'Organize characters by series or mood',
      'Quick load previous character designs'
    ],
    tips: [
      'Use descriptive names for easy searching',
      'Add tags for better organization',
      'Auto-generated thumbnails help identify characters quickly'
    ]
  },
  {
    id: 'ai-color-assistant',
    name: 'AI Color Assistant',
    description: 'Analyze images and get smart color suggestions with natural language',
    category: 'creation',
    version: '1.2',
    isNew: true,
    examples: [
      '"Make it more sunset-like" → warm orange/pink palette',
      '"Ocean vibes" → cool blue/teal suggestions',
      'Upload reference image for instant color extraction'
    ],
    tips: [
      'Try describing moods instead of exact colors',
      'Upload multiple references for varied palettes',
      'AI learns from your color preferences over time'
    ]
  },
  {
    id: 'smart-brush-system',
    name: 'Smart Brush System',
    description: 'Intelligent brushes with auto-fill and pattern recognition',
    category: 'creation',
    version: '1.2',
    isNew: true,
    examples: [
      'Auto-detect skin areas for consistent coloring',
      'Pattern brush for repetitive elements like scales or feathers',
      'Edge-aware fills that respect line art boundaries'
    ],
    tips: [
      'Adjust sensitivity for different art styles',
      'Use preserve details for intricate line work',
      'Blend strength affects color transitions'
    ]
  },
  {
    id: 'version-history',
    name: 'Version History & Rollback',
    description: 'AI-labeled checkpoints with smart rollback capabilities',
    category: 'creation',
    version: '1.2',
    isNew: true,
    examples: [
      'Auto-save at major milestones: "Sketch Complete", "Base Colors Done"',
      'Compare versions side-by-side',
      'Rollback to any previous state instantly'
    ],
    tips: [
      'Save versions before major changes',
      'Use comparison view to spot differences',
      'AI labels help identify the right version'
    ]
  },
  {
    id: 'enhanced-drawing-tools',
    name: 'Enhanced Drawing Tools',
    description: '14 specialized brushes including fine-liner for eyelashes',
    category: 'creation',
    version: '1.2',
    isNew: true,
    examples: [
      'Fine-liner (0.1px) for detailed eyelashes',
      'Texture brush for hair strands and fabric',
      'Airbrush (200px) for soft backgrounds'
    ],
    tips: [
      'Use pressure sensitivity for natural strokes',
      'Adjust tapering for dynamic line weights',
      'Quick presets available for common details'
    ]
  },
  {
    id: 'creative-control-system',
    name: 'Creative Control Levels',
    description: 'Choose how much creative freedom to give AI - from precise to freestyle',
    category: 'system',
    version: '1.2',
    isNew: true,
    examples: [
      '🎯 Precise: "Follow my instructions exactly"',
      '🎨 Balanced: "Good results with smart suggestions"',
      '🎲 Freestyle: "Surprise me with creativity"'
    ],
    tips: [
      'Try different levels for different projects',
      'Balanced mode adapts to your style over time',
      'Freestyle mode works great for inspiration'
    ]
  },
  {
    id: 'personality-guided-ai',
    name: 'Yumi Personality Guides',
    description: 'Different AI personalities provide unique creative guidance',
    category: 'collaboration',
    version: '1.2',
    isNew: true,
    examples: [
      '🎌 Otaku Yumi: Anime-focused suggestions',
      '👩‍🏫 Teacher Yumi: Educational and structured approach',
      '⚡ Genki Yumi: High-energy, optimistic guidance'
    ],
    tips: [
      'Each personality offers different creative perspectives',
      'Switch personalities to break creative blocks',
      'AI remembers your preferred personality'
    ]
  },
  {
    id: 'iterative-refinement',
    name: 'Smart Iterative Refinement',
    description: 'Generate multiple versions and refine with one-click suggestions',
    category: 'creation',
    version: '1.2',
    isNew: true,
    examples: [
      'Generate 3 versions: Main, Alternative, Enhanced',
      'Quick mood adjustments: "Make it softer", "Add more energy"',
      'Style variations with personality influence'
    ],
    tips: [
      'Compare versions before committing',
      'Use quick refinement chips for fast iterations',
      'Personality-matched suggestions marked with ⭐'
    ]
  },
  {
    id: 'writing-versions',
    name: 'Writing Style Variations',
    description: 'Generate multiple writing styles from the same content',
    category: 'writing',
    version: '1.2',
    isNew: true,
    examples: [
      'Transform casual text to formal academic style',
      'Add emotional depth or humor to existing content',
      'Personality-influenced rewrites'
    ],
    tips: [
      'Start with your natural writing style',
      'Use Generate Versions for quick alternatives',
      'Combine elements from different versions'
    ]
  },
  {
    id: 'academic-enhancements',
    name: 'Academic Report Enhancements',
    description: 'Transform reports with citations, analysis, and academic formatting',
    category: 'analysis',
    version: '1.2',
    isNew: true,
    examples: [
      'Auto-suggest citation formats (APA, MLA, IEEE)',
      'Add data analysis sections',
      'Structure for peer review'
    ],
    tips: [
      'Use Teacher Yumi for academic guidance',
      'Generate literature review sections',
      'Include methodology explanations'
    ]
  }
]

// Yumi Chat Responses by Personality
export const YUMI_CHAT_RESPONSES: Record<string, YumiChatResponse> = {
  otaku: {
    personality: 'Otaku',
    responses: {
      greeting: [
        'Konnichiwa! Ready to create some amazing anime art? ✨',
        'Ohayo! I see you\'re exploring the new v1.2 features! Sugoi! 🎌',
        'Hey there, fellow otaku! Let\'s make something kawaii together! 💖'
      ],
      helpOffers: [
        'Want me to show you the new Character Library? It\'s perfect for organizing your waifus! 📚',
        'The Smart Brush System is incredible for anime-style coloring! Want a demo? 🎨',
        'I can help you master the new drawing tools - especially that fine-liner for perfect eyelashes! ✨'
      ],
      encouragement: [
        'Your art style is getting better every day! Ganbatte! 💪',
        'That character design has real potential! Keep going! 🌟',
        'I love seeing your creativity shine through! Tanoshii! 😊'
      ],
      tips: [
        'Pro tip: Use the AI Color Assistant with "anime sunset" for magical lighting! 🌅',
        'Try the Texture Brush for realistic hair strands - it\'s a game changer! ✨',
        'The Version History saves automatically at key points - never lose progress again! 💾'
      ],
      surprises: [
        'Did you know you can say "make it more shoujo-like" and the AI understands? Magic! ✨',
        'Secret: The Fine-liner brush goes down to 0.1px - perfect for manga details! 🖊️',
        'Easter egg: Try "Studio Ghibli vibes" in the AI Color Assistant! 🏞️'
      ]
    }
  },
  teacher: {
    personality: 'Teacher',
    responses: {
      greeting: [
        'Welcome back! I notice you\'re exploring our new v1.2 capabilities. Excellent! 📚',
        'Good day! Ready to learn about the enhanced creative tools? Let\'s begin! 👩‍🏫',
        'Hello there! I\'m excited to guide you through the new features systematically. ✨'
      ],
      helpOffers: [
        'Shall we start with the Creative Control Levels? They\'re quite educational! 🎯',
        'The Academic Report Enhancements might interest you - very structured approach! 📊',
        'Would you like me to explain the Smart Brush System\'s technical capabilities? 🔬'
      ],
      encouragement: [
        'You\'re making excellent progress! Your methodology is improving! 📈',
        'Great work! I can see you\'re applying the techniques we discussed! ⭐',
        'Your analytical approach is very thorough. Well done! 💯'
      ],
      tips: [
        'Remember: Start with Balanced mode to learn, then experiment with other levels! 🎨',
        'The Version History is excellent for tracking your learning progress! 📝',
        'Use the Character Library to study your improvement over time! 📚'
      ],
      surprises: [
        'Advanced tip: The AI learns your patterns and suggests improvements! 🧠',
        'Did you know? Each drawing tool has educational tooltips when you hover! 💡',
        'Hidden feature: The system tracks your most-used techniques for personalized tips! 📊'
      ]
    }
  },
  genki: {
    personality: 'Genki',
    responses: {
      greeting: [
        'YAY! You\'re here! The new v1.2 features are SO EXCITING! ⚡',
        'OMG hi hi! Ready to have FUN with all the amazing new tools?! 🎉',
        'WOOHOO! Let\'s explore these incredible new features together! ✨'
      ],
      helpOffers: [
        'Wanna see the COOLEST feature? The AI Color Assistant is AMAZING! 🌈',
        'OH OH! Let me show you how to make SUPER detailed eyelashes! ✨',
        'The Character Library is like having a WHOLE TEAM of characters! Want to try?! 🎭'
      ],
      encouragement: [
        'WOW! Your creativity is absolutely INCREDIBLE! Keep going! 🚀',
        'AMAZING work! You\'re getting SO good at this! 🌟',
        'That\'s FANTASTIC! I\'m so proud of your progress! 💖'
      ],
      tips: [
        'FUN FACT: Try "party vibes" in the color assistant for instant celebration colors! 🎊',
        'ENERGY TIP: The Airbrush at max size creates AWESOME motion effects! 💨',
        'SECRET: Freestyle mode with me as your guide creates the most DYNAMIC art! ⚡'
      ],
      surprises: [
        'SURPRISE! You can drag characters between different projects! Mind = BLOWN! 🤯',
        'COOL DISCOVERY: The system remembers what makes you excited and suggests more! 🎯',
        'HIDDEN GEM: Voice commands work in some browsers - try "make it brighter"! 🗣️'
      ]
    }
  }
}

// FAQ Data for v1.2
export const AI_ASSISTANT_FAQ: FAQItem[] = [
  {
    id: 'what-is-v12',
    question: 'What\'s new in Yumi-Series v1.2?',
    answer: 'v1.2 introduces the Creative Control System with personality-guided AI, enhanced drawing tools (14 specialized brushes), Character Library, AI Color Assistant, Smart Brush System, and intelligent version management. The biggest innovation is choosing how much creative control to give the AI!',
    category: 'general',
    version: '1.2',
    isNew: true,
    relatedFeatures: ['creative-control-system', 'enhanced-drawing-tools', 'character-library']
  },
  {
    id: 'creative-control-levels',
    question: 'What are Creative Control Levels?',
    answer: 'You can choose how much creative freedom to give the AI: 🎯 Precise (follow instructions exactly), 🎨 Balanced (good results with smart questions), or 🎲 Freestyle (surprise me with creativity). Each level changes how the AI collaborates with you!',
    category: 'features',
    version: '1.2',
    isNew: true,
    relatedFeatures: ['creative-control-system', 'personality-guided-ai']
  },
  {
    id: 'character-library-usage',
    question: 'How do I use the Character Library?',
    answer: 'Save your characters with the Character Library tool in Creation Mode. Auto-generated thumbnails make them easy to find, and you can drag-and-drop to organize by series, mood, or any system you prefer. Perfect for building your anime universe!',
    category: 'creation',
    version: '1.2',
    isNew: true,
    relatedFeatures: ['character-library', 'version-history']
  },
  {
    id: 'ai-color-magic',
    question: 'How does the AI Color Assistant work?',
    answer: 'Instead of picking exact colors, describe the mood! Try "sunset vibes", "ocean depths", or "magical forest". Upload reference images for instant color extraction, or let the AI analyze your artwork and suggest harmonious palettes.',
    category: 'creation',
    version: '1.2',
    isNew: true,
    relatedFeatures: ['ai-color-assistant', 'smart-brush-system']
  },
  {
    id: 'brush-tools-guide',
    question: 'What are the new specialized brushes?',
    answer: 'v1.2 includes 14 specialized tools: Fine-liner (0.1px for eyelashes), Texture brush (hair/fabric), Detail brushes, Calligraphy pen, Pixel brush, and more! Each has unique properties like pressure sensitivity and tapering. Quick presets available for common details.',
    category: 'creation',
    version: '1.2',
    isNew: true,
    relatedFeatures: ['enhanced-drawing-tools', 'smart-brush-system']
  },
  {
    id: 'personality-guides',
    question: 'What do the different Yumi personalities do?',
    answer: 'Each personality offers unique creative guidance: 🎌 Otaku (anime expertise), 👩‍🏫 Teacher (structured approach), ⚡ Genki (high energy), 😤 Tsundere (dramatic flair), 🌸 Imouto (cute style), 👫 Classmate (collaborative), ❄️ Kuudere (analytical). Switch anytime for fresh perspectives!',
    category: 'collaboration',
    version: '1.2',
    isNew: true,
    relatedFeatures: ['personality-guided-ai', 'creative-control-system']
  },
  {
    id: 'version-management',
    question: 'How does Version History work?',
    answer: 'The system auto-saves at key milestones with AI-generated labels like "Sketch Complete" or "Colors Added". Compare versions side-by-side, rollback instantly, or combine elements from different versions. Never lose your progress again!',
    category: 'creation',
    version: '1.2',
    isNew: true,
    relatedFeatures: ['version-history', 'iterative-refinement']
  },
  {
    id: 'writing-enhancements',
    question: 'What writing improvements are in v1.2?',
    answer: 'Generate multiple writing styles from the same content! Transform casual to formal, add emotional depth, or get personality-influenced rewrites. The Academic Report mode includes citation suggestions, data analysis sections, and peer-review formatting.',
    category: 'writing',
    version: '1.2',
    isNew: true,
    relatedFeatures: ['writing-versions', 'academic-enhancements', 'personality-guided-ai']
  },
  {
    id: 'smart-suggestions',
    question: 'How do smart suggestions work?',
    answer: 'The AI learns your preferences and suggests improvements based on your history. Personality-matched suggestions are marked with ⭐. Quick refinement chips let you adjust mood, style, or details with one click. The system gets smarter the more you use it!',
    category: 'system',
    version: '1.2',
    isNew: true,
    relatedFeatures: ['iterative-refinement', 'personality-guided-ai', 'creative-control-system']
  },
  {
    id: 'getting-started-v12',
    question: 'How do I get started with v1.2 features?',
    answer: 'Start in any mode (Creation, Writing, or Report), choose a Creative Control level, pick a Yumi personality guide, then explore! Look for the ✨ "Generate Versions" buttons to see the magic in action. The floating Creative Control Panel (top-left) lets you adjust settings anytime.',
    category: 'general',
    version: '1.2',
    isNew: true,
    relatedFeatures: ['creative-control-system', 'personality-guided-ai', 'iterative-refinement']
  }
]

// Export collections for easy access
export const getNewFeatures = () => AI_ASSISTANT_FEATURES.filter(f => f.isNew)
export const getFeaturesByCategory = (category: string) => AI_ASSISTANT_FEATURES.filter(f => f.category === category)
export const getNewFAQ = () => AI_ASSISTANT_FAQ.filter(f => f.isNew)
export const getYumiResponse = (personality: string, type: keyof YumiChatResponse['responses']) => {
  const responses = YUMI_CHAT_RESPONSES[personality]?.responses[type] || YUMI_CHAT_RESPONSES.otaku.responses[type]
  return responses[Math.floor(Math.random() * responses.length)]
} 