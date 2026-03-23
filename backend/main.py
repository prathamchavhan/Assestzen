import os
import io
import uuid
import tempfile
import zipfile
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image

import utils

app = FastAPI(title="OptiMedia AI API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = os.path.join(tempfile.gettempdir(), "optimedia_static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def read_root():
    return {"message": "OptiMedia AI API is running"}

@app.post("/process-image")
async def process_image(
    file: UploadFile = File(...),
    action: str = Form("Compress"), 
    target_size_kb: float = Form(20.0),
    target_format: str = Form("Original")
):
    try:
        image_bytes = await file.read()
        file_ext = file.filename.split('.')[-1].lower()
        
        current_bytes = image_bytes
        current_format = file_ext.upper() if file_ext.lower() != "jpg" else "JPEG"
        
        action_list = [a.strip() for a in action.split(",")]
        
        # 1. Background Removal
        if "Remove Background" in action_list or "All-in-One (BG + Compress + Convert)" in action:
            current_bytes = utils.process_background_removal(current_bytes)
            current_format = "PNG"
            
        # 2. Convert Format
        if ("Convert Format" in action_list or "Convert to URL" in action_list or "All-in-One (BG + Compress + Convert)" in action) and target_format != "Original":
            img = Image.open(io.BytesIO(current_bytes))
            current_bytes = utils.convert_image_format(img, target_format)
            current_format = target_format if target_format != "JPG" else "JPEG"
            
        # 3. Compress
        if "Compress" in action_list or "Convert to URL" in action_list or "All-in-One (BG + Compress + Convert)" in action:
            current_bytes = utils.compress_image(current_bytes, target_size_kb, current_format)
            
        ext_map = {"JPEG": "jpg", "JPG": "jpg", "PNG": "png", "WEBP": "webp", "AVIF": "avif"}
        final_ext = ext_map.get(current_format, file_ext)
        if "Convert Format" in action_list and target_format != "Original":
            final_ext = ext_map.get(target_format if target_format != "JPG" else "JPEG", final_ext)
            
        filename_base = file.filename.rsplit('.', 1)[0]
        final_filename = f"opti_{filename_base}.{final_ext}"

        if "Convert to URL" in action_list:
            unique_filename = f"{uuid.uuid4().hex[:8]}_{final_filename}"
            file_path = os.path.join(STATIC_DIR, unique_filename)
            with open(file_path, "wb") as f:
                f.write(current_bytes)
            url = f"http://localhost:8000/static/{unique_filename}"
            return JSONResponse(content={"url": url, "filename": unique_filename, "processed": True})

        return StreamingResponse(
            io.BytesIO(current_bytes),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={final_filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-video")
async def process_video(
    file: UploadFile = File(...),
    video_comp_level: str = Form("Medium") # "Low", "Medium", "High"
):
    try:
        crf_map = {"Low": 28, "Medium": 23, "High": 18}
        crf = crf_map.get(video_comp_level, 23)
        
        image_bytes = await file.read()
        
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name
        
        out_path = utils.compress_video_ffmpeg(tmp_path, crf)
        
        with open(out_path, "rb") as f:
            processed_bytes = f.read()
            
        os.remove(tmp_path)
        if os.path.exists(out_path):
            os.remove(out_path)
            
        final_filename = f"compressed_{file.filename}"
        
        return StreamingResponse(
            io.BytesIO(processed_bytes),
            media_type="video/mp4",
            headers={"Content-Disposition": f"attachment; filename={final_filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-url")
async def upload_url(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        unique_filename = f"{uuid.uuid4().hex[:8]}_{file.filename}"
        file_path = os.path.join(STATIC_DIR, unique_filename)
        
        with open(file_path, "wb") as f:
            f.write(image_bytes)
            
        url = f"http://localhost:8000/static/{unique_filename}"
        return JSONResponse(content={"url": url, "filename": unique_filename})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
