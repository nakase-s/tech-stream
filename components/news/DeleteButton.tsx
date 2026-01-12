'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm('本当に削除しますか？\nこの操作は取り消せません。')) return;

    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('削除に失敗しました');
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('エラーが発生しました。削除できませんでした。');
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      aria-label="削除"
      title="削除"
      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
