import { getKeywords } from '@/lib/actions/keywords';
import KeywordManager from './KeywordManager';
import SettingsSubHeader from '@/components/settings/SettingsSubHeader';

export const dynamic = 'force-dynamic';

export default async function KeywordsPage() {
    const { data: keywords = [], error } = await getKeywords();

    if (error) {
        return (
            <div className="mx-auto max-w-4xl p-6">
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500">
                    Error loading keywords: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-8 pb-20">
            <div className="mx-auto max-w-4xl px-6">
                <SettingsSubHeader
                    titleKey="settings.keywords.title"
                    descKey="settings.keywords.description"
                />

                <KeywordManager initialKeywords={keywords} />
            </div>
        </div>
    );
}
