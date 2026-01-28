'use client';

import { Radio, Settings } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/context/LocaleContext';

import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function AppHeader() {
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">{t('common.siteTitle')}</h1>
            <p className="text-[10px] font-medium tracking-widest text-cyan-400 uppercase mt-1">{t('common.systemActive')}</p>
          </div>
        </Link>

        {/* Navigation & Status */}
        <div className="flex items-center gap-6">
          <LanguageSwitcher />

          <div className="h-4 w-px bg-white/10 hidden sm:block"></div>

          <nav className="flex items-center gap-4">
            <Link
              href="/settings"
              className="text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t('header.settings')}</span>
            </Link>
          </nav>

          <div className="h-4 w-px bg-white/10 hidden sm:block"></div>

          <div className="hidden sm:flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></div>
            <span className="text-[10px] text-zinc-500 font-mono">{t('common.online')}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
