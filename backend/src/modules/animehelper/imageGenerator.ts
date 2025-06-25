import { StructuredPrompt } from './types';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);
const MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0";

export async function generateImage(
  prompt: StructuredPrompt
): Promise<string> {
  try {
    // Combine all prompt parts into a cohesive prompt
    const fullPrompt = [
      prompt.subject,
      `Pose: ${prompt.pose}`,
      `Expression: ${prompt.expression}`,
      `Outfit: ${prompt.clothingAndAccessories}`,
      `Hair and colors: ${prompt.hairAndColorPalette}`,
      `Lighting and mood: ${prompt.lightingAndMood}`,
      `Style: ${prompt.artStyleAndDetail}`,
      `Quality and finish: ${prompt.finishAndPostProcess}`
    ].filter(Boolean).join(', ');

    // Generate image using Hugging Face
    const response = await hf.textToImage({
      inputs: fullPrompt,
      model: MODEL_ID,
      parameters: {
        negative_prompt: prompt.negativePrompt,
        num_inference_steps: 50,
        guidance_scale: 7.5
      }
    });

    // Handle response properly
    let base64Image: string;
    
    if (Buffer.isBuffer(response)) {
      base64Image = response.toString('base64');
    } else if (typeof response === 'string') {
      // If it's already a string (base64), return as data URL
      return response.startsWith('data:') ? response : `data:image/jpeg;base64,${response}`;
    } else {
      // If it's a Blob or ArrayBuffer, convert to base64
      const buffer = Buffer.from(await (response as any).arrayBuffer());
      base64Image = buffer.toString('base64');
    }
    
    // Return data URL
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}