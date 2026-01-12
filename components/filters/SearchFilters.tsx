'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef } from 'react';
import { Search, RotateCcw, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [start, setStart] = useState(searchParams.get('startDate') || '');
  const [end, setEnd] = useState(searchParams.get('endDate') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const onSearch = () => {
    const p = new URLSearchParams();
    if (title) p.set('title', title);
    if (start) p.set('startDate', start);
    if (end) p.set('endDate', end);
    if (sort) p.set('sort', sort);
    router.push(`/?${p.toString()}`);
  };

  const onReset = () => {
    setTitle('');
    setStart('');
    setEnd('');
    setSort('');
    router.push('/');
  };

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
        className="flex items-center gap-3 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => inputRef.current?.showPicker()}
      >
        <CalendarIcon className="w-4 h-4 text-blue-400 shrink-0" />
        <span className={`truncate ${value ? 'text-white' : 'text-slate-500'}`}>
          {value || 'Select Date'}
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
    <div className="w-full bg-zinc-900/40 border border-white/5 backdrop-blur-sm p-6 rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">

        {/* 1. Keyword Search (Col span 4) */}
        <div className="md:col-span-12 lg:col-span-4 space-y-2">
          <label className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">Target Keyword</label>
          <div className="relative group">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSearch()}
              placeholder="Search news..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          </div>
        </div>

        {/* 2. Date Range (Col span 4) */}
        <div className="md:col-span-6 lg:col-span-4 space-y-2">
          <label className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">Date Range</label>
          <div className="flex items-center gap-2">
            <DatePickerTrigger value={start} onChange={setStart} inputRef={startInputRef} />
            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
            <DatePickerTrigger value={end} onChange={setEnd} inputRef={endInputRef} />
          </div>
        </div>

        {/* 3. Sort (Col span 2) */}
        <div className="md:col-span-3 lg:col-span-2 space-y-2">
          <label className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">Sort By</label>
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-white/10 transition-all pr-8"
            >
              <option value="" className="bg-slate-900 text-slate-300">Latest First</option>
              <option value="importance" className="bg-slate-900 text-slate-300">Highest Stars</option>
            </select>
            {/* Custom arrow */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* 4. Actions (Col span 2) */}
        <div className="md:col-span-3 lg:col-span-2 flex gap-3 h-[46px]"> {/* Fixed height matching inputs roughly */}
          <button
            onClick={onSearch}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2 group h-full"
          >
            SCAN
          </button>
          <button
            onClick={onReset}
            className="w-12 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 rounded-xl flex items-center justify-center transition-all active:scale-95 h-full"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
