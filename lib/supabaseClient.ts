
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

console.log('Initializing Supabase Client...');
console.log('URL:', supabaseUrl);
// Do not log the full key for security, just presence
console.log('Key preset:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
