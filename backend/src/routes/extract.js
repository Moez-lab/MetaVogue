import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

import { UPLOAD_DIR, FEATURE_EXTRACTOR_SCRIPT } from '../config/index.js';
import { getPythonCommand } from '../utils/pythonRunner.js';

const router = express.Router();

// Resolve Python once at startup
const pythonCmd = getPythonCommand();
console.log(`[Server] Python command: ${pythonCmd}`);

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// POST /api/extract
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const imagePath = req.file.path;
  const height = req.body.height || 170.0;

  console.log(`[Extract] Image=${req.file.filename}, Height=${height}`);

  // Validate Python script exists
  if (!fs.existsSync(FEATURE_EXTRACTOR_SCRIPT)) {
    console.error('[Extract] Python script not found at:', FEATURE_EXTRACTOR_SCRIPT);
    return res.status(500).json({ error: 'Internal server error: Script missing' });
  }

  const pythonProcess = spawn(pythonCmd, [FEATURE_EXTRACTOR_SCRIPT, imagePath, height]);

  let dataString = '';
  let errorString = '';

  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorString += data.toString();
    console.log(`[Python Log] ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`[Extract] Python process exited with code ${code}`);

    if (code !== 0) {
      return res.status(500).json({ error: 'Processing failed', details: errorString });
    }

    const ext = path.extname(imagePath);
    const annotatedFilename = path.basename(imagePath, ext) + '_annotated' + ext;
    const annotatedPath = path.join(UPLOAD_DIR, annotatedFilename);

    if (fs.existsSync(annotatedPath)) {
      const publicUrl = `/temp/uploads/${annotatedFilename}`;
      const jsonPath = path.join(UPLOAD_DIR, path.basename(imagePath, ext) + '_features.json');

      let featuresData = null;
      if (fs.existsSync(jsonPath)) {
        try {
          featuresData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        } catch (e) {
          console.error('[Extract] Error reading features JSON:', e);
        }
      }

      return res.json({
        success: true,
        imageUrl: publicUrl,
        features: featuresData,
        logs: dataString,
      });
    }

    res.status(500).json({ error: 'Output file generation failed', details: errorString });
  });
});

export default router;
