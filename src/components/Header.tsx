import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  HomeOutlined,
  SearchOutlined,
  BellOutlined,
  DownloadOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { UserInfo } from '../types';

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  user: UserInfo | null;
  onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/search', icon: <SearchOutlined />, label: '搜索' },
    { key: '/download', icon: <DownloadOutlined />, label: '下载' },
    { key: '/notifications', icon: <BellOutlined />, label: '通知' },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.nickname || '用户',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      onLogout();
    }
  };

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#ff2442',
            marginRight: 32,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          📕 小红书工具箱
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', flex: 1 }}
        />
      </div>

      {user && (
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar src={user.avatar} icon={<UserOutlined />} />
            <Text>{user.nickname}</Text>
          </Space>
        </Dropdown>
      )}
    </Header>
  );
};

export default AppHeader;
