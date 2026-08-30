"use client";

import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/lib/store/ui-store";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export function CustomCursor() {
  const enabled = useUIStore((s) => s.customCursor);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (enabled && finePointer) html.classList.add("cursor-hidden");
    else html.classList.remove("cursor-hidden");
    return () => html.classList.remove("cursor-hidden");
  }, [enabled, finePointer]);

  useEffect(() => {
    if (!enabled || !finePointer) return;

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let hovering = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate(${mx}px, ${my}px)`;
      }
      const target = e.target as HTMLElement | null;
      hovering = Boolean(
        target?.closest("a, button, [role='button'], input, textarea, select")
      );
    };

    const onDown = (e: MouseEvent) => {
      const colors = ["#f5b942", "#2ee6d6", "#fff4d1", "#ff8a3d"];
      for (let i = 0; i < 16; i++) {
        const a = (Math.PI * 2 * i) / 16;
        const speed = 2 + Math.random() * 4;
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 1,
          color: colors[i % colors.length],
        });
      }
    };

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring.current) {
        const scale = hovering ? 1.7 : 1;
        ring.current.style.transform = `translate(${rx}px, ${ry}px) scale(${scale})`;
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.current = particles.current.filter((p) => p.life > 0);
        for (const p of particles.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.06;
          p.life -= 0.025;
          ctx.globalAlpha = Math.max(p.life, 0);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      cancelAnimationFrame(raf);
    };
  }, [enabled, finePointer]);

  if (!enabled || !finePointer) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[90]"
        aria-hidden
      />
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[91] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/80 mix-blend-difference"
        aria-hidden
      />
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[92] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_#f5b942]"
        aria-hidden
      />
    </>
  );
}
