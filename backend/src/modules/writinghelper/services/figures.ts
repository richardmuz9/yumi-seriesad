import { Figure } from '../../shared/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ChartConfig {
  type: string;
  data: any;
  options?: any;
}

// Simple chart configuration generator instead of rendering
const generateChartConfig = (type: string, data: any, options: any = {}): ChartConfig => {
  return {
    type,
    data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: options.title || 'Chart'
        }
      },
      ...options
    }
  };
};

export const createFigure = async (
  userId: string,
  type: 'image' | 'chart',
  title: string,
  caption?: string,
  source?: string,
  data?: any,
  config?: any
): Promise<Figure> => {
  const figureData: any = {
    userId,
    type,
    title,
    caption: caption || null,
    source: source || null,
    format: type === 'chart' ? 'json' : 'png'
  };

  if (type === 'chart' && data) {
    // Store chart configuration instead of rendered image
    const chartConfig = generateChartConfig(config?.chartType || 'bar', data, config);
    figureData.dataJson = JSON.stringify(data);
    figureData.configJson = JSON.stringify(chartConfig);
  }

  return await prisma.figure.create({
    data: figureData
  });
};

export const getUserFigures = async (userId: string): Promise<Figure[]> => {
  return await prisma.figure.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

export const getFigureById = async (id: string): Promise<Figure | null> => {
  return await prisma.figure.findUnique({
    where: { id }
  });
};

export const updateFigure = async (
  id: string,
  updates: Partial<{
    title: string;
    caption: string;
    source: string;
    data: any;
    config: any;
  }>
): Promise<Figure> => {
  const updateData: any = {};
  
  if (updates.title) updateData.title = updates.title;
  if (updates.caption !== undefined) updateData.caption = updates.caption;
  if (updates.source !== undefined) updateData.source = updates.source;
  if (updates.data) updateData.dataJson = JSON.stringify(updates.data);
  if (updates.config) updateData.configJson = JSON.stringify(updates.config);

  return await prisma.figure.update({
    where: { id },
    data: updateData
  });
};

export const deleteFigure = async (id: string): Promise<void> => {
  await prisma.figure.delete({
    where: { id }
  });
};

export const exportFigure = async (id: string, format: 'png' | 'svg' | 'pdf' | 'json'): Promise<any> => {
  const figure = await getFigureById(id);
  if (!figure) {
    throw new Error('Figure not found');
  }

  if (format === 'json') {
    return {
      title: figure.title,
      caption: figure.caption,
      data: figure.dataJson ? JSON.parse(figure.dataJson) : null,
      config: figure.configJson ? JSON.parse(figure.configJson) : null
    };
  }

  // For image formats, return the chart configuration
  // Frontend can use libraries like Chart.js to render
  return {
    type: 'chart_config',
    config: figure.configJson ? JSON.parse(figure.configJson) : null,
    format,
    message: 'Use this configuration with Chart.js or similar library on the frontend'
  };
};

export class FiguresService {
  // Instance methods for compatibility
  async saveFigure(userId: string, figureData: any): Promise<Figure> {
    return createFigure(
      userId,
      figureData.type || 'image',
      figureData.title || figureData.name,
      figureData.caption,
      figureData.source,
      figureData.data,
      figureData.config
    );
  }

  async getFigures(userId: string): Promise<Figure[]> {
    return getUserFigures(userId);
  }

  async updateFigure(userId: string, id: string, updates: any): Promise<Figure> {
    return updateFigure(id, updates);
  }

  async deleteFigure(userId: string, id: string): Promise<void> {
    return deleteFigure(id);
  }

  async exportFigure(id: string, format: 'png' | 'svg' | 'pdf' | 'json'): Promise<any> {
    return exportFigure(id, format);
  }

  // Static methods
  static async createFigure(
    userId: string,
    type: 'image' | 'chart',
    title: string,
    caption?: string,
    source?: string,
    data?: any,
    config?: any
  ): Promise<Figure> {
    return createFigure(userId, type, title, caption, source, data, config);
  }

  static async getUserFigures(userId: string): Promise<Figure[]> {
    return getUserFigures(userId);
  }

  static async getFigureById(id: string): Promise<Figure | null> {
    return getFigureById(id);
  }

  static async updateFigure(
    id: string,
    updates: Partial<{
      title: string;
      caption: string;
      source: string;
      data: any;
      config: any;
    }>
  ): Promise<Figure> {
    return updateFigure(id, updates);
  }

  static async deleteFigure(id: string): Promise<void> {
    return deleteFigure(id);
  }

  static async exportFigure(id: string, format: 'png' | 'svg' | 'pdf' | 'json'): Promise<any> {
    return exportFigure(id, format);
  }
} 