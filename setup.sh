#!/bin/bash
echo "=========================================="
echo "      Web Meta Project Setup Script       "
echo "=========================================="
echo ""

echo "[1/4] Installing Frontend Dependencies..."
npm install
echo ""

echo "[2/4] Installing Backend Node Dependencies..."
cd backend
npm install
cd ..
echo ""

echo "[3/4] Setting up Python Conda Environment..."
echo "Creating Conda environment 'feature-extractor' with Python 3.10..."
conda create -n feature-extractor python=3.10 -y
echo "Installing dependencies into Conda environment..."
conda run -n feature-extractor pip install -r backend/feature-extractor/requirements.txt
echo ""

echo "[4/4] Starting Servers..."
echo "To start the backend, run: cd backend && ./start-server.sh"
echo "To start the frontend, run: npm run dev"

echo ""
echo "Setup complete!"
