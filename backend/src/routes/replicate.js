import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.post('/generate-video', async (req, res) => {
    try {
        const { image_path, prompt, prompt_optimizer = true, use_subject_reference = false } = req.body;
        if (!image_path) {
            return res.status(400).json({ success: false, error: 'image_path is required' });
        }
        if (!prompt) {
            return res.status(400).json({ success: false, error: 'prompt is required' });
        }

        const apiKey = process.env.REPLICATE_API_TOKEN;
        if (!apiKey || apiKey === 'your_replicate_token_here') {
             return res.status(400).json({ 
                 success: false, 
                 error: 'Replicate API token is not configured. Please add REPLICATE_API_TOKEN to backend/.env' 
             });
        }

        let first_frame_image = image_path;
        if (!image_path.startsWith('http') && !image_path.startsWith('data:')) {
            const relativePath = image_path.startsWith('/') ? image_path.slice(1) : image_path;
            const absolutePath = path.resolve(__dirname, '../../public', relativePath);
            try {
                const fileBuffer = await fs.readFile(absolutePath);
                const ext = path.extname(absolutePath).toLowerCase();
                let mimeType = 'image/png';
                if (ext === '.jpg' || ext === '.jpeg') {
                  mimeType = 'image/jpeg';
                } else if (ext === '.webp') {
                  mimeType = 'image/webp';
                }
                first_frame_image = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
            } catch (err) {
                console.error('Failed to read image file:', err);
                return res.status(400).json({ success: false, error: `Could not load local image file: ${err.message}` });
            }
        }

        console.log(`[Replicate] Submitting video generation task (use_subject_reference: ${use_subject_reference}) for prompt: "${prompt}"`);
        const response = await fetch('https://api.replicate.com/v1/models/minimax/video-01/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: {
                    prompt,
                    prompt_optimizer,
                    ...(use_subject_reference 
                        ? { subject_reference: first_frame_image } 
                        : { first_frame_image }
                    )
                }
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Replicate error:', data);
            return res.status(response.status).json({ success: false, error: data.detail || 'Failed to start video generation' });
        }

        res.json({ success: true, result: data }); 
    } catch (error) {
        console.error('Replicate generation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/task/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const apiKey = process.env.REPLICATE_API_TOKEN;

        if (!apiKey || apiKey === 'your_replicate_token_here') {
          return res.status(400).json({
            success: false,
            error: 'Replicate API token is not configured.'
          });
        }

        const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
            headers: {
                'Authorization': `Token ${apiKey}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
             return res.status(response.status).json({ success: false, error: data.detail || 'Failed to fetch task status' });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Replicate task status error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
