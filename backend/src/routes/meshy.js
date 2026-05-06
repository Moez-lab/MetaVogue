import express from 'express';

const router = express.Router();

router.post('/image-to-3d', async (req, res) => {
    try {
        const { image_base64 } = req.body;
        if (!image_base64) {
            return res.status(400).json({ success: false, error: 'image_base64 is required' });
        }

        const apiKey = process.env.MESHY_API_KEY;
        if (!apiKey) {
             return res.status(500).json({ success: false, error: 'Meshy API key is not configured' });
        }

        const response = await fetch('https://api.meshy.ai/v1/image-to-3d', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image_url: image_base64,
                enable_pbr: true,
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Meshy Error:', data);
            return res.status(response.status).json({ success: false, error: data.message || 'Failed to start generation' });
        }

        // data.result is the Task ID
        res.json({ success: true, result: data.result }); 
    } catch (error) {
        console.error('Meshy generation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/task/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const apiKey = process.env.MESHY_API_KEY;

        const response = await fetch(`https://api.meshy.ai/v1/image-to-3d/${id}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
             return res.status(response.status).json({ success: false, error: data.message || 'Failed to fetch task status' });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Meshy task status error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
