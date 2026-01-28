'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function SettingsSubHeader({
    titleKey,
    descKey
}: {
    titleKey: string;
    descKey: string;
}) {
    const { t } = useLocale();

    return (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">{t(titleKey)}</h1>
                <p className="mt-2 text-zinc-400">
                    {t(descKey)}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <Link href="/settings" className="inline-flex items-center rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white border border-white/10">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('common.backToSettings')}
                </Link>
            </div>
        </div>
    );
}
