// Error handling utilities for AnimeHelper module
export enum ImageGenerationErrorType {
  API_ERROR = 'API_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  BILLING_ERROR = 'BILLING_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export class ImageGenerationError extends Error {
  constructor(
    public type: ImageGenerationErrorType,
    message: string,
    public retryable: boolean = false,
    public retryAfter?: number
  ) {
    super(message)
    this.name = 'ImageGenerationError'
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
}

// Helper function to add jitter to retry delay
function getRetryDelay(attempt: number): number {
  const baseDelay = Math.min(
    RETRY_CONFIG.maxDelay,
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt)
  )
  return baseDelay + Math.random() * baseDelay * 0.1 // Add 0-10% jitter
}

// Helper function to handle retries
export async function withRetry<T>(
  operation: () => Promise<T>,
  isRetryable: (error: any) => boolean
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (!isRetryable(error)) {
        throw error
      }
      
      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const delay = getRetryDelay(attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
    }
  }
  
  throw lastError
}

// Helper function to check if an error is retryable
export function isRetryableError(error: any): boolean {
  if (error instanceof ImageGenerationError) {
    return error.retryable
  }
  
  // Network errors, rate limits, and temporary API issues are retryable
  return (
    error.code === 'ECONNRESET' ||
    error.code === 'ETIMEDOUT' ||
    error.response?.status === 429 ||
    error.response?.status === 503
  )
}

// Handle service errors
export function handleServiceError(error: any): ImageGenerationError {
  if (error instanceof ImageGenerationError) {
    return error
  }

  if (error.response?.status === 429) {
    return new ImageGenerationError(
      ImageGenerationErrorType.API_ERROR,
      'The service is temporarily busy. Please try again in a few moments.',
      true,
      60000 // 1 minute
    )
  }

  if (error.response?.status >= 500) {
    return new ImageGenerationError(
      ImageGenerationErrorType.API_ERROR,
      'The service is experiencing issues. Please try again later.',
      true
    )
  }

  if (error.response?.status === 400) {
    return new ImageGenerationError(
      ImageGenerationErrorType.VALIDATION_ERROR,
      'Invalid request parameters.'
    )
  }

  return new ImageGenerationError(
    ImageGenerationErrorType.API_ERROR,
    'An unexpected error occurred.',
    false
  )
}