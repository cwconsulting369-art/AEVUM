// CompareView — Side-by-Side Vorher/Nachher mit Grade + Hook-Score + Breakdown.

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { MarkdownViewer } from '../markdown/MarkdownViewer';
import GradeBadge from './GradeBadge';
import HookScoreBar from './HookScoreBar';

export interface ScoreBreakdown {
  hook?: number;
  structure?: number;
  specificity?: number;
  icp_match?: number;
  cta?: number;
  [k: string]: number | undefined;
}

export interface ScriptSide {
  text: string;
  grade?: string | null;
  hook_score?: number | null;
  strengths?: string[];
  weaknesses?: string[];
  score_breakdown?: ScoreBreakdown | null;
}

interface Props {
  before: ScriptSide;
  after: ScriptSide;
}

export default function CompareView({ before, after }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Column side="before" data={before} label="Vorher (Original)" />
      <Column side="after" data={after} label="Nachher (Optimiert)" />
    </div>
  );
}

function Column({ side, data, label }: { side: 'before' | 'after'; data: ScriptSide; label: string }) {
  const [copied, setCopied] = useState(false);
  const accent = side === 'after' ? 'border-gold-400/30' : 'border-white/8';

  const copy = () => {
    navigator.clipboard.writeText(data.text || '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`card-premium p-4 sm:p-5 border min-w-0 ${accent}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-[0.65rem] uppercase tracking-widest text-ink-500 font-semibold">{label}</div>
          <div className="text-base font-semibold text-white mt-0.5">
            {side === 'after' ? 'Optimiert' : 'Original'}
          </div>
        </div>
        <GradeBadge grade={data.grade} size="md" />
      </div>

      <div className="space-y-3 mb-4">
        <HookScoreBar score={data.hook_score} label="Hook-Score" />
        {data.score_breakdown && (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="text-[0.6rem] uppercase tracking-wider text-ink-500 font-semibold mb-1">Score-Breakdown</div>
            {(['hook', 'structure', 'specificity', 'icp_match', 'cta'] as const).map(k =>
              typeof data.score_breakdown?.[k] === 'number' ? (
                <HookScoreBar key={k} score={data.score_breakdown[k]!} label={labelOf(k)} size="sm" />
              ) : null
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {data.strengths && data.strengths.length > 0 && (
          <div>
            <div className="text-[0.6rem] uppercase tracking-wider text-emerald-400/80 font-semibold mb-1.5">Strengths</div>
            <ul className="space-y-1">
              {data.strengths.map((s, i) => (
                <li key={i} className="text-xs text-ink-200 flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.weaknesses && data.weaknesses.length > 0 && (
          <div>
            <div className="text-[0.6rem] uppercase tracking-wider text-rose-400/80 font-semibold mb-1.5">Weaknesses</div>
            <ul className="space-y-1">
              {data.weaknesses.map((s, i) => (
                <li key={i} className="text-xs text-ink-200 flex items-start gap-1.5">
                  <span className="text-rose-400 mt-0.5">−</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-white/5 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[0.6rem] uppercase tracking-wider text-ink-500 font-semibold">Skript</div>
          <button onClick={copy} className="text-[0.65rem] inline-flex items-center gap-1 text-ink-400 hover:text-gold-300">
            {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Kopiert!' : 'Kopieren'}
          </button>
        </div>
        <div className="bg-ink-950/60 border border-white/5 rounded-lg p-3 max-h-96 overflow-y-auto overflow-x-auto">
          {data.text ? (
            <MarkdownViewer content={data.text} variant="portal" />
          ) : (
            <div className="text-xs text-ink-500 italic">Kein Skript-Output.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelOf(k: string): string {
  switch (k) {
    case 'hook':         return 'Hook';
    case 'structure':    return 'Struktur';
    case 'specificity':  return 'Spezifität';
    case 'icp_match':    return 'ICP-Match';
    case 'cta':          return 'CTA';
    default:             return k;
  }
}
