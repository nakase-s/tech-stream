'use client';

import { useState, useTransition } from 'react';
import { TagGroupWithKeywords, createTagGroup, deleteTagGroup, addKeywordToGroup, removeKeywordFromGroup, updateTagGroup } from '@/lib/actions/tagGroups';
import { SearchKeyword } from '@/lib/actions/keywords';
import { Loader2, Trash2, Plus, Users, X, ChevronDown, ChevronUp, Edit2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import CyberCard from '@/components/ui/CyberCard';

export default function TagGroupManager({
    initialGroups,
    availableKeywords
}: {
    initialGroups: TagGroupWithKeywords[],
    availableKeywords: SearchKeyword[]
}) {
    const [groups, setGroups] = useState<TagGroupWithKeywords[]>(initialGroups);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { t } = useLocale(); // Assuming we'll add translations later or use fallbacks

    // --- New Group State ---
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupColor, setNewGroupColor] = useState('#3B82F6');

    // --- Edit State ---
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
    const [selectedKeywordToAdd, setSelectedKeywordToAdd] = useState<string>('');

    // Update local state if props change (though typically we rely on router.refresh)
    if (initialGroups !== groups && !isPending) {
        setGroups(initialGroups);
    }

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        setError(null);
        startTransition(async () => {
            const result = await createTagGroup(newGroupName, newGroupColor);
            if (result.success) {
                setNewGroupName('');
                setNewGroupColor('#3B82F6');
                router.refresh();
            } else {
                setError(result.error || 'Failed to create group');
            }
        });
    };

    const handleDeleteGroup = async (id: string) => {
        if (!confirm('Are you sure you want to delete this group?')) return;

        startTransition(async () => {
            const result = await deleteTagGroup(id);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || 'Failed to delete group');
            }
        });
    };

    const handleAddKeywordToGroup = async (groupId: string) => {
        if (!selectedKeywordToAdd) return;

        startTransition(async () => {
            const result = await addKeywordToGroup(groupId, selectedKeywordToAdd);
            if (result.success) {
                setSelectedKeywordToAdd('');
                router.refresh();
            } else {
                alert(result.error || 'Failed to add keyword');
            }
        });
    };

    const handleRemoveKeyword = async (groupId: string, keywordId: string) => {
        startTransition(async () => {
            const result = await removeKeywordFromGroup(groupId, keywordId);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || 'Failed to remove keyword');
            }
        });
    };

    const handleUpdateColor = (id: string, color: string) => {
        startTransition(async () => {
            await updateTagGroup(id, { color });
        });
    };

    return (
        <div className="space-y-8">
            {/* Create Group Form */}
            <CyberCard hoverEffect={false} className="p-6 border-purple-500/30 bg-purple-950/10">
                <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    {t('settings.tagGroups.title')}
                </h2>

                <form onSubmit={handleCreateGroup} className="flex flex-col gap-4 sm:flex-row">
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder={t('settings.tagGroups.placeholder')}
                        className="flex-1 rounded-lg border border-white/20 bg-black/50 px-4 py-2.5 text-sm text-purple-50 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        disabled={isPending}
                    />
                    <div className="relative flex items-center">
                        <input
                            type="color"
                            value={newGroupColor}
                            onChange={(e) => setNewGroupColor(e.target.value)}
                            className="h-10 w-14 cursor-pointer rounded-lg border border-white/20 bg-black/50 p-1"
                            disabled={isPending}
                            title={t('settings.tagGroups.selectColor')}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending || !newGroupName.trim()}
                        className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        {t('settings.tagGroups.add')}
                    </button>
                </form>
                {error && (
                    <div className="mt-3 text-sm text-red-400">
                        {error}
                    </div>
                )}
            </CyberCard>

            {/* Groups List */}
            {groups.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    {groups.map((group) => {
                        const isExpanded = expandedGroupId === group.id;

                        // Calculate used keywords dynamically across all groups to maintain "single group ownership" simulation if desired,
                        // or at least exclude from THIS group. 
                        // To keep UI clean and similar to before, let's exclude keywords that are already in ANY group.
                        const usedKeywordIds = new Set(groups.flatMap(g => g.members.map(m => m.keyword_id)));

                        const availableToAdd = availableKeywords.filter(
                            k => !usedKeywordIds.has(k.id) && (!k.type || k.type === 'include')
                        );

                        return (
                            <CyberCard key={group.id} hoverEffect={false} className="border-purple-500/20 overflow-hidden">
                                <div className="flex flex-col">
                                    {/* Group Header */}
                                    <div className="flex items-center justify-between p-4 bg-purple-950/20">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="color"
                                                    defaultValue={group.color}
                                                    onChange={(e) => handleUpdateColor(group.id, e.target.value)}
                                                    className="h-6 w-8 cursor-pointer rounded border border-white/20 bg-transparent p-0"
                                                    title={t('settings.tagGroups.updateColor')}
                                                />
                                            </div>
                                            <span className="font-semibold text-white">{group.keyword}</span>
                                            <span className="text-xs text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-full">
                                                {group.members.length} {t('settings.tagGroups.keywordsCount')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                                                className="p-2 text-purple-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                title={isExpanded ? t('settings.tagGroups.collapse') : t('settings.tagGroups.expand')}
                                            >
                                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <Edit2 className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGroup(group.id)}
                                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title={t('settings.tagGroups.delete')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Content: Members Management */}
                                    {isExpanded && (
                                        <div className="p-4 border-t border-white/5 bg-black/20">
                                            {/* Add Keyword to Group */}
                                            <div className="flex gap-2 mb-4">
                                                <select
                                                    value={selectedKeywordToAdd}
                                                    onChange={(e) => setSelectedKeywordToAdd(e.target.value)}
                                                    className="flex-1 rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                                                >
                                                    <option value="">{t('settings.tagGroups.addKeywordPlaceholder')}</option>
                                                    {availableToAdd.map(k => (
                                                        <option key={k.id} value={k.id}>{k.keyword}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleAddKeywordToGroup(group.id)}
                                                    disabled={!selectedKeywordToAdd || isPending}
                                                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                                >
                                                    {t('settings.tagGroups.addKeywordBtn')}
                                                </button>
                                            </div>

                                            {/* Members List */}
                                            <div className="space-y-2">
                                                {group.members.length === 0 ? (
                                                    <p className="text-sm text-slate-500 italic">{t('settings.tagGroups.noMembers')}</p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {group.members.map(member => (
                                                            <div key={member.keyword_id} className="flex items-center gap-1 bg-slate-800/50 border border-white/10 rounded-md px-2 py-1">
                                                                <span className="text-sm text-slate-200">{member.keyword}</span>
                                                                <button
                                                                    onClick={() => handleRemoveKeyword(group.id, member.keyword_id)}
                                                                    className="text-slate-500 hover:text-red-400 ml-1"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CyberCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
