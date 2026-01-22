import client from './client';
import type { UserInfo } from '../types';

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

// 后端实际返回的状态响应格式
interface QRCodeStatusRawResponse {
  success: boolean;
  code_status: number;  // 0=等待扫码, 1=已扫码, 2=登录成功, -1=过期/错误
  login_info?: {
    user_id?: string;
    nickname?: string;
  };
  new_cookies?: Record<string, string>;
  error?: string;
}

// 前端使用的状态响应格式
interface QRCodeStatusResponse {
  status: string;  // waiting, scanned, confirmed, expired
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

// 查询二维码状态（转换后端 code_status 为前端 status 字符串）
export const checkQRCodeStatus = async (qrId: string): Promise<QRCodeStatusResponse> => {
  const raw: QRCodeStatusRawResponse = await client.get(`/api/auth/qrcode/status`, { params: { qr_id: qrId } });

  // 将 code_status 数字转换为前端期望的字符串状态
  let status: string;
  switch (raw.code_status) {
    case 0:
      status = 'waiting';
      break;
    case 1:
      status = 'scanned';
      break;
    case 2:
      status = 'confirmed';
      break;
    default:
      status = 'expired';
      break;
  }

  return {
    status,
    nickname: raw.login_info?.nickname,
    user_id: raw.login_info?.user_id,
    error: raw.error,
  };
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<{ data?: UserInfo }> => {
  return client.get('/api/user/me');
};
