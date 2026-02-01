'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use Service Role Key for Admin actions
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface SearchKeyword {
    id: string;
    keyword: string;
    color: string;
    type: 'include' | 'exclude';
    created_at: string;
    tag_group_id?: string | null;
}

export async function addKeyword(keyword: string, color: string = '#3B82F6', type: 'include' | 'exclude' = 'include') {
    if (!keyword || !keyword.trim()) {
        return { success: false, error: 'Keyword is required' };
    }

    try {
        const { error } = await supabase
            .from('search_keywords')
            .insert({
                keyword: keyword.trim(),
                color: color,
                type: type,
            });

        if (error) {
            if (error.code === '23505') { // Unique violation
                return { success: false, error: 'Keyword already exists' };
            }
            console.error('addKeyword Supabase error:', error);
            return { success: false, error: 'Failed to add keyword' };
        }

        revalidatePath('/settings/keywords');
        return { success: true };
    } catch (error) {
        console.error('addKeyword error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function deleteKeyword(id: string) {
    try {
        const { error } = await supabase
            .from('search_keywords')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('deleteKeyword error:', error);
            return { success: false, error: 'Failed to delete keyword' };
        }

        revalidatePath('/settings/keywords');
        return { success: true };
    } catch (error) {
        console.error('deleteKeyword error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}


export async function updateKeywordColor(id: string, color: string) {
    try {
        const { error } = await supabase
            .from('search_keywords')
            .update({ color: color })
            .eq('id', id);

        if (error) {
            console.error('updateKeywordColor error:', error);
            return { success: false, error: 'Failed to update color' };
        }

        revalidatePath('/settings/keywords');
        revalidatePath('/'); // Refresh main page to reflect color changes immediately
        return { success: true };
    } catch (error) {
        console.error('updateKeywordColor error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function getKeywords(): Promise<{ success: boolean; data?: SearchKeyword[]; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('search_keywords')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('getKeywords error:', error);
            return { success: false, error: 'Failed to fetch keywords' };
        }

        return { success: true, data: data as SearchKeyword[] };
    } catch (error) {
        console.error('getKeywords error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
