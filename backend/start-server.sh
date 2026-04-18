#!/bin/bash
echo "========================================"
echo " Starting Feature Extractor Backend"
echo " Working directory: backend/"
echo "========================================"
echo ""

# Get the base path of conda
CONDA_PATH=$(conda info --base)
if [ -f "$CONDA_PATH/etc/profile.d/conda.sh" ]; then
    source "$CONDA_PATH/etc/profile.d/conda.sh"
    conda activate feature-extractor
    echo "Activated Python environment: feature-extractor"
else
    echo "Warning: Could not find conda.sh. Make sure conda is in your PATH."
fi

echo ""
echo "Starting Express server on port 3001..."
node server.js
