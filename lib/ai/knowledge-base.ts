import { google } from '@ai-sdk/google';
import { embed, embedMany } from 'ai';

// Knowledge base types
interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: 'faq' | 'products' | 'policies' | 'billing' | 'technical';
  embedding?: number[];
}

// Sample knowledge base - In production, this would be in a vector database
const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: '1',
    title: 'Return Policy',
    category: 'policies',
    content: 'We offer a 30-day return policy on most items. Products must be in original condition with all packaging and accessories. To initiate a return, log into your account, go to Order History, and select "Return Item". Refunds are processed within 5-7 business days after we receive the item.',
  },
  {
    id: '2',
    title: 'Shipping Information',
    category: 'policies',
    content: 'We offer free standard shipping on orders over $50. Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available for $15. Orders placed before 2 PM EST ship the same day. You will receive a tracking number via email once your order ships.',
  },
  {
    id: '3',
    title: 'Password Reset',
    category: 'technical',
    content: 'To reset your password: 1) Go to the login page and click "Forgot Password". 2) Enter your email address. 3) Check your email for a reset link (check spam if not in inbox). 4) Click the link and create a new password. 5) Password must be at least 8 characters with one number and one special character. The reset link expires in 24 hours.',
  },
  {
    id: '4',
    title: 'Warranty Information',
    category: 'policies',
    content: 'All electronics come with a 1-year manufacturer warranty covering defects in materials and workmanship. Warranty does not cover accidental damage, water damage, or normal wear and tear. To claim warranty, contact our support team with your order number and description of the issue. Extended warranties are available for purchase at checkout.',
  },
  {
    id: '5',
    title: 'Order Tracking',
    category: 'faq',
    content: 'To track your order: 1) Log into your account and go to Order History. 2) Click on the order you want to track. 3) You will see the current status and tracking number. 4) Click the tracking number to see detailed shipping information. If your order shows as shipped but tracking hasn\'t updated in 24 hours, please contact us.',
  },
  {
    id: '6',
    title: 'Payment Methods',
    category: 'billing',
    content: 'We accept Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, and Google Pay. We also offer financing through Affirm for purchases over $200. All transactions are encrypted and secure. We do not store full credit card numbers.',
  },
  {
    id: '7',
    title: 'Bluetooth Pairing Issues',
    category: 'technical',
    content: 'If you are having trouble pairing a Bluetooth device: 1) Make sure Bluetooth is enabled on both devices. 2) Put the device in pairing mode (usually hold power button for 5 seconds until LED flashes). 3) On your phone/computer, scan for new devices. 4) Select the device from the list. 5) If prompted, enter PIN "0000" or "1234". 6) If it still won\'t pair, restart both devices and try again.',
  },
  {
    id: '8',
    title: 'Cancel Order',
    category: 'faq',
    content: 'You can cancel an order before it ships. Log into your account, go to Order History, select the order, and click "Cancel Order". If the order has already shipped, you will need to refuse delivery or initiate a return once received. Cancellations are processed immediately and refunds take 3-5 business days.',
  },
];

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Initialize knowledge base with embeddings (run this once during setup)
let embeddedKnowledgeBase: KnowledgeEntry[] = [];

export async function initializeKnowledgeBase() {
  if (embeddedKnowledgeBase.length > 0) {
    return; // Already initialized
  }

  try {
    const texts = KNOWLEDGE_BASE.map(entry => entry.content);
    
    const { embeddings } = await embedMany({
      model: google.embedding('text-embedding-004'),
      values: texts,
    });

    embeddedKnowledgeBase = KNOWLEDGE_BASE.map((entry, i) => ({
      ...entry,
      embedding: embeddings[i],
    }));

    console.log('Knowledge base initialized with embeddings');
  } catch (error) {
    console.error('Failed to initialize knowledge base:', error);
    // Fallback to non-embedded search
    embeddedKnowledgeBase = KNOWLEDGE_BASE;
  }
}

// Search knowledge base using semantic similarity
export async function searchKnowledgeBase(
  query: string,
  category?: string,
  topK: number = 3
): Promise<Array<KnowledgeEntry & { score: number }>> {
  // Initialize if not already done
  if (embeddedKnowledgeBase.length === 0) {
    await initializeKnowledgeBase();
  }

  try {
    // Get embedding for the query
    const { embedding: queryEmbedding } = await embed({
      model: google.embedding('text-embedding-004'),
      value: query,
    });

    // Filter by category if specified
    let searchSpace = embeddedKnowledgeBase;
    if (category) {
      searchSpace = embeddedKnowledgeBase.filter(entry => entry.category === category);
    }

    // Calculate similarity scores
    const results = searchSpace
      .map(entry => {
        if (!entry.embedding) {
          return { ...entry, score: 0 };
        }
        const score = cosineSimilarity(queryEmbedding, entry.embedding);
        return { ...entry, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  } catch (error) {
    console.error('Knowledge base search error:', error);
    
    // Fallback to simple keyword search
    const keywords = query.toLowerCase().split(' ');
    return KNOWLEDGE_BASE
      .map(entry => {
        const contentLower = entry.content.toLowerCase();
        const titleLower = entry.title.toLowerCase();
        const score = keywords.reduce((acc, keyword) => {
          if (titleLower.includes(keyword)) acc += 2;
          if (contentLower.includes(keyword)) acc += 1;
          return acc;
        }, 0);
        return { ...entry, score };
      })
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

// Add new knowledge entry (for admin use)
export async function addKnowledgeEntry(entry: Omit<KnowledgeEntry, 'id' | 'embedding'>) {
  const id = `${Date.now()}`;
  
  const { embedding } = await embed({
    model: google.embedding('text-embedding-004'),
    value: entry.content,
  });

  const newEntry: KnowledgeEntry = {
    ...entry,
    id,
    embedding,
  };

  embeddedKnowledgeBase.push(newEntry);
  
  // In production, save to database
  // await db.insert(knowledgeTable).values(newEntry);
  
  return newEntry;
}