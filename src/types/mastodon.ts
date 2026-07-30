export interface MastodonPost {
  id: string;
  created_at: string;
  content: string;
  url?: string;
  account?: {
    id: string;
    username: string;
    display_name?: string;
    avatar?: string;
    avatar_static?: string;
  };
  media_attachments?: Array<{
    id: string;
    type: 'image' | 'video' | 'gifv' | 'audio';
    url: string;
    preview_url?: string;
    description?: string;
  }>;
  replies_count?: number;
  reblogs_count?: number;
  favourites_count?: number;
  reblog?: MastodonPost;
}