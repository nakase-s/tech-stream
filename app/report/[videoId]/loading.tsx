export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050510] text-cyan-50">
            <div className="relative">
                {/* Ping animation effect */}
                <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-25"></div>
                <div className="relative w-16 h-16 border-4 border-cyan-900 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
            <h2 className="mt-8 text-xl font-medium tracking-wide animate-pulse">
                AIが動画を視聴中...
            </h2>
            <p className="mt-2 text-cyan-400/60 text-sm">
                詳細なレポートを作成しています
            </p>
        </div>
    );
}
