import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import {google} from '@ai-sdk/google';
import { streamText, tool, gateway } from 'ai';
import { z } from 'zod';
import { getSystemPrompt } from '@/lib/ai/prompts';
import { searchKnowledgeBase } from '@/lib/ai/knowledge-base';
import { createTicket, getOrderStatus } from '@/lib/db/queries';
import { analyzeSentiment } from '@/lib/utils';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, conversationId, customerEmail } = await req.json();

    // Choose your AI provider (uncomment one)
    // const model = openai('gpt-4-turbo');
    // const model = anthropic('claude-3-5-sonnet-20241022');
    // const model = google('gemini-2.5-pro');
    const model = gateway('openai/gpt-5')
    
    // Normalize messages to ensure they have the correct format
    const normalizedMessages = messages.map((msg: any) => {
      // If message has parts (new format), convert to content string
      if (msg.parts) {
        const textParts = msg.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('');
        return {
          role: msg.role,
          content: textParts,
        };
      }
      // If already in correct format, return as is
      return msg;
    });
    
    // Analyze customer sentiment from recent messages
    const recentMessages = normalizedMessages.slice(-3);
    const sentiment = analyzeSentiment(recentMessages);

    // Get system prompt with context
    const systemPrompt = getSystemPrompt({
      sentiment,
      customerEmail,
      conversationId,
    });

    const result = streamText({
      model,
      system: systemPrompt,
      messages: normalizedMessages,
      
      // Response configuration
      maxOutputTokens: 1000,
      temperature: 0.7,
      maxRetries: 2,
      
      // Abort signal for request cancellation
      abortSignal: req.signal,
      
      tools: {
        // Tool 1: Search company knowledge base
        search_knowledge_base: tool({
          description: 'Search the company knowledge base for information about products, policies, and procedures',
          inputSchema: z.object({
            query: z.string().describe('The search query'),
            category: z.enum(['faq', 'products', 'policies', 'billing', 'technical']).optional(),
          }),
          execute: async ({ query, category }) => {
            const results = await searchKnowledgeBase(query, category);
            return {
              results: results.map(r => ({
                title: r.title,
                content: r.content,
                relevance: r.score,
              })),
            };
          },
        }),

        // Tool 2: Create support ticket for escalation
        create_ticket: tool({
          description: 'Create a support ticket when the issue requires human assistance or cannot be resolved by the AI',
          inputSchema: z.object({
            subject: z.string().describe('Brief subject line for the ticket'),
            priority: z.enum(['low', 'medium', 'high', 'urgent']).describe('Priority level based on issue severity'),
            category: z.enum(['technical', 'billing', 'account', 'product', 'other']),
            description: z.string().describe('Detailed description of the issue'),
            customerEmail: z.string().email(),
          }),
          execute: async ({ subject, priority, category, description, customerEmail }) => {
            const ticket = await createTicket({
              subject,
              priority,
              category,
              description,
              customerEmail,
              conversationId,
              createdAt: new Date(),
            });
            
            return {
              ticketId: ticket.id,
              estimatedResponseTime: priority === 'urgent' ? '1 hour' : priority === 'high' ? '4 hours' : '24 hours',
              message: 'Ticket created successfully. A human agent will reach out soon.',
            };
          },
        }),

        // Tool 3: Get order status
        get_order_status: tool({
          description: 'Retrieve the status and details of a customer order',
          inputSchema: z.object({
            orderId: z.string().describe('The order ID or number'),
            email: z.string().email().describe('Customer email for verification'),
          }),
          execute: async ({ orderId, email }) => {
            const order = await getOrderStatus(orderId, email);
            
            if (!order) {
              return {
                found: false,
                message: 'Order not found. Please verify the order ID and email address.',
              };
            }

            return {
              found: true,
              orderId: order.id,
              status: order.status,
              items: order.items,
              total: order.total,
              estimatedDelivery: order.estimatedDelivery,
              trackingNumber: order.trackingNumber,
            };
          },
        }),

        // Tool 4: Transfer to human agent
        transfer_to_agent: tool({
          description: 'Transfer the conversation to a human agent immediately for complex issues or when requested by customer',
          inputSchema: z.object({
            reason: z.string().describe('Reason for transfer'),
            urgency: z.enum(['normal', 'high']),
          }),
          execute: async ({ reason, urgency }) => {
            // In production, this would trigger a notification to available agents
            // and potentially use a queue system
            return {
              transferred: true,
              message: 'Connecting you with a human agent...',
              estimatedWaitTime: urgency === 'high' ? '2 minutes' : '5 minutes',
            };
          },
        }),
      },
      
      // Callbacks for monitoring and error handling
      onChunk: async ({ chunk }) => {
        // Monitor each chunk for debugging or analytics
        if (chunk.type === 'text-delta') {
          // Could log or process text chunks here
        }
      },
      
      onStepFinish: async (result) => {
        // Log step completion for analytics
        console.log('Step finished:', {
          finishReason: result.finishReason,
          toolCallsCount: result.toolCalls?.length || 0,
          textLength: result.text?.length || 0,
          usage: result.usage
        });
      },
      
      onFinish: async ({ text, toolCalls, toolResults, usage, finishReason, response }) => {
        // Log final conversation metrics
        console.log('Generation finished:', {
          totalTokens: usage.totalTokens,
          finishReason,
          responseId: response?.id,
          toolCallsCount: toolCalls?.length || 0,
          toolResultsCount: toolResults?.length || 0
        });
        
        // Store conversation in database for analytics
        // await saveConversationMetrics(conversationId, {
        //   usage,
        //   finishReason,
        //   toolCalls,
        //   timestamp: new Date()
        // });
      },
      
      onError: ({ error }) => {
        // Log errors for debugging
        console.error('Stream error:', error);
      },
    });

    // Return UI message stream response for better client integration
    return result.toUIMessageStreamResponse();
    
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}