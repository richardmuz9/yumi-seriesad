import express, { Express } from 'express'
import { optionalAuth } from '../../shared'
import { authenticateUser } from '../../../auth'
import { wrapAuthHandler } from '../../shared/types'
import { AuthRequest } from '../../shared'
import { db } from '../../../database'

export function setupTrendsRoutes(app: Express): void {
  // Get trending hashtags and topics for a platform
  app.get('/api/trends/:platform', optionalAuth, (req, res): void => {
    try {
      const { platform } = req.params
      
      // Mock trending data - in production this would come from actual social media APIs
      const trendingData = {
        linkedin: {
          trends: [
            { tag: '#Leadership', count: 15420 },
            { tag: '#Innovation', count: 12890 },
            { tag: '#AI', count: 11250 },
            { tag: '#Productivity', count: 9870 },
            { tag: '#RemoteWork', count: 8540 },
            { tag: '#Technology', count: 7320 },
            { tag: '#Business', count: 6890 },
            { tag: '#Career', count: 6240 },
            { tag: '#Marketing', count: 5780 },
            { tag: '#Networking', count: 5120 }
          ],
          platform: 'linkedin'
        },
        twitter: {
          trends: [
            { tag: '#TechNews', count: 25600 },
            { tag: '#AI', count: 18790 },
            { tag: '#Crypto', count: 16540 },
            { tag: '#Breaking', count: 14230 },
            { tag: '#Innovation', count: 12890 },
            { tag: '#Startup', count: 11650 },
            { tag: '#Development', count: 10420 },
            { tag: '#Marketing', count: 9180 },
            { tag: '#Design', count: 8750 },
            { tag: '#Business', count: 7890 }
          ],
          platform: 'twitter'
        },
        xiaohongshu: {
          trends: [
            { tag: '#美妆', count: 32100 },
            { tag: '#护肤', count: 28750 },
            { tag: '#穿搭', count: 24860 },
            { tag: '#旅行', count: 21340 },
            { tag: '#美食', count: 19580 },
            { tag: '#生活', count: 17920 },
            { tag: '#摄影', count: 15640 },
            { tag: '#健身', count: 13280 },
            { tag: '#学习', count: 11750 },
            { tag: '#工作', count: 10490 }
          ],
          platform: 'xiaohongshu'
        },
        instagram: {
          trends: [
            { tag: '#photography', count: 45600 },
            { tag: '#fashion', count: 38920 },
            { tag: '#travel', count: 32840 },
            { tag: '#food', count: 28750 },
            { tag: '#fitness', count: 25630 },
            { tag: '#art', count: 22480 },
            { tag: '#lifestyle', count: 19350 },
            { tag: '#beauty', count: 17240 },
            { tag: '#nature', count: 15860 },
            { tag: '#motivation', count: 13570 }
          ],
          platform: 'instagram'
        }
      }

      const trends = trendingData[platform as keyof typeof trendingData]
      
      if (!trends) {
        res.status(404).json({ error: `Platform ${platform} not supported` })
        return
      }

      res.json(trends)
    } catch (error) {
      console.error('Trends error:', error)
      res.status(500).json({ error: 'Failed to fetch trends' })
    }
  })

  app.get('/api/writing-helper/trends', authenticateUser, wrapAuthHandler(async (req: AuthRequest) => {
    // Get trending topics and hashtags
    const userId = req.user!.id
    const trends = await db.getTrendingTopics()
    return trends
  }))

  app.post('/api/writing-helper/trends', authenticateUser, wrapAuthHandler(async (req: AuthRequest) => {
    // Add a new trend
    const userId = req.user!.id
    const { topic, hashtags } = req.body
    const trend = await db.addTrendingTopic(topic, hashtags)
    return trend
  }))

  app.delete('/api/writing-helper/trends/:id', authenticateUser, wrapAuthHandler(async (req: AuthRequest) => {
    // Delete a trend
    const userId = req.user!.id
    const trendId = req.params.id
    await db.deleteTrendingTopic(trendId)
    return { success: true }
  }))
} 