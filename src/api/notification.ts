import client from './client';
import type { ApiResponse, Notification } from '../types';

// 获取评论和@通知
export const getMentions = async (cursor?: string): Promise<ApiResponse<{ items: Notification[]; cursor: string; has_more: boolean }>> => {
  return client.get('/api/notification/mentions', { params: { cursor } });
};

// 获取新增关注通知
export const getConnections = async (cursor?: string): Promise<ApiResponse<{ items: Notification[]; cursor: string; has_more: boolean }>> => {
  return client.get('/api/notification/connections', { params: { cursor } });
};

// 获取赞和收藏通知
export const getLikes = async (cursor?: string): Promise<ApiResponse<{ items: Notification[]; cursor: string; has_more: boolean }>> => {
  return client.get('/api/notification/likes', { params: { cursor } });
};
