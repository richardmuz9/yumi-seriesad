/// <reference types="jest" />
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import axios from 'axios';
import { PlagiarismService, PlagiarismError } from '../plagiarism';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PlagiarismService', () => {
  let plagiarismService: PlagiarismService;

  beforeEach(() => {
    process.env.PCHECK_API_TOKEN = 'test_token';
    process.env.EDENAI_PLAG_KEY = 'test_key';
    plagiarismService = new PlagiarismService();

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should check plagiarism using both services', async () => {
    // Mock PlagiarismCheck.org API responses
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: {
          text: {
            id: 'test_id'
          }
        }
      }
    });
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          data: {
            text: {
              status: 'completed'
            }
          }
        }
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            percent: 25,
            matches: [
              {
                text: 'test text',
                source_url: 'http://example.com',
                percent: 25
              }
            ]
          }
        }
      });

    // Mock Eden AI API response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        copyleaks: {
          plagiarism_score: 30,
          items: [
            {
              matched_text: 'test text',
              url: 'http://example.com',
              similarity_score: 30
            }
          ]
        }
      }
    });

    const text = 'This is a test text to check for plagiarism.';
    const result = await plagiarismService.checkPlagiarism(text);

    expect(result.score).toBe(27.5); // Average of 25 and 30
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0]).toEqual({
      text: 'test text',
      source: 'http://example.com',
      similarity: 30
    });
    expect(result.matches[1]).toEqual({
      text: 'test text',
      source: 'http://example.com',
      similarity: 25
    });
  });

  it('should handle missing API keys', async () => {
    delete process.env.PCHECK_API_TOKEN;
    delete process.env.EDENAI_PLAG_KEY;
    
    expect(() => new PlagiarismService()).toThrow(
      new PlagiarismError(
        'CONFIG_ERROR',
        'Missing required API keys for plagiarism checking services'
      )
    );
  });

  it('should handle validation errors', async () => {
    await expect(plagiarismService.checkPlagiarism('')).rejects.toThrow(
      new PlagiarismError('VALIDATION_ERROR', 'Text must be a non-empty string')
    );

    const longText = 'a'.repeat(51000);
    await expect(plagiarismService.checkPlagiarism(longText)).rejects.toThrow(
      new PlagiarismError(
        'VALIDATION_ERROR',
        'Text length (51000) exceeds maximum allowed length (50000)'
      )
    );
  });

  it('should handle API timeouts', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      code: 'ECONNABORTED',
      message: 'timeout of 30000ms exceeded'
    });

    await expect(plagiarismService.checkPlagiarism('test text')).rejects.toThrow(
      new PlagiarismError(
        'TIMEOUT_ERROR',
        'PlagiarismCheck.org API request timed out'
      )
    );
  });

  it('should handle one service failing', async () => {
    // Mock PlagiarismCheck.org API failure
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { error: 'Internal server error' }
      }
    });

    // Mock Eden AI API success
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        copyleaks: {
          plagiarism_score: 30,
          items: [
            {
              matched_text: 'test text',
              url: 'http://example.com',
              similarity_score: 30
            }
          ]
        }
      }
    });

    const result = await plagiarismService.checkPlagiarism('test text');
    expect(result.score).toBe(30);
    expect(result.matches).toHaveLength(1);
  });

  it('should handle both services failing', async () => {
    mockedAxios.post.mockRejectedValue({
      response: {
        status: 500,
        data: { error: 'Internal server error' }
      }
    });

    await expect(plagiarismService.checkPlagiarism('test text')).rejects.toThrow(
      new PlagiarismError('API_ERROR', 'All plagiarism checking services failed')
    );
  });
}); 