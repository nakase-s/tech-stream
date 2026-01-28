'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchFilters from '@/components/filters/SearchFilters';
import NewsGrid from '@/components/news/NewsGrid';
import PurgeBar from '@/components/ui/PurgeBar';
import { deleteNewsAction } from '@/app/actions/news';
import { NewsItem } from '@/types/database';

export default function NewsDashboard({
    initialItems,
    tagColors,
    keywords
}: {
    initialItems: NewsItem[];
    tagColors: Record<string, string>;
    keywords?: { keyword: string; color: string }[];
}) {
    const [displayedItems, setDisplayedItems] = useState(initialItems);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const router = useRouter();
    const searchParams = useSearchParams();

    const [isDeleting, setIsDeleting] = useState(false);

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
