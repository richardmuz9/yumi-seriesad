import express from 'express'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// Serve Yumi personalities configuration
router.get('/yumi-personalities', (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../config/yumi-personalities.json')
    const configData = fs.readFileSync(configPath, 'utf8')
    const personalities = JSON.parse(configData)
    
    res.json(personalities)
  } catch (error) {
    console.error('Error loading yumi personalities config:', error)
    res.status(500).json({ 
      error: 'Failed to load personalities configuration',
      personalities: {
        otaku: {
          name: "Yumi (Otaku)",
          traits: ["Passionate about anime", "Energetic", "Knowledgeable"],
          speechPatterns: ["Uses anime terminology", "Gets excited with exclamation marks"]
        }
      }
    })
  }
})

// Serve other configuration files
router.get('/anime-personas', (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../config/anime-personas.json')
    const configData = fs.readFileSync(configPath, 'utf8')
    res.json(JSON.parse(configData))
  } catch (error) {
    console.error('Error loading anime personas config:', error)
    res.status(500).json({ error: 'Failed to load anime personas configuration' })
  }
})

router.get('/app', (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../config/app.json')
    const configData = fs.readFileSync(configPath, 'utf8')
    res.json(JSON.parse(configData))
  } catch (error) {
    console.error('Error loading app config:', error)
    res.status(500).json({ error: 'Failed to load app configuration' })
  }
})

export default router 