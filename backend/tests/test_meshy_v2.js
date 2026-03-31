
const API_KEY = 'msy_YzYiQ6nwRh9y6dvMdWwEP1s7fTzjSOJZLOgd';

async function testMeshyV2() {
    console.log("Testing Meshy V2 Image-to-3D...");

    // Small 1x1 red pixel base64
    const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    try {
        const response = await fetch('https://api.meshy.ai/v1/image-to-3d', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_url: dataUrl,
                enable_pbr: true,
                should_remesh: true
            }),
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

testMeshyV2();
