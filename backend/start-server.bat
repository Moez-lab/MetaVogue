@echo off
echo ========================================
echo  Starting Feature Extractor Backend
echo  Working directory: backend/
echo ========================================
echo.
echo Activating Python environment (feature-extractor)...
call conda activate feature-extractor
echo.
echo Starting Express server on port 3001...
node server.js
pause
