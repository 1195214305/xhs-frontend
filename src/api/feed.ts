import client from './client';
import type { ApiResponse, NoteItem, FeedCategory } from '../types';

// Feed 分类映射
export const FEED_CATEGORIES: { key: FeedCategory; label: string }[] = [
  { key: 'homefeed_recommend', label: '推荐' },
  { key: 'homefeed.fashion_v3', label: '穿搭' },
  { key: 'homefeed.food_v3', label: '美食' },
  { key: 'homefeed.cosmetics_v3', label: '彩妆' },
  { key: 'homefeed.movie_and_tv_v3', label: '影视' },
  { key: 'homefeed.career_v3', label: '职场' },
  { key: 'homefeed.love_v3', label: '情感' },
  { key: 'homefeed.household_product_v3', label: '家居' },
  { key: 'homefeed.gaming_v3', label: '游戏' },
  { key: 'homefeed.travel_v3', label: '旅行' },
  { key: 'homefeed.fitness_v3', label: '健身' },
];

// 获取 Feed 列表
export const getHomeFeed = async (params: {
  category: FeedCategory;
  cursor?: string;
  num?: number;
}): Promise<ApiResponse<{ items: NoteItem[]; cursor: string; has_more: boolean }>> => {
  return client.get(`/api/feed/homefeed/${params.category}`, {
    params: { cursor: params.cursor, num: params.num || 20 },
  });
};
