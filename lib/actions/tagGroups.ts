'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Interfaces
export interface TagGroup {
    id: string;
    name: string;
    color: string;
    created_at: string;
}

export interface TagGroupWithKeywords {
    id: string;
    name: string;
    keyword: string; // Alias for UI compatibility
    color: string;
    created_at: string;
    members: {
        keyword_id: string;
        keyword: string;
    }[];
}

export async function createTagGroup(name: string, color: string) {
    try {
        const { data, error } = await supabase
            .from('tag_groups')
            .insert({
                name: name,
                color: color
            })
            .select()
            .single();

        if (error) {
            // Check for unique constraint on name
            if (error.code === '23505') {
                return { success: false, error: 'A group with this name already exists.' };
            }
            console.error('createTagGroup error:', error);
            return { success: false, error: 'Failed to create group' };
        }

        revalidatePath('/settings/keywords');
        return { success: true, data };
    } catch (error) {
        console.error('createTagGroup unexpected error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function updateTagGroup(id: string, updates: { name?: string; color?: string }) {
    try {
        const { error } = await supabase
            .from('tag_groups')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('updateTagGroup error:', error);
            return { success: false, error: 'Failed to update group' };
        }

        revalidatePath('/settings/keywords');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('updateTagGroup unexpected error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function deleteTagGroup(id: string) {
    try {
        const { error } = await supabase
            .from('tag_groups')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('deleteTagGroup error:', error);
            return { success: false, error: 'Failed to delete group' };
        }

        revalidatePath('/settings/keywords');
        return { success: true };
    } catch (error) {
        console.error('deleteTagGroup unexpected error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function addKeywordToGroup(groupId: string, keywordId: string) {
    try {
        // Hybrid Schema: Update the keyword's tag_group_id
        const { error } = await supabase
            .from('search_keywords')
            .update({ tag_group_id: groupId })
            .eq('id', keywordId);

        if (error) {
            console.error('addKeywordToGroup error:', error);
            return { success: false, error: 'Failed to add keyword to group' };
        }

        revalidatePath('/settings/keywords');
        return { success: true };
    } catch (error) {
        console.error('addKeywordToGroup unexpected error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function removeKeywordFromGroup(groupId: string, keywordId: string) {
    try {
        // Hybrid Schema: Set tag_group_id to null
        const { error } = await supabase
            .from('search_keywords')
            .update({ tag_group_id: null })
            .eq('id', keywordId)
            // Safety check: only remove if it's currently in this group
            .eq('tag_group_id', groupId);

        if (error) {
            console.error('removeKeywordFromGroup error:', error);
            return { success: false, error: 'Failed to remove keyword from group' };
        }

        revalidatePath('/settings/keywords');
        return { success: true };
    } catch (error) {
        console.error('removeKeywordFromGroup unexpected error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

export async function getTagGroups(): Promise<{ success: boolean; data?: TagGroupWithKeywords[]; error?: string }> {
    try {
        // 1. Fetch available groups
        const { data: groups, error: groupsError } = await supabase
            .from('tag_groups')
            .select('*')
            .order('created_at', { ascending: false });

        if (groupsError) throw groupsError;

        // 2. Fetch keywords that are assigned to ANY group
        const { data: keywords, error: keywordsError } = await supabase
            .from('search_keywords')
            .select('id, keyword, tag_group_id')
            .not('tag_group_id', 'is', null);

        if (keywordsError) throw keywordsError;

        // 3. Assemble
        const result: TagGroupWithKeywords[] = groups.map((g: any) => {
            const groupMembers = keywords
                .filter((k: any) => k.tag_group_id === g.id)
                .map((k: any) => ({
                    keyword_id: k.id,
                    keyword: k.keyword
                }));

            return {
                id: g.id,
                name: g.name,
                keyword: g.name, // Aliasing
                color: g.color || '#3B82F6',
                created_at: g.created_at,
                members: groupMembers
            };
        });

        return { success: true, data: result };

    } catch (error) {
        console.error('getTagGroups error:', error);
        return { success: false, error: 'Failed to fetch tag groups' };
    }
}
