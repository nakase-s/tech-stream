'use client';

import { useState, useTransition } from 'react';
import { fetchVideoDetails } from '@/lib/actions/youtube';
import { Loader2, Plus, Youtube, AlertCircle } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

export default function AddVideoForm() {
    const [url, setUrl] = useState('');
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string | null }>({ type: 'idle', message: null });
    const { t } = useLocale();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setStatus({ type: 'idle', message: null });
        startTransition(async () => {
            const result = await fetchVideoDetails(url);
            if (result.success) {
                setStatus({ type: 'success', message: result.message || 'Video added successfully' });
                setUrl('');
                // Clear success message after 3 seconds
                setTimeout(() => setStatus({ type: 'idle', message: null }), 3000);
            } else {
                setStatus({ type: 'error', message: result.error || 'Failed to add video' });
            }
        });
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-500 transition-colors">
                        <Youtube className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        // Placeholder should be localized ideally, but hardcoding for now or using default
                        placeholder={t('tools.pasteUrl')}
                        className="w-full rounded-lg border border-cyan-950 bg-white/5 pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:bg-slate-900/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]"
                        disabled={isPending}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isPending || !url.trim()}
                    className="flex items-center justify-center gap-2 rounded-lg bg-cyan-900/30 border border-cyan-950 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_-3px_rgba(6,182,212,0.1)] hover:shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]"
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{t('tools.addCard')}</span>
                </button>
            </form>

            {status.message && (
                <div className={`mt-2 flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-1
                    ${status.type === 'error' ? 'text-red-400' : 'text-emerald-400'}
                `}>
                    {status.type === 'error' ? <AlertCircle className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    {status.message}
                </div>
            )}
        </div>
    );
}
