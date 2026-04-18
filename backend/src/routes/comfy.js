import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COMFY_URL = 'http://127.0.0.1:8188';

router.post('/generate', async (req, res) => {
  try {
    const { 
      prompt, 
      negativePrompt, 
      steps = 8, 
      cfg = 1.5, 
      seed = -1, 
      batchSize = 1 
    } = req.body;

    const currentSeed = seed === -1 ? Math.floor(Math.random() * 1000000000000000) : seed;
    
    const logMsg = `[${new Date().toISOString()}] Request: "${prompt}" (Seed: ${currentSeed}, Batch: ${batchSize})\n`;
    await fs.appendFile('comfy_debug.log', logMsg);
    
    console.log(`[ComfyUI] Receiving request. Prompt: "${prompt}", Negative: "${negativePrompt}", Batch: ${batchSize}`);

    // Load the workflow from the root directory
    const workflowPath = path.join(__dirname, '../../../metavogueImage.json');
    const workflowRaw = await fs.readFile(workflowPath, 'utf-8');
    const workflow = JSON.parse(workflowRaw);

    // Update Node 14 (Positive Prompt)
    if (workflow["14"]?.inputs) {
      workflow["14"].inputs.text = prompt || "highly detailed garment";
    }

    // Update Node 15 (Negative Prompt)
    if (workflow["15"]?.inputs) {
      workflow["15"].inputs.text = negativePrompt || "blurry, bad quality, distorted";
    }

    // Update Node 2 (KSampler settings)
    if (workflow["2"]?.inputs) {
      workflow["2"].inputs.steps = parseInt(steps);
      workflow["2"].inputs.cfg = parseFloat(cfg);
      workflow["2"].inputs.seed = currentSeed;
    }

    // Update Node 5 (Batch Size)
    if (workflow["5"]?.inputs) {
      workflow["5"].inputs.batch_size = parseInt(batchSize);
    }

    // Send to ComfyUI
    const response = await fetch(`${COMFY_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ComfyUI error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const promptId = data.prompt_id;
    console.log(`[ComfyUI] Prompt submitted. ID: ${promptId}`);

    // Poll for the result
    const images = await pollForResult(promptId);

    res.json({ success: true, images, promptId });
  } catch (error) {
    const errorMsg = `[${new Date().toISOString()}] ERROR: ${error.message}\n${error.stack}\n`;
    await fs.appendFile('comfy_debug.log', errorMsg);
    console.error('[ComfyUI] Generate Error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function pollForResult(promptId) {
  const maxAttempts = 120; // 2 minutes max
  console.log(`[ComfyUI] Polling for result of ${promptId}...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 1000));
    
    try {
      const historyRes = await fetch(`${COMFY_URL}/history/${promptId}`);
      if (!historyRes.ok) continue;

      const history = await historyRes.json();
      
      if (history[promptId]) {
        console.log(`[ComfyUI] Found history for ${promptId}`);
        const outputs = history[promptId].outputs;
        const images = [];

        // Find all image outputs
        for (const nodeId in outputs) {
          if (outputs[nodeId].images) {
            for (const image of outputs[nodeId].images) {
              // Instead of direct ComfyUI URL, use our backend proxy to avoid 403/CORS issues
              const url = `http://localhost:3001/api/comfy/view?filename=${image.filename}&subfolder=${image.subfolder}&type=${image.type}`;
              images.push(url);
            }
          }
        }

        if (images.length > 0) {
          console.log(`[ComfyUI] Found ${images.length} images.`);
          return images;
        }
      }
    } catch (err) {
      console.warn(`[ComfyUI] Polling attempt ${i} failed:`, err.message);
    }
  }
  throw new Error('Timeout waiting for ComfyUI result');
}

// ── Image Proxy ──────────────────────────────────────────────────────────
router.get('/view', async (req, res) => {
  try {
    const { filename, subfolder, type } = req.query;
    const url = `${COMFY_URL}/view?filename=${filename}&subfolder=${subfolder}&type=${type}`;
    
    console.log(`[ComfyUI] Proxying image: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from ComfyUI: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType);
    
    // Pipe the response body to the client
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error('[ComfyUI Proxy] Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
