'use client';

import Link from 'next/link';
import { Youtube, Search, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import CyberCard from '@/components/ui/CyberCard';

import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function SettingsPage() {
    const { t } = useLocale();

    return (
        <div className="min-h-screen pt-8 pb-20">
            <div className="mx-auto max-w-4xl px-6">
                <div className="mb-8 flex flex-row items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">{t('settings.title')}</h1>
                        <p className="mt-2 text-cyan-100">
                            {t('settings.description')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        <Link href="/" className="inline-flex items-center rounded-lg bg-white/5 px-3 sm:px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white border border-white/10 h-10">
                            <ArrowLeft className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{t('common.backToHome')}</span>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Channels Card */}
                    <Link href="/settings/channels" className="block h-full">
                        <CyberCard className="flex flex-col justify-between h-full p-6" color="red">
                            <div>
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-500 ring-1 ring-red-500/20 group-hover:scale-110 transition-transform">
                                    <Youtube className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-semibold text-white group-hover:text-red-400 transition-colors">{t('settings.channelSettings')}</h2>
                                <p className="mt-2 text-sm text-red-100/70">
                                    {t('settings.channelDesc')}
                                </p>
                            </div>
                            <div className="mt-6 flex items-center text-sm font-medium text-red-400 opacity-60 group-hover:opacity-100 transition-opacity">
                                {t('settings.manage')} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </CyberCard>
                    </Link>

                    {/* Keywords Card */}
                    <Link href="/settings/keywords" className="block h-full">
                        <CyberCard className="flex flex-col justify-between h-full p-6" color="purple">
                            <div>
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20 group-hover:scale-110 transition-transform">
                                    <Search className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">{t('settings.keywordSettings')}</h2>
                                <p className="mt-2 text-sm text-purple-100/70">
                                    {t('settings.keywordDesc')}
                                </p>
                            </div>
                            <div className="mt-6 flex items-center text-sm font-medium text-purple-400 opacity-60 group-hover:opacity-100 transition-opacity">
                                {t('settings.manage')} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </CyberCard>
                    </Link>
                </div>
            </div>
        </div>
    );
}
