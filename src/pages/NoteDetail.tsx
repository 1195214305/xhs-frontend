import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Spin,
  Typography,
  Avatar,
  Space,
  Button,
  Image,
  Divider,
  List,
  message,
  Tag
} from 'antd';
import {
  HeartOutlined,
  StarOutlined,
  MessageOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { getNoteDetail, getNoteComments, getVideoUrl, getImageUrls } from '../api/note';
import { getDownloadUrl } from '../api/media';
import type { NoteItem, Comment } from '../types';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

const NoteDetail: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<NoteItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoUrls, setVideoUrls] = useState<{ quality: string; url: string }[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (noteId) {
      loadNoteDetail();
      loadComments();
    }
  }, [noteId]);

  const loadNoteDetail = async () => {
    try {
      const res = await getNoteDetail(noteId!);
      if (res.data) {
        setNote(res.data);

        // 根据类型加载媒体
        if (res.data.type === 'video') {
          const videoRes = await getVideoUrl(noteId!);
          if (videoRes.data?.urls) {
            setVideoUrls(videoRes.data.urls);
          }
        } else {
          const imageRes = await getImageUrls(noteId!);
          if (imageRes.data?.urls) {
            setImageUrls(imageRes.data.urls);
          }
        }
      }
    } catch (error) {
      message.error('获取笔记详情失败');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const res = await getNoteComments({ note_id: noteId! });
      if (res.data?.comments) {
        setComments(res.data.comments);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    setDownloading(true);
    try {
      const downloadUrl = getDownloadUrl(url);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('开始下载');
    } catch (error) {
      message.error('下载失败');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = () => {
    if (note?.type === 'video' && videoUrls.length > 0) {
      handleDownload(videoUrls[0].url, `${note.title || noteId}.mp4`);
    } else if (imageUrls.length > 0) {
      imageUrls.forEach((url, index) => {
        setTimeout(() => {
          handleDownload(url, `${note?.title || noteId}_${index + 1}.jpg`);
        }, index * 500);
      });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!note) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Text>笔记不存在或已删除</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card>
        {/* 作者信息 */}
        <Space style={{ marginBottom: 16 }}>
          <Avatar src={note.user.avatar} size={48} />
          <div>
            <Text strong>{note.user.nickname}</Text>
            {note.create_time && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(note.create_time).format('YYYY-MM-DD HH:mm')}
                </Text>
              </div>
            )}
          </div>
        </Space>

        {/* 标题 */}
        <Title level={4}>{note.title}</Title>

        {/* 媒体内容 */}
        {note.type === 'video' ? (
          <div style={{ marginBottom: 16 }}>
            {videoUrls.length > 0 ? (
              <div>
                <video
                  controls
                  style={{ width: '100%', maxHeight: 500, background: '#000' }}
                  poster={note.cover}
                >
                  <source src={videoUrls[0].url} type="video/mp4" />
                </video>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">画质选择：</Text>
                  {videoUrls.map((v, i) => (
                    <Tag
                      key={i}
                      color="blue"
                      style={{ cursor: 'pointer', marginLeft: 8 }}
                      onClick={() => handleDownload(v.url, `${note.title}_${v.quality}.mp4`)}
                    >
                      {v.quality} <DownloadOutlined />
                    </Tag>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                position: 'relative',
                display: 'inline-block',
                width: '100%'
              }}>
                <Image src={note.cover} style={{ width: '100%' }} />
                <PlayCircleOutlined style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 64,
                  color: 'rgba(255,255,255,0.8)'
                }} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <Image.PreviewGroup>
              {(imageUrls.length > 0 ? imageUrls : note.images || [note.cover]).map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  style={{ maxWidth: '100%', marginBottom: 8 }}
                />
              ))}
            </Image.PreviewGroup>
          </div>
        )}

        {/* 描述 */}
        {note.desc && (
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {note.desc}
          </Paragraph>
        )}

        {/* 互动数据 */}
        <Space size="large" style={{ marginTop: 16 }}>
          <span><HeartOutlined /> {note.liked_count}</span>
          <span><StarOutlined /> {note.collected_count || 0}</span>
          <span><MessageOutlined /> {note.comment_count || 0}</span>
        </Space>

        {/* 下载按钮 */}
        <div style={{ marginTop: 16 }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloading}
            onClick={handleDownloadAll}
            style={{ background: '#ff2442', borderColor: '#ff2442' }}
          >
            {note.type === 'video' ? '下载视频' : `下载全部图片 (${imageUrls.length || 1}张)`}
          </Button>
        </div>

        <Divider />

        {/* 评论区 */}
        <Title level={5}>评论 ({comments.length})</Title>
        <List
          dataSource={comments}
          renderItem={(comment) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={comment.user.avatar} />}
                title={
                  <Space>
                    <Text strong>{comment.user.nickname}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(comment.create_time).format('MM-DD HH:mm')}
                    </Text>
                  </Space>
                }
                description={
                  <div>
                    <Paragraph style={{ marginBottom: 4 }}>{comment.content}</Paragraph>
                    <Text type="secondary"><HeartOutlined /> {comment.like_count}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无评论' }}
        />
      </Card>
    </div>
  );
};

export default NoteDetail;
