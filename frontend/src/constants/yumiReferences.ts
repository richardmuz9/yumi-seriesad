// Yumi Reference Library - AI-generated images for character creation
// Currently 3 images, easily extensible to more in the future

export interface YumiReference {
  id: string;
  src: string;
  title: string;
  description: string;
  tags: string[];
}

// Current reference images (can be extended)
export const YUMI_REFS: YumiReference[] = [
  {
    id: 'yumi-1',
    src: '/references/yumi-1.png',
    title: 'Yumi Madi Style',
    description: 'Classic Yumi character design with signature style',
    tags: ['classic', 'signature', 'character-design']
  },
  {
    id: 'yumi-2', 
    src: '/references/yumi-2.png',
    title: 'Yumi Sort Style',
    description: 'Alternative Yumi design with unique styling',
    tags: ['alternative', 'unique', 'styling']
  },
  {
    id: 'yumi-3',
    src: '/references/yumi-3.png', 
    title: 'Yumi with Bubble Tea',
    description: 'Yumi enjoying bubble tea - casual scene reference',
    tags: ['casual', 'bubble-tea', 'lifestyle', 'scene']
  }
];

// Helper functions
export const getYumiReferenceById = (id: string): YumiReference | undefined => {
  return YUMI_REFS.find(ref => ref.id === id);
};

export const getYumiReferencesByTag = (tag: string): YumiReference[] => {
  return YUMI_REFS.filter(ref => ref.tags.includes(tag));
};

export const getAllYumiReferences = (): YumiReference[] => {
  return YUMI_REFS;
};

// For future expansion - easy to add more references
export const addYumiReference = (reference: YumiReference): void => {
  YUMI_REFS.push(reference);
};

// Reference categories for filtering (extensible)
export const YUMI_CATEGORIES = [
  { id: 'all', label: 'All References', count: YUMI_REFS.length },
  { id: 'classic', label: 'Classic Designs', count: getYumiReferencesByTag('classic').length },
  { id: 'casual', label: 'Casual Scenes', count: getYumiReferencesByTag('casual').length },
  { id: 'alternative', label: 'Alternative Styles', count: getYumiReferencesByTag('alternative').length }
];

// Legal compliance note
export const REFERENCE_DISCLAIMER = `
All Yumi reference images are AI-generated original content owned by our platform. 
These images are provided for drawing reference and inspiration purposes only.
By using these references, you agree to respect the original artistic style and intent.
`;

// Future expansion placeholder
export const FUTURE_REFS_PLACEHOLDER = Array.from({ length: 7 }, (_, i) => ({
  id: `yumi-${i + 4}`,
  src: `/references/yumi-${i + 4}.png`,
  title: `Yumi Reference ${i + 4}`,
  description: 'Future reference image - coming soon!',
  tags: ['coming-soon']
})); 