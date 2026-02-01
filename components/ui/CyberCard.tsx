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
            border: 'border-cyan-500/30',
            shadow: 'shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)]',
            hover: 'hover:border-cyan-500 hover:shadow-[0_0_20px_-5px_rgba(6,182,212,1)] hover:-translate-y-1'
        },
        gold: {
            border: 'border-amber-500/30',
            shadow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)]',
            hover: 'hover:border-amber-500 hover:shadow-[0_0_20px_-5px_rgba(245,158,11,1)] hover:-translate-y-1'
        },
        red: {
            border: 'border-red-500/30',
            shadow: 'shadow-[0_0_20px_-5px_rgba(239,68,68,0.15)]',
            hover: 'hover:border-red-500 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,1)] hover:-translate-y-1'
        },
        purple: {
            border: 'border-purple-500/30',
            shadow: 'shadow-[0_0_20px_-5px_rgba(168,85,247,0.15)]',
            hover: 'hover:border-purple-500 hover:shadow-[0_0_20px_-5px_rgba(168,85,247,1)] hover:-translate-y-1'
        }
    };

    const styles = colorStyles[color];

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-md transition-all duration-300 border-2
                ${styles.border} ${styles.shadow}
                ${hoverEffect ? styles.hover : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
}
