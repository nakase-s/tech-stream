'use client';

import { useEffect, useRef } from 'react';

export default function AppBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Configuration
    const STREAM_COUNT = Math.floor(width / 20); // Density of streams
    const streams: { x: number; y: number; speed: number; length: number; opacity: number }[] = [];

    // Initialize streams
    for (let i = 0; i < STREAM_COUNT; i++) {
      streams.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 1 + Math.random() * 3,
        length: 50 + Math.random() * 150,
        opacity: 0.1 + Math.random() * 0.3,
      });
    }

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const draw = () => {
      // Clear with slight trail effect (optional, or just clear)
      // Using solid clear for performance + clean look
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);

      // Draw Grid (very subtle)
      ctx.strokeStyle = '#1e293b'; // slate-800
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.05;

      const gridSize = 50;
      // Vertical grid lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      // Horizontal grid lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Streams
      ctx.globalAlpha = 1; // Content logic controls its own alpha

      streams.forEach((s) => {
        // Create gradient for the tail
        const gradient = ctx.createLinearGradient(s.x, s.y, s.x, s.y - s.length);
        gradient.addColorStop(0, `rgba(59, 130, 246, 0)`); // Fade out top (tail end) - actually y is head
        // Wait, falling down: y is head. Tail is y - length.
        // Let's draw line from y-length to y.

        // Head Color: Cyan/Blue mix
        // Tail Color: Transparent

        // Gradient logic correction for falling down:
        // Start (0) is at y (Head) -> Bright
        // End (1) is at y - length (Tail) -> Transparent

        const headColor = `rgba(14, 165, 233, ${s.opacity})`; // Sky-500
        const tailColor = `rgba(14, 165, 233, 0)`;

        const g = ctx.createLinearGradient(s.x, s.y, s.x, s.y - s.length);
        g.addColorStop(0, headColor);
        g.addColorStop(1, tailColor);

        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y - s.length);
        ctx.stroke();

        // Drop highlight (head)
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.fillRect(s.x - 0.5, s.y, 2, 2);

        // Update position
        s.y += s.speed;

        // Reset if off screen
        if (s.y - s.length > height) {
          s.y = -s.length;
          s.x = Math.random() * width;
          s.speed = 1 + Math.random() * 3;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-50 bg-slate-950 pointer-events-none"
    />
  );
}
