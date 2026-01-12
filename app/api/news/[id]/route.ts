import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Next.js 15: params must be awaited
    const { id } = await params;

    console.log(`[API] Delete request received for ID: ${id}`);

    if (!id) {
        console.error('[API] Error: Missing ID parameter');
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    // Perform the delete operation
    const { error } = await supabase.from('news').delete().eq('id', id);

    if (error) {
        console.error('[API] Supabase Delete Error Detail:', error.message);
        console.error('[API] Error Code:', error.code);
        console.error('[API] Error Details:', error.details);
        console.error('[API] Error Hint:', error.hint);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[API] Successfully deleted article with ID: ${id}`);
    return NextResponse.json({ success: true });
}
