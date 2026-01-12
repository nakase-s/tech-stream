import { Radio } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo Area */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">AI INTEL HUB</h1>
            <p className="text-[10px] font-medium tracking-widest text-blue-400 uppercase mt-1">System Active // 2026</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
          <span className="text-[10px] text-zinc-500 font-mono">ONLINE</span>
        </div>
      </div>
    </header>
  );
}
