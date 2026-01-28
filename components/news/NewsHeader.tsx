'use client';

import { useLocale } from '@/context/LocaleContext';

export default function NewsHeader() {
    const { t } = useLocale();

    return (
        <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{t('news.title')}</h2>
            <p className="mt-1 text-sm text-slate-400">{t('news.description')}</p>
        </section>
    );
}
