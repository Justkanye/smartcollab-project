import { NextResponse } from 'next/server';
import { z } from 'zod';
import { aiFeedbackService } from '@/lib/services/ai-feedback.service';

const feedbackSchema = z.object({
  type: z.enum(['code-review', 'documentation', 'design', 'general']),
  content: z.string().min(1, 'Content is required'),
  context: z.string().optional(),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = feedbackSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { type, content, context, maxTokens, temperature } = validation.data;
    
    // Get feedback from AI service
    const feedback = await aiFeedbackService.getFeedback({
      type,
      content,
      context,
      maxTokens,
      temperature,
    });

    return NextResponse.json({ feedback });
    
  } catch (error) {
    console.error('Error in AI feedback endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
