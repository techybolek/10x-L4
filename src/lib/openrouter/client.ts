import axios from 'axios';
import { OpenRouterConfig, ChatMessage, ChatOptions, ChatResponse, ModelInfo } from './types';
import { OpenRouterError, ErrorCode } from './errors';

export class OpenRouterClient {
  private readonly axiosInstance;

  constructor(private config: OpenRouterConfig) {
    this.axiosInstance = axios.create({
      baseURL: 'https://openrouter.ai/api/v1/chat/completions',
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      }
    });
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    try {
      // Validate input
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new OpenRouterError('Messages array is required and must not be empty', ErrorCode.INVALID_REQUEST);
      }

      // Validate each message
      for (const message of messages) {
        if (!message.role || !message.content) {
          throw new OpenRouterError('Each message must have a role and content', ErrorCode.INVALID_REQUEST);
        }
      }

      // Prepare request body - match the successful test pattern
      const requestBody = {
        model: options.model || this.config.defaultModel,
        messages: messages,
        ...options
      };

      // Log request for debugging
      console.log('OpenRouter request:', JSON.stringify(requestBody, null, 2).slice(0, 100));

      const response = await this.axiosInstance.post('', requestBody);

      // Log response for debugging
      // Only log first 100 chars of response for brevity
      const truncatedResponse = JSON.stringify(response.data).slice(0, 100);
      console.log('OpenRouter response:', truncatedResponse);

      return this.validateResponse(response.data);
    } catch (error: unknown) {
      if (error instanceof OpenRouterError) {
        throw error;
      }
      if (error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError) {
        const axiosError = error as any;
        if (axiosError.response?.status === 400) {
          const errorMessage = axiosError.response?.data?.error?.message || 'Invalid request parameters';
          throw new OpenRouterError(errorMessage, ErrorCode.INVALID_REQUEST, axiosError.response?.data);
        }
        if (axiosError.response?.status === 429) {
          throw new OpenRouterError('Rate limit exceeded', ErrorCode.RATE_LIMIT_EXCEEDED);
        }
        if (axiosError.response?.status === 401) {
          throw new OpenRouterError('Authentication failed', ErrorCode.AUTHENTICATION_FAILED);
        }
        if (axiosError.response?.status === 402) {
          throw new OpenRouterError('Quota exceeded', ErrorCode.QUOTA_EXCEEDED);
        }
        throw new OpenRouterError(
          `Request failed with status ${axiosError.response?.status}`,
          ErrorCode.INVALID_RESPONSE,
          axiosError.response?.data
        );
      }
      throw error;
    }
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.axiosInstance.get('/models');
      const data = response.data as { data: ModelInfo[] };
      return data.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError) {
        const axiosError = error as any;
        if (axiosError.response?.status === 401) {
          throw new OpenRouterError('Authentication failed', ErrorCode.AUTHENTICATION_FAILED);
        }
      }
      throw error;
    }
  }

  private validateResponse(response: unknown): ChatResponse {
    if (!response || typeof response !== 'object') {
      throw new OpenRouterError('Invalid response format', ErrorCode.INVALID_RESPONSE);
    }

    const data = response as any;
    if (!data.choices?.[0]?.message?.content) {
      throw new OpenRouterError('Missing content in response', ErrorCode.INVALID_RESPONSE);
    }

    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  }
} 