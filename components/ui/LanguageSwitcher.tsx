'use client';

import { useLocale } from '@/context/LocaleContext';

type LanguageSwitcherProps = {
    className?: string;
};

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
    const { locale, setLocale } = useLocale();

    return (
        <div className={`flex items-center gap-1 rounded-lg bg-white/5 p-1 border border-white/10 ${className}`}>
            <button
                onClick={() => setLocale('ja')}
                className={`rounded px-2 py-0.5 text-xs font-medium transition-all ${locale === 'ja'
                    ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                    }`}
            >
                JP
            </button>
            <button
                onClick={() => setLocale('en')}
                className={`rounded px-2 py-0.5 text-xs font-medium transition-all ${locale === 'en'
                    ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                    }`}
            >
                EN
            </button>
        </div>
    );
}
