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

// ── NLP Helpers ─────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while',
  'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
  'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
  'should', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
  'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'having', 'do', 'does', 'did', 'doing'
]);

function preprocessText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

function getKeywordMatchScore(chunkText, queryKeywords) {
  if (queryKeywords.length === 0) return 0;
  const chunkLower = chunkText.toLowerCase();
  let matches = 0;
  queryKeywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(chunkLower)) {
      matches++;
    }
  });
  return matches / queryKeywords.length;
}

// ── Shared Singletons ───────────────────────────────────────────────────────
let documentStore = []; 
let llm = null;
let llmSummary = null; 
let embeddingsModel = null;

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1000; 

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
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
    const loader = new PDFLoader(pdfPath, { parsedItemSeparator: ' ' });
    const rawDocs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 700,
      chunkOverlap: 100,
    });

    const splitDocs = await splitter.splitDocuments(rawDocs);
    console.log(`📚 Created ${splitDocs.length} chunks`);

    embeddingsModel = new GoogleGenerativeAIEmbeddings({
      model: 'gemini-embedding-001',
      apiKey,
    });

    const texts = splitDocs.map((doc) => doc.pageContent);
    const embeddings = await embeddingsModel.embedDocuments(texts);

    documentStore = splitDocs.map((doc, i) => ({
      pageContent: doc.pageContent,
      embedding: embeddings[i],
    }));

    console.log('✅ Vector DB ready');

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) throw new Error('GROQ_API_KEY is not set');

    llm = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      maxTokens: 2048,
      apiKey: groqApiKey,
      streaming: true,
    });

    llmSummary = new ChatGroq({
      model: 'llama-3.1-8b-instant',
      maxTokens: 512,
      apiKey: groqApiKey,
    });

    console.log('✅ AI Engines ready');

    if (process.env.LANGSMITH_TRACING === 'true') {
      console.log('📊 LangSmith Tracing: ENABLED (Project: ' + process.env.LANGSMITH_PROJECT + ')');
    }
  } catch (err) {
    console.error('❌ initRAG failed:', err.message);
  }
}

/**
 * Summarize conversation into key entities and focus area to save tokens.
 */
async function summarizeConversation(history) {
  if (!history || history.length === 0) return "Starting fresh conversation.";
  
  try {
    const summaryPrompt = `Extract key entities, user preferences, and the current goal from this chat history. 
    Be extremely concise (max 2 sentences).
    
    History:
    ${history.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n')}
    
    Summary:`;

    const res = await llmSummary.invoke([new HumanMessage(summaryPrompt)]);
    return res.content;
  } catch (err) {
    console.error('Extraction failed:', err.message);
    return "Continuation of chat.";
  }
}

// ── GENERATE STREAM: Search + Memory + Context + LLM ─────────────────────────
export async function* generateAnswerStream(userMessage, history = []) {
  if (!embeddingsModel || documentStore.length === 0 || !llm) {
    throw new Error('AI not initialized. Call initRAG() first.');
  }

  // 1. Memory Pass: Extract Entities (Token Saver)
  const extractedContext = await summarizeConversation(history);

  // 2. Embed & Search
  const queryEmbedding = await embeddingsModel.embedQuery(userMessage);
  const queryKeywords = preprocessText(userMessage);

  const scoredDocs = documentStore.map((doc) => {
    const semanticScore = cosineSimilarity(queryEmbedding, doc.embedding);
    const keywordScore = getKeywordMatchScore(doc.pageContent, queryKeywords);
    const finalScore = (semanticScore * 0.7) + (keywordScore * 0.3);
    return { ...doc, semanticScore, keywordScore, score: finalScore };
  });

  scoredDocs.sort((a, b) => b.score - a.score);

  // 3. Adaptive Context Selection
  const top1 = scoredDocs[0];
  let chunksToUse = 3;
  if (top1 && top1.score > 0.85) chunksToUse = 1;
  else if (top1 && top1.score > 0.75) chunksToUse = 2;

  const topChunks = scoredDocs.slice(0, chunksToUse);
  const context = topChunks.map((c) => c.pageContent.slice(0, 1000)).join('\n\n---\n\n');

  // 4. Compact System Prompt
  const systemPrompt = `You are "Vogue AI", Meta Vogue assistant.
RULES:
- ONLY answer using CONTEXT.
- If unknown: "I don't have that info in my documents, contact support."
- No hallucinations. Concise/Professional.

MEMORY: ${extractedContext}
CONTEXT:
---
${context}
---`;

  const messages = [
    new SystemMessage(systemPrompt),
    ...history.slice(-2).map((msg) =>
      msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    ),
    new HumanMessage(userMessage),
  ];

  console.log(`🤖 Streaming invoked (Context Chunks: ${chunksToUse})...`);
  const stream = await llm.stream(messages);
  
  for await (const chunk of stream) {
    yield chunk.content;
  }
}

// Deprecated wrapper: maintained for backward compatibility.
export async function generateAnswer(userMessage, history = []) {
  const iterator = generateAnswerStream(userMessage, history);
  let fullText = "";
  for await (const chunk of iterator) {
    fullText += chunk;
  }
  return fullText;
}