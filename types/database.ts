export type NewsItem = {
    id: string;
    title: string;
    url: string;
    thumbnail_url: string | null;
    summary: string | null;
    published_at: string;
    importance: number | string | null;
    tag?: string | null;
    channel_title?: string | null;
    channel_id?: string | null;
    is_saved: boolean;
    duration_sec?: number | null;
    score?: number | null;
};
