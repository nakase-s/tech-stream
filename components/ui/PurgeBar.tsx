'use client';

import { Trash2, X } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

type PurgeBarProps = {
    selectedCount: number;
    onPurge: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
};

export default function PurgeBar({ selectedCount, onPurge, onCancel, isDeleting = false }: PurgeBarProps) {
    const { t } = useLocale();

    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 w-[90%] max-w-2xl">
            <div className="bg-black/90 border border-red-600/50 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_-10px_rgba(220,38,38,0.5)] p-4 flex items-center justify-between gap-6">

                <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 text-red-500 ${isDeleting ? 'animate-spin' : 'animate-pulse'}`}>
                        {isDeleting ? (
                            <svg className="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <Trash2 className="w-5 h-5" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-white font-bold tracking-wider uppercase text-sm">
                            {isDeleting ? (t('purge.deleting') || 'DELETING...') : (t('purge.title') || 'PURGE MODE ACTIVE')}
                        </h3>
                        <p className="text-red-400 text-xs font-mono">
                            {selectedCount} {t('purge.selected') || 'TARGETS SELECTED'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('common.cancel') || 'CANCEL'}
                    </button>

                    <button
                        onClick={onPurge}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? '' : <Trash2 className="w-4 h-4" />}
                        {isDeleting ? (t('purge.processing') || 'PROCESSING...') : (t('purge.execute') || 'PURGE')}
                    </button>
                </div>

            </div>
        </div>
    );
}
