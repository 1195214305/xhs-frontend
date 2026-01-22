import client from './client';
import type { ApiResponse, NoteItem, Comment } from '../types';

// 获取笔记详情
export const getNoteDetail = async (noteId: string): Promise<ApiResponse<NoteItem>> => {
  return client.get('/api/note/detail', { params: { note_id: noteId } });
};

// 获取笔记评论
export const getNoteComments = async (params: {
  note_id: string;
  cursor?: string;
}): Promise<ApiResponse<{ comments: Comment[]; cursor: string; has_more: boolean }>> => {
  return client.get('/api/note/page', { params });
};

// 获取视频地址
export const getVideoUrl = async (noteId: string): Promise<ApiResponse<{ urls: { quality: string; url: string }[] }>> => {
  return client.get('/api/note/video', { params: { note_id: noteId } });
};

// 获取图片地址
export const getImageUrls = async (noteId: string): Promise<ApiResponse<{ urls: string[] }>> => {
  return client.get('/api/note/images', { params: { note_id: noteId } });
};
