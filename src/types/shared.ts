interface AIResponse {
  output: {
    text: string;
  };
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface PlagiarismResponse {
  data: {
    text: {
      id: string;
      status: string;
    };
  };
}

interface CrossrefResponse {
  message: {
    items: any[];
  };
}

export type { AIResponse, OpenAIResponse, PlagiarismResponse, CrossrefResponse }; 