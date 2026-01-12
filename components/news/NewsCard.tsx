'use client';

import { Star, Image as ImageIcon } from 'lucide-react';
import DeleteButton from '@/components/news/DeleteButton';

type NewsItem = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  summary: string | null;
  published_at: string;
  engine_type: string | null;
  importance: number | string | null;
};

export default function NewsCard({ item }: { item: NewsItem }) {
  // Parsing date safely, ensuring valid output
  let formattedDate = '';
  try {
    formattedDate = new Date(item.published_at).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  } catch (e) { /* fallback */ }

  const starCount = Number(item.importance) || 0;

  return (
    <article className="group relative flex flex-col h-full bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-zinc-800/60 hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10">

      {/* Content Wrapper */}
      <div className="flex flex-col h-full p-5">

        {/* Header */}
        <div className="flex items-start justify-between mb-3 min-h-[24px]">
          <div className="flex flex-wrap items-center gap-2">
            <time className="text-[10px] font-mono font-bold text-slate-500 tracking-wider">
              {formattedDate}
            </time>
            <span className="inline-flex items-center rounded-md border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400">
              {item.engine_type}
            </span>
          </div>
          {/* DeleteButton - Hover only, no overlay issues */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1" style={{ zIndex: 10 }}>
            <DeleteButton id={item.id} />
          </div>
        </div>

        {/* Title */}
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="block mb-3 group/title">
          <h3 className="text-base font-bold leading-snug text-slate-100 group-hover/title:text-blue-400 transition-colors line-clamp-2">
            {item.title}
          </h3>
        </a>

        {/* Thumbnail - Strictly h-36 */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-36 overflow-hidden rounded-lg bg-black/40 border border-white/5 mb-4 relative"
        >
          {item.thumbnail_url && item.thumbnail_url !== 'empty' ? (
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-30 group-hover:opacity-50 transition-opacity">
              <ImageIcon className="w-6 h-6" />
              <span className="text-[9px] font-bold uppercase tracking-widest">No Signal</span>
            </div>
          )}
        </a>

        {/* Rating */}
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              className={`transition-colors ${i < starCount
                  ? 'fill-blue-500 text-blue-500 animate-[pulse_3s_ease-in-out_infinite]'
                  : 'fill-transparent text-slate-700'
                }`}
            />
          ))}
        </div>

        {/* Summary */}
        <p className="mt-auto text-xs leading-relaxed text-slate-400 line-clamp-3">
          {item.summary}
        </p>

      </div>
    </article>
  );
}
