import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { TokenTransaction } from './types'

// Initialize Prisma client with logging in development
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

// Database interface
export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  tokensRemaining: number
  totalTokensUsed: number
  freeTokensUsedThisMonth: number
  freeTokensResetDate: Date
  subscriptionStatus: 'free' | 'premium_monthly' | 'paid_tokens'
  subscriptionId?: string
  stripeCustomerId?: string
  dailyTokenLimit?: number
  lastDailyReset?: Date
  createdAt: Date
  updatedAt: Date
  role?: string
}

export interface ChatHistory {
  id: number
  userId: number
  sessionId: string
  messages: string // JSON string of messages
  provider: string
  model: string
  mode: 'agent' | 'assistant'
  tokensUsed: number
  createdAt: Date
}

// Template interface
export interface Template {
  id: string
  userId: string
  name: string
  content: string
  type: string
  createdAt: Date
  updatedAt: Date
}

// Trending topic interface
export interface TrendingTopic {
  id: string
  topic: string
  hashtags: string[]
  count: number
  createdAt: Date
  updatedAt: Date
}

// Artwork contribution interfaces
export interface ArtworkContribution {
  id: string
  userId: string
  filename: string
  originalName: string
  fileSize: number
  mimeType: string
  status: 'pending' | 'approved' | 'rejected'
  rewardClaimed: boolean
  rewardAmount: number
  submittedAt: Date
  reviewedAt: Date | null
  reviewedBy: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ContributionReward {
  id: string
  contributionId: string
  userId: string
  timeshardsAwarded: number
  reason: string
  awardedAt: Date
  createdAt: Date
}

export class Database {
  private prisma: PrismaClient
  private retryCount: number = 0
  private maxRetries: number = 3
  private retryDelay: number = 5000 // 5 seconds

  constructor() {
    this.prisma = prisma
  }

  async initialize() {
    while (this.retryCount < this.maxRetries) {
      try {
        await this.prisma.$connect()
        console.log('✅ Database connected successfully')
        
        // Reset retry count on successful connection
        this.retryCount = 0
        return
      } catch (error) {
        console.error(`❌ Database connection error:`, error)
        
        this.retryCount++
        if (this.retryCount < this.maxRetries) {
          console.log(`⏳ Retrying in ${this.retryDelay/1000} seconds...`)
          console.log(`📊 Database connection attempt ${this.retryCount + 1}/${this.maxRetries}...`)
          await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        } else {
          console.error('❌ Max retries reached. Could not connect to database.')
          throw error
        }
      }
    }
  }

  async createUser(email: string, username: string, passwordHash: string): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        role: 'user',
        tokensRemaining: 0,
        billing: {
          create: {
            subscriptionStatus: 'free',
            availableTokens: 10000,
            tokenSource: 'free_monthly',
            totalTokensUsedJson: JSON.stringify({ openai: 0, claude: 0, qwen: 0 }),
            freeTokensRemainingJson: JSON.stringify({ openai: 10000, claude: 10000, qwen: 1000000 })
          }
        }
      },
      include: {
        billing: true
      }
    })

    return {
      ...user,
      totalTokensUsed: JSON.parse(user.billing?.totalTokensUsedJson || '{}').openai || 0,
      freeTokensUsedThisMonth: 0,
      freeTokensResetDate: user.billing?.lastTokenResetDate || new Date(),
      subscriptionStatus: (user.billing?.subscriptionStatus || 'free') as User['subscriptionStatus']
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        billing: true
      }
    });

    if (!user) return null;

    return {
      ...user,
      totalTokensUsed: JSON.parse(user.billing?.totalTokensUsedJson || '{}').openai || 0,
      freeTokensUsedThisMonth: 0,
      freeTokensResetDate: user.billing?.lastTokenResetDate || new Date(),
      subscriptionStatus: (user.billing?.subscriptionStatus || 'free') as User['subscriptionStatus']
    };
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        billing: true
      }
    });

    if (!user) return null;

    return {
      ...user,
      totalTokensUsed: JSON.parse(user.billing?.totalTokensUsedJson || '{}').openai || 0,
      freeTokensUsedThisMonth: 0,
      freeTokensResetDate: user.billing?.lastTokenResetDate || new Date(),
      subscriptionStatus: (user.billing?.subscriptionStatus || 'free') as User['subscriptionStatus']
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        billing: true
      }
    })

    if (!user) return null

    return {
      ...user,
      totalTokensUsed: JSON.parse(user.billing?.totalTokensUsedJson || '{}').openai || 0,
      freeTokensUsedThisMonth: 0,
      freeTokensResetDate: user.billing?.lastTokenResetDate || new Date(),
      subscriptionStatus: (user.billing?.subscriptionStatus || 'free') as User['subscriptionStatus']
    }
  }

  async updateUserTokens(userId: string, tokensRemaining: number, totalTokensUsed: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { billing: true }
    })

    if (!user || !user.billing) throw new Error('User or billing not found')

    const totalTokensUsedJson = JSON.parse(user.billing.totalTokensUsedJson)
    totalTokensUsedJson.openai = totalTokensUsed

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        tokensRemaining,
        billing: {
          update: {
            availableTokens: tokensRemaining,
            totalTokensUsedJson: JSON.stringify(totalTokensUsedJson)
          }
        }
      }
    })
  }

  async addTokenTransaction(
    userId: string, 
    type: 'purchase' | 'usage' | 'bonus', 
    amount: number, 
    description: string,
    model?: string,
    stripePaymentId?: string
  ): Promise<TokenTransaction> {
    const transaction = await this.prisma.tokenTransaction.create({
      data: {
        userId,
        type,
        amount,
        description,
        model,
        stripePaymentId
      }
    })

    return {
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type as 'purchase' | 'usage' | 'bonus',
      amount: transaction.amount,
      model: transaction.model || undefined,
      description: transaction.description,
      stripePaymentId: transaction.stripePaymentId || undefined,
      createdAt: transaction.createdAt
    }
  }

  async runRawSQL(sql: string, params?: any[]): Promise<any> {
    return await this.prisma.$queryRawUnsafe(sql, ...(params || []))
  }

  async close() {
    await this.prisma.$disconnect()
  }

  async getArtworkContribution(id: string): Promise<ArtworkContribution | null> {
    const contribution = await this.prisma.artworkContribution.findUnique({
      where: { id }
    })

    if (!contribution) return null

    return {
      id: contribution.id,
      userId: contribution.userId,
      filename: contribution.filename,
      originalName: contribution.originalName,
      fileSize: contribution.fileSize,
      mimeType: contribution.mimeType,
      status: contribution.status as 'pending' | 'approved' | 'rejected',
      rewardClaimed: contribution.rewardClaimed,
      rewardAmount: contribution.rewardAmount,
      submittedAt: contribution.submittedAt,
      reviewedAt: contribution.reviewedAt || null,
      reviewedBy: contribution.reviewedBy || null,
      createdAt: contribution.createdAt,
      updatedAt: contribution.updatedAt
    }
  }

  async approveArtworkContribution(id: string, reward: { tokensAwarded: number; bonusTokens?: number }): Promise<{ contribution: ArtworkContribution; reward: ContributionReward }> {
    const contribution = await this.prisma.artworkContribution.update({
      where: { id },
      data: {
        status: 'approved' as const,
        reviewedAt: new Date(),
        rewardAmount: reward.tokensAwarded + (reward.bonusTokens || 0)
      }
    })

    const contributionReward = await this.prisma.contributionReward.create({
      data: {
        userId: contribution.userId,
        contributionId: contribution.id,
        timeshardsAwarded: reward.tokensAwarded + (reward.bonusTokens || 0),
        reason: 'Artwork contribution approved',
        awardedAt: new Date()
      }
    })

    return {
      contribution: {
        id: contribution.id,
        userId: contribution.userId,
        filename: contribution.filename,
        originalName: contribution.originalName,
        fileSize: contribution.fileSize,
        mimeType: contribution.mimeType,
        status: contribution.status as 'pending' | 'approved' | 'rejected',
        rewardClaimed: contribution.rewardClaimed,
        rewardAmount: contribution.rewardAmount,
        submittedAt: contribution.submittedAt,
        reviewedAt: contribution.reviewedAt || null,
        reviewedBy: contribution.reviewedBy || null,
        createdAt: contribution.createdAt,
        updatedAt: contribution.updatedAt
      },
      reward: {
        id: contributionReward.id,
        userId: contributionReward.userId,
        contributionId: contributionReward.contributionId,
        timeshardsAwarded: contributionReward.timeshardsAwarded,
        reason: contributionReward.reason,
        awardedAt: contributionReward.awardedAt,
        createdAt: contributionReward.createdAt
      }
    }
  }

  async rejectArtworkContribution(id: string, reason: string): Promise<ArtworkContribution> {
    const contribution = await this.prisma.artworkContribution.update({
      where: { id },
      data: {
        status: 'rejected' as const,
        reviewedAt: new Date()
      }
    })

    return {
      id: contribution.id,
      userId: contribution.userId,
      filename: contribution.filename,
      originalName: contribution.originalName,
      fileSize: contribution.fileSize,
      mimeType: contribution.mimeType,
      status: contribution.status as 'pending' | 'approved' | 'rejected',
      rewardClaimed: contribution.rewardClaimed,
      rewardAmount: contribution.rewardAmount,
      submittedAt: contribution.submittedAt,
      reviewedAt: contribution.reviewedAt || null,
      reviewedBy: contribution.reviewedBy || null,
      createdAt: contribution.createdAt,
      updatedAt: contribution.updatedAt
    }
  }

  async getUserTemplates(userId: string): Promise<Template[]> {
    return []
  }

  async saveTemplate(userId: string, name: string, content: string, type: string): Promise<Template> {
    return {
      id: uuidv4(),
      userId,
      name,
      content,
      type,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async updateTemplate(id: string, userId: string, name: string, content: string, type: string): Promise<Template> {
    return {
      id,
      userId,
      name,
      content,
      type,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async deleteTemplate(id: string, userId: string): Promise<void> {
    // No-op since we don't have template storage yet
  }

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    return []
  }

  async addTrendingTopic(topic: string, hashtags: string[]): Promise<TrendingTopic> {
    return {
      id: uuidv4(),
      topic,
      hashtags,
      count: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async deleteTrendingTopic(id: string): Promise<void> {
    // No-op since we don't have trending topics storage yet
  }
}

// Create and export database instance
export const db = new Database() 