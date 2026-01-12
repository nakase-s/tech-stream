'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function SearchFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [title, setTitle] = useState(searchParams.get('title') || '');
    const [start, setStart] = useState(searchParams.get('startDate') || '');
    const [end, setEnd] = useState(searchParams.get('endDate') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || '');

    const onSearch = () => {
        const p = new URLSearchParams();
        if (title) p.set('title', title);
        if (start) p.set('startDate', start);
        if (end) p.set('endDate', end);
        if (sort) p.set('sort', sort);
        router.push(`/?${p.toString()}`);
    };

    return (
        <div className="flex flex-wrap items-end gap-6 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl w-fit">
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-blue-400 tracking-widest uppercase">Target Keyword</label>
                <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSearch()} placeholder="SCAN KEYWORD..." className="w-full md:w-[300px] bg-white/10 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-white/30" />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-blue-400 tracking-widest uppercase">Range Start</label>
                <input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-[160px] bg-white/10 border-none rounded-xl px-4 py-3 text-sm outline-none text-white/80" />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-blue-400 tracking-widest uppercase">Range End</label>
                <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-[160px] bg-white/10 border-none rounded-xl px-4 py-3 text-sm outline-none text-white/80" />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-blue-400 tracking-widest uppercase">Sort Order</label>
                <select value={sort} onChange={e => setSort(e.target.value)} className="w-[160px] bg-white/10 border-none rounded-xl px-4 py-3 text-sm outline-none text-white cursor-pointer appearance-none">
                    <option value="" className="bg-slate-900 text-white">Latest Date</option>
                    <option value="importance" className="bg-slate-900 text-white">Highest Stars</option>
                </select>
            </div>
            <div className="flex gap-2">
                <button onClick={onSearch} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-xs font-black tracking-widest transition-all shadow-lg shadow-blue-500/20">SCAN</button>
                <button onClick={() => { setTitle(''); setStart(''); setEnd(''); setSort(''); router.push('/'); }} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all text-white"><RotateCcw size={18} /></button>
            </div>
        </div>
    );
}