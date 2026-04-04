@echo off
echo ==========================================
echo       Web Meta Project Setup Script       
echo ==========================================
echo.

echo [1/4] Installing Frontend Dependencies...
call npm install
cmd /c npm i baseline-browser-mapping@latest -D
echo.

echo [2/4] Installing Backend Node Dependencies...
cd backend
call npm install
cd ..
echo.

echo [3/4] Setting up Python Conda Environment...
cd backend
echo Creating Conda environment 'feature-extractor' with Python 3.10 (this might take a minute)...
call conda create -n feature-extractor python=3.10 -y
echo Installing dependencies into Conda environment...
call conda run -n feature-extractor pip install -r feature-extractor\requirements.txt
cd ..
echo.

echo [4/4] Starting Servers...
echo Starting Backend Server in a new window...
cd backend
start "Web Meta Backend" cmd /c "start-server.bat"
cd ..

echo Starting Frontend Server in a new window...
start "Web Meta Frontend" cmd /k "npm run dev"

echo.
echo All done! You can close this window now.
pause