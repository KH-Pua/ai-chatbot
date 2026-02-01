import { pgTable, text, timestamp, serial, integer, varchar, jsonb, boolean } from 'drizzle-orm/pg-core';

// Conversations table
export const conversations = pgTable('conversations', {
  id: varchar('id', { length: 255 }).primaryKey(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('active'), // active, resolved, escalated
  sentiment: varchar('sentiment', { length: 50 }), // positive, neutral, negative, frustrated
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: varchar('conversation_id', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // user, assistant, system
  content: text('content').notNull(),
  toolCalls: jsonb('tool_calls'), // Store tool invocations
  tokens: integer('tokens'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Support tickets table
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  conversationId: varchar('conversation_id', { length: 255 }),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(), // technical, billing, account, product, other
  priority: varchar('priority', { length: 50 }).notNull(), // low, medium, high, urgent
  status: varchar('status', { length: 50 }).default('open'), // open, in_progress, resolved, closed
  assignedTo: varchar('assigned_to', { length: 255 }), // Agent ID or email
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});

// Knowledge base table
export const knowledgeBase = pgTable('knowledge_base', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  embedding: jsonb('embedding'), // Vector embedding for semantic search
  metadata: jsonb('metadata'), // Additional metadata
  views: integer('views').default(0),
  helpful: integer('helpful').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Analytics/metrics table
export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  conversationId: varchar('conversation_id', { length: 255 }).notNull(),
  metric: varchar('metric', { length: 100 }).notNull(), // resolution_rate, avg_response_time, etc.
  value: text('value').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Customer feedback table
export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  conversationId: varchar('conversation_id', { length: 255 }).notNull(),
  messageId: integer('message_id'),
  rating: integer('rating'), // 1-5 stars
  helpful: boolean('helpful'),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Orders table (sample for order status lookups)
export const orders = pgTable('orders', {
  id: varchar('id', { length: 255 }).primaryKey(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  status: varchar('status', { length: 100 }).notNull(), // pending, processing, shipped, delivered, cancelled
  items: jsonb('items').notNull(),
  total: integer('total').notNull(), // Amount in cents
  trackingNumber: varchar('tracking_number', { length: 255 }),
  estimatedDelivery: timestamp('estimated_delivery'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type KnowledgeEntry = typeof knowledgeBase.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;