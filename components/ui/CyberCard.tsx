import { ReactNode } from 'react';
// Actually I don't recall seeing lib/utils. I will just use template strings + maybe a simple join or clsx if available. 
// I'll stick to template literals for safety if I'm not sure, but `cn` is very common.
// Let me check if `lib/utils` exists quickly? No, I'll just use template strings to be safe and avoid errors, or standard class names.

// Checking previous file reads: `tailwind.config.ts` was read. `lib/supabaseClient` exists.
// I'll write a safe version without `cn` dependency for now, or use `clsx`/`tailwind-merge` if I knew they existed. 
// I'll use simple string interpolation.

interface CyberCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
    color?: 'cyan' | 'gold' | 'red' | 'purple';
}

export default function CyberCard({
    children,
    className = '',
    hoverEffect = true,
    color = 'cyan'
}: CyberCardProps) {
    const colorStyles = {
        cyan: {
            border: 'border-cyan-500/40',
            shadow: 'shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]',
            hover: 'hover:border-cyan-400 hover:shadow-[0_0_30px_5px_rgba(6,182,212,0.6)]'
        },
        gold: {
            border: 'border-amber-400/40',
            shadow: 'shadow-[0_0_15px_-3px_rgba(251,191,36,0.15)]',
            hover: 'hover:border-amber-300 hover:shadow-[0_0_30px_5px_rgba(251,191,36,0.6)]'
        },
        red: {
            border: 'border-red-500/40',
            shadow: 'shadow-[0_0_15px_-3px_rgba(239,68,68,0.15)]',
            hover: 'hover:border-red-400 hover:shadow-[0_0_30px_5px_rgba(239,68,68,0.6)]'
        },
        purple: {
            border: 'border-purple-500/40',
            shadow: 'shadow-[0_0_15px_-3px_rgba(168,85,247,0.15)]',
            hover: 'hover:border-purple-400 hover:shadow-[0_0_30px_5px_rgba(168,85,247,0.6)]'
        }
    };

    const styles = colorStyles[color];

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-md transition-all duration-300
                ${styles.border} ${styles.shadow}
                ${hoverEffect ? styles.hover : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
}
