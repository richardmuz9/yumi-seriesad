export interface CuratedPrompt {
  id: string;
  theme: 'swimsuit' | 'maid' | 'seifuku';
  title: string;
  prompt: string;
  negativePrompt: string;
  baseCharacter: {
    hairColor: string;
    eyeColor: string;
    name: string;
  };
}

export const CURATED_PROMPTS: CuratedPrompt[] = [
  {
    id: 'swimsuit-yumi',
    theme: 'swimsuit',
    title: '🌊 Summer Beach Theme',
    prompt: "A stunning anime girl with long white hair and mesmerizing blue-purple eyes, standing on a sunny beach wearing a frilly white and blue bikini. She has a cheerful smile, gentle waves in the background, and holds a parasol. Her delicate hair flows with the sea breeze, and sunlight sparkles off the water.",
    negativePrompt: "nsfw, nude, revealing, inappropriate content, poor quality, low quality, bad anatomy, bad proportions, blurry, distorted",
    baseCharacter: {
      hairColor: 'white',
      eyeColor: 'blue-purple',
      name: 'Yumi'
    }
  },
  {
    id: 'maid-yumi',
    theme: 'maid',
    title: '🧹 Elegant Maid Theme',
    prompt: "An elegant anime maid character with long white hair and blue-purple eyes, wearing a detailed black and white French maid outfit with lace and ribbons. She is slightly blushing, holding a silver tray with tea, standing in a classy Victorian-style café. Her hair is styled neatly with a cute headband, and soft lighting adds warmth to the scene.",
    negativePrompt: "nsfw, nude, revealing, inappropriate content, poor quality, low quality, bad anatomy, bad proportions, blurry, distorted",
    baseCharacter: {
      hairColor: 'white',
      eyeColor: 'blue-purple',
      name: 'Yumi'
    }
  },
  {
    id: 'seifuku-yumi',
    theme: 'seifuku',
    title: '🎓 School Uniform Theme',
    prompt: "A cute anime schoolgirl with long white hair and blue-purple eyes, wearing a traditional Japanese sailor uniform (seifuku) with a blue skirt and ribbon. She's standing on a school rooftop with the wind gently blowing her hair, holding a bento box with a shy expression. Cherry blossoms are floating in the air.",
    negativePrompt: "nsfw, nude, revealing, inappropriate content, poor quality, low quality, bad anatomy, bad proportions, blurry, distorted",
    baseCharacter: {
      hairColor: 'white',
      eyeColor: 'blue-purple',
      name: 'Yumi'
    }
  }
]; 