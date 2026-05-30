/**
 * TrustpilotWidget — Wave I Final 2026-05-24
 *
 * Lazy-load Trustpilot-Widget-Script (Bootstrap v5).
 *
 * Props:
 *   - businessUnitId?: string  (override; default = VITE_TRUSTPILOT_BUSINESS_ID)
 *   - templateId?: string      (override; default = MicroCombo "5419b6ffb0d04a076446a9af")
 *   - locale?: string          (default "de-DE")
 *   - height?: string          (default "24px" for MicroCombo)
 *   - className?: string
 *
 * Falls businessUnitId fehlt → freundlicher Placeholder ("Reviews kommen bald").
 * Script wird nur 1× geladen (Idempotent), respektiert Privacy (defer, no async-eval).
 */
import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';

const TP_SCRIPT_SRC = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
const TP_SCRIPT_ID = 'trustpilot-bootstrap-v5';

// Default-Template: MicroCombo (Logo + Stars + "Excellent" + Count)
const DEFAULT_TEMPLATE_ID = '5419b6ffb0d04a076446a9af';

interface TrustpilotWidgetProps {
  businessUnitId?: string;
  templateId?: string;
  locale?: string;
  height?: string;
  className?: string;
}

function loadTrustpilotScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();
    if (document.getElementById(TP_SCRIPT_ID)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.id = TP_SCRIPT_ID;
    s.src = TP_SCRIPT_SRC;
    s.defer = true;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // graceful — Fallback rendert dann
    document.head.appendChild(s);
  });
}

function TrustpilotPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-flex max-w-full flex-wrap items-center gap-3 px-5 py-3 bg-bg-surface border border-theme-border rounded-md ${className}`}
      role="status"
      aria-label="Trustpilot-Reviews kommen bald"
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={14}
            className="text-text-muted/50"
            fill="currentColor"
          />
        ))}
      </div>
      <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
        Trustpilot-Reviews bald verfügbar
      </span>
    </div>
  );
}

export default function TrustpilotWidget({
  businessUnitId,
  templateId = DEFAULT_TEMPLATE_ID,
  locale = 'de-DE',
  height = '24px',
  className = '',
}: TrustpilotWidgetProps) {
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const buId =
    businessUnitId ||
    (import.meta.env.VITE_TRUSTPILOT_BUSINESS_ID as string | undefined) ||
    '';

  useEffect(() => {
    if (!buId) return;
    let cancelled = false;
    loadTrustpilotScript().then(() => {
      if (cancelled) return;
      setScriptReady(true);
      // Re-init falls Widget bereits geladen (z.B. Route-Wechsel)
      const Tp = (window as { Trustpilot?: { loadFromElement: (el: HTMLElement, b?: boolean) => void } }).Trustpilot;
      if (Tp && widgetRef.current) {
        try {
          Tp.loadFromElement(widgetRef.current, true);
        } catch {
          /* graceful */
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [buId]);

  if (!buId) {
    return <TrustpilotPlaceholder className={className} />;
  }

  return (
    <div
      ref={widgetRef}
      className={`trustpilot-widget ${className}`}
      data-locale={locale}
      data-template-id={templateId}
      data-businessunit-id={buId}
      data-style-height={height}
      data-style-width="100%"
      data-theme="dark"
      style={{ minHeight: height }}
      // Microdata fallback während Script lädt
      aria-busy={!scriptReady}
    >
      <a
        href={`https://www.trustpilot.com/review/aevum-system.de`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-mono uppercase tracking-wider text-text-muted hover:text-theme-accent transition-colors"
      >
        Trustpilot-Reviews lesen →
      </a>
    </div>
  );
}
