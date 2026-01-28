'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { locales, Locale, Dictionary } from '@/lib/i18n/locales';

type LocaleContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('ja');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // 1. Check LocalStorage
        const saved = localStorage.getItem('app_locale') as Locale;
        if (saved && (saved === 'ja' || saved === 'en')) {
            setLocaleState(saved);
        } else {
            // 2. Check Browser
            const browserLang = navigator.language;
            if (browserLang.startsWith('en')) {
                setLocaleState('en');
            } else {
                setLocaleState('ja'); // Default to ja
            }
        }
        setIsInitialized(true);
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('app_locale', newLocale);
    };

    // Helper to access nested keys like 'common.siteTitle'
    const t = (key: string): string => {
        const keys = key.split('.');
        let current: any = locales[locale];

        for (const k of keys) {
            if (current[k] === undefined) {
                console.warn(`Translation key missing: ${key}`);
                return key;
            }
            current = current[k];
        }

        return current as string;
    };

    // Avoid hydration mismatch by rendering nothing until client-side check is done
    // Or just render children with default ja to avoid flicker, but stick to 'ja' default above.
    // To be safe against hydration errors, we can suppress it but better to wait.
    // BUT waiting might flash white. Let's render children immediately with default 'ja'
    // and update layout effect-ively. However, simple apps often accept hydration diff if minimal.
    // Best practice: render defaults.

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (context === undefined) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
}
