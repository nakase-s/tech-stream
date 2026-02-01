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
  if (params.tag) query = query.ilike('tag', `%${params.tag}%`);
  if (params.startDate) query = query.gte('published_at', `${params.startDate}T00:00:00`);
  if (params.endDate) query = query.lte('published_at', `${params.endDate}T23:59:59`);

  // Bookmark Filter
  if (params.filter === 'saved') {
    query = query.eq('is_saved', true);
  }

  // Parallel fetching of News, Keywords, Tags, and Groups
  const [newsResult, keywordsResult, tagsResult, groupsResult] = await Promise.all([
    query,
    supabase.from('search_keywords').select('keyword, color, tag_group_id'),
    supabase.from('news').select('tag').not('tag', 'is', null),
    supabase.from('tag_groups').select('id, name, color')
  ]);

  const items = (newsResult.data ?? []) as NewsItem[];
  const registeredKeywords = (keywordsResult.data ?? []) as { keyword: string; color: string; tag_group_id: string | null }[];
  const allTagsRaw = (tagsResult.data ?? []) as { tag: string }[];
  const tagGroups = (groupsResult.data ?? []) as { id: string; name: string; color: string }[];

  // 1. Build Keyword -> Group Map
  const keywordToGroupMap: Record<string, { name: string; color: string }> = {};

  // Helper map for group lookup by ID
  const groupMap = new Map(tagGroups.map(g => [g.id, g]));

  registeredKeywords.forEach(k => {
    if (k.tag_group_id && groupMap.has(k.tag_group_id)) {
      const group = groupMap.get(k.tag_group_id)!;
      keywordToGroupMap[k.keyword] = {
        name: group.name,
        color: group.color
      };
    }
  });

  // Dedup tags from the actual news data (handle comma-separated tags)
  const uniqueTags = Array.from(new Set(
    allTagsRaw
      .map(r => r.tag)
      .filter(Boolean)
      .flatMap(tag => tag.split(','))
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
  ));

  // Create a map for quick color lookup: { "AI": "#RRGGBB", "Frontend": "#RRGGBB" }
  const tagColors: Record<string, string> = {};

  // Add colors for individual keywords
  registeredKeywords.forEach(k => {
    tagColors[k.keyword] = k.color;
  });

  // Add colors for groups
  tagGroups.forEach(g => {
    tagColors[g.name] = g.color;
  });

  // Explicit overrides
  tagColors['YouTube'] = '#a1a1aa'; // Zinc-400 (Silver-ish)

  // Build the detailed keywords list for the dropdown based on ACTUAL tags in 'news'
  // If a tag belongs to a group, use the GROUP name.
  const effectiveTagsSet = new Set<string>();

  uniqueTags.forEach(tag => {
    if (keywordToGroupMap[tag]) {
      effectiveTagsSet.add(keywordToGroupMap[tag].name);
    } else {
      effectiveTagsSet.add(tag);
    }
  });

  const keywords = Array.from(effectiveTagsSet).sort().map(tag => ({
    keyword: tag,
    color: tagColors[tag] || '#94a3b8' // Fallback color
  }));

  return (
    <div className="relative min-h-screen text-white">


      <div className="relative z-10">
        <AppHeader />

        <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8">
          <NewsHeader />

          <NewsDashboard
            initialItems={items}
            tagColors={tagColors}
            keywords={keywords}
            keywordToGroupMap={keywordToGroupMap}
          />
        </main>
      </div>
    </div>
  );
}
