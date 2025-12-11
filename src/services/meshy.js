const API_KEY = 'msy_yPRISWzbsu85iNDaZQCLcVASdBbuXryFNqci';

export const meshyService = {
    async createTextTo3D(prompt) {
        // Strict T-Pose enforcement
        const tPoseEnforcement = "in strict T-pose, arms outstretched 90 degrees, symmetrical, standing straight, must only in undergarments";
        const enhancedPrompt = `${tPoseEnforcement}, ${prompt}, wearing basic underwear,must only in undergarments only if male then only underwear if model is female then must be in bra and underwear,no shoes and socks, fashion mannequin style, high quality, 4k texture, ${tPoseEnforcement}`;

        const response = await fetch('https://api.meshy.ai/v2/text-to-3d', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mode: 'preview', // 'preview' is faster, 'refine' is higher quality
                prompt: enhancedPrompt,
                art_style: 'realistic',
                should_remesh: true
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create task');
        }

        return await response.json();
    },

    async getTask(taskId) {
        const response = await fetch(`https://api.meshy.ai/v2/text-to-3d/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get task status');
        }

        return await response.json();
    },

    async createRetextureTask(modelUrl, prompt) {
        const response = await fetch('https://api.meshy.ai/openapi/v1/retexture', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model_url: modelUrl,
                text_style_prompt: prompt,
                ai_model: 'meshy-4', // Use high quality model
                enable_pbr: true
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error("Meshy API Error:", errorData);
            throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    },

    async getRetextureTask(taskId) {
        const response = await fetch(`https://api.meshy.ai/openapi/v1/retexture/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get retexture task status');
        }

        return await response.json();
    },

    async createImageTo3D(imageUrl) {
        const response = await fetch('https://api.meshy.ai/v1/image-to-3d', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_url: imageUrl,
                enable_pbr: true,
                should_remesh: true,
                ai_model: 'meshy-4'
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        return await response.json();
    },

    async getImageTo3DTask(taskId) {
        const response = await fetch(`https://api.meshy.ai/v1/image-to-3d/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get task status');
        }

        return await response.json();
    }
};
