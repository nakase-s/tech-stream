import { supabase } from '@/lib/supabaseClient';

import AppHeader from '@/components/layout/AppHeader';
import NewsHeader from '@/components/news/NewsHeader';
import NewsDashboard from '@/components/news/NewsDashboard';
import { NewsItem } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: any }) {
  const params = await searchParams;

  let query = supabase.from('news').select('*');

  // Sort
  if (params.sort === 'importance') {
    query = query.order('importance', { ascending: false });
  } else {
    query = query.order('published_at', { ascending: false });
  }

  // Filters
  if (params.title) query = query.ilike('title', `%${params.title}%`);
  if (params.tag) query = query.eq('tag', params.tag);
  if (params.startDate) query = query.gte('published_at', `${params.startDate}T00:00:00`);
  if (params.endDate) query = query.lte('published_at', `${params.endDate}T23:59:59`);

  // Bookmark Filter
  if (params.filter === 'saved') {
    query = query.eq('is_saved', true);
  }

  // Parallel fetching of News, Keywords (for colors), and existing Tags
  const [newsResult, keywordsResult, tagsResult] = await Promise.all([
    query,
    supabase.from('search_keywords').select('keyword, color'),
    supabase.from('news').select('tag').not('tag', 'is', null)
  ]);

  const items = (newsResult.data ?? []) as NewsItem[];
  const registeredKeywords = (keywordsResult.data ?? []) as { keyword: string; color: string }[];
  const allTagsRaw = (tagsResult.data ?? []) as { tag: string }[];

  // Dedup tags from the actual news data
  const uniqueTags = Array.from(new Set(allTagsRaw.map(r => r.tag).filter(Boolean)));

  // Create a map for quick color lookup: { "AI": "#RRGGBB" }
  const tagColors: Record<string, string> = {};
  registeredKeywords.forEach(k => {
    // Normalize to handle case sensitivity if needed, but strict match is fine for now
    tagColors[k.keyword] = k.color;
  });

  // Explicit overrides
  tagColors['YouTube'] = '#a1a1aa'; // Zinc-400 (Silver-ish)

  // Build the keywords list for the dropdown based on ACTUAL tags in 'news'
  const keywords = uniqueTags.sort().map(tag => ({
    keyword: tag,
    color: tagColors[tag] || '#94a3b8' // Fallback color (Slate-400) if not in registered keywords
  }));

  return (
    <div className="relative min-h-screen text-white">


      <div className="relative z-10">
        <AppHeader />

        <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8">
          <NewsHeader />

          <NewsDashboard initialItems={items} tagColors={tagColors} keywords={keywords} />
        </main>
      </div>
    </div>
  );
}
