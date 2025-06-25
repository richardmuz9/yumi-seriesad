declare module 'openai' {
  export interface OpenAIApi {
    createCompletion(params: any): Promise<any>;
    createChatCompletion(params: any): Promise<any>;
  }
  export class Configuration {
    constructor(config: { apiKey: string });
  }
}

declare module 'rate-limiter-flexible' {
  export class RateLimiterMemory {
    constructor(options: any);
    consume(key: string, points?: number): Promise<any>;
  }
}

declare module 'zod' {
  export function string(): any;
  export function number(): any;
  export function boolean(): any;
  export function object(schema: any): any;
  export function array(type: any): any;
}

declare module '/CrossPlatformPreview' {
  const CrossPlatformPreview: React.FC<any>;
  export default CrossPlatformPreview;
}

declare module '/SentimentAnalysisPanel' {
  const SentimentAnalysisPanel: React.FC<any>;
  export default SentimentAnalysisPanel;
} 