'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Search, RotateCcw, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

import { Trash2, Archive } from 'lucide-react';

type SearchFiltersProps = {
  isSelectionMode?: boolean;
  onToggleSelectionMode?: () => void;
  tags?: { keyword: string; color: string }[];
};

export default function SearchFilters({ isSelectionMode = false, onToggleSelectionMode, tags = [] }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();

  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [tag, setTag] = useState(searchParams.get('tag') || '');
  const [start, setStart] = useState(searchParams.get('startDate') || '');
  const [end, setEnd] = useState(searchParams.get('endDate') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  const isSavedFilterType = searchParams.get('filter') === 'saved';

  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  // Sync state with URL params
  useEffect(() => {
    setTitle(searchParams.get('title') || '');
    setTag(searchParams.get('tag') || '');
    setStart(searchParams.get('startDate') || '');
    setEnd(searchParams.get('endDate') || '');
    setSort(searchParams.get('sort') || '');
  }, [searchParams]);

  const triggerSearch = (overrides: { [key: string]: string } = {}) => {
    const p = new URLSearchParams();

    const t = 'title' in overrides ? overrides.title : title;
    if (t) p.set('title', t);

    const tg = 'tag' in overrides ? overrides.tag : tag;
    if (tg) p.set('tag', tg);

    const s = 'startDate' in overrides ? overrides.startDate : start;
    if (s) p.set('startDate', s);

    const e = 'endDate' in overrides ? overrides.endDate : end;
    if (e) p.set('endDate', e);

    const so = 'sort' in overrides ? overrides.sort : sort;
    if (so) p.set('sort', so);

    if (isSavedFilterType) p.set('filter', 'saved'); // Persist saved filter if active
    router.push(`/?${p.toString()}`);
  };

  const onSearch = () => triggerSearch();

  const onReset = () => {
    setTitle('');
    setTag('');
    setStart('');
    setEnd('');
    setSort('');
    router.push('/');
  };

  const onToggleSavedFilter = () => {
    const p = new URLSearchParams(searchParams.toString());
    if (isSavedFilterType) {
      p.delete('filter');
    } else {
      p.set('filter', 'saved');
    }
    router.push(`/?${p.toString()}`);
  }

  // Custom Date Trigger Component
  const DatePickerTrigger = ({
    value,
    onChange,
    inputRef
  }: {
    value: string;
    onChange: (val: string) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => (
    <div className="relative group w-full">
      {/* Visual Button */}
      <div
        className="flex items-center gap-3 w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-base cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => inputRef.current?.showPicker()}
      >
        <CalendarIcon className="w-5 h-5 text-blue-400 shrink-0" />
        <span className={`truncate ${value ? 'text-white' : 'text-slate-500'}`}>
          {value || t('filters.selectDate')}
        </span>
      </div>

      {/* Invisible Native Input */}
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );

  return (
    <div className="w-full bg-slate-950/80 border border-white/10 shadow-2xl backdrop-blur-xl p-4 rounded-2xl flex flex-col gap-3">

      {/* --- Row 1: Keyword Input + Tools --- */}
      <div className="flex items-center gap-2 w-full">
        {/* Keyword Input (Flex Grow) */}
        <div className="flex-1 relative group">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            placeholder={t('filters.searchPlaceholder')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 pl-10 text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
        </div>

        {/* Tools Button Group (Fixed) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onReset}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0"
            title={t('filters.reset')}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleSavedFilter}
            className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 ${isSavedFilterType
              ? 'bg-fuchsia-950/50 border-fuchsia-500 text-fuchsia-400 shadow-[0_0_15px_-5px_magenta]'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            title="Toggle Saved Items (Vault)"
          >
            <Archive className="w-5 h-5" />
          </button>

          {onToggleSelectionMode && (
            <button
              onClick={onToggleSelectionMode}
              className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 ${isSelectionMode
                ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_-5px_red]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              title={isSelectionMode ? "Exit Selection Mode" : "Bulk Delete Mode"}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* --- Row 2: Date + Sort + Scan --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full">

        {/* Date Range (Flex Grow) */}
        <div className="flex items-center gap-2 min-w-0 md:col-span-12 lg:col-span-5">
          <DatePickerTrigger value={start} onChange={setStart} inputRef={startInputRef} />
          <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />
          <DatePickerTrigger value={end} onChange={setEnd} inputRef={endInputRef} />
        </div>

        {/* Tag Filter (Newly Added) */}
        <div className="relative md:col-span-4 lg:col-span-3">
          <select
            value={tag}
            onChange={e => {
              const val = e.target.value;
              setTag(val);
              triggerSearch({ tag: val });
              e.target.blur();
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-base text-white appearance-none cursor-pointer focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-white/10 transition-all pr-8"
          >
            <option value="" className="bg-slate-900 text-slate-300">{t('filters.allTags') || "All Tags"}</option>
            {tags.map((t, i) => (
              <option key={i} value={t.keyword} className="bg-slate-900 text-white">
                {t.keyword}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Sort (Fixed Width or Grow on mobile) */}
        <div className="relative md:col-span-4 lg:col-span-2">
          <select
            value={sort}
            onChange={e => {
              const val = e.target.value;
              setSort(val);
              triggerSearch({ sort: val });
              e.target.blur();
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-base text-white appearance-none cursor-pointer focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-white/10 transition-all pr-8"
          >
            <option value="" className="bg-slate-900 text-slate-300">{t('filters.latestFirst')}</option>
            <option value="importance" className="bg-slate-900 text-slate-300">{t('filters.highestStars')}</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Scan Button (Auto Width or Full on mobile) */}
        <div className="md:col-span-4 lg:col-span-2">
          <button
            onClick={onSearch}
            className="w-full px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2 group h-12 whitespace-nowrap"
          >
            {t('filters.scan')}
          </button>
        </div>

      </div>

    </div>
  );
}
