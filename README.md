# AI Customer Support Chatbot

A production-ready customer support chatbot built with Vercel AI SDK, Next.js, and React.

## Features

- **Real-time streaming responses** for natural conversation flow
- **Context-aware conversations** with message history
- **Knowledge base integration** for company-specific information
- **Sentiment analysis** to detect frustrated customers
- **Ticket creation** for escalation to human agents
- **Multi-language support**
- **Analytics dashboard** for tracking metrics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI SDK**: Vercel AI SDK
- **UI**: React with Tailwind CSS
- **Database**: PostgreSQL (via Vercel Postgres or Supabase)
- **LLM Provider**: OpenAI / Anthropic
- **Deployment**: Vercel

## Project Structure

```
ai-support-chatbot/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts           # Main chat endpoint
│   │   ├── tickets/
│   │   │   └── route.ts           # Ticket creation endpoint
│   │   └── analytics/
│   │       └── route.ts           # Analytics endpoint
│   ├── chat/
│   │   └── page.tsx               # Chat interface page
│   ├── admin/
│   │   └── page.tsx               # Admin dashboard
│   └── layout.tsx                 # Root layout
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx      # Main chat component
│   │   ├── ChatMessage.tsx        # Individual message
│   │   ├── ChatInput.tsx          # Message input
│   │   └── TypingIndicator.tsx   # Loading state
│   ├── admin/
│   │   ├── Dashboard.tsx          # Analytics dashboard
│   │   └── TicketQueue.tsx        # Support tickets
│   └── ui/
│       └── button.tsx             # Reusable components
├── lib/
│   ├── ai/
│   │   ├── prompts.ts             # System prompts
│   │   ├── knowledge-base.ts      # RAG implementation
│   │   └── tools.ts               # AI function tools
│   ├── db/
│   │   ├── schema.ts              # Database schema
│   │   └── queries.ts             # Database queries
│   └── utils.ts                   # Utility functions
├── public/
│   └── logo.svg
├── .env.local
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm
- OpenAI or Anthropic API key
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env.local`:
```env
# AI Provider
OPENAI_API_KEY=your_key_here
# or
ANTHROPIC_API_KEY=your_key_here

# Database
DATABASE_URL=your_postgres_url

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run database migrations:
```bash
# For development (quick prototyping) - pushes schema directly to database
npm run db:push

# OR for production (with migration files) - generates and applies migrations
npm run db:generate  # Generate migration files
npm run db:migrate   # Apply migrations to database
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the chatbot.

## Key Implementation Details

### Chat API Route (`/api/chat/route.ts`)
- Handles streaming responses using Vercel AI SDK
- Implements conversation context management
- Integrates knowledge base for relevant information
- Uses function calling for ticket creation and escalation

### Knowledge Base Integration
- Vector embeddings for company documentation
- Semantic search for relevant context
- RAG (Retrieval Augmented Generation) implementation

### Function Tools
- `create_ticket`: Creates support tickets for escalation
- `search_knowledge_base`: Searches company documentation
- `get_order_status`: Retrieves order information
- `update_user_info`: Updates customer information

## Customization

### Adding Custom Knowledge
Edit `lib/ai/knowledge-base.ts` to add your company's:
- FAQs
- Product documentation
- Policy information
- Common workflows

### Modifying System Prompts
Update `lib/ai/prompts.ts` to customize:
- Bot personality and tone
- Response guidelines
- Escalation criteria
- Language and formatting

### Adding New Tools
Extend `lib/ai/tools.ts` to add new capabilities:
```typescript
export const tools = {
  create_ticket: {
    description: 'Creates a support ticket',
    parameters: z.object({
      subject: z.string(),
      priority: z.enum(['low', 'medium', 'high']),
      description: z.string(),
    }),
  },
  // Add your custom tools here
};
```

## Deployment

Deploy to Vercel with one click or via CLI:

```bash
vercel
```

Make sure to set environment variables in your Vercel project settings.

## Monitoring & Analytics

The admin dashboard (`/admin`) provides:
- Conversation metrics
- Response time tracking
- Customer satisfaction scores
- Common issues and topics
- Escalation rates

## License

MIT