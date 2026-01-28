'use client';

import { useState, useTransition } from 'react';
import { registerChannel, deleteChannel, YouTubeChannel } from '@/lib/actions/youtube';
import { Loader2, Trash2, Plus, Youtube } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import CyberCard from '@/components/ui/CyberCard';

export default function ChannelManager({ initialChannels }: { initialChannels: YouTubeChannel[] }) {
    const [channels, setChannels] = useState<YouTubeChannel[]>(initialChannels);
    const [newChannelId, setNewChannelId] = useState('');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { t } = useLocale();

    if (initialChannels !== channels && !isPending) {
        setChannels(initialChannels);
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChannelId.trim()) return;

        setError(null);
        startTransition(async () => {
            const result = await registerChannel(newChannelId);
            if (result.success) {
                setNewChannelId('');
                router.refresh();
            } else {
                setError(result.error || t('settings.channels.errorRegister'));
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('settings.channels.confirmDelete'))) return;

        startTransition(async () => {
            const result = await deleteChannel(id);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || t('settings.channels.errorDelete'));
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Add New Channel Card */}
            <CyberCard hoverEffect={false} className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-cyan-400" />
                    {t('settings.channels.registerNew')}
                </h2>

                <form onSubmit={handleRegister} className="flex flex-col gap-4 sm:flex-row">
                    <input
                        type="text"
                        value={newChannelId}
                        onChange={(e) => setNewChannelId(e.target.value)}
                        placeholder={t('settings.channels.placeholder')}
                        className="flex-1 rounded-lg border border-white/20 bg-black/50 px-4 py-2.5 text-sm text-cyan-50 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        disabled={isPending}
                    />
                    <button
                        type="submit"
                        disabled={isPending || !newChannelId.trim()}
                        className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        {t('settings.channels.register')}
                    </button>
                </form>
                {error && (
                    <div className="mt-3 text-sm text-red-400">
                        {error}
                    </div>
                )}
            </CyberCard>

            {/* Channel List */}
            <CyberCard hoverEffect={false} className="overflow-hidden">
                <div className="border-b border-white/10 bg-slate-950/50 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-cyan-500" />
                        {t('settings.channels.monitored')}
                        <span className="ml-2 rounded-full bg-cyan-900/50 px-2.5 py-0.5 text-xs font-medium text-cyan-200">
                            {channels.length}
                        </span>
                    </h2>
                </div>

                <div className="divide-y divide-white/5">
                    {channels.length === 0 ? (
                        <div className="p-8 text-center text-cyan-500/50 text-sm">
                            {t('settings.channels.noChannels')}
                        </div>
                    ) : (
                        channels.map((channel) => (
                            <div key={channel.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-cyan-500/10">
                                <a
                                    href={`https://www.youtube.com/channel/${channel.channel_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col gap-1 hover:text-cyan-400 group cursor-pointer"
                                >
                                    <span className="font-medium text-white group-hover:text-cyan-400 transition-colors">{channel.name}</span>
                                    <span className="font-mono text-xs text-cyan-200/70 group-hover:text-cyan-400/70 transition-colors">{channel.channel_id}</span>
                                </a>
                                <button
                                    onClick={() => handleDelete(channel.id)}
                                    disabled={isPending}
                                    className="rounded-lg p-2 text-cyan-400 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
                                    title="Remove channel"
                                >
                                    {isPending ? (
                                        <div className="h-5 w-5" /> // Placeholder to prevent layout shift if specific row loading is not tracked
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
