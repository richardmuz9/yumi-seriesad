import { Response } from 'express'
import { AuthRequest } from '../../../auth'

interface CommunityStyle {
  id: string;
  name: string;
  creator: string;
  description: string;
  thumbnail: string;
  downloads: number;
  rating: number;
  tags: string[];
  created: string;
}

interface StylesResponse {
  styles: CommunityStyle[];
  total: number;
  categories: string[];
  success: boolean;
}

interface StyleDownloadResponse {
  styleId: string;
  downloadUrl: string;
  success: boolean;
  message: string;
}

// Get community styles from marketplace
export const getStyles = async (req: AuthRequest, res: Response): Promise<StylesResponse | undefined> => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'User not authenticated' })
    return
  }

  // Mock community styles data - in production this would come from a database
  const communityStyles: CommunityStyle[] = [
    {
      id: 'style_001',
      name: 'Pastel Dreams',
      creator: 'ArtistName',
      description: 'Soft pastel colors with dreamy atmosphere',
      thumbnail: '/marketplace/pastel-dreams-thumb.png',
      downloads: 1234,
      rating: 4.8,
      tags: ['pastel', 'soft', 'dreamy'],
      created: '2024-01-15'
    },
    {
      id: 'style_002',
      name: 'Neon Cyberpunk Pro',
      creator: 'CyberArtist',
      description: 'Advanced cyberpunk style with enhanced neon effects',
      thumbnail: '/marketplace/neon-cyber-thumb.png',
      downloads: 892,
      rating: 4.9,
      tags: ['cyberpunk', 'neon', 'futuristic'],
      created: '2024-01-20'
    },
    {
      id: 'style_003',
      name: 'Vintage Manga',
      creator: 'RetroMangaka',
      description: 'Classic 90s manga style with authentic screentones',
      thumbnail: '/marketplace/vintage-manga-thumb.png',
      downloads: 2156,
      rating: 4.7,
      tags: ['vintage', 'manga', 'retro'],
      created: '2024-01-10'
    }
  ]

  const { sort, search } = req.query
  let filteredStyles = communityStyles

  // Filter by search term
  if (search) {
    filteredStyles = filteredStyles.filter(style =>
      style.name.toLowerCase().includes((search as string).toLowerCase()) ||
      style.tags.some(tag => tag.toLowerCase().includes((search as string).toLowerCase()))
    )
  }

  // Sort results
  if (sort === 'popular') {
    filteredStyles.sort((a, b) => b.downloads - a.downloads)
  } else if (sort === 'rating') {
    filteredStyles.sort((a, b) => b.rating - a.rating)
  } else if (sort === 'newest') {
    filteredStyles.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
  }

  return {
    styles: filteredStyles,
    total: filteredStyles.length,
    categories: ['All', 'Popular', 'New', 'Cyberpunk', 'Pastel', 'Vintage'],
    success: true
  };
}

// Download community style
export const downloadStyle = async (req: AuthRequest, res: Response): Promise<StyleDownloadResponse | undefined> => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'User not authenticated' })
    return
  }

  const { styleId } = req.params

  // In a real implementation, this would:
  // 1. Verify the user has permission to download
  // 2. Increment download counter
  // 3. Return the actual style data/files

  return {
    styleId,
    downloadUrl: `/marketplace/styles/${styleId}/download`,
    success: true,
    message: 'Style downloaded successfully'
  };
} 