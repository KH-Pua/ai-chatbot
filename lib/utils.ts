import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple sentiment analysis
export function analyzeSentiment(
  messages: Array<{ role: string; content: string }>
): 'positive' | 'neutral' | 'negative' | 'frustrated' {
  if (!messages.length) return 'neutral';

  // Get user messages only
  const userMessages = messages
    .filter((m) => m.role === 'user' && m.content)
    .map((m) => m.content.toLowerCase());

  if (!userMessages.length) return 'neutral';

  // Keywords for sentiment detection
  const positiveKeywords = [
    'thank',
    'thanks',
    'great',
    'awesome',
    'perfect',
    'excellent',
    'appreciate',
    'helpful',
    'love',
  ];

  const negativeKeywords = [
    'bad',
    'poor',
    'terrible',
    'horrible',
    'worst',
    'disappointed',
    'frustrating',
    'issue',
    'problem',
  ];

  const frustratedKeywords = [
    'angry',
    'frustrated',
    'ridiculous',
    'unacceptable',
    'cancel',
    'refund',
    'never',
    'always',
    'manager',
    'complaint',
  ];

  // Punctuation indicators
  const recentMessage = userMessages[userMessages.length - 1];
  const hasExclamations = (recentMessage.match(/!/g) || []).length >= 2;
  const hasAllCaps = recentMessage.split(' ').some((word) => 
    word.length > 3 && word === word.toUpperCase()
  );

  let positiveScore = 0;
  let negativeScore = 0;
  let frustratedScore = 0;

  // Score messages
  userMessages.forEach((message) => {
    positiveKeywords.forEach((keyword) => {
      if (message.includes(keyword)) positiveScore++;
    });
    negativeKeywords.forEach((keyword) => {
      if (message.includes(keyword)) negativeScore++;
    });
    frustratedKeywords.forEach((keyword) => {
      if (message.includes(keyword)) frustratedScore++;
    });
  });

  // Boost frustrated score if excessive punctuation or caps
  if (hasExclamations || hasAllCaps) {
    frustratedScore += 2;
  }

  // Determine sentiment
  if (frustratedScore >= 2) return 'frustrated';
  if (negativeScore > positiveScore) return 'negative';
  if (positiveScore > negativeScore) return 'positive';
  return 'neutral';
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

// Format currency
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Generate conversation ID
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Calculate response time
export function calculateResponseTime(
  userMessageTime: Date,
  assistantMessageTime: Date
): number {
  return Math.floor(
    (assistantMessageTime.getTime() - userMessageTime.getTime()) / 1000
  );
}

// Get priority color
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'resolved':
    case 'delivered':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'in_progress':
    case 'processing':
    case 'shipped':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'open':
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'closed':
    case 'cancelled':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

// Sleep utility for testing
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// Extract order ID from message
export function extractOrderId(message: string): string | null {
  // Look for patterns like: #12345, ORDER-12345, 12345
  const patterns = [
    /#(\d{4,})/,
    /ORDER[- ]?(\d{4,})/i,
    /\b(\d{8,})\b/,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Rate limit check (simple in-memory version)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);