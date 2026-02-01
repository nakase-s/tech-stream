'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchFilters from '@/components/filters/SearchFilters';
import NewsGrid from '@/components/news/NewsGrid';
import AddVideoForm from '@/components/news/AddVideoForm';
import { Plus } from 'lucide-react';
import PurgeBar from '@/components/ui/PurgeBar';
import { deleteNewsAction } from '@/app/actions/news';
import { NewsItem } from '@/types/database';
import { useLocale } from '@/context/LocaleContext';

export default function NewsDashboard({
    initialItems,
    tagColors,
    keywords,
    keywordToGroupMap
}: {
    initialItems: NewsItem[];
    tagColors: Record<string, string>;
    keywords?: { keyword: string; color: string }[];
    keywordToGroupMap?: Record<string, { name: string; color: string }>;
}) {
    const [displayedItems, setDisplayedItems] = useState(initialItems);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const router = useRouter();
    const searchParams = useSearchParams();

    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const { t } = useLocale();

    // Reset local state when initialItems change (e.g. from server-side filter)
    useEffect(() => {
        setDisplayedItems(initialItems);
        setSelectedIds([]);
        setIsDeleting(false);
    }, [initialItems]);

    const toggleSelectionMode = () => {
        setIsSelectionMode(prev => {
            if (prev) setSelectedIds([]); // Clear selection when exiting mode
            return !prev;
        });
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleTagClick = (tag: string) => {
        const p = new URLSearchParams(searchParams.toString());
        const currentTag = p.get('tag');

        if (currentTag === tag) {
            // Deselect if already active
            p.delete('tag');
        } else {
            // Select new tag
            p.set('tag', tag);
        }
        router.push(`/?${p.toString()}`);
    };

    const handlePurge = async () => {
        if (selectedIds.length === 0) return;

        setIsDeleting(true);

        try {
            // Server Action
            const result = await deleteNewsAction(selectedIds);

            if (result.success) {
                // Optimistic update handled by revalidatePath in server action, 
                // but we also clear local state to be sure
                setSelectedIds([]);
                setIsSelectionMode(false);
            } else {
                console.error('Delete failed:', result.message);
                // Optionally show error toast
                alert('Failed to delete items');
            }
        } catch (error) {
            console.error('Error during purge:', error);
            alert('An unexpected error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <section className="mb-8">
                {/* Tools Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex-1">
                        {/* Placeholder for future header capability or left empty if title is in layout */}
                    </div>
                    <button
                        onClick={() => setIsAddMode(!isAddMode)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                            ${isAddMode
                                ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/30'
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_-3px_rgba(6,182,212,0.5)]'
                            }
                        `}
                    >
                        <Plus className={`w-4 h-4 transition-transform duration-300 ${isAddMode ? 'rotate-45' : ''}`} />
                        {isAddMode ? t('tools.close') : t('tools.addVideo')}
                    </button>
                </div>

                {/* Add Video Form Area */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isAddMode ? 'max-h-40 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
                    <AddVideoForm />
                </div>

                <div className="mt-6">
                    <SearchFilters
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={toggleSelectionMode}
                        tags={keywords}
                    />
                </div>
            </section>

            <NewsGrid
                items={displayedItems}
                tagColors={tagColors}
                isSelectionMode={isSelectionMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onTagClick={handleTagClick}
                keywordToGroupMap={keywordToGroupMap}
            />

            <PurgeBar
                selectedCount={selectedIds.length}
                onPurge={handlePurge}
                onCancel={() => {
                    setSelectedIds([]);
                    setIsSelectionMode(false);
                }}
                isDeleting={isDeleting}
            />
        </>
    );
}
