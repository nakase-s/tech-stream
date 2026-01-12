import { Star } from 'lucide-react';

export default function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <div className="flex items-center gap-1" aria-label={`重要度 ${v}/5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < v;
        return (
          <Star
            key={i}
            size={14}
            className={filled ? 'text-blue-400' : 'text-slate-600'}
            fill={filled ? 'currentColor' : 'transparent'}
          />
        );
      })}
    </div>
  );
}
