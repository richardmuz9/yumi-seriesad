export interface TokenTransaction {
  id: string
  userId: string
  type: 'purchase' | 'usage' | 'bonus'
  amount: number
  model?: string
  description: string
  stripePaymentId?: string
  createdAt: Date
}

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
  userId: string
  contributionId: string
  timeshardsAwarded: number
  reason: string
  awardedAt: Date
  createdAt: Date
}

export interface Template {
  id: string
  userId: string
  name: string
  content: string
  type: string
  createdAt: Date
  updatedAt: Date
}

export interface TrendingTopic {
  id: string
  topic: string
  hashtags: string[]
  count: number
  createdAt: Date
  updatedAt: Date
} 