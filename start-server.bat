@echo off
echo ========================================
echo Starting Feature Extractor Backend
echo ========================================
echo.
echo Activating Python 3.11 environment...
call conda activate feature-extractor

echo.
echo Starting server on port 3001...
node server/index.js
