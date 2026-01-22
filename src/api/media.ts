import client from './client';

// 下载媒体文件
export const downloadMedia = async (url: string): Promise<Blob> => {
  const response = await client.get('/api/media/download', {
    params: { url },
    responseType: 'blob',
  });
  return response as unknown as Blob;
};

// 获取下载链接（不直接下载）
export const getDownloadUrl = (url: string): string => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${baseUrl}/api/media/download?url=${encodeURIComponent(url)}`;
};
