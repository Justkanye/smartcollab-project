import OpenAI from 'openai';
import { env } from '@/lib/env';

type FeedbackType = 'code-review' | 'documentation' | 'design' | 'general';

interface FeedbackOptions {
  type: FeedbackType;
  content: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export class AIFeedbackService {
  private static instance: AIFeedbackService;
  private openai: OpenAI;

  private constructor() {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  public static getInstance(): AIFeedbackService {
    if (!AIFeedbackService.instance) {
      AIFeedbackService.instance = new AIFeedbackService();
    }
    return AIFeedbackService.instance;
  }

  private getSystemPrompt(type: FeedbackType): string {
    const prompts = {
      'code-review': 'You are a senior software engineer providing code review feedback. Be concise, constructive, and focus on code quality, best practices, and potential improvements.',
      'documentation': 'You are a technical writer. Provide clear, concise, and helpful feedback on the documentation. Focus on clarity, accuracy, and completeness.',
      'design': 'You are a UX/UI expert. Provide feedback on the design, focusing on usability, accessibility, and visual hierarchy.',
      'general': 'You are a helpful assistant. Provide thoughtful and constructive feedback on the given content.'
    };
    
    return prompts[type] || prompts.general;
  }

  async getFeedback(options: FeedbackOptions): Promise<string> {
    const {
      type,
      content,
      context = '',
      maxTokens = 500,
      temperature = 0.7
    } = options;

    try {
      const systemPrompt = this.getSystemPrompt(type);
      const userPrompt = context 
        ? `Context: ${context}\n\nContent to review:\n${content}`
        : content;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      });

      return response.choices[0]?.message?.content?.trim() || 'No feedback generated.';
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      throw new Error('Failed to generate AI feedback. Please try again later.');
    }
  }

  // Specific feedback methods for common use cases
  async getCodeReview(code: string, language: string, context?: string): Promise<string> {
    return this.getFeedback({
      type: 'code-review',
      content: `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``,
      context,
      temperature: 0.3 // Lower temperature for more focused code reviews
    });
  }

  async getDocumentationFeedback(docs: string, context?: string): Promise<string> {
    return this.getFeedback({
      type: 'documentation',
      content: docs,
      context
    });
  }

  async getDesignFeedback(designDescription: string, context?: string): Promise<string> {
    return this.getFeedback({
      type: 'design',
      content: designDescription,
      context
    });
  }
}

// Export a singleton instance
export const aiFeedbackService = AIFeedbackService.getInstance();
