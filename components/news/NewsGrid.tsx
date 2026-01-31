import NewsCard from './NewsCard';
import { NewsItem } from '@/types/database';

export default function NewsGrid({
  items,
  tagColors,
  isSelectionMode = false,
  selectedIds = [],
  onToggleSelect,
  onTagClick
}: {
  items: NewsItem[],
  tagColors?: Record<string, string>,
  isSelectionMode?: boolean,
  selectedIds?: string[],
  onToggleSelect?: (id: string) => void,
  onTagClick?: (tag: string) => void
}) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p className="text-sm font-medium tracking-widest uppercase">No Intel Found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <NewsCard
          key={item.id}
          item={item}
          tagColor={item.tag && tagColors ? tagColors[item.tag.split(',')[0].trim()] : undefined}
          isSelectionMode={isSelectionMode}
          isSelected={selectedIds.includes(item.id)}
          onToggleSelect={() => onToggleSelect?.(item.id)}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
}
