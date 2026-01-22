import client from './client';
import type { ApiResponse, SearchResult } from '../types';

// 获取热搜词
export const getTrending = async (): Promise<ApiResponse<string[]>> => {
  return client.get('/api/search/trending');
};

// 搜索笔记
export const searchNotes = async (params: {
  keyword: string;
  page?: number;
  sort?: 'general' | 'time_descending' | 'popularity_descending';
  note_type?: 'all' | 'video' | 'normal';
}): Promise<ApiResponse<SearchResult>> => {
  return client.get('/api/search/notes', { params });
};

// 搜索用户
export const searchUsers = async (params: {
  keyword: string;
  page?: number;
}): Promise<ApiResponse<{ items: any[]; has_more: boolean }>> => {
  return client.get('/api/search/usersearch', { params });
};

// 获取搜索建议
export const getSearchRecommend = async (keyword: string): Promise<ApiResponse<string[]>> => {
  return client.get('/api/search/recommend', { params: { keyword } });
};
