import type { OpenAIResponse } from '../../../types/shared';

  // @ts-ignore
  return response.data.choices[0].message.content.trim(); 