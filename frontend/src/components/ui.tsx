"use client";
import React, { useEffect, useRef, useState } from "react";

export function Aurora() {
  return (
    <div className="aurora" aria-hidden>
      <span style={{ background: "var(--color-brand-500)", width: "46vw", height: "46vw", top: "-12vh", insetInlineStart: "-8vw" }} />
      <span style={{ background: "var(--color-flare)", width: "38vw", height: "38vw", top: "22vh", insetInlineEnd: "-10vw", animationDelay: "-6s" }} />
      <span style={{ background: "var(--color-neon)", width: "34vw", height: "34vw", top: "68vh", insetInlineStart: "22vw", animationDelay: "-12s" }} />
    </div>
  );
}

export function Reveal({ children, delay = 0, className = "" }:
  { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(26px) scale(.985)",
        transition: `opacity .7s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform .7s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}>
      {children}
    </div>
  );
}

export function Pill({ active, children, ...p }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button {...p}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 border
        ${active ? "grad-bg text-white border-transparent shadow-lg shadow-[var(--glow)] scale-[1.03]"
                 : "glass hover:scale-[1.03] hover:border-[var(--color-brand-300)]"} ${p.className || ""}`}>
      {children}
    </button>
  );
}

export function Btn({ children, variant = "solid", ...p }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "ghost" }) {
  return (
    <button {...p}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold
        transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none
        ${variant === "solid"
          ? "grad-bg text-white shadow-xl shadow-[var(--glow)] hover:shadow-2xl hover:-translate-y-0.5"
          : "glass hover:border-[var(--color-brand-300)] hover:-translate-y-0.5"} ${p.className || ""}`}>
      {children}
    </button>
  );
}

export function Ring({ value, size = 44 }: { value: number; size?: number }) {
  const r = size / 2 - 3, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#g)" strokeWidth="3"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
        style={{ transition: "stroke-dashoffset .9s cubic-bezier(.2,.7,.2,1)" }} />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-neon)" />
          <stop offset="100%" stopColor="var(--color-flare)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
