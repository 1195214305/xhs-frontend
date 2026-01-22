import client from './client';
import type { QRCodeStatus, UserInfo } from '../types';

// 后端响应格式
interface QRCodeResponse {
  success: boolean;
  qr_url: string | null;
  qr_id: string | null;
  code: string | null;
  error: string | null;
}

interface GuestInitResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface QRCodeStatusResponse {
  status: string;
  nickname?: string;
  user_id?: string;
  error?: string;
}

// 获取访客 Cookie
export const initGuest = async (): Promise<GuestInitResponse> => {
  return client.post('/api/auth/guest-init');
};

// 创建登录二维码
export const createQRCode = async (): Promise<QRCodeResponse> => {
  return client.post('/api/auth/qrcode/create');
};

// 查询二维码状态
export const checkQRCodeStatus = async (qrId: string): Promise<QRCodeStatusResponse> => {
  return client.get(`/api/auth/qrcode/status`, { params: { qr_id: qrId } });
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<{ data?: UserInfo }> => {
  return client.get('/api/user/me');
};
