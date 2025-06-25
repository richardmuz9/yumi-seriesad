import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { PlagiarismResponse } from '../../../types/shared';

interface CopyleaksResponse {
  data: {
    text: {
      id: string;
      status: string;
    };
  };
}

interface CopyleaksReport {
  data: {
    text: {
      id: string;
      status: string;
      report: any; // Replace with proper type if available
    };
  };
}

// ... existing code ...

    if (error instanceof Error) {
      // Handle error
      return {
        success: false,
        error: error.message
      };
    }

// ... existing code ...

      const response = await axios.post<PlagiarismResponse>(/* ... */);
      const textId = response.data.data.text.id;

// ... existing code ...

      const statusResponse = await axios.get<PlagiarismResponse>(/* ... */);
      status = statusResponse.data.data.text.status;

// ... existing code ...

      const reportResponse = await axios.get<PlagiarismResponse>(/* ... */);
      const report = reportResponse.data.data;

// ... existing code ... 

export async function checkPlagiarism(text: string): Promise<{
  success: boolean;
  report?: any;
  error?: string;
}> {
  try {
    const submitResponse = await axios.post<CopyleaksResponse>('https://api.copyleaks.com/v3/scans/submit', {
      text
    });
    const textId = submitResponse.data.data.text.id;

    let status = 'pending';
    while (status === 'pending') {
      const statusResponse = await axios.get<CopyleaksResponse>(`https://api.copyleaks.com/v3/scans/${textId}/status`);
      status = statusResponse.data.data.text.status;
      if (status === 'pending') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const reportResponse = await axios.get<CopyleaksReport>(`https://api.copyleaks.com/v3/scans/${textId}/report`);
    const report = reportResponse.data.data;

    return {
      success: true,
      report
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred'
    };
  }
} 