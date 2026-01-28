'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

export async function toggleBookmarkAction(id: string, currentState: boolean) {
    try {
        const { error } = await supabase
            .from('news')
            .update({ is_saved: !currentState })
            .eq('id', id);

        if (error) {
            console.error('SERVER ACTION ERROR: Failed to toggle bookmark', {
                id,
                currentState,
                errorDetails: error,
                errorMessage: error.message,
                errorCode: error.code
            });
            return { success: false, message: `Database Error: ${error.message}` };
        }

        revalidatePath('/');
        return { success: true };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { success: false, message: 'Unexpected error occurred' };
    }
}
