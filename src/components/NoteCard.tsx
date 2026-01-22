import React from 'react';
import { Card, Typography, Avatar, Space } from 'antd';
import { HeartOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { NoteItem } from '../types';

const { Text } = Typography;

interface NoteCardProps {
  note: NoteItem;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/note/${note.note_id}`);
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      cover={
        <div style={{ position: 'relative', paddingTop: '133%', overflow: 'hidden' }}>
          <img
            src={note.cover}
            alt={note.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {note.type === 'video' && (
            <PlayCircleOutlined
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                fontSize: 24,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
          )}
        </div>
      }
      bodyStyle={{ padding: 12 }}
    >
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.4,
          height: 40,
          marginBottom: 8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {note.title}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size={4}>
          <Avatar src={note.user.avatar} size={20} />
          <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
            {note.user.nickname}
          </Text>
        </Space>

        <Space size={4}>
          <HeartOutlined style={{ fontSize: 12, color: '#999' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {note.liked_count > 10000
              ? `${(note.liked_count / 10000).toFixed(1)}万`
              : note.liked_count}
          </Text>
        </Space>
      </div>
    </Card>
  );
};

export default NoteCard;
