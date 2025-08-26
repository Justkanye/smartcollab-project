'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAIFeedback } from '@/hooks/useAIFeedback';

type FeedbackType = 'code-review' | 'documentation' | 'design' | 'general';

interface AIFeedbackWidgetProps {
  type?: FeedbackType;
  title?: string;
  placeholder?: string;
  context?: string;
  className?: string;
  maxTokens?: number;
  temperature?: number;
}

export function AIFeedbackWidget({
  type = 'general',
  title = 'Get AI Feedback',
  placeholder = 'Enter your content here...',
  context = '',
  className = '',
  maxTokens = 1000,
  temperature = 0.7,
}: AIFeedbackWidgetProps) {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { 
    getFeedback, 
    feedback, 
    isLoading, 
    error, 
    reset 
  } = useAIFeedback({
    type,
    context,
    maxTokens,
    temperature,
    onSuccess: () => {
      setIsExpanded(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      getFeedback(content);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleReset = () => {
    setContent('');
    reset();
  };

  const getTypeLabel = () => {
    const labels = {
      'code-review': 'Code Review',
      'documentation': 'Documentation',
      'design': 'Design Feedback',
      'general': 'General Feedback'
    };
    return labels[type] || 'Feedback';
  };

  return (
    <Card className={`w-full max-w-3xl mx-auto ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            {title} ({getTypeLabel()})
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleExpand}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={`${isExpanded ? 'block' : 'hidden'}`}>
        {!feedback && !isLoading && !error && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">
                {type === 'code-review' ? 'Your Code' : 'Your Content'}
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                rows={8}
                className="font-mono text-sm"
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset}
                disabled={isLoading || (!content && !feedback)}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isLoading || !content.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Get Feedback'
                )}
              </Button>
            </div>
          </form>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing your content...</p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-destructive">
                  Error generating feedback
                </h4>
                <p className="text-sm text-destructive/80 mt-1">
                  {error.message || 'An error occurred while generating feedback. Please try again.'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={handleReset}
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {feedback && !isLoading && (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                    AI Feedback Generated
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Here's the feedback based on your content.
                  </p>
                </div>
              </div>
            </div>

            <div className="prose dark:prose-invert prose-sm max-w-none p-4 border rounded-md bg-muted/10">
              {feedback.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Analyze Something Else
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example usage:
/*
<AIFeedbackWidget 
  type="code-review"
  title="Get Code Review"
  placeholder="Paste your code here..."
  context="This is a React component for a todo list."
  className="my-8"
/>
*/
