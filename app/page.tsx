import { supabase } from '@/lib/supabaseClient';
import { Star, Radio, Image as ImageIcon } from 'lucide-react';
import SearchFilters from '@/components/SearchFilters';
import DeleteButton from '@/components/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  let query = supabase.from('news').select('*');

  // Sorting logic
  if (params.sort === 'importance') {
    query = query.order('importance', { ascending: false });
  } else {
    query = query.order('published_at', { ascending: false });
  }

  if (params.title) query = query.ilike('title', `%${params.title}%`);
  if (params.startDate) query = query.gte('published_at', `${params.startDate}T00:00:00`);
  if (params.endDate) query = query.lte('published_at', `${params.endDate}T23:59:59`);

  const { data: news } = await query;

  return (
    <div className="relative min-h-screen text-white font-sans overflow-x-hidden">
      {/* Background Video */}
      <video autoPlay muted loop className="fixed inset-0 w-full h-full object-cover z-0">
        <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-circuit-board-1544-large.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-[2px] z-10"></div>

      <div className="relative z-20">
        <header className="border-b border-white/10 py-6 px-12 bg-black/20 backdrop-blur-md">
          <div className="max-w-7xl flex justify-between items-center">
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3 italic">
              <Radio className="text-blue-500 animate-pulse" /> AI INTEL HUB
            </h1>
            <div className="text-[10px] tracking-[0.4em] text-blue-400 font-bold uppercase">System Active // 2026</div>
          </div>
        </header>

        <main className="w-full">
          <div className="max-w-7xl mx-auto px-12 py-16">
            <section className="mb-10 text-left">
              <h2 className="text-6xl font-black tracking-tighter mb-4 opacity-10">LATEST INTEL</h2>
              <SearchFilters />
            </section>
          </div>

          {/* Grid Container - Customized gaps */}
          <div className="w-full px-6 pb-20">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-x-8 gap-y-12 items-start">
              {news?.map((item) => (
                <article key={item.id} className="flex flex-col bg-zinc-900/60 border border-white/10 rounded-2xl p-6 transition-all hover:bg-zinc-800/80 hover:border-blue-500/50 hover:-translate-y-1 duration-300 h-full w-full shadow-2xl group">

                  {/* Metadata & Delete Check (Top) */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <time className="text-xs font-mono text-blue-400 font-bold tracking-widest">
                        {new Date(item.published_at).toLocaleDateString('ja-JP').replace(/\//g, '-')}
                      </time>
                      <span className="inline-block bg-blue-600/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded border border-blue-500/30 uppercase">
                        {item.engine_type}
                      </span>
                    </div>
                    <DeleteButton id={item.id} />
                  </div>

                  {/* 1. Title */}
                  <h3 className="text-xl font-bold leading-tight text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {/* 2. Thumbnail (my-6 for wider vertical spacing) */}
                  <div className="w-full aspect-video overflow-hidden rounded-xl my-6 relative bg-black/20 border border-white/5 shadow-md">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-full"
                    >
                      {item.thumbnail_url && item.thumbnail_url !== 'empty' ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800/50 text-slate-500 gap-2">
                          <ImageIcon className="w-8 h-8 opacity-50" />
                          <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">No Image</span>
                        </div>
                      )}
                    </a>
                  </div>

                  {/* 3. Stars (Importance) - Adjusted margin */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => {
                      const isFilled = i < Number(item.importance);
                      return (
                        <Star
                          key={i}
                          size={14}
                          style={{
                            fill: isFilled ? '#3b82f6' : 'transparent',
                            stroke: isFilled ? '#3b82f6' : '#334155'
                          }}
                          className={isFilled ? 'animate-pulse' : 'opacity-40'}
                        />
                      );
                    })}
                  </div>

                  {/* 4. Summary */}
                  <p className="text-slate-400 font-light leading-relaxed text-sm line-clamp-3 mt-auto">
                    {item.summary}
                  </p>

                </article>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}