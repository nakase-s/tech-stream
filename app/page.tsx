import { supabase } from '@/lib/supabaseClient';

import AppBackground from '@/components/layout/AppBackground';
import AppHeader from '@/components/layout/AppHeader';
import SearchFilters from '@/components/filters/SearchFilters';
import NewsGrid from '@/components/news/NewsGrid';

export const dynamic = 'force-dynamic';

type NewsRow = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  summary: string | null;
  published_at: string;
  engine_type: string | null;
  importance: number | string | null;
};

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
  if (params.startDate) query = query.gte('published_at', `${params.startDate}T00:00:00`);
  if (params.endDate) query = query.lte('published_at', `${params.endDate}T23:59:59`);

  const { data } = await query;
  const items = (data ?? []) as NewsRow[];

  return (
    <div className="relative min-h-screen text-white">
      <AppBackground />

      <div className="relative z-10">
        <AppHeader />

        <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8">
          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">ニュース一覧</h2>
            <p className="mt-1 text-sm text-slate-400">キーワード・期間で絞り込み、重要度で並び替えできます。</p>

            <div className="mt-6">
              <SearchFilters />
            </div>
          </section>

          <NewsGrid items={items} />
        </main>
      </div>
    </div>
  );
}
