import React, { useState } from 'react';
import { Card, Input, Button, Space, Typography, message, Spin, Divider, Image, Tag } from 'antd';
import { DownloadOutlined, LinkOutlined, VideoCameraOutlined, PictureOutlined } from '@ant-design/icons';
import { getNoteDetail, getVideoUrl, getImageUrls } from '../api/note';
import { getDownloadUrl } from '../api/media';
import type { NoteItem } from '../types';

const { Title, Text, Paragraph } = Typography;

const Download: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<NoteItem | null>(null);
  const [videoUrls, setVideoUrls] = useState<{ quality: string; url: string }[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const extractNoteId = (input: string): string | null => {
    // 支持多种格式
    // 1. 直接 note_id
    // 2. 完整链接 https://www.xiaohongshu.com/explore/xxx
    // 3. 分享链接 https://www.xiaohongshu.com/discovery/item/xxx

    const patterns = [
      /xiaohongshu\.com\/explore\/([a-zA-Z0-9]+)/,
      /xiaohongshu\.com\/discovery\/item\/([a-zA-Z0-9]+)/,
      /xhslink\.com\/([a-zA-Z0-9]+)/,
      /^([a-zA-Z0-9]{24})$/,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  };

  const handleParse = async () => {
    if (!url.trim()) {
      message.warning('请输入笔记链接或ID');
      return;
    }

    const noteId = extractNoteId(url.trim());
    if (!noteId) {
      message.error('无法识别的链接格式');
      return;
    }

    setLoading(true);
    setNote(null);
    setVideoUrls([]);
    setImageUrls([]);

    try {
      const res = await getNoteDetail(noteId);
      if (res.data) {
        setNote(res.data);

        if (res.data.type === 'video') {
          const videoRes = await getVideoUrl(noteId);
          if (videoRes.data?.urls) {
            setVideoUrls(videoRes.data.urls);
          }
        } else {
          const imageRes = await getImageUrls(noteId);
          if (imageRes.data?.urls) {
            setImageUrls(imageRes.data.urls);
          }
        }

        message.success('解析成功');
      } else {
        message.error('笔记不存在或无法访问');
      }
    } catch (error) {
      message.error('解析失败，请检查链接是否正确');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (mediaUrl: string, filename: string) => {
    const downloadUrl = getDownloadUrl(mediaUrl);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('开始下载');
  };

  const handleDownloadAll = () => {
    if (note?.type === 'video' && videoUrls.length > 0) {
      handleDownload(videoUrls[0].url, `${note.title || 'video'}.mp4`);
    } else if (imageUrls.length > 0) {
      imageUrls.forEach((imgUrl, index) => {
        setTimeout(() => {
          handleDownload(imgUrl, `${note?.title || 'image'}_${index + 1}.jpg`);
        }, index * 500);
      });
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Title level={4}>
          <DownloadOutlined /> 小红书媒体下载
        </Title>
        <Paragraph type="secondary">
          支持下载小红书笔记中的视频和图片，无水印高清下载
        </Paragraph>

        <Space.Compact style={{ width: '100%', marginTop: 16 }}>
          <Input
            size="large"
            placeholder="粘贴小红书笔记链接或笔记ID..."
            prefix={<LinkOutlined />}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPressEnter={handleParse}
          />
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleParse}
            style={{ background: '#ff2442', borderColor: '#ff2442' }}
          >
            解析
          </Button>
        </Space.Compact>

        <div style={{ marginTop: 12 }}>
          <Text type="secondary">
            支持格式：小红书分享链接、笔记详情页链接、笔记ID
          </Text>
        </div>
      </Card>

      {loading && (
        <Card style={{ marginTop: 24, textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>正在解析笔记...</Text>
          </div>
        </Card>
      )}

      {note && !loading && (
        <Card style={{ marginTop: 24 }}>
          <Space align="start" style={{ width: '100%' }}>
            <img
              src={note.cover}
              alt=""
              style={{ width: 120, height: 160, objectFit: 'cover', borderRadius: 8 }}
            />
            <div style={{ flex: 1 }}>
              <Space>
                <Tag color={note.type === 'video' ? 'blue' : 'green'}>
                  {note.type === 'video' ? <><VideoCameraOutlined /> 视频</> : <><PictureOutlined /> 图文</>}
                </Tag>
              </Space>
              <Title level={5} style={{ marginTop: 8 }}>{note.title}</Title>
              <Text type="secondary">作者：{note.user.nickname}</Text>
              {note.desc && (
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{ marginTop: 8, marginBottom: 0 }}
                >
                  {note.desc}
                </Paragraph>
              )}
            </div>
          </Space>

          <Divider />

          {note.type === 'video' && videoUrls.length > 0 && (
            <div>
              <Title level={5}>视频下载</Title>
              <Space wrap>
                {videoUrls.map((v, i) => (
                  <Button
                    key={i}
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(v.url, `${note.title}_${v.quality}.mp4`)}
                  >
                    {v.quality}
                  </Button>
                ))}
              </Space>
            </div>
          )}

          {note.type !== 'video' && imageUrls.length > 0 && (
            <div>
              <Title level={5}>图片下载 ({imageUrls.length}张)</Title>
              <Image.PreviewGroup>
                <Space wrap>
                  {imageUrls.map((imgUrl, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <Image
                        src={imgUrl}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                      />
                      <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          right: 4,
                          opacity: 0.9,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(imgUrl, `${note.title}_${index + 1}.jpg`);
                        }}
                      />
                    </div>
                  ))}
                </Space>
              </Image.PreviewGroup>
            </div>
          )}

          <Divider />

          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={handleDownloadAll}
            style={{ background: '#ff2442', borderColor: '#ff2442' }}
          >
            {note.type === 'video' ? '下载视频' : `下载全部图片 (${imageUrls.length}张)`}
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Download;
