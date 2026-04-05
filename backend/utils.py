import os
# Must set ONNX/OpenMP thread limits BEFORE importing rembg/onnxruntime
# to prevent massive memory overallocation on shared Render hosts (OOM fix)
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

os.environ["OMPI_NUM_THREADS"] = "1"

import io
import tempfile
import subprocess
from PIL import Image
from rembg import remove, new_session
import uuid

# Load the highly optimized and lightweight u2netp model for edge deployments
# u2netp uses ~4MB of RAM making it perfect for 512MB Free Tier limits.
bg_session = new_session("u2netp")


def downscale_image(image_bytes: bytes, max_dim: int = 2048) -> bytes:
    """Pre-downscale large images to speed up all processing."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if max(img.size) > max_dim:
            img.thumbnail((max_dim, max_dim), Image.BILINEAR)
            out = io.BytesIO()
            fmt = "PNG" if img.mode == "RGBA" else "JPEG"
            img.save(out, format=fmt, quality=90)
            return out.getvalue()
    except Exception:
        pass
    return image_bytes


def process_background_removal(image_bytes: bytes) -> bytes:
    """Removes background using highly optimized u2netp model"""
    # Downscale to 1024 for bg removal (faster inference)
    image_bytes = downscale_image(image_bytes, max_dim=1024)
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
        except Exception:
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
    """Ultra-fast image compression — typically completes in <200ms."""
    target_bytes = int(target_size_kb * 1024)

    # Early exit: already under target
    if len(image_bytes) <= target_bytes:
        return image_bytes

    image = Image.open(io.BytesIO(image_bytes))

    # Normalize format once
    fmt = fmt.upper()
    if fmt == "JPG":
        fmt = "JPEG"

    # PNG: can't quality-compress, just optimize & return
    if fmt == "PNG":
        out = io.BytesIO()
        image.save(out, format="PNG", optimize=True)
        return out.getvalue()

    if fmt not in ("JPEG", "WEBP"):
        return image_bytes

    # Adaptive downscale: smaller targets get more aggressive resize
    max_dim = 2048
    if target_size_kb < 50:
        max_dim = 800
    elif target_size_kb < 100:
        max_dim = 1024
    elif target_size_kb < 200:
        max_dim = 1536

    if max(image.size) > max_dim:
        image.thumbnail((max_dim, max_dim), Image.BILINEAR)

    if image.mode in ("RGBA", "P") and fmt == "JPEG":
        image = image.convert("RGB")

    # Fast path: single encode at q=80
    out = io.BytesIO()
    image.save(out, format=fmt, quality=80)
    if out.tell() <= target_bytes:
        return out.getvalue()

    # Quick binary search — 3 iterations only (precision ~8 quality steps)
    low, high = 15, 75
    best = None
    for _ in range(3):
        if low > high:
            break
        mid = (low + high) // 2
        buf = io.BytesIO()
        image.save(buf, format=fmt, quality=mid)
        if buf.tell() <= target_bytes:
            best = buf.getvalue()
            low = mid + 1
        else:
            high = mid - 1

    if best:
        return best

    # Fallback: lowest quality
    final = io.BytesIO()
    image.save(final, format=fmt, quality=15)
    return final.getvalue()

def compress_video_ffmpeg(input_path: str, crf: int) -> str:
    """Compresses video using FFmpeg with ultrafast preset for speed."""
    output_path = input_path.replace(".mp4", f"_{uuid.uuid4().hex[:6]}_compressed.mp4")
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-vcodec", "libx264",
        "-preset", "ultrafast",     # 3-5x faster encoding
        "-tune", "fastdecode",      # Optimized for fast playback
        "-crf", str(crf),
        "-movflags", "+faststart",  # Progressive loading
        output_path
    ]
    subprocess.run(cmd, capture_output=True)
    return output_path


# --- QR Code Utilities ---

import qrcode
from pyzbar.pyzbar import decode as pyzbar_decode
from functools import lru_cache


@lru_cache(maxsize=256)
def generate_qr_code(data: str) -> bytes:
    """Generate a high-quality QR code PNG from a string (URL or text)."""
    qr = qrcode.QRCode(
        version=None,  # auto-size
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    out = io.BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


def decode_qr_code(image_bytes: bytes) -> str:
    """Decode a QR code image and return the embedded text."""
    img = Image.open(io.BytesIO(image_bytes))
    # Convert to grayscale for better decoding
    img = img.convert("L")
    results = pyzbar_decode(img)
    if not results:
        raise ValueError("No QR code found in the uploaded image.")
    return results[0].data.decode("utf-8")
