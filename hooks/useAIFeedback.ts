import { useState } from 'react';
import { aiFeedbackService } from '@/lib/services/ai-feedback.service';

type FeedbackType = 'code-review' | 'documentation' | 'design' | 'general';

interface UseAIFeedbackOptions {
  type: FeedbackType;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  onSuccess?: (feedback: string) => void;
  onError?: (error: Error) => void;
}

export function useAIFeedback(options: UseAIFeedbackOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const getFeedback = async (content: string) => {
    if (!content.trim()) {
      setError(new Error('Content cannot be empty'));
      return null;
    }

    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const result = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: options.type,
          content,
          context: options.context,
          maxTokens: options.maxTokens,
          temperature: options.temperature,
        }),
      });

      if (!result.ok) {
        throw new Error('Failed to get feedback');
      }

      const { feedback } = await result.json();
      setFeedback(feedback);
      options.onSuccess?.(feedback);
      return feedback;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setFeedback(null);
  };

  return {
    getFeedback,
    feedback,
    isLoading,
    error,
    reset,
  };
}

// Example component usage:
/*
function CodeReviewExample() {
  const [code, setCode] = useState('');
  const { getFeedback, feedback, isLoading, error } = useAIFeedback({
    type: 'code-review',
    context: 'This is a React component for a todo list.',
  });

  return (
    <div>
      <textarea 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
        rows={10}
        className="w-full p-2 border rounded"
      />
      <button 
        onClick={() => getFeedback(code)}
        disabled={isLoading}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isLoading ? 'Getting feedback...' : 'Get Code Review'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error.message}
        </div>
      )}
      
      {feedback && (
        <div className="mt-4 p-4 bg-gray-50 border rounded">
          <h3 className="font-bold mb-2">AI Feedback:</h3>
          <div className="whitespace-pre-line">{feedback}</div>
        </div>
      )}
    </div>
  );
}
*/
