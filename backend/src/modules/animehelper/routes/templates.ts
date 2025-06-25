import { Request } from 'express'
import { characterTemplates as templateData } from '../data'
import { CharacterTemplate } from '../types'

const characterTemplates: CharacterTemplate[] = templateData;

// Get all character templates
export const getTemplates = async (_req: Request): Promise<CharacterTemplate[]> => {
  return characterTemplates;
} 