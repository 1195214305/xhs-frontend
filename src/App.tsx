import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import AppHeader from './components/Header';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Search from './pages/Search';
import NoteDetail from './pages/NoteDetail';
import Notifications from './pages/Notifications';
import Download from './pages/Download';
import type { UserInfo } from './types';

const { Content } = Layout;

const App: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查本地存储的登录状态
    const savedUser = localStorage.getItem('xhs_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('xhs_user');
      }
    }
  }, []);

  const handleLoginSuccess = (userInfo: UserInfo) => {
    setUser(userInfo);
    setIsLoggedIn(true);
    localStorage.setItem('xhs_user', JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('xhs_user');
  };

  // 主题配置
  const theme = {
    token: {
      colorPrimary: '#ff2442',
      borderRadius: 8,
    },
  };

  if (!isLoggedIn) {
    return (
      <ConfigProvider locale={zhCN} theme={theme}>
        <AntApp>
          <Login onLoginSuccess={handleLoginSuccess} />
        </AntApp>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <AntApp>
        <BrowserRouter>
          <Layout style={{ minHeight: '100vh' }}>
            <AppHeader user={user} onLogout={handleLogout} />
            <Content style={{ background: '#f5f5f5' }}>
              <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/search" element={<Search />} />
                <Route path="/note/:noteId" element={<NoteDetail />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/download" element={<Download />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Content>
          </Layout>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
