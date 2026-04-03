@echo off
echo ==========================================
echo       Web Meta Project Setup Script       
echo ==========================================
echo.

echo [1/3] Installing Frontend Dependencies...
call npm install
cmd /c npm i baseline-browser-mapping@latest -D
echo.

echo [2/3] Installing Backend Dependencies...
cd backend
call npm install
cd ..
echo.

echo [3/3] Starting Servers...
echo Starting Backend Server in a new window...
cd backend
start "Web Meta Backend" cmd /c "start-server.bat"
cd ..

echo Starting Frontend Server in a new window...
start "Web Meta Frontend" cmd /k "npm run dev"

echo.
echo All done! You can close this window now.
pause
