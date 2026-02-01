import { drizzle } from 'drizzle-orm/vercel-postgres';
import { eq, desc, and, sql as sqlOperator } from 'drizzle-orm';
import * as schema from './schema';

// Initialize Drizzle with new connection pattern
// The db instance is automatically configured when POSTGRES_URL is set
export const db = drizzle({ schema });

// Ticket operations
export async function createTicket(data: {
  subject: string;
  priority: string;
  category: string;
  description: string;
  customerEmail: string;
  conversationId: string;
  createdAt: Date;
}) {
  const [ticket] = await db
    .insert(schema.tickets)
    .values({
      ...data,
      status: 'open',
    })
    .returning();

  return ticket;
}

export async function getTicketsByEmail(email: string, limit = 10) {
  return db
    .select()
    .from(schema.tickets)
    .where(eq(schema.tickets.customerEmail, email))
    .orderBy(desc(schema.tickets.createdAt))
    .limit(limit);
}

export async function updateTicketStatus(ticketId: number, status: string, resolution?: string) {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'resolved' || status === 'closed') {
    updateData.resolvedAt = new Date();
    if (resolution) {
      updateData.resolution = resolution;
    }
  }

  const [ticket] = await db
    .update(schema.tickets)
    .set(updateData)
    .where(eq(schema.tickets.id, ticketId))
    .returning();

  return ticket;
}

// Order operations
export async function getOrderStatus(orderId: string, email: string) {
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(
      and(
        eq(schema.orders.id, orderId),
        eq(schema.orders.customerEmail, email)
      )
    )
    .limit(1);

  return order;
}

export async function getOrdersByEmail(email: string, limit = 10) {
  return db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.customerEmail, email))
    .orderBy(desc(schema.orders.createdAt))
    .limit(limit);
}

// Conversation operations
export async function createConversation(conversationId: string, customerEmail: string) {
  const [conversation] = await db
    .insert(schema.conversations)
    .values({
      id: conversationId,
      customerEmail,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return conversation;
}

export async function updateConversationSentiment(conversationId: string, sentiment: string) {
  const [conversation] = await db
    .update(schema.conversations)
    .set({
      sentiment,
      updatedAt: new Date(),
    })
    .where(eq(schema.conversations.id, conversationId))
    .returning();

  return conversation;
}

export async function saveMessage(data: {
  conversationId: string;
  role: string;
  content: string;
  toolCalls?: any;
  tokens?: number;
}) {
  const [message] = await db
    .insert(schema.messages)
    .values({
      ...data,
      createdAt: new Date(),
    })
    .returning();

  return message;
}

export async function getConversationMessages(conversationId: string) {
  return db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, conversationId))
    .orderBy(schema.messages.createdAt);
}

// Feedback operations
export async function saveFeedback(data: {
  conversationId: string;
  messageId?: number;
  rating?: number;
  helpful?: boolean;
  comment?: string;
}) {
  const [feedback] = await db
    .insert(schema.feedback)
    .values({
      ...data,
      createdAt: new Date(),
    })
    .returning();

  return feedback;
}

// Analytics operations
export async function saveAnalytics(
  conversationId: string,
  metric: string,
  value: string,
  metadata?: any
) {
  const [analytic] = await db
    .insert(schema.analytics)
    .values({
      conversationId,
      metric,
      value,
      metadata,
      createdAt: new Date(),
    })
    .returning();

  return analytic;
}

export async function getAnalyticsByMetric(metric: string, limit = 100) {
  return db
    .select()
    .from(schema.analytics)
    .where(eq(schema.analytics.metric, metric))
    .orderBy(desc(schema.analytics.createdAt))
    .limit(limit);
}

// Dashboard stats
export async function getDashboardStats(timeRange: 'day' | 'week' | 'month' = 'week') {
  const daysAgo = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
  const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  // Total conversations
  const totalConversations = await db
    .select({ count: sqlOperator<number>`count(*)` })
    .from(schema.conversations)
    .where(sqlOperator`${schema.conversations.createdAt} >= ${since}`);

  // Total tickets
  const totalTickets = await db
    .select({ count: sqlOperator<number>`count(*)` })
    .from(schema.tickets)
    .where(sqlOperator`${schema.tickets.createdAt} >= ${since}`);

  // Resolved tickets
  const resolvedTickets = await db
    .select({ count: sqlOperator<number>`count(*)` })
    .from(schema.tickets)
    .where(
      and(
        sqlOperator`${schema.tickets.createdAt} >= ${since}`,
        eq(schema.tickets.status, 'resolved')
      )
    );

  // Average rating
  const avgRating = await db
    .select({ avg: sqlOperator<number>`avg(${schema.feedback.rating})` })
    .from(schema.feedback)
    .where(sqlOperator`${schema.feedback.createdAt} >= ${since}`);

  return {
    totalConversations: totalConversations[0]?.count || 0,
    totalTickets: totalTickets[0]?.count || 0,
    resolvedTickets: resolvedTickets[0]?.count || 0,
    resolutionRate: totalTickets[0]?.count
      ? ((resolvedTickets[0]?.count || 0) / totalTickets[0].count) * 100
      : 0,
    averageRating: avgRating[0]?.avg || 0,
  };
}