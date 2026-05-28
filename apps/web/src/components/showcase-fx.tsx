/**
 * Showcase-FX library for AEVUM — reusable visual-effect components.
 * Lifted from aurora-studios showcase pattern. Tailored to AEVUM gold/dark palette.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  animate,
} from "framer-motion";

/* ──────────────── Scroll Progress (global) ──────────────── */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const w = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <motion.div
      style={{ width: w }}
      className="fixed top-0 left-0 z-[60] h-[2px] bg-gradient-to-r from-[#e0a458] via-[#f0c878] to-[#e0a458] pointer-events-none"
    />
  );
}

/* ──────────────── Animated Number Counter ──────────────── */
export function NumberCounter({
  to,
  suffix = "",
  prefix = "",
  duration = 2,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const controls = animate(0, to, {
            duration,
            ease: "easeOut",
            onUpdate: (v) => setValue(v),
          });
          obs.disconnect();
          return () => controls.stop();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {Math.round(value).toLocaleString("de-DE")}
      {suffix}
    </span>
  );
}

/* ──────────────── Magnetic Wrapper ──────────────── */
export function Magnetic({
  children,
  strength = 0.3,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * strength);
        y.set((e.clientY - cy) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── Tilt Card ──────────────── */
export function TiltCard({
  children,
  className = "",
  intensity = 12,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        ry.set(px * intensity);
        rx.set(-py * intensity);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── Spotlight (cursor-following radial) ──────────────── */
export function Spotlight({
  className = "",
  color = "rgba(224,164,88,0.12)",
  radius = 600,
}: {
  className?: string;
  color?: string;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }}
      className={className}
      style={{
        background: `radial-gradient(${radius}px circle at ${pos.x}% ${pos.y}%, ${color}, transparent 40%)`,
      }}
    />
  );
}

/* ──────────────── Mouse-Follow Glow (background layer) ──────────────── */
export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 150, damping: 25 });
  const sy = useSpring(y, { stiffness: 150, damping: 25 });

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
      }}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <motion.div
        style={{ x: sx, y: sy }}
        className="absolute -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#e0a458]/15 via-transparent to-transparent blur-3xl"
      />
    </div>
  );
}

/* ──────────────── Aurora Background ──────────────── */
export function AuroraBg({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, #e0a458 50%, #8b5cf6 60%, transparent 80%)",
          filter: "blur(60px)",
          animation: "aevum-aurora 14s linear infinite",
        }}
      />
      <style>{`
        @keyframes aevum-aurora {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

/* ──────────────── Scroll-Reveal Wrapper ──────────────── */
export function Reveal({
  children,
  delay = 0,
  y = 30,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── Gradient Border Wrapper ──────────────── */
export function GradientBorder({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex p-[1.5px] rounded-2xl overflow-hidden ${className}`}>
      <div className="absolute inset-0 animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,#e0a458,#8b5cf6,#e0a458)]" />
      <div className="relative rounded-2xl bg-[#0a0a0f] w-full">{children}</div>
    </div>
  );
}
