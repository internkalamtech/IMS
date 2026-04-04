#!/bin/bash
# IMS Project Runner - Cross-platform script
# This script works on both Windows and Mac/Linux

echo "Starting IMS Project..."
echo

# Check if we're on Windows or Unix-like system
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows commands
    echo "Running on Windows"
    echo

    # Start backend (if Python is available)
    if command -v python >/dev/null 2>&1; then
        echo "Starting backend server..."
        start cmd /k "cd backend && python run.py"
    else
        echo "Python not found. Please install Python and run: pip install -r backend/requirements.txt"
    fi

    # Start mobile app
    echo "Starting mobile app..."
    start cmd /k "cd mobile && npm start"

    echo
    echo "IMS Project started!"
    echo "- Backend: http://localhost:8000 (if Python is available)"
    echo "- Mobile: Check the Expo DevTools in your browser"
    echo
    read -p "Press any key to continue..."
else
    # Unix-like commands (Mac/Linux)
    echo "Running on Mac/Linux"
    echo

    # Start backend (if Python3 is available)
    if command -v python3 >/dev/null 2>&1; then
        echo "Starting backend server..."
        cd backend && python3 run.py &
        BACKEND_PID=$!
        echo "Backend started with PID: $BACKEND_PID"
    else
        echo "Python3 not found. Please install Python3 and run: pip3 install -r backend/requirements.txt"
    fi

    # Start mobile app
    echo "Starting mobile app..."
    cd mobile && npm start &
    MOBILE_PID=$!
    echo "Mobile app started with PID: $MOBILE_PID"

    echo
    echo "IMS Project started!"
    echo "- Backend: http://localhost:8000 (if Python3 is available)"
    echo "- Mobile: Check the Expo DevTools in your browser"
    echo
    echo "Press Ctrl+C to stop all services"

    # Wait for user interrupt
    trap "echo 'Stopping services...'; kill $BACKEND_PID $MOBILE_PID 2>/dev/null; exit" INT
    wait
fi