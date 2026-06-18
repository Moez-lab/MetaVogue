import 'dotenv/config';
import app from './src/app.js';
import { PORT } from './src/config/index.js';

app.listen(PORT, () => {
  console.log(`✅ Feature Extractor Server running on port ${PORT}`);
  console.log('📊 Tracing Enabled:', process.env.LANGSMITH_TRACING === 'true');
});
// Trigger restart to load new env vars

