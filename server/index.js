import express from 'express';
import multer from 'multer';
import { spawn, execSync } from 'child_process';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Determine valid python command
const getPythonCommand = () => {
    // First, try the feature-extractor environment
    const featureExtractorPython = 'C:\\Users\\mueez\\anaconda3\\envs\\feature-extractor\\python.exe';
    try {
        execSync(`"${featureExtractorPython}" --version`, { stdio: 'ignore' });
        console.log('Using feature-extractor environment Python');
        return featureExtractorPython;
    } catch (e) {
        console.log('feature-extractor environment not found, trying system Python...');
    }

    // Fallback to system python
    const commands = ['python', 'python3', 'py'];
    for (const cmd of commands) {
        try {
            execSync(`${cmd} --version`, { stdio: 'ignore' });
            return cmd;
        } catch (e) {
            continue;
        }
    }
    return 'python'; // Default fallback
};

const pythonCmd = getPythonCommand();

console.log(`Using Python command: ${pythonCmd}`);

// Configure Multer for file uploads
const uploadDir = path.join(__dirname, '../public/temp/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files from the uploads directory
app.use('/temp/uploads', express.static(uploadDir));

app.post('/api/extract', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imagePath = req.file.path;
    const height = req.body.height || 170.0; // Default height

    console.log(`Received request: Image=${req.file.filename}, Height=${height}`);

    // Path to python script
    const scriptPath = path.join(__dirname, '../feature-extractor/feature-extraction.py');

    // Validate script exists
    if (!fs.existsSync(scriptPath)) {
        console.error('Python script not found at:', scriptPath);
        return res.status(500).json({ error: 'Internal server error: Script missing' });
    }

    // Spawn Python process
    const pythonProcess = spawn(pythonCmd, [scriptPath, imagePath, height]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
        // console.log(`Python Output: ${data}`); 
    });

    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
        console.log(`Python Log: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);

        if (code !== 0) {
            return res.status(500).json({ error: 'Processing failed', details: errorString });
        }

        const ext = path.extname(imagePath);
        const annotatedFilename = path.basename(imagePath, ext) + '_annotated' + ext;
        const annotatedPath = path.join(uploadDir, annotatedFilename);

        if (fs.existsSync(annotatedPath)) {
            const publicUrl = `/temp/uploads/${annotatedFilename}`;

            // Read the generated JSON features file
            const jsonPath = path.join(uploadDir, path.basename(imagePath, ext) + '_features.json');
            let featuresData = null;

            if (fs.existsSync(jsonPath)) {
                try {
                    const rawData = fs.readFileSync(jsonPath, 'utf8');
                    featuresData = JSON.parse(rawData);
                } catch (e) {
                    console.error('Error reading features JSON:', e);
                }
            }

            res.json({
                success: true,
                imageUrl: publicUrl,
                features: featuresData,
                logs: dataString
            });
        } else {
            res.status(500).json({ error: 'Output file generation failed', details: errorString });
        }
    });
});

app.listen(port, () => {
    console.log(`Feature Extractor Server running on port ${port}`);
});
