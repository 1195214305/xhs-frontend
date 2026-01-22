import React, { useState, useEffect } from 'react';
import { Tabs, List, Avatar, Space, Typography, Empty, Spin, Badge } from 'antd';
import { MessageOutlined, UserAddOutlined, HeartOutlined } from '@ant-design/icons';
import { getMentions, getConnections, getLikes } from '../api/notification';
import type { Notification } from '../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text } = Typography;

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('mentions');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      let res;
      switch (activeTab) {
        case 'mentions':
          res = await getMentions();
          break;
        case 'connections':
          res = await getConnections();
          break;
        case 'likes':
          res = await getLikes();
          break;
      }

      if (res?.data?.items) {
        setNotifications(res.data.items);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('获取通知失败:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
      case 'comment':
        return <MessageOutlined style={{ color: '#1890ff' }} />;
      case 'follow':
        return <UserAddOutlined style={{ color: '#52c41a' }} />;
      case 'like':
        return <HeartOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  const tabItems = [
    {
      key: 'mentions',
      label: (
        <span>
          <MessageOutlined /> 评论和@
        </span>
      ),
    },
    {
      key: 'connections',
      label: (
        <span>
          <UserAddOutlined /> 新增关注
        </span>
      ),
    },
    {
      key: 'likes',
      label: (
        <span>
          <HeartOutlined /> 赞和收藏
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginBottom: 24 }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : notifications.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Badge count={getNotificationIcon(item.type)} offset={[-5, 35]}>
                    <Avatar src={item.user.avatar} size={48} />
                  </Badge>
                }
                title={
                  <Space>
                    <Text strong>{item.user.nickname}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(item.create_time).fromNow()}
                    </Text>
                  </Space>
                }
                description={
                  <div>
                    <Text>{item.content}</Text>
                    {item.note && (
                      <div style={{
                        marginTop: 8,
                        padding: 8,
                        background: '#f5f5f5',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <img
                          src={item.note.cover}
                          alt=""
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <Text ellipsis style={{ flex: 1 }}>{item.note.title}</Text>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="暂无通知" />
      )}
    </div>
  );
};

export default Notifications;
