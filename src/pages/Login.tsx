import React, { useState, useEffect, useCallback } from 'react';
import { QRCode, Button, Spin, message, Card, Typography, Space } from 'antd';
import { ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { createQRCode, checkQRCodeStatus, getCurrentUser, initGuest } from '../api/auth';
import type { UserInfo } from '../types';

const { Title, Text } = Typography;

interface LoginProps {
  onLoginSuccess: (user: UserInfo) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [qrId, setQrId] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'waiting' | 'scanned' | 'confirmed' | 'expired'>('loading');
  const [polling, setPolling] = useState(false);

  const generateQRCode = useCallback(async () => {
    setStatus('loading');
    try {
      // 先初始化访客 Cookie
      await initGuest();

      // 然后创建二维码
      const res = await createQRCode();
      if (res.success && res.qr_url) {
        setQrUrl(res.qr_url);
        setQrId(res.qr_id || '');
        setStatus('waiting');
        setPolling(true);
      } else {
        message.error(res.error || '生成二维码失败');
        setStatus('expired');
      }
    } catch (error) {
      message.error('生成二维码失败，请检查后端服务');
      setStatus('expired');
    }
  }, []);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  useEffect(() => {
    if (!polling || !qrId) return;

    const interval = setInterval(async () => {
      try {
        const res = await checkQRCodeStatus(qrId);
        if (res.status) {
          const statusMap: Record<string, 'waiting' | 'scanned' | 'confirmed' | 'expired'> = {
            'waiting': 'waiting',
            'scanned': 'scanned',
            'confirmed': 'confirmed',
            'expired': 'expired',
          };
          const mappedStatus = statusMap[res.status] || 'waiting';
          setStatus(mappedStatus);

          if (res.status === 'confirmed') {
            setPolling(false);
            message.success('登录成功！');
            // 使用返回的用户信息
            const userInfo = {
              user_id: res.user_id || '',
              nickname: res.nickname || '用户',
              avatar: '',
            };
            onLoginSuccess(userInfo);
          } else if (res.status === 'expired') {
            setPolling(false);
          }
        }
      } catch (error) {
        console.error('轮询状态失败:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [polling, qrId, onLoginSuccess]);

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return '正在生成二维码...';
      case 'waiting':
        return '请使用小红书 APP 扫描二维码';
      case 'scanned':
        return '已扫描，请在手机上确认登录';
      case 'confirmed':
        return '登录成功！';
      case 'expired':
        return '二维码已过期，请刷新';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />;
      case 'expired':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff2442 0%, #ff6b81 100%)'
    }}>
      <Card
        style={{
          width: 400,
          textAlign: 'center',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0, color: '#ff2442' }}>
            小红书工具箱
          </Title>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            {status === 'loading' ? (
              <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
              </div>
            ) : status === 'expired' ? (
              <div
                style={{
                  width: 200,
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f5f5f5',
                  borderRadius: 8
                }}
              >
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={generateQRCode}
                  style={{ background: '#ff2442', borderColor: '#ff2442' }}
                >
                  刷新二维码
                </Button>
              </div>
            ) : (
              <QRCode
                value={qrUrl}
                size={200}
                style={{ opacity: status === 'scanned' ? 0.5 : 1 }}
              />
            )}

            {status === 'scanned' && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255,255,255,0.9)',
                padding: '8px 16px',
                borderRadius: 8
              }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                已扫描
              </div>
            )}
          </div>

          <Space>
            {getStatusIcon()}
            <Text>{getStatusText()}</Text>
          </Space>

          {status === 'waiting' && (
            <Button
              icon={<ReloadOutlined />}
              onClick={generateQRCode}
            >
              刷新二维码
            </Button>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default Login;
