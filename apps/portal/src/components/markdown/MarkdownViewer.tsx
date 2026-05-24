import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
  variant?: 'portal' | 'public';
}

/**
 * Premium MD viewer for AEVUM portal — docs, knowledge base, legal text.
 * GFM tables, task lists, strikethrough. Dark-mode tuned with gold accents.
 */
export function MarkdownViewer({ content, variant = 'portal' }: Props) {
  return (
    <>
      <style>{`
        .aevum-md {
          color: rgba(255,255,255,0.88);
          font-size: 15px;
          line-height: 1.7;
          font-family: var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif);
        }
        .aevum-md > *:first-child { margin-top: 0; }
        .aevum-md > *:last-child { margin-bottom: 0; }

        .aevum-md h1, .aevum-md h2, .aevum-md h3, .aevum-md h4 {
          font-family: "DM Serif Display", Georgia, serif;
          font-weight: 400;
          letter-spacing: -0.015em;
          color: #fff;
          line-height: 1.25;
        }
        .aevum-md h1 { font-size: 30px; margin: 36px 0 16px; }
        .aevum-md h2 {
          font-size: 22px;
          margin: 44px 0 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: baseline; gap: 12px;
        }
        .aevum-md h2::before {
          content: "";
          flex-shrink: 0;
          width: 4px; height: 18px;
          border-radius: 2px;
          background: linear-gradient(180deg, #f5b94c 0%, #d99c2a 100%);
          align-self: center;
        }
        .aevum-md h3 { font-size: 17px; margin: 28px 0 10px; color: #f3e3c0; }
        .aevum-md h4 { font-size: 15px; margin: 20px 0 8px; color: #c9b48a; }

        .aevum-md p { margin: 12px 0; color: rgba(255,255,255,0.82); }
        .aevum-md strong { color: #fff; font-weight: 600; }
        .aevum-md em { color: rgba(255,255,255,0.92); }

        .aevum-md a {
          color: #f5b94c;
          text-decoration: none;
          border-bottom: 1px solid rgba(245,185,76,0.30);
          transition: all 180ms ease;
        }
        .aevum-md a:hover {
          color: #f9d27a;
          border-bottom-color: rgba(249,210,122,0.7);
        }

        .aevum-md ul, .aevum-md ol {
          margin: 12px 0;
          padding-left: 0;
          list-style: none;
        }
        .aevum-md li {
          position: relative;
          padding-left: 24px;
          margin: 6px 0;
          color: rgba(255,255,255,0.82);
        }
        .aevum-md ul > li::before {
          content: "";
          position: absolute;
          left: 8px; top: 12px;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f5b94c 0%, #d99c2a 100%);
          box-shadow: 0 0 6px rgba(245,185,76,0.45);
        }
        .aevum-md ol { counter-reset: aev-ol; }
        .aevum-md ol > li { counter-increment: aev-ol; }
        .aevum-md ol > li::before {
          content: counter(aev-ol) ".";
          position: absolute;
          left: 0; top: 0;
          color: #f5b94c;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
        .aevum-md li > ul, .aevum-md li > ol { margin: 4px 0; }

        .aevum-md blockquote {
          margin: 18px 0;
          padding: 12px 18px;
          background: linear-gradient(135deg, rgba(245,185,76,0.06) 0%, rgba(245,185,76,0.02) 100%);
          border: 1px solid rgba(245,185,76,0.22);
          border-left: 3px solid #f5b94c;
          border-radius: 10px;
          color: rgba(255,255,255,0.85);
        }
        .aevum-md blockquote p { margin: 4px 0; }

        .aevum-md code {
          font-family: "JetBrains Mono", ui-monospace, Menlo, monospace;
          font-size: 13px;
          padding: 2px 7px;
          background: rgba(245,185,76,0.10);
          border: 1px solid rgba(245,185,76,0.18);
          border-radius: 5px;
          color: #f9d27a;
        }
        .aevum-md pre {
          margin: 16px 0;
          padding: 14px 18px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          overflow-x: auto;
          font-size: 13px;
          line-height: 1.55;
        }
        .aevum-md pre code { padding: 0; background: none; border: none; color: inherit; }

        .aevum-md hr {
          margin: 36px 0;
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
        }

        .aevum-md table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 18px 0;
          font-size: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255,255,255,0.015);
        }
        .aevum-md thead {
          background: linear-gradient(180deg, rgba(245,185,76,0.10) 0%, rgba(245,185,76,0.04) 100%);
        }
        .aevum-md th {
          padding: 10px 14px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #f3e3c0;
          border-bottom: 1px solid rgba(245,185,76,0.20);
        }
        .aevum-md td {
          padding: 10px 14px;
          border-top: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.80);
          vertical-align: top;
        }
        .aevum-md tr:first-child td { border-top: none; }
        .aevum-md tbody tr:hover { background: rgba(255,255,255,0.02); }
        .aevum-md td strong { color: #fff; }

        .aevum-md.is-public {
          font-size: 16px;
          max-width: 760px;
        }
        .aevum-md.is-public h2 { font-size: 26px; }

        .aevum-md-table-wrap { overflow-x: auto; }
      `}</style>
      <div className={`aevum-md ${variant === 'public' ? 'is-public' : ''}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children, ...props }) => (
              <div className="aevum-md-table-wrap">
                <table {...props}>{children}</table>
              </div>
            ),
            a: ({ children, href, ...props }) => (
              <a
                href={href}
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </>
  );
}
