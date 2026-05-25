/**
 * TrustpilotReviews — Block F3 (2026-05-25)
 *
 * Card-Component die 3-5 echte Trustpilot-Reviews rendert (via aevum-api Cache).
 * Aktuell (Pre-Launch): API liefert leere Liste → Component zeigt Placeholder-Cards
 * mit "Founding-Customer"-CTA und transparentem Coming-Soon-Label.
 *
 * Sobald reale Reviews via Trustpilot-API in die `trustpilot_reviews`-Tabelle
 * synced werden, switched die Component automatisch auf Live-Mode.
 *
 * Backend: GET /api/trustpilot/reviews → { ok, reviews: [...] }
 *
 * Schwester-Komponente: TrustpilotWidget (lädt Trustpilot-CDN-Badge für MicroCombo).
 * Diese hier ist die volle Review-Grid-Variante.
 */
import { useEffect, useState } from 'react';
import { Star, Quote, ExternalLink, Clock } from 'lucide-react';

interface TrustpilotReview {
  trustpilot_review_id: string;
  author_name: string | null;
  star_rating: number;
  text: string | null;
  language: string | null;
  created_ts: string | null;
}

interface TrustpilotReviewsResponse {
  ok: boolean;
  reviews: TrustpilotReview[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.aevum-system.de';

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} von 5 Sternen`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? 'text-[#00b67a]' : 'text-white/15'}
          fill="currentColor"
        />
      ))}
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function ReviewCard({ r }: { r: TrustpilotReview }) {
  return (
    <article className="bg-bg-surface border border-white/10 hover:border-[#00b67a]/30 transition-colors p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <StarRow rating={r.star_rating} />
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#7a7a85]">
          {formatDate(r.created_ts)}
        </span>
      </div>
      <Quote size={18} className="text-[#e0a458]/60" />
      <p className="text-sm text-[#d4d4dc] leading-relaxed line-clamp-6">
        {r.text || '—'}
      </p>
      <div className="mt-auto pt-3 border-t border-white/5 text-xs text-[#a4a4ad]">
        {r.author_name || 'Verifizierter Kunde'}
      </div>
    </article>
  );
}

function PlaceholderCard({ slot }: { slot: number }) {
  const headlines = [
    'Werde Founding-Customer',
    'Reviews kommen mit den ersten Cases',
    'Public-Launch: Q3 2026',
  ];
  const bodies = [
    'AEVUM startet öffentlich im Sommer 2026. Founding-Customer bekommen einen Early-Adopter-Rabatt und sehen ihre echten Bewertungen hier zuerst.',
    'Wir veröffentlichen keine erfundenen Testimonials. Echte Reviews erscheinen sobald die ersten Customer-Projekte abgeschlossen sind.',
    'Trustpilot-Profile geht zeitgleich mit dem Public-Launch live. Bis dahin: transparenter Pre-Launch-Modus.',
  ];
  return (
    <article
      className="relative bg-bg-surface/30 border border-dashed border-white/10 p-6 flex flex-col gap-3 opacity-85"
      aria-label="Platzhalter — noch keine echte Review verfügbar"
    >
      {/* Prominent Coming-Soon Badge — top-right corner */}
      <span
        className="absolute -top-2.5 right-4 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-1 rounded-sm bg-[#e0a458] text-[#1a1a1a] font-semibold shadow-sm"
        aria-label="Coming Soon"
      >
        <Clock size={10} /> Bald verfügbar
      </span>

      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-0.5"
          aria-label="Noch keine Bewertung"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={14} className="text-white/10" fill="currentColor" />
          ))}
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#7a7a85]">
          Platzhalter
        </span>
      </div>
      <h3 className="text-sm font-medium text-[#e6e6ec]">
        {headlines[slot % headlines.length]}
      </h3>
      <p className="text-xs text-[#a4a4ad] leading-relaxed">
        {bodies[slot % bodies.length]}
      </p>
      <div className="mt-auto pt-3 border-t border-white/5 text-[10px] font-mono uppercase tracking-wider text-[#e0a458]/70">
        Noch keine echte Review · Pre-Launch
      </div>
    </article>
  );
}

interface TrustpilotReviewsProps {
  className?: string;
  /** Limit für gerenderte Reviews (default 3). */
  limit?: number;
  /** Wenn true und keine Reviews da → zeigt Placeholder-Cards (default). Wenn false → renderert null. */
  showPlaceholders?: boolean;
}

export default function TrustpilotReviews({
  className = '',
  limit = 3,
  showPlaceholders = true,
}: TrustpilotReviewsProps) {
  const [reviews, setReviews] = useState<TrustpilotReview[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/trustpilot/reviews`, {
      headers: { Accept: 'application/json' },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as TrustpilotReviewsResponse;
      })
      .then((d) => {
        if (cancelled) return;
        setReviews(Array.isArray(d?.reviews) ? d.reviews.slice(0, limit) : []);
        setState('ready');
      })
      .catch(() => {
        if (cancelled) return;
        // Graceful: kein Fehler-State an User — wir zeigen Placeholder
        setReviews([]);
        setState('ready');
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  // Loading-Skeleton
  if (state === 'loading') {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}
        aria-busy="true"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-bg-surface/40 border border-white/5 p-6 h-48 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const hasReal = reviews.length > 0;
  const placeholderCount = Math.max(0, 3 - reviews.length);

  if (!hasReal && !showPlaceholders) return null;

  return (
    <div className={className}>
      {/* Mode-Label: Live vs Pre-Launch */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#7a7a85]">
            Kundenstimmen
          </span>
          {!hasReal && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#e0a458]/15 text-[#e0a458] border border-[#e0a458]/30">
              <Clock size={10} /> Coming Soon · Pre-Launch
            </span>
          )}
        </div>
        <a
          href="https://www.trustpilot.com/review/aevum-system.de"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-[#7a7a85] hover:text-[#e0a458] transition-colors"
        >
          Trustpilot
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Clear Section-Headline when in Pre-Launch mode */}
      {!hasReal && (
        <div className="mb-6">
          <h2 className="text-lg font-medium text-[#e6e6ec]">
            Trustpilot-Reviews — verfügbar nach Launch
          </h2>
          <p className="text-xs text-[#7a7a85] mt-1">
            Diese Sektion zeigt aktuell Platzhalter. Echte Reviews erscheinen sobald die ersten Customer-Projekte live sind.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reviews.map((r) => (
          <ReviewCard key={r.trustpilot_review_id} r={r} />
        ))}
        {showPlaceholders &&
          Array.from({ length: placeholderCount }).map((_, i) => (
            <PlaceholderCard key={`ph-${i}`} slot={i} />
          ))}
      </div>

      {!hasReal && showPlaceholders && (
        <div className="mt-6 text-center">
          <p className="text-xs text-[#7a7a85] max-w-2xl mx-auto leading-relaxed">
            Wir veröffentlichen keine erfundenen Testimonials. Echte Trustpilot-Reviews
            erscheinen hier sobald die ersten Customer-Projekte abgeschlossen und freigegeben
            sind — voraussichtlich zum Public-Launch im Sommer 2026.
          </p>
        </div>
      )}
    </div>
  );
}
