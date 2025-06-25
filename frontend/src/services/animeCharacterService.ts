import { GeneratedImage } from '../anime-chara-helper/types';
import { api } from './api';

export const generateAnimeCharacter = async (
  prompt: string
): Promise<GeneratedImage> => {
  return api.post<GeneratedImage>('/anime-character', { prompt }).then(r => r.data);
}; 