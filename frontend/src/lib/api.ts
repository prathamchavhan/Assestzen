import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

export const processImage = async (
    file: File,
    action: string,
    targetSizeKb: number,
    targetFormat: string,
    onProgress?: (p: number) => void
) => {
    const formData = new FormData();
    formData.append('file', file);
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
