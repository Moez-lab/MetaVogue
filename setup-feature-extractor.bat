@echo off
echo ========================================
echo Feature Extractor Python Setup
echo ========================================
echo.
echo This will create a Python 3.11 environment and install dependencies.
echo.
pause

echo.
echo Step 1: Creating Python 3.11 environment...
call conda create -n feature-extractor python=3.11 -y

echo.
echo Step 2: Activating environment...
call conda activate feature-extractor

echo.
echo Step 3: Installing dependencies...
call pip install mediapipe opencv-python numpy pillow transformers torch

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To use the feature extractor:
echo 1. Keep this terminal open
echo 2. Run: node server/index.js
echo 3. In another terminal, run: npm run dev
echo.
pause
