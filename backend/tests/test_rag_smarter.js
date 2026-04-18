import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initRAG, generateAnswer } from '../src/services/ragService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('🚀 Starting Smarter RAG Test...');
  
  await initRAG();
  
  const testQuery = "What is the handling fee for returned or exchanged goods?";
  console.log(`\n❓ Query: ${testQuery}`);
  
  try {
    const answer = await generateAnswer(testQuery);
    console.log(`\n🤖 Answer:\n${answer}\n`);
    console.log('✅ Test Completed');
  } catch (err) {
    console.error('❌ Test Failed:', err.message);
  }
}

runTest();
