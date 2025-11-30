
const API_KEY = 'msy_YzYiQ6nwRh9y6dvMdWwEP1s7fTzjSOJZLOgd';

const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function runTests() {
    console.log('Testing v1/image-to-3d with ai_model: meshy-3...');
    const response = await fetch('https://api.meshy.ai/v1/image-to-3d', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image_url: dataUrl,
            enable_pbr: true,
            should_remesh: true,
            ai_model: 'meshy-4'
        }),
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Task Created:', data);
        const taskId = data.result;

        // Poll for status
        let status = 'PENDING';
        while (status === 'PENDING' || status === 'IN_PROGRESS') {
            await new Promise(r => setTimeout(r, 2000));
            const statusRes = await fetch(`https://api.meshy.ai/v1/image-to-3d/${taskId}`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });
            const statusData = await statusRes.json();
            status = statusData.status;
            console.log('Status:', status, statusData.progress + '%');
            if (status === 'SUCCEEDED') {
                console.log('Final Result Metadata:', JSON.stringify(statusData, null, 2));
                console.log('Model URLs:', statusData.model_urls);
            } else if (status === 'FAILED') {
                console.log('Task Failed:', statusData);
            }
        }
    } else {
        console.log('Error:', await response.text());
    }
}

runTests();
