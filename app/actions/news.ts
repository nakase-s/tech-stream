'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

export async function deleteNewsAction(ids: string[]) {
    if (!ids || ids.length === 0) {
        return { success: false, message: 'No IDs provided' };
    }

    try {
        const { error } = await supabase
            .from('news')
            .delete()
            .in('id', ids);

        if (error) {
            console.error('Error deleting news:', error);
            return { success: false, message: error.message };
        }

        revalidatePath('/');
        return { success: true };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { success: false, message: 'Unexpected error occurred' };
    }
}
