#!/bin/bash

echo "======================================"
echo "✨ Starting OptiMedia AI Full Stack ✨"
echo "======================================"

# Start Backend
echo "-> Booting FastAPI Python Backend on port 8000..."
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "-> Booting Next.js Frontend on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "======================================"
echo "🟢 All systems online!"
echo "Frontend URL: http://localhost:3000"
echo "Backend URL:  http://localhost:8000"
echo "Press Ctrl+C to cleanly stop both servers."
echo "======================================"

# Handle clean exit
trap "echo 'Shutting down OptiMedia AI...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
