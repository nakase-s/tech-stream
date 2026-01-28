'use client';

import { useState, useTransition } from 'react';
import { addKeyword, deleteKeyword, updateKeywordColor, SearchKeyword } from '@/lib/actions/keywords';
import { Loader2, Trash2, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import CyberCard from '@/components/ui/CyberCard';

export default function KeywordManager({ initialKeywords }: { initialKeywords: SearchKeyword[] }) {
    const [keywords, setKeywords] = useState<SearchKeyword[]>(initialKeywords);
    const [newKeyword, setNewKeyword] = useState('');
    const [newColor, setNewColor] = useState('#3B82F6');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { t } = useLocale();

    if (initialKeywords !== keywords && !isPending) {
        setKeywords(initialKeywords);
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim()) return;

        setError(null);
        startTransition(async () => {
            const result = await addKeyword(newKeyword, newColor);
            if (result.success) {
                setNewKeyword('');
                setNewColor('#3B82F6');
                router.refresh();
            } else {
                setError(result.error || t('settings.keywords.errorAdd'));
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('settings.keywords.confirmDelete'))) return;

        startTransition(async () => {
            const result = await deleteKeyword(id);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || t('settings.keywords.errorDelete'));
            }
        });
    };

    const handleColorUpdate = (id: string, color: string) => {
        startTransition(async () => {
            // Optimistically update local state if needed, but router.refresh handles it cleanly
            await updateKeywordColor(id, color);
            // No error handling alert for color change to keep it smooth, ideally show toast
        });
    };

    return (
        <div className="space-y-8">
            {/* Add New Keyword Card */}
            <CyberCard hoverEffect={false} className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-cyan-400" />
                    {t('settings.keywords.addNew')}
                </h2>

                <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row">
                    <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder={t('settings.keywords.placeholder')}
                        className="flex-1 rounded-lg border border-white/20 bg-black/50 px-4 py-2.5 text-sm text-cyan-50 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        disabled={isPending}
                    />
                    <div className="relative flex items-center">
                        <input
                            type="color"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            className="h-10 w-14 cursor-pointer rounded-lg border border-white/20 bg-black/50 p-1"
                            disabled={isPending}
                            title={t('settings.keywords.selectColor')}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending || !newKeyword.trim()}
                        className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        {t('settings.keywords.add')}
                    </button>
                </form>
                {error && (
                    <div className="mt-3 text-sm text-red-400">
                        {error}
                    </div>
                )}
            </CyberCard>

            {/* Keyword List */}
            <CyberCard hoverEffect={false} className="overflow-hidden">
                <div className="border-b border-white/10 bg-slate-950/50 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Search className="h-5 w-5 text-cyan-500" />
                        {t('settings.keywords.monitored')}
                        <span className="ml-2 rounded-full bg-cyan-900/50 px-2.5 py-0.5 text-xs font-medium text-cyan-200">
                            {keywords.length}
                        </span>
                    </h2>
                </div>

                <div className="divide-y divide-white/5">
                    {keywords.length === 0 ? (
                        <div className="p-8 text-center text-cyan-500/50 text-sm">
                            {t('settings.keywords.noKeywords')}
                        </div>
                    ) : (
                        keywords.map((kw) => (
                            <div key={kw.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-cyan-500/10">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex items-center">
                                            <input
                                                type="color"
                                                defaultValue={kw.color || '#3B82F6'}
                                                onChange={(e) => handleColorUpdate(kw.id, e.target.value)}
                                                className="h-6 w-8 cursor-pointer rounded border border-white/20 bg-transparent p-0"
                                                title={t('settings.keywords.selectColor')}
                                            />
                                        </div>
                                        <span className="font-medium text-white">{kw.keyword}</span>
                                    </div>
                                    <span className="font-mono text-xs text-cyan-200/70">{t('settings.keywords.added')}{new Date(kw.created_at).toLocaleDateString()}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(kw.id)}
                                    disabled={isPending}
                                    className="rounded-lg p-2 text-cyan-400 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
                                    title="Remove keyword"
                                >
                                    {isPending ? (
                                        <div className="h-5 w-5" />
                                    ) : (
                                        <Trash2 className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </CyberCard>
        </div>
    );
}
