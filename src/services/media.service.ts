import { API } from './api';

export interface UploadMediaResponse {
  url: string;
  key: string;
  contentType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

export const mediaService = {
  /**
   * Téléverse une photo de tissu vers l'API qui l'optimise en WebP et la stocke sur Cloudflare R2
   */
  uploadTissuPhoto: async (file: File): Promise<UploadMediaResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await API.post<UploadMediaResponse>('/media/upload-tissu', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });

    return res.data;
  },
};

export default mediaService;
