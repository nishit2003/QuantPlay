"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  "#10b981", "#34d399", "#6ee7b7", // emerald
  "#f59e0b", "#fbbf24", "#fcd34d", // amber
  "#3b82f6", "#60a5fa", "#93c5fd", // blue
  "#ec4899", "#f472b6",             // pink
  "#8b5cf6", "#a78bfa",             // violet
];

export function Confetti({ trigger }: { trigger: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const prevTrigger = useRef(false);

  const burst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const count = 80;
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.35;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 4 + Math.random() * 8;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        w: 4 + Math.random() * 6,
        h: 6 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        opacity: 1,
      });
    }

    let frame = 0;
    const maxFrames = 120;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // gravity
        p.vx *= 0.99; // air resistance
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - frame / maxFrames);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (frame < maxFrames) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (trigger && !prevTrigger.current) {
      burst();
    }
    prevTrigger.current = trigger;
  }, [trigger, burst]);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-hidden
    />
  );
}
