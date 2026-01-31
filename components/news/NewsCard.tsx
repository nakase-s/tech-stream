import { Star, Image as ImageIcon, Bookmark, Trash2 } from 'lucide-react';

import { useLocale } from '@/context/LocaleContext';
import { toggleBookmarkAction } from '@/app/actions/bookmark';
import { deleteNewsAction } from '@/app/actions/news';
import { NewsItem } from '@/types/database';
import Link from 'next/link';

// Helper to extract Video ID from various YouTube URL formats
function extractVideoId(url: string | null): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

// Helper to format duration
function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds && seconds !== 0) return null;

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function NewsCard({
  item,
  tagColor,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  onTagClick,
}: {
  item: NewsItem,
  tagColor?: string,
  isSelectionMode?: boolean,
  isSelected?: boolean,
  onToggleSelect?: () => void,
  onTagClick?: (tag: string) => void
}) {
  const { t } = useLocale();
  // Parsing date safely, ensuring valid output
  let formattedDate = '';
  try {
    formattedDate = new Date(item.published_at).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) { /* fallback */ }

  const starCount = Number(item.importance) || 0;
  const durationLabel = formatDuration(item.duration_sec);

  // Use DB-provided color or default to Cyber Cyan
  // Special case: 'Subscription' tag uses Gold (Amber-500)
  const accentColor = item.tag === 'Subscription' ? '#f59e0b' : (tagColor || '#06b6d4');

  // Dynamic Tag Style
  const tagStyle = {
    backgroundColor: `${accentColor}1A`, // 10% opacity
    borderColor: `${accentColor}80`,    // 50% opacity for better visibility
    color: accentColor,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode && onToggleSelect) {
      e.preventDefault();
      onToggleSelect();
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleBookmarkAction(item.id, item.is_saved);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(t('card.confirmDelete'))) return;

    await deleteNewsAction([item.id]);
  };

  return (
    <article
      className={`
        group relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300
        ${isSelectionMode && isSelected
          ? 'bg-red-950/30 border-red-500/80 shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-[0.98]'
          : 'bg-gradient-to-br from-cyan-900/40 via-blue-900/20 to-transparent border-[color:var(--accent-color)]/30 hover:from-cyan-800/60 hover:border-[color:var(--accent-color)] hover:shadow-[0_0_20px_-5px_var(--accent-color)] hover:-translate-y-1'
        }
        ${isSelectionMode ? 'cursor-pointer backdrop-blur-md border-[2px]' : 'backdrop-blur-xl border-[2px]'}
      `}
      style={{ '--accent-color': accentColor } as React.CSSProperties}
      onClick={handleCardClick}
    >

      {/* Content Wrapper */}
      <div className="flex flex-col h-full p-5">

        {/* 1. Header: Meta + Actions */}
        <div className="flex justify-between items-start mb-3 w-full gap-3">

          {/* Left: Date & Channel */}
          <div className="flex-1 min-w-0 flex flex-col items-start gap-1">
            <time className="text-[10px] font-mono font-bold text-slate-400 tracking-wider whitespace-nowrap">
              {formattedDate}
            </time>
            {item.channel_title && (
              <a
                href={
                  item.channel_id
                    ? `https://www.youtube.com/channel/${item.channel_id}/videos`
                    : `https://www.youtube.com/results?search_query=${encodeURIComponent(item.channel_title || "")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-slate-500 font-medium truncate w-full hover:!text-cyan-400 hover:underline cursor-pointer block relative z-10 transition-colors"
                title={`Visit ${item.channel_title}`}
              >
                {item.channel_title}
              </a>
            )}
          </div>

          {/* Right: Unified Action Icons */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-900/40 rounded-lg p-1 backdrop-blur-sm border border-white/5">

            {/* Bookmark Button (Always Visible or !SelectionMode? - Keeping !SelectionMode for now to match strict "Trash: Selection &&" duality, 
                but user said "Unified design". If I show both, it's cool. 
                Let's show Bookmark ALWAYS for utility, unless previously restricted. 
                Prompt: "Bookark... Trash(SelectionOnly)". Implies Bookmark is default. 
                I will show Bookmark ALWAYS. 
            */}
            <button
              onClick={handleToggleBookmark}
              className="group/btn h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-800/50 transition-all duration-300"
              title={item.is_saved ? "Remove from Vault" : "Save to Vault"}
            >
              <Bookmark
                className={`w-5 h-5 transition-all duration-300 ${item.is_saved
                  ? 'text-fuchsia-500 fill-fuchsia-500 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]'
                  : 'text-slate-600 group-hover/btn:text-fuchsia-500'
                  }`}
              />
            </button>

            {/* Individual Delete Button (Visible ONLY when NOT in Selection Mode) */}
            {!isSelectionMode && (
              <button
                onClick={handleDelete}
                className="group/btn h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-800/50 transition-all duration-300"
                title={t('card.delete')}
              >
                <Trash2
                  className="w-5 h-5 transition-all duration-300 text-slate-600 group-hover/btn:text-red-500 group-hover/btn:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                />
              </button>
            )}

            {/* Trash / Selection Button (Visible ONLY in Selection Mode) */}
            {isSelectionMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect?.();
                }}
                className={`h-8 w-8 flex items-center justify-center rounded-md transition-all duration-300 ${isSelected
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-slate-600 hover:text-red-400 hover:bg-slate-800/50'
                  }`}
                title={isSelected ? "Deselect" : "Select for Deletion"}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

          </div>
        </div>

        {/* 2. Title - Fixed min-height for alignment */}
        {isSelectionMode ? (
          <div className="block mb-2 min-h-[3.5rem]">
            <h3 className="text-lg font-bold leading-snug text-slate-100 transition-colors line-clamp-2 break-words hyphens-auto">
              {item.title}
            </h3>
          </div>
        ) : (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-2 group/title min-h-[3.5rem]"
          >
            <h3 className="text-lg font-bold leading-snug text-slate-100 group-hover/title:text-cyan-400 transition-colors line-clamp-2 break-words hyphens-auto">
              {item.title}
            </h3>
          </a>
        )}

        {/* 3. Tags */}
        {
          item.tag && (
            <div className="mb-4 flex flex-wrap gap-2">
              {item.tag.split(',').map((tagRaw) => {
                const tag = tagRaw.trim();
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all hover:brightness-150"
                    style={tagStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick?.(tag);
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )
        }

        {/* Thumbnail - Strictly h-36 */}
        {isSelectionMode ? (
          <div className="block w-full h-36 overflow-hidden rounded-lg bg-black/40 border border-white/5 mb-4 relative flex-shrink-0">
            {item.thumbnail_url && item.thumbnail_url !== 'empty' ? (
              <img
                src={item.thumbnail_url}
                alt={item.title}
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-30">
                <ImageIcon className="w-6 h-6" />
                <span className="text-[9px] font-bold uppercase tracking-widest">{t('card.noSignal')}</span>
              </div>
            )}
            {durationLabel && (
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-mono pointer-events-none z-10">
                {durationLabel}
              </div>
            )}
            {item.score !== undefined && item.score !== null && (
              <div className="absolute bottom-1 left-1 bg-black/80 text-white text-[10px] px-1 rounded font-mono pointer-events-none z-10">
                Score: {item.score}
              </div>
            )}
          </div>
        ) : (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-36 overflow-hidden rounded-lg bg-black/40 border border-white/5 mb-4 relative flex-shrink-0"
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
                <span className="text-[9px] font-bold uppercase tracking-widest">{t('card.noSignal')}</span>
              </div>
            )}
            {durationLabel && (
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-mono pointer-events-none z-10">
                {durationLabel}
              </div>
            )}
            {item.score !== undefined && item.score !== null && (
              <div className="absolute bottom-1 left-1 bg-black/80 text-white text-[10px] px-1 rounded font-mono pointer-events-none z-10">
                Score: {item.score}
              </div>
            )}
          </a>
        )}

        {/* Rating & Details Button */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={`transition-colors ${i < starCount
                  ? 'fill-cyan-500 text-cyan-500 animate-[pulse_3s_ease-in-out_infinite]'
                  : 'fill-transparent text-slate-700'
                  }`}
              />
            ))}
          </div>

          {!isSelectionMode && (
            <Link
              href={`/report/${extractVideoId(item.url)}`}
              target="_blank"
              className="text-[10px] bg-cyan-950/50 hover:bg-cyan-900 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/50 transition-colors"
            >
              {t('card.details')}
            </Link>
          )}
        </div>

        {/* Summary */}
        <p className="mt-auto text-xs leading-relaxed text-slate-400 line-clamp-3 break-words hyphens-auto">
          {item.summary}
        </p>

      </div>
    </article >
  );
}
