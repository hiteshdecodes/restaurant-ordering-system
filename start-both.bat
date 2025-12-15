@echo off
echo Starting Restaurant Ordering System...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Client...
start "Frontend Client" cmd /k "cd client && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
