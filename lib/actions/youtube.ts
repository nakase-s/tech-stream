'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use Service Role Key for Admin actions (writing to db)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const youtubeApiKey = process.env.YOUTUBE_API_KEY!;
const geminiApiKey = process.env.GEMINI_API_KEY!;

if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface YouTubeChannel {
    id: string;
    name: string;
    channel_id: string;
    created_at: string;
}

export async function registerChannel(channelId: string) {
    if (!channelId) {
        return { success: false, error: 'Channel ID is required' };
    }

    try {
        // 1. Verify channel existence via YouTube Data API
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${youtubeApiKey}`
        );

        if (!response.ok) {
            return { success: false, error: 'Failed to verify channel with YouTube' };
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return { success: false, error: 'Channel not found on YouTube' };
        }

        const channelTitle = data.items[0].snippet.title;

        // 2. Save to Supabase
        const { error } = await supabase
            .from('youtube_channels')
            .insert({
                channel_id: channelId,
                name: channelTitle,
            });

        if (error) {
            // Check for unique key violation if mapped, normally channel_id might be unique
            if (error.code === '23505') {
                return { success: false, error: 'Channel already registered' };
            }
            console.error('Supabase error:', error);
            return { success: false, error: 'Failed to save channel to database' };
        }

        revalidatePath('/settings/channels');
        return { success: true, message: `Registered: ${channelTitle}` };
    } catch (error) {
        console.error('registerChannel error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function deleteChannel(id: string) {
    try {
        const { error } = await supabase
            .from('youtube_channels')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            return { success: false, error: 'Failed to delete channel' };
        }

        revalidatePath('/settings/channels');
        return { success: true };
    } catch (error) {
        console.error('deleteChannel error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function getChannels(): Promise<{ success: boolean; data?: YouTubeChannel[]; error?: string }> {
    try {
        // Using simple fetch without service key for read-only might be better if RLS allows, 
        // but consistent admin access ensures we see everything for settings.
        const { data, error } = await supabase
            .from('youtube_channels')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('getChannels error:', error);
            return { success: false, error: 'Failed to fetch channels' };
        }

        return { success: true, data: data as YouTubeChannel[] };
    } catch (error) {
        console.error('getChannels error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
// Helper to extract Video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Helper: Generate Summary & Importance via Gemini
async function generateSummaryAndImportance(description: string, title: string): Promise<{ summary: string; importance: number }> {
    if (!permissionToUseGemini()) return { summary: description, importance: 5 };

    try {
        const prompt = `
        Video Title: ${title}
        Description: ${description}

        Task:
        1. Summarize the content in Japanese in 3 lines or less.
        2. Rate the technical importance for an AI/Tech engineer on a scale of 1 to 5 (5 = Critical/High Value, 1 = Low).

        Return strictly JSON format:
        {
          "summary": "...",
          "importance": 3
        }
        `;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            }
        );

        if (!response.ok) {
            console.error('Gemini API Error:', await response.text());
            return { summary: description, importance: 5 }; // Fallback
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            const result = JSON.parse(text);
            return {
                summary: result.summary || description.slice(0, 200),
                importance: Number(result.importance) || 3
            };
        }
    } catch (e) {
        console.error('Gemini processing failed:', e);
    }

    return { summary: description, importance: 5 };
}

function permissionToUseGemini() {
    return !!geminiApiKey;
}

// Helper to parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);

    return hours * 3600 + minutes * 60 + seconds;
}

export async function fetchVideoDetails(videoUrl: string) {
    if (!videoUrl) {
        return { success: false, error: 'URL is required' };
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
        return { success: false, error: 'Invalid YouTube URL' };
    }

    try {
        // 1. Fetch Video Details (snippet + contentDetails + statistics)
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${youtubeApiKey}`
        );

        if (!response.ok) {
            return { success: false, error: 'Failed to fetch video details from YouTube' };
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return { success: false, error: 'Video not found' };
        }

        const video = data.items[0];
        const snippet = video.snippet;
        const thumbnail = snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url;

        // Parse Duration
        const durationSec = video.contentDetails?.duration ? parseDuration(video.contentDetails.duration) : null;

        // Calculate Score
        const viewCount = Number(video.statistics?.viewCount) || 0;
        const publishedAt = new Date(snippet.publishedAt);
        const now = new Date();
        let hoursElapsed = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
        if (hoursElapsed < 1) hoursElapsed = 1;

        const score = Math.round(viewCount / hoursElapsed);

        // 1.5 Generate AI Summary & Importance
        const { summary, importance } = await generateSummaryAndImportance(snippet.description, snippet.title);

        // 2. Insert into News table
        const { error } = await supabase
            .from('news')
            .insert({
                title: snippet.title,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                thumbnail_url: thumbnail,
                summary: summary,
                published_at: snippet.publishedAt,
                importance: importance,
                tag: 'YouTube',
                source: 'YouTube',
                channel_title: snippet.channelTitle,
                is_saved: false,
                duration_sec: durationSec,
                score: score
            });

        if (error) {
            console.error('Supabase insert error:', error);
            // Check for potential duplicates if URL is unique?
            if (error.code === '23505') {
                return { success: false, error: 'This video is already in your dashboard.' };
            }
            return { success: false, error: `Failed to save to dashboard: ${error.message}` };
        }

        revalidatePath('/');
        return { success: true, message: `Added: ${snippet.title}` };

    } catch (error) {
        console.error('fetchVideoDetails error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function resolveChannelHandle(handle: string) {
    if (!handle) {
        return { success: false, error: 'Handle is required' };
    }

    // Ensure handle starts with '@' if not present, though users usually include it
    // The API expects just the handle name but documentation says "forHandle" parameter.
    // Let's assume input might or might not have @.
    // Actually, testing with API explorer, `forHandle` usually expects the handle string *with* or *without* @ depending on how they implemented it?
    // Docs say: "The parameter value must be a YouTube handle."
    // Let's keep it as users types it, but if they forget @, maybe add it? 
    // Wait, let's try raw input first. If it fails, I'll adjust.
    // But commonly handles are just the name. 
    // UPDATE: The parameter is `forHandle`. It's safer to pass exactly what the user inputs, but usually starts with @.

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${youtubeApiKey}`
        );

        if (!response.ok) {
            return { success: false, error: 'Failed to connect to YouTube API' };
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return { success: false, error: 'NOT_FOUND' };
        }

        const channelId = data.items[0].id;
        return { success: true, id: channelId };

    } catch (error) {
        console.error('resolveChannelHandle error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
