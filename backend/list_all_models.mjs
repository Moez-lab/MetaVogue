async function listModels() {
    const key = 'AIzaSyDIlLJScJebxZBztmTSQHqTCkEB2CfRvUU';
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('--- AVAILABLE MODELS ---');
        data.models.forEach(m => {
            console.log(m.name);
        });
    } catch (err) {
        console.error('Error listing models:', err);
    }
}

listModels();
