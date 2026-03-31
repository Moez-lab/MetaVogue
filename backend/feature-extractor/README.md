# Feature Extractor

A Python application for extracting facial features from images using OpenCV and MediaPipe.

## Features

- Face detection and localization
- Dominant face color extraction
- Hair color detection
- Eye state detection (open/closed)
- Smile detection

## Setup

### Conda Environment

A conda environment named `feature-extractor` has been created with Python 3.10.

### Activate the Environment

```bash
conda activate feature-extractor
```

### Deactivate the Environment

```bash
conda deactivate
```

## Installed Dependencies

- **opencv-python** (4.8.1.78) - Computer vision library
- **mediapipe** (0.10.8) - Face detection and mesh analysis
- **numpy** (1.24.3) - Numerical computing

## Usage

1. Activate the conda environment:
   ```bash
   conda activate feature-extractor
   ```

2. Run the feature extraction script:
   ```bash
   python feature-extraction.py
   ```

3. The script will analyze `person.jpg` and extract:
   - Face color (RGB)
   - Hair color (RGB)
   - Eyes open/closed status
   - Smiling status

## Files

- `feature-extraction.py` - Main extraction script
- `person.jpg` - Sample image for analysis
- `requirements.txt` - Python dependencies
- `README.md` - This file
