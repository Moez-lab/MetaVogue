import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COMFY_URL = 'http://127.0.0.1:8188';

async function uploadToComfy(imagePath, filename) {
  try {
    const fileBuffer = await fs.readFile(imagePath);
    const formData = new FormData();
    const blob = new Blob([fileBuffer]);
    formData.append('image', blob, filename);
    formData.append('overwrite', 'true');

    const response = await fetch(`${COMFY_URL}/upload/image`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`ComfyUI upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error('[ComfyUI] Upload Error:', error);
    throw error;
  }
}


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

router.post('/vogue-changer', async (req, res) => {
  try {
    const { 
      personImage, 
      clothImage, 
      positivePrompt, 
      negativePrompt,
      segmentationPrompt,
      denoise = 1, 
      ipadapterWeight = 1,
      steps = 20, 
      cfg = 8, 
      seed = -1 
    } = req.body;


    const currentSeed = seed === -1 ? Math.floor(Math.random() * 1000000000000000) : seed;
    
    console.log(`[ComfyUI] Vogue Changer Request. Seed: ${currentSeed}, Denoise: ${denoise}`);
    console.log(`[ComfyUI] Paths: person=${personImage}, cloth=${clothImage}`);


    // Load the workflow
    const workflowPath = path.join(__dirname, '../../../cloth changing  (2).json');
    const workflowRaw = await fs.readFile(workflowPath, 'utf-8');

    const workflow = JSON.parse(workflowRaw);

    // Handle Person Image
    if (personImage) {
      const filename = path.basename(personImage);
      // Ensure we don't have a leading slash that might mess up path.join on Windows
      const relativeImage = personImage.startsWith('/') ? personImage.slice(1) : personImage;
      const fullPath = path.resolve(__dirname, '../../public', relativeImage);
      console.log(`[ComfyUI] Uploading Person Image: ${fullPath}`);
      const comfyFilename = await uploadToComfy(fullPath, filename);
      if (workflow["4"]?.inputs) workflow["4"].inputs.image = comfyFilename;
    }

    // Handle Cloth Image
    if (clothImage) {
      const filename = path.basename(clothImage);
      const relativeImage = clothImage.startsWith('/') ? clothImage.slice(1) : clothImage;
      const fullPath = path.resolve(__dirname, '../../public', relativeImage);
      console.log(`[ComfyUI] Uploading Cloth Image: ${fullPath}`);
      const comfyFilename = await uploadToComfy(fullPath, filename);
      if (workflow["5"]?.inputs) workflow["5"].inputs.image = comfyFilename;
    }


    // Update Node 7 (Positive Prompt)
    if (workflow["7"]?.inputs) {
      workflow["7"].inputs.text = positivePrompt || "A photo of a girl wearing a plain black t-shirt, outdoors, high quality";
    }

    // Update Node 8 (Negative Prompt)
    if (workflow["8"]?.inputs) {
      workflow["8"].inputs.text = negativePrompt || "blurry, bad quality, distorted, extra limbs, low resolution";
    }

    // Update Node 9 (IPAdapter Weight)
    if (workflow["9"]?.inputs) {
      workflow["9"].inputs.weight = parseFloat(ipadapterWeight);
    }



    // Update Node 10 (KSampler settings)
    if (workflow["10"]?.inputs) {
      workflow["10"].inputs.denoise = parseFloat(denoise);
      workflow["10"].inputs.steps = parseInt(steps);
      workflow["10"].inputs.cfg = parseFloat(cfg);
      workflow["10"].inputs.seed = currentSeed;
    }

    // Update Node 18 (Segmentation Prompt)
    if (workflow["18"]?.inputs) {
      workflow["18"].inputs.prompt = segmentationPrompt || "dark blue t-shirt";
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
    console.log(`[ComfyUI] Vogue Changer Prompt submitted. ID: ${promptId}`);

    // Poll for the result
    const images = await pollForResult(promptId);

    res.json({ success: true, images, promptId });
  } catch (error) {
    console.error('[ComfyUI] Vogue Changer Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/meta-vogue-im', async (req, res) => {
  try {
    const { 
      baseImage, 
      outfitPrompt, 
      backgroundPrompt, 
      facePrompt, 
      negativePrompt,
      outputType, 
      ipadapterWeight = 0,
      steps = 20, 
      cfg = 8, 
      seed = -1 
    } = req.body;

    const currentSeed = seed === -1 ? Math.floor(Math.random() * 1000000000000000) : seed;
    console.log(`[ComfyUI] Meta Vogue IM Request. Seed: ${currentSeed}, OutputType: ${outputType}, IPWeight: ${ipadapterWeight}`);

    // Load the workflow
    const workflowPath = path.join(__dirname, '../../../meta-vouge-image-im.json');
    const workflowRaw = await fs.readFile(workflowPath, 'utf-8');
    const workflow = JSON.parse(workflowRaw);

    // Handle Base Image
    if (baseImage) {
      const filename = path.basename(baseImage);
      const relativeImage = baseImage.startsWith('/') ? baseImage.slice(1) : baseImage;
      const fullPath = path.resolve(__dirname, '../../public', relativeImage);
      const comfyFilename = await uploadToComfy(fullPath, filename);
      if (workflow["10"]?.inputs) workflow["10"].inputs.image = comfyFilename;
    }

    // Update Node 32 (Outfit & Background Prompt)
    if (workflow["32"]?.inputs) {
      const combinedPrompt = [outfitPrompt, backgroundPrompt].filter(Boolean).join(", ");
      workflow["32"].inputs.text_g = combinedPrompt;
      workflow["32"].inputs.text_l = combinedPrompt;
    }

    // Update Node 33 (Negative Prompt)
    if (workflow["33"]?.inputs) {
      workflow["33"].inputs.text_g = negativePrompt;
      workflow["33"].inputs.text_l = negativePrompt;
    }

    // Update Node 34 (Face Prompt)
    if (workflow["34"]?.inputs) {
      workflow["34"].inputs.text_g = facePrompt;
      workflow["34"].inputs.text_l = facePrompt;
    }

    // Update Node 16 (Segmentation Prompt)
    if (workflow["16"]?.inputs) {
       // If the user wants to change the background, we must mask it so it can be inpainted.
       if (backgroundPrompt && backgroundPrompt.trim().length > 0) {
         workflow["16"].inputs.prompt = "clothes, body, background";
       } else {
         workflow["16"].inputs.prompt = "clothes, body";
       }
    }

    // Update Node 12 (IPAdapter weight)
    if (workflow["12"]?.inputs) {
      workflow["12"].inputs.weight = parseFloat(ipadapterWeight);
    }

    // Update Node 2 (KSampler settings)
    if (workflow["2"]?.inputs) {
      workflow["2"].inputs.steps = parseInt(steps);
      workflow["2"].inputs.cfg = parseFloat(cfg);
      workflow["2"].inputs.seed = currentSeed;
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
    console.log(`[ComfyUI] Meta Vogue IM Prompt submitted. ID: ${promptId}`);

    // Target node based on output type
    const targetNodeId = outputType === 'outfit' ? '4' : '26';
    const images = await pollForResultWithNodeFilter(promptId, targetNodeId);

    res.json({ success: true, images, promptId });
  } catch (error) {
    console.error('[ComfyUI] Meta Vogue IM Error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function pollForResultWithNodeFilter(promptId, targetNodeId) {
  const maxAttempts = 120; // 2 minutes max
  console.log(`[ComfyUI] Polling for result of ${promptId} (Target Node: ${targetNodeId})...`);
  
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

        // Check if the specific node has output
        if (outputs[targetNodeId] && outputs[targetNodeId].images) {
           for (const image of outputs[targetNodeId].images) {
              const url = `http://localhost:3001/api/comfy/view?filename=${image.filename}&subfolder=${image.subfolder}&type=${image.type}`;
              images.push(url);
           }
        }

        // If target node didn't produce an image, maybe fall back to getting whatever image we can
        if (images.length === 0) {
            for (const nodeId in outputs) {
              if (outputs[nodeId].images) {
                for (const image of outputs[nodeId].images) {
                  const url = `http://localhost:3001/api/comfy/view?filename=${image.filename}&subfolder=${image.subfolder}&type=${image.type}`;
                  images.push(url);
                }
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
