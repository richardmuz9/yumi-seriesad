import { readFileSync } from 'fs'
import { join } from 'path'

// Load configuration files
export const modelsConfig = JSON.parse(readFileSync(join(__dirname, '../../config/models.json'), 'utf8'))
export const promptsConfig = JSON.parse(readFileSync(join(__dirname, '../../config/prompts.json'), 'utf8'))
export const appConfig = JSON.parse(readFileSync(join(__dirname, '../../config/app.json'), 'utf8'))
export const postTemplatesConfig = JSON.parse(readFileSync(join(__dirname, '../../config/post-templates.json'), 'utf8'))
export const animePersonasConfig = JSON.parse(readFileSync(join(__dirname, '../../config/anime-personas.json'), 'utf8'))
export const contentBlocksConfig = JSON.parse(readFileSync(join(__dirname, '../../config/content-blocks.json'), 'utf8'))
export const userPreferencesConfig = JSON.parse(readFileSync(join(__dirname, '../../config/user-preferences.json'), 'utf8')) 