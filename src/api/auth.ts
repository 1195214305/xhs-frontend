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
  try {
    const raw: QRCodeStatusRawResponse = await client.get(`/api/auth/qrcode/status`, { params: { qr_id: qrId } });

    // 调试日志
    console.log('[QRCode Status] Raw response:', raw);

    // 检查是否有错误
    if (raw.error) {
      console.error('[QRCode Status] Error:', raw.error);
      return {
        status: 'expired',
        error: raw.error,
      };
    }

    // 将 code_status 数字转换为前端期望的字符串状态
    let status: string;
    const codeStatus = raw.code_status;

    // 确保 code_status 是有效数字
    if (typeof codeStatus !== 'number') {
      console.warn('[QRCode Status] Invalid code_status:', codeStatus);
      return {
        status: 'waiting',  // 默认继续等待，而不是过期
        error: undefined,
      };
    }

    switch (codeStatus) {
      case 0:
        status = 'waiting';
        break;
      case 1:
        status = 'scanned';
        break;
      case 2:
        status = 'confirmed';
        break;
      case -1:
        status = 'expired';
        break;
      default:
        console.warn('[QRCode Status] Unknown code_status:', codeStatus);
        status = 'waiting';  // 未知状态继续等待
        break;
    }

    return {
      status,
      nickname: raw.login_info?.nickname,
      user_id: raw.login_info?.user_id,
      error: raw.error,
    };
  } catch (error) {
    console.error('[QRCode Status] Request failed:', error);
    // 请求失败时返回 waiting 而不是 expired，让用户可以继续轮询
    return {
      status: 'waiting',
      error: String(error),
    };
  }
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<{ data?: UserInfo }> => {
  return client.get('/api/user/me');
};
