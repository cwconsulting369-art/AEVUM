import { useEffect, useRef, useState } from 'react';
import { getProject, types } from '@theatre/core';

const DEV_MODE = import.meta.env.DEV;

const projectState = {
  sheetsById: {
    'Hero Animation': {
      staticOverrides: {
        byObject: {
          'headline': {
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0.8,
          },
          'subline': {
            y: 20,
            opacity: 0,
          },
          'orb': {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
          },
        },
      },
      sequence: {
        subUnitsPerUnit: 30,
        length: 4,
        type: 'PositionalSequence' as const,
        tracks: {
          trackData: {
            'opacity-headline': {
              type: 'BasicKeyframedTrack' as const,
              keyframes: [
                { id: 'k1', position: 0, connectedRight: true, handles: [0.5, 0, 0.5, 1] as [number, number, number, number], type: 'bezier' as const, value: 0 },
                { id: 'k2', position: 1.2, connectedRight: false, handles: [0.5, 0, 0.5, 1] as [number, number, number, number], type: 'bezier' as const, value: 1 },
              ],
            },
          },
          trackIdByPropPath: {
            '["opacity"]': 'opacity-headline',
          },
        },
      },
    },
  },
  definitionVersion: '0.4.0' as const,
  revisionHistory: [],
};

export default function LabMotion() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function setupTheatre() {
      const project = getProject('AEVUM Lab', { state: projectState });
      await project.ready;

      const sheet = project.sheet('Hero Animation');

      const headlineObj = sheet.object('headline', {
        opacity: types.number(0, { range: [0, 1] }),
        y: types.number(40, { range: [-100, 100] }),
        scale: types.number(0.85, { range: [0.5, 1.5] }),
      });

      const sublineObj = sheet.object('subline', {
        opacity: types.number(0, { range: [0, 1] }),
        y: types.number(30, { range: [-50, 50] }),
      });

      const orbObj = sheet.object('orb', {
        x: types.number(0, { range: [-200, 200] }),
        y: types.number(0, { range: [-200, 200] }),
        scale: types.number(1, { range: [0.5, 2] }),
        rotation: types.number(0, { range: [0, 360] }),
      });

      const u1 = headlineObj.onValuesChange((v) => {
        if (!headlineRef.current) return;
        headlineRef.current.style.opacity = String(v.opacity);
        headlineRef.current.style.transform = `translateY(${v.y}px) scale(${v.scale})`;
      });

      const u2 = sublineObj.onValuesChange((v) => {
        if (!sublineRef.current) return;
        sublineRef.current.style.opacity = String(v.opacity);
        sublineRef.current.style.transform = `translateY(${v.y}px)`;
      });

      const u3 = orbObj.onValuesChange((v) => {
        if (!orbRef.current) return;
        orbRef.current.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.scale}) rotate(${v.rotation}deg)`;
      });

      if (DEV_MODE) {
        const studio = (await import('@theatre/studio')).default;
        studio.initialize();
      }

      sheet.sequence.play({ iterationCount: 1, rate: 1 });
      setReady(true);

      cleanup = () => {
        u1();
        u2();
        u3();
      };
    }

    setupTheatre();

    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1530] to-[#0a0a0f] text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e0a458] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur border border-white/10 text-xs uppercase tracking-widest text-[#e0a458]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e0a458] animate-pulse" />
          Theatre.js PoC — Premium Motion Layer
        </div>

        <h1
          ref={headlineRef}
          className="text-6xl md:text-8xl font-bold tracking-tight leading-none"
          style={{ opacity: 0, transform: 'translateY(40px) scale(0.85)' }}
        >
          High-End<br />
          <span className="bg-gradient-to-r from-[#e0a458] via-[#f0c878] to-[#e0a458] bg-clip-text text-transparent">
            Motion Design.
          </span>
        </h1>

        <p
          ref={sublineRef}
          className="mt-8 text-xl md:text-2xl text-white/70 max-w-2xl"
          style={{ opacity: 0, transform: 'translateY(30px)' }}
        >
          Timeline-basierte Animationen wie in After Effects — direkt im Browser, framework-agnostisch, visual + code.
        </p>

        <div className="mt-20 flex items-center gap-8">
          <div
            ref={orbRef}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-[#e0a458] to-purple-600 shadow-2xl shadow-[#e0a458]/30"
          />
          <div className="text-sm text-white/50 max-w-md">
            <div className="font-mono text-xs text-[#e0a458] mb-2">// Live-Demo</div>
            Orb-Element gesteuert über Theatre.js Sequence.
            <br />
            {DEV_MODE ? 'Studio aktiv (unten-rechts) — Keyframes live editierbar.' : 'Production-Bundle: Studio ausgeschlossen, nur Playback.'}
          </div>
        </div>

        {ready && (
          <div className="mt-24 grid md:grid-cols-3 gap-6">
            <FeatureCard
              title="Timeline-Editor"
              desc="Visual Keyframes wie in After Effects. Sequenz-basiert."
            />
            <FeatureCard
              title="Code + Visual"
              desc="Edit visuell, save als JSON, ship als Code."
            />
            <FeatureCard
              title="Framework-agnostic"
              desc="React, Svelte, Vanilla — nur JS-Variables, kein Lock-in."
            />
          </div>
        )}

        <div className="mt-20 pt-10 border-t border-white/10 text-sm text-white/40">
          <a href="#/" className="hover:text-[#e0a458] transition">← zurück zur Startseite</a>
          <span className="mx-3">·</span>
          <span>Branch: experiment/theatre-js-poc-2026-05-28</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur border border-white/10 hover:border-[#e0a458]/30 transition">
      <div className="text-lg font-semibold text-white mb-2">{title}</div>
      <div className="text-sm text-white/60">{desc}</div>
    </div>
  );
}
