import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Row, Col, Spin, Empty, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { getHomeFeed, FEED_CATEGORIES } from '../api/feed';
import NoteCard from '../components/NoteCard';
import type { NoteItem, FeedCategory } from '../types';

const Feed: React.FC = () => {
  const [category, setCategory] = useState<FeedCategory>('homefeed_recommend');
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);

  const loadFeed = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setNotes([]);
      setCursor('');
    }

    try {
      const res = await getHomeFeed({
        category,
        cursor: isLoadMore ? cursor : undefined,
        num: 20,
      });

      if (res.data) {
        if (isLoadMore) {
          setNotes((prev) => [...prev, ...res.data!.items]);
        } else {
          setNotes(res.data.items);
        }
        setCursor(res.data.cursor);
        setHasMore(res.data.has_more);
      }
    } catch (error) {
      console.error('获取 Feed 失败:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, cursor]);

  useEffect(() => {
    loadFeed();
  }, [category]);

  const handleCategoryChange = (key: string) => {
    setCategory(key as FeedCategory);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadFeed(true);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Tabs
        activeKey={category}
        onChange={handleCategoryChange}
        items={FEED_CATEGORIES.map((cat) => ({
          key: cat.key,
          label: cat.label,
        }))}
        style={{ marginBottom: 24 }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : notes.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {notes.map((note, index) => (
              <Col key={`${note.note_id}-${index}`} xs={24} sm={12} md={8} lg={6}>
                <NoteCard note={note} />
              </Col>
            ))}
          </Row>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loadingMore}
                onClick={handleLoadMore}
                style={{ background: '#ff2442', borderColor: '#ff2442' }}
              >
                加载更多
              </Button>
            </div>
          )}
        </>
      ) : (
        <Empty description="暂无内容" />
      )}
    </div>
  );
};

export default Feed;
