@echo off
REM IMS Project Runner - Cross-platform script
REM This script works on both Windows and Mac/Linux

echo Starting IMS Project...
echo.

REM Check if we're on Windows or Unix-like system
if "%OS%"=="Windows_NT" (
    REM Windows commands
    echo Running on Windows
    echo.

    REM Start backend (if Python is available)
    where python >nul 2>nul
    if %errorlevel% equ 0 (
        echo Starting backend server...
        start cmd /k "cd backend && python run.py"
    ) else (
        echo Python not found. Please install Python and run: pip install -r backend/requirements.txt
    )

    REM Start mobile app
    echo Starting mobile app...
    start cmd /k "cd mobile && npm start"

    echo.
    echo IMS Project started!
    echo - Backend: http://localhost:8000 (if Python is available)
    echo - Mobile: Check the Expo DevTools in your browser
    echo.
    pause
) else (
    REM Unix-like commands (Mac/Linux)
    echo Running on Mac/Linux
    echo.

    REM Start backend (if Python3 is available)
    if command -v python3 >/dev/null 2>&1; then
        echo Starting backend server...
        cd backend && python3 run.py &
    else
        echo Python3 not found. Please install Python3 and run: pip3 install -r backend/requirements.txt
    fi

    REM Start mobile app
    echo Starting mobile app...
    cd mobile && npm start &
fi