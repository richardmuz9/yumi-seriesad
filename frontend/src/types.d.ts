declare module 'rate-limiter-flexible';
declare module 'zod';
declare module '/CrossPlatformPreview';
declare module '/SentimentAnalysisPanel';

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
} 