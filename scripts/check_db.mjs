
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
    try {
        const envPath = path.resolve('.env.local');
        if (!fs.existsSync(envPath)) return;
        const content = fs.readFileSync(envPath, 'utf-8');
        content.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim();
                process.env[key] = val;
            }
        });
    } catch (e) {
        console.error('Failed to load env', e);
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars even after manual parse.');
    console.log('Keys found:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
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
