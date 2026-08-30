"use client";

import { useEffect, useRef } from "react";
import { useUIStore } from "@/lib/store/ui-store";

export function AmbientCanvas() {
  const ambient = useUIStore((s) => s.ambient);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || ambient === "none") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const leaves = Array.from({ length: 28 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: 8 + Math.random() * 14,
      vy: 0.4 + Math.random() * 0.9,
      vx: -0.4 + Math.random() * 0.8,
      rot: Math.random() * Math.PI,
      vr: (-0.02 + Math.random() * 0.04),
      hue: 28 + Math.random() * 28,
    }));

    const clouds = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * w,
      y: 40 + i * 70,
      s: 80 + Math.random() * 140,
      vx: 0.15 + Math.random() * 0.25,
      a: 0.04 + Math.random() * 0.05,
    }));

    let t = 0;

    const drawLeaf = (x: number, y: number, s: number, rot: number, hue: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = `hsla(${hue}, 80%, 58%, 0.55)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.45, s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `hsla(${hue}, 70%, 35%, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(0, s * 0.6);
      ctx.stroke();
      ctx.restore();
    };

    const loop = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      if (ambient === "leaves") {
        for (const l of leaves) {
          l.x += l.vx + Math.sin(t + l.y) * 0.3;
          l.y += l.vy;
          l.rot += l.vr;
          if (l.y > h + 20) {
            l.y = -20;
            l.x = Math.random() * w;
          }
          drawLeaf(l.x, l.y, l.s, l.rot, l.hue);
        }
      }

      if (ambient === "clouds") {
        for (const c of clouds) {
          c.x += c.vx;
          if (c.x - c.s > w) c.x = -c.s;
          ctx.fillStyle = `rgba(255,255,255,${c.a})`;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.s * 0.55, 0, Math.PI * 2);
          ctx.arc(c.x + c.s * 0.45, c.y + 10, c.s * 0.4, 0, Math.PI * 2);
          ctx.arc(c.x - c.s * 0.4, c.y + 12, c.s * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (ambient === "water") {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "rgba(14, 40, 55, 0.0)");
        grad.addColorStop(1, "rgba(20, 90, 110, 0.18)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(46, 230, 214, 0.18)";
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          for (let x = 0; x <= w; x += 8) {
            const y =
              h * 0.35 +
              i * 42 +
              Math.sin(x * 0.01 + t * 1.4 + i) * 16 +
              Math.sin(x * 0.023 + t * 0.8) * 10;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [ambient]);

  if (ambient === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}
