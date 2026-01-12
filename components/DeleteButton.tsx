'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
    id: string;
}

export default function DeleteButton({ id }: DeleteButtonProps) {
    const router = useRouter();

    const handleDelete = async () => {
        if (!window.confirm('本当に削除しますか？\nこの操作は取り消せません。')) return;

        try {
            const res = await fetch(`/api/news/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('削除に失敗しました');
            }

            router.refresh();
        } catch (error) {
            console.error(error);
            alert('エラーが発生しました。削除できませんでした。');
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="inline-flex items-center justify-center p-3 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]"
            title="Delete Article"
        >
            <Trash2 size={18} />
        </button>
    );
}
