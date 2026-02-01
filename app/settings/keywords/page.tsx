import { getKeywords } from '@/lib/actions/keywords';
import KeywordManager from './KeywordManager';
import { getTagGroups } from '@/lib/actions/tagGroups';
import TagGroupManager from '@/components/settings/TagGroupManager';
import SettingsSubHeader from '@/components/settings/SettingsSubHeader';

export const dynamic = 'force-dynamic';

export default async function KeywordsPage() {
    // Parallel fetch
    const [keywordsResult, groupsResult] = await Promise.all([
        getKeywords(),
        getTagGroups()
    ]);

    const keywords = keywordsResult.data || [];
    const groups = groupsResult.data || [];

    return (
        <div className="min-h-screen pt-8 pb-20">
            <div className="mx-auto max-w-5xl px-6">
                <SettingsSubHeader
                    titleKey="settings.keywords.title"
                    descKey="settings.keywords.description"
                />

                <div className="space-y-8">
                    <KeywordManager initialKeywords={keywords}>
                        <TagGroupManager
                            initialGroups={groups}
                            availableKeywords={keywords}
                        />
                    </KeywordManager>
                </div>
            </div>
        </div>
    );
}
