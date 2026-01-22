// 用户信息
export interface UserInfo {
  user_id: string;
  nickname: string;
  avatar: string;
  desc?: string;
  fans_count?: number;
  follows_count?: number;
  notes_count?: number;
}

// 笔记信息
export interface NoteItem {
  note_id: string;
  title: string;
  desc?: string;
  type: 'normal' | 'video';
  cover: string;
  liked_count: number;
  collected_count?: number;
  comment_count?: number;
  user: {
    user_id: string;
    nickname: string;
    avatar: string;
  };
  images?: string[];
  video_url?: string;
  create_time?: number;
}

// 搜索结果
export interface SearchResult {
  items: NoteItem[];
  has_more: boolean;
  cursor?: string;
}

// 评论
export interface Comment {
  id: string;
  content: string;
  user: {
    user_id: string;
    nickname: string;
    avatar: string;
  };
  like_count: number;
  create_time: number;
  sub_comments?: Comment[];
}

// 登录状态
export interface QRCodeStatus {
  code: number;
  message: string;
  qr_id?: string;
  qr_url?: string;
  status?: 'waiting' | 'scanned' | 'confirmed' | 'expired';
}

// Feed 分类
export type FeedCategory =
  | 'homefeed_recommend'
  | 'homefeed.fashion_v3'
  | 'homefeed.food_v3'
  | 'homefeed.cosmetics_v3'
  | 'homefeed.movie_and_tv_v3'
  | 'homefeed.career_v3'
  | 'homefeed.love_v3'
  | 'homefeed.household_product_v3'
  | 'homefeed.gaming_v3'
  | 'homefeed.travel_v3'
  | 'homefeed.fitness_v3';

// 通知类型
export interface Notification {
  id: string;
  type: 'mention' | 'like' | 'follow' | 'comment';
  content: string;
  user: UserInfo;
  note?: NoteItem;
  create_time: number;
}

// API 响应
export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}
