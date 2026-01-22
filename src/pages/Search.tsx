import React, { useState, useEffect, useCallback } from 'react';
import { Input, Tabs, Card, Row, Col, Spin, Empty, Tag, message } from 'antd';
import { SearchOutlined, FireOutlined } from '@ant-design/icons';
import { searchNotes, getTrending, getSearchRecommend } from '../api/search';
import NoteCard from '../components/NoteCard';
import type { NoteItem } from '../types';

const { Search } = Input;

const SearchPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sortType, setSortType] = useState<'general' | 'time_descending' | 'popularity_descending'>('general');
  const [noteType, setNoteType] = useState<'all' | 'video' | 'normal'>('all');

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const res = await getTrending();
      if (res.data) {
        setTrending(res.data);
      }
    } catch (error) {
      console.error('获取热搜失败:', error);
    }
  };

  const handleSearch = useCallback(async (value: string) => {
    if (!value.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }

    setKeyword(value);
    setLoading(true);

    try {
      const res = await searchNotes({
        keyword: value,
        sort: sortType,
        note_type: noteType,
      });

      if (res.data?.items) {
        setNotes(res.data.items);
      } else {
        setNotes([]);
      }
    } catch (error) {
      message.error('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [sortType, noteType]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 0) {
      try {
        const res = await getSearchRecommend(value);
        if (res.data) {
          setSuggestions(res.data);
        }
      } catch (error) {
        // 忽略建议获取失败
      }
    } else {
      setSuggestions([]);
    }
  };

  const sortItems = [
    { key: 'general', label: '综合' },
    { key: 'time_descending', label: '最新' },
    { key: 'popularity_descending', label: '最热' },
  ];

  const typeItems = [
    { key: 'all', label: '全部' },
    { key: 'video', label: '视频' },
    { key: 'normal', label: '图文' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 24 }}>
        <Search
          placeholder="搜索小红书笔记..."
          allowClear
          enterButton={<><SearchOutlined /> 搜索</>}
          size="large"
          onSearch={handleSearch}
          onChange={handleInputChange}
          style={{ maxWidth: 600, margin: '0 auto', display: 'block' }}
        />

        {suggestions.length > 0 && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            {suggestions.map((s, i) => (
              <Tag
                key={i}
                style={{ cursor: 'pointer', margin: 4 }}
                onClick={() => handleSearch(s)}
              >
                {s}
              </Tag>
            ))}
          </div>
        )}
      </Card>

      {!keyword && trending.length > 0 && (
        <Card title={<><FireOutlined style={{ color: '#ff4d4f' }} /> 热门搜索</>}>
          <div>
            {trending.map((item, index) => (
              <Tag
                key={index}
                color={index < 3 ? 'red' : 'default'}
                style={{ cursor: 'pointer', margin: 4, padding: '4px 12px' }}
                onClick={() => handleSearch(item)}
              >
                {index + 1}. {item}
              </Tag>
            ))}
          </div>
        </Card>
      )}

      {keyword && (
        <>
          <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
            <Tabs
              activeKey={sortType}
              onChange={(key) => {
                setSortType(key as any);
                handleSearch(keyword);
              }}
              items={sortItems}
            />
            <Tabs
              activeKey={noteType}
              onChange={(key) => {
                setNoteType(key as any);
                handleSearch(keyword);
              }}
              items={typeItems}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Spin size="large" />
            </div>
          ) : notes.length > 0 ? (
            <Row gutter={[16, 16]}>
              {notes.map((note) => (
                <Col key={note.note_id} xs={24} sm={12} md={8} lg={6}>
                  <NoteCard note={note} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="暂无搜索结果" />
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
