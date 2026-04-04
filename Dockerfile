FROM python:3.11-slim

# Install system dependencies, specifically ffmpeg for video processing
RUN apt-get update && apt-get install -y ffmpeg libsm6 libxext6 libzbar0 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the requirements file from the backend folder and install python packages
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the lightweight U2NetP model so it doesn't stall on the first request
RUN python -c "from rembg import new_session; new_session('u2netp')"

# Copy the rest of the backend files directly into the /app root
COPY backend/ .

# Render dynamically assigns a $PORT environment variable.
EXPOSE 8000

# Start the FastAPI server (restrict workers to 1 to explicitly save memory)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
