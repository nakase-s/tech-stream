'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use Service Role Key for Admin actions (writing to db)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const youtubeApiKey = process.env.YOUTUBE_API_KEY!;

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
