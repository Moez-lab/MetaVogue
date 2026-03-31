import app from './src/app.js';
import { PORT } from './src/config/index.js';

app.listen(PORT, () => {
  console.log(`✅ Feature Extractor Server running on port ${PORT}`);
});
