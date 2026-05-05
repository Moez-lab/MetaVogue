import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PORT = process.env.PORT || 3001;

// Absolute path to the uploads directory (served statically by Express)
export const UPLOAD_DIR = path.join(__dirname, '../../../frontend/public/temp/uploads');

// Absolute path to the feature-extraction Python script
export const FEATURE_EXTRACTOR_SCRIPT = path.join(
  __dirname,
  '../../feature-extractor/feature-extraction.py'
);

// Preferred Python environment path (Anaconda feature-extractor env)
export const PREFERRED_PYTHON_PATH =
  process.env.PYTHON_PATH ||
  (process.platform === 'win32'
    ? 'C:\\Users\\ahads\\anaconda3\\envs\\feature-extractor\\python.exe'
    : '/home/researchcandidate/miniconda3/envs/feature-extractor/bin/python');
