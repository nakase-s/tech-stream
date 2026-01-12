import NewsCard from './NewsCard';

type NewsItem = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  summary: string | null;
  published_at: string;
  engine_type: string | null;
  importance: number | string | null;
};

export default function NewsGrid({ items }: { items: NewsItem[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p className="text-sm font-medium tracking-widest uppercase">No Intel Found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
      {items.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
    </div>
  );
}
