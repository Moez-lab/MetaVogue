import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Shared Singletons ───────────────────────────────────────────────────────
let documentStore = []; // Array of { pageContent: string, embedding: number[] }
let llm = null;
let embeddingsModel = null;

// ── Throttle setup ─────────────────────────────────────────────────────────
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1000; // minimum 1 request per second

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Utility: Cosine Similarity ──────────────────────────────────────────────
function cosineSimilarity(a, b) {
  let dot = 0,
    magA = 0,
    magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ── INIT: Load PDF → Chunk → Embed → Store ──────────────────────────────────
export async function initRAG() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

    const pdfPath = path.join(__dirname, '../data/pdf1.pdf');
    console.log('📄 PDF Path:', pdfPath);

    console.log('📚 Loading PDF...');
    const loader = new PDFLoader(pdfPath, { parsedItemSeparator: ' ' });
    const rawDocs = await loader.load();

    // Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 700,
      chunkOverlap: 100,
    });

    const splitDocs = await splitter.splitDocuments(rawDocs);
    console.log(`📚 Created ${splitDocs.length} chunks`);

    // Initialize embeddings model (updated model)
    embeddingsModel = new GoogleGenerativeAIEmbeddings({
      model: 'gemini-embedding-001', // ✅ Confirmed available embedding model
      apiKey,
    });

    // Embed documents
    const texts = splitDocs.map((doc) => doc.pageContent);
    const embeddings = await embeddingsModel.embedDocuments(texts);

    documentStore = splitDocs.map((doc, i) => ({
      pageContent: doc.pageContent,
      embedding: embeddings[i],
    }));

    console.log('✅ In-memory vector DB ready');

    // Initialize LLM
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) throw new Error('GROQ_API_KEY is not set');

    llm = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      maxTokens: 2048,
      apiKey: groqApiKey,
    });

    console.log('✅ LLM ready');
  } catch (err) {
    console.error('❌ initRAG failed:', err.message);
  }
}

// ── GENERATE: Search + Context + LLM ────────────────────────────────────────
export async function generateAnswer(userMessage, history = []) {
  if (!embeddingsModel || documentStore.length === 0 || !llm) {
    throw new Error('AI not initialized. Call initRAG() first.');
  }

  // Throttle requests
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_INTERVAL_MS) {
    await delay(MIN_INTERVAL_MS - timeSinceLast);
  }
  lastRequestTime = Date.now();

  // Embed query
  const queryEmbedding = await embeddingsModel.embedQuery(userMessage);

  // Score documents
  const scoredDocs = documentStore.map((doc) => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));
  scoredDocs.sort((a, b) => b.score - a.score);

  // Top 3 chunks
  const topChunks = scoredDocs.slice(0, 3);
  if (topChunks.length === 0) {
    throw new Error('No relevant context found.');
  }

  // Trim context to avoid token overflow
  const context = topChunks
    .map((c) => c.pageContent.slice(0, 1000))
    .join('\n\n---\n\n');

  // System prompt
  const systemPrompt = `You are "Vogue AI", the friendly and professional AI assistant for the Meta Vogue platform — a premium fashion-tech service that transforms physical garments into hyper-realistic digital assets.

STRICT RULES:
1. ONLY answer using the CONTEXT provided below.
2. If answer is not found, say:
"That's a great question! I don't have that specific information in my documents right now. Please contact our support team for further assistance."
3. Never invent information.
4. Be concise and professional.

CONTEXT:
---
${context}
---`;

  const messages = [
    new SystemMessage(systemPrompt),
    ...history.map((msg) =>
      msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    ),
    new HumanMessage(userMessage),
  ];

  // Retry logic
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🤖 LLM Invoking (attempt ${attempt})...`);
      const response = await llm.invoke(messages);
      return response.content;
    } catch (err) {
      console.error(`❌ LLM attempt ${attempt} failed:`, err.message);
      
      const isRateLimit = err.status === 429 || err.message?.includes('429') || err.message?.includes('Rate limit');
      const isTransient = isRateLimit || err.status === 503 || err.message?.includes('503') || err.status === 500;

      if (isTransient && attempt < MAX_RETRIES) {
        const waitMs = attempt * 5000; // Exponential backoff
        console.log(`⏳ Retrying in ${waitMs/1000}s...`);
        await delay(waitMs);
      } else {
        throw new Error(`AI error: ${err.message}`);
      }
    }
  }
}