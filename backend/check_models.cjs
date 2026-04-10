const { GoogleGenerativeAI } = require('@google/generative-ai');

async function list() {
  const genAI = new GoogleGenerativeAI('AIzaSyDIlLJScJebxZBztmTSQHqTCkEB2CfRvUU');
  const res = await genAI.listModels();
  
  console.log('--- AVAILABLE EMBEDDING MODELS ---');
  res.models.forEach(m => {
    if (m.name.includes('embed')) console.log(m.name);
  });
}

list().catch(console.error);
