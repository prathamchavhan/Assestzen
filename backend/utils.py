import io
import os
import tempfile
import subprocess
from PIL import Image
from rembg import remove, new_session
import uuid

# Load a highly accurate model for sophisticated background removal
# isnet-general-use performs significantly better on tricky edges than standard u2net.
bg_session = new_session("isnet-general-use")

def process_background_removal(image_bytes: bytes) -> bytes:
    """Removes background using highly accurate ISNet model"""
    return remove(image_bytes, session=bg_session)

def convert_image_format(image: Image.Image, target_format: str) -> bytes:
    """Converts image to target format."""
    out = io.BytesIO()
    fmt = "PNG" if target_format == "Original" else target_format
    if fmt == "JPG":
        fmt = "JPEG"
        
    if fmt == "AVIF":
        # Check if Pillow has AVIF support natively
        try:
            image.save(out, format="AVIF")
        except ValueError:
            # Fallback to FFmpeg
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_in:
                if image.mode in ("RGBA", "P"):
                    # For AVIF via FFmpeg, PNG handles alpha. 
                    pass
                image.save(tmp_in.name, format="PNG")
                tmp_in_path = tmp_in.name
                
            tmp_out_path = tmp_in_path.replace(".png", ".avif")
            subprocess.run(["ffmpeg", "-y", "-i", tmp_in_path, "-frames:v", "1", tmp_out_path], capture_output=True)
            with open(tmp_out_path, "rb") as f:
                avif_bytes = f.read()
            os.remove(tmp_in_path)
            if os.path.exists(tmp_out_path):
                os.remove(tmp_out_path)
            return avif_bytes
    else:
        if image.mode in ("RGBA", "P") and fmt == "JPEG":
            image = image.convert("RGB")
        image.save(out, format=fmt)
        
    return out.getvalue()

def compress_image(image_bytes: bytes, target_size_kb: float, fmt: str) -> bytes:
    """Iteratively compresses an image to reach the target size, respecting min quality."""
    target_bytes = target_size_kb * 1024
    image = Image.open(io.BytesIO(image_bytes))
    
    if fmt == "JPG":
        fmt = "JPEG"
        
    if fmt not in ["JPEG", "WEBP", "WebP"]:
        if fmt == "PNG":
            out = io.BytesIO()
            image.save(out, format="PNG", optimize=True)
            return out.getvalue()
        return image_bytes

    if image.mode in ("RGBA", "P") and fmt == "JPEG":
        image = image.convert("RGB")

    min_q = 30
    max_q = 95
    
    out = io.BytesIO()
    image.save(out, format=fmt, quality=max_q)
    if len(out.getvalue()) <= target_bytes:
        return out.getvalue()

    low = min_q
    high = max_q
    closest_output = None
    
    while low <= high:
        mid = (low + high) // 2
        temp_out = io.BytesIO()
        image.save(temp_out, format=fmt, quality=mid)
        size = len(temp_out.getvalue())

        if size <= target_bytes:
            closest_output = temp_out.getvalue()
            low = mid + 1  # Try higher quality
        else:
            high = mid - 1
            
    if closest_output:
        return closest_output
    
    final_out = io.BytesIO()
    image.save(final_out, format=fmt, quality=min_q)
    return final_out.getvalue()

def compress_video_ffmpeg(input_path: str, crf: int) -> str:
    """Compresses video using FFmpeg and H.264 codec."""
    output_path = input_path.replace(".mp4", f"_{uuid.uuid4().hex[:6]}_compressed.mp4")
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-vcodec", "libx264", "-crf", str(crf),
        output_path
    ]
    subprocess.run(cmd, capture_output=True)
    return output_path
