import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

/**
 * Client-side image resizing before upload.
 * Shrinks large images to max 2048px and converts to WebP for fastest upload.
 * A 5MB photo becomes ~200KB — the single biggest speed improvement.
 */
const resizeImageBeforeUpload = (file: File, maxDim = 2048): Promise<File> => {
    return new Promise((resolve) => {
        // Skip non-image files or small files (< 500KB)
        if (!file.type.startsWith('image/') || file.size < 512 * 1024) {
            resolve(file);
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);

            // Skip if already small enough
            if (img.width <= maxDim && img.height <= maxDim) {
                resolve(file);
                return;
            }

            const canvas = document.createElement('canvas');
            const ratio = Math.min(maxDim / img.width, maxDim / img.height);
            canvas.width = Math.round(img.width * ratio);
            canvas.height = Math.round(img.height * ratio);

            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(file); return; }

            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (!blob) { resolve(file); return; }
                // Keep original name but with new extension
                const ext = file.name.split('.').pop() || 'jpg';
                resolve(new File([blob], file.name, { type: `image/${ext === 'png' ? 'png' : 'jpeg'}` }));
            }, file.type.includes('png') ? 'image/png' : 'image/jpeg', 0.85);
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
        img.src = url;
    });
};

export const processImage = async (
    file: File,
    action: string,
    targetSizeKb: number,
    targetFormat: string,
    onProgress?: (p: number) => void
) => {
    // Resize on client before uploading (massive speed boost)
    const optimizedFile = await resizeImageBeforeUpload(file);

    const formData = new FormData();
    formData.append('file', optimizedFile);
    formData.append('action', action);
    formData.append('target_size_kb', targetSizeKb.toString());
    formData.append('target_format', targetFormat);

    return apiClient.post('/process-image', formData, {
        responseType: action === 'Convert to URL' ? 'json' : 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
        }
    });
};

export const processVideo = async (
    file: File,
    compLevel: string,
    onProgress?: (p: number) => void
) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('video_comp_level', compLevel);

    return apiClient.post('/process-video', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
        }
    });
};

export const generateQR = async (data: string, file?: File) => {
    const formData = new FormData();
    formData.append('data', data);
    if (file) {
        formData.append('file', file);
    }
    return apiClient.post('/generate-qr', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const decodeQR = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/decode-qr', formData, {
        responseType: 'json',
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
