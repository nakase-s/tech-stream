export default function AppBackground() {
  return (
    <div className="fixed inset-0 w-full h-full -z-50 bg-slate-950">
      {/* Subtle consistent gradient background instead of video */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>

      {/* Optional: Grid pattern for tech feel but very subtle */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
    </div>
  );
}
