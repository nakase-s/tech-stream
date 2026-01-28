
import { createClient } from '@supabase/supabase-js';

// process.env will be populated by --env-file

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars. Ensure you run with --env-file=.env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('--- Checking Existing Data ---');
    const { data: news, error } = await supabase.from('news').select('id, url, title');

    if (error) {
        console.error('Error fetching news:', error);
    } else {
        console.log(`Found ${news?.length ?? 0} records:`);
        news?.forEach(n => console.log(JSON.stringify(n, null, 2)));
    }

    console.log('\n--- Attempting Insertion ---');
    const testUrl = 'https://www.youtube.com/watch?v=nX6YXiXex1I';

    // First check if it exists loosely
    const { data: existing } = await supabase.from('news').select('*').eq('url', testUrl);
    if (existing && existing.length > 0) {
        console.log('URL already exists in DB:', existing);
    } else {
        console.log('URL not found via SELECT. Trying INSERT...');
    }

    const { data: insertData, error: insertError } = await supabase.from('news').insert([
        {
            url: testUrl,
            title: 'Test Video',
            published_at: new Date().toISOString()
        }
    ]).select();

    if (insertError) {
        console.error('Insert Error:', insertError);
    } else {
        console.log('Insert Success:', insertData);
        // Cleanup
        if (insertData && insertData[0]) {
            await supabase.from('news').delete().eq('id', insertData[0].id);
            console.log('Cleaned up test record.');
        }
    }
}

main();
