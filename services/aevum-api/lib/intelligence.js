// intelligence.js — AEVUM Full Audit Engine
// Zwei-Ebenen-Analyse: Code/Content-Level + Workflow/AI-Level
// Läuft async bei Projekt-Anlage, speichert in project_intelligence

import { supabase } from './supabase.js';

const OR_KEY   = process.env.OPENROUTER_API_KEY;
const MODEL_FAST  = 'anthropic/claude-haiku-4-5';
const MODEL_SMART = 'anthropic/claude-sonnet-4-5';

// ── LLM ─────────────────────────────────────────────────────────────────────

async function llm(prompt, model = MODEL_FAST, maxTokens = 1500) {
  if (!OR_KEY) return null;
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OR_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aevum-system.de',
        'X-Title': 'AEVUM Intelligence'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens
      })
    });
    const j = await res.json();
    return j.choices?.[0]?.message?.content ?? null;
  } catch { return null; }
}

function parseJson(raw, fallback = []) {
  if (!raw) return fallback;
  try {
    const m = raw.match(/[\[{][\s\S]*[\]}]/);
    return m ? JSON.parse(m[0]) : fallback;
  } catch { return fallback; }
}

// ── Stage 1: Deep Crawl ─────────────────────────────────────────────────────

async function crawlPage(url, timeout = 8000) {
  try {
    const t0 = Date.now();
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AEVUM-Audit/1.0 (+https://aevum-system.de)' },
      signal: AbortSignal.timeout(timeout)
    });
    const responseMs = Date.now() - t0;
    const html = await res.text();

    const extract = (rx) => rx.exec(html)?.[1]?.trim() ?? null;
    const title       = extract(/<title[^>]*>([^<]+)<\/title>/i);
    const description = extract(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,300})["']/i);
    const h1          = extract(/<h1[^>]*>([^<]+)<\/h1>/i);
    const canonical   = extract(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    const h2s         = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi)].map(m => m[1].trim()).slice(0, 6);
    const robots      = extract(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
    const schemaOrg   = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
    const hasOG       = /<meta[^>]+property=["']og:/i.test(html);
    const ogTitle     = extract(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,200})["']/i);
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
    const hasFavicon  = /<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(html);

    // Extract all page-internal links for sub-page discovery
    const internalLinks = [...new Set(
      [...html.matchAll(/href=["'](\/?[a-zA-Z0-9/\-_]+)["']/g)]
        .map(m => m[1])
        .filter(l => l.startsWith('/') && l.length > 1 && !l.includes('.') )
        .slice(0, 20)
    )];

    // Content extraction (strip tags, get readable text)
    const bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);

    // Image audit
    const imgCount    = (html.match(/<img/gi) || []).length;
    const imgNoAlt    = (html.match(/<img(?![^>]+alt=)[^>]+>/gi) || []).length;

    // CTA detection
    const ctaButtons  = [...html.matchAll(/<(?:button|a)[^>]*>([^<]{3,50})<\/(?:button|a)>/gi)]
      .map(m => m[1].trim())
      .filter(t => /kauf|jetzt|bestell|termin|kontakt|anfrage|start|entdeck|buy|order|book|free|try|get|contact|start/i.test(t))
      .slice(0, 8);

    // Resource count (scripts + stylesheets)
    const scriptCount = (html.match(/<script[^>]+src/gi) || []).length;
    const styleCount  = (html.match(/<link[^>]+stylesheet/gi) || []).length;

    // Word count
    const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

    return {
      url,
      status: res.status,
      responseMs,
      title, description, h1, h2s, canonical, robots,
      hasSSL: url.startsWith('https://'),
      hasOG, ogTitle, schemaOrg, hasViewport, hasFavicon,
      imgCount, imgNoAlt, ctaButtons, scriptCount, styleCount,
      wordCount, bodyText, internalLinks
    };
  } catch (e) {
    return { url, error: e.message };
  }
}

async function deepCrawl(baseUrl) {
  const homepage = await crawlPage(baseUrl);
  if (homepage.error) return { pages: [homepage], baseUrl };

  // Crawl up to 4 sub-pages (Impressum/About/Services/Pricing skip)
  const skip = /impressum|datenschutz|privacy|legal|agb|cookie/i;
  const subLinks = (homepage.internalLinks || [])
    .filter(l => !skip.test(l))
    .slice(0, 3);

  const subPages = await Promise.all(
    subLinks.map(l => crawlPage(`${new URL(baseUrl).origin}${l}`).catch(() => null))
  );

  return {
    baseUrl,
    pages: [homepage, ...subPages.filter(Boolean)],
    homepage
  };
}

// ── Stage 2: Speed Analysis ──────────────────────────────────────────────────

function analyzeSpeed(homepage) {
  if (!homepage || homepage.error) return null;
  const { responseMs, scriptCount, styleCount, imgCount, wordCount } = homepage;
  let score = 100;
  const issues = [];

  if (responseMs > 3000) { score -= 30; issues.push({ severity: 'high', msg: `TTFB ${responseMs}ms — kritisch langsam (>3s)` }); }
  else if (responseMs > 1500) { score -= 15; issues.push({ severity: 'medium', msg: `TTFB ${responseMs}ms — verbesserbar (>1.5s)` }); }
  else if (responseMs > 800) { score -= 5; issues.push({ severity: 'low', msg: `TTFB ${responseMs}ms — leicht langsam` }); }

  if (scriptCount > 10) { score -= 15; issues.push({ severity: 'medium', msg: `${scriptCount} externe Scripts — zu viele JS-Requests` }); }
  if (styleCount > 5)   { score -= 10; issues.push({ severity: 'low',    msg: `${styleCount} Stylesheets — CSS-Requests reduzieren` }); }
  if (imgCount > 20)    { score -= 10; issues.push({ severity: 'low',    msg: `${imgCount} Bilder — Lazy Loading prüfen` }); }
  if (homepage.imgNoAlt > 0) { score -= 5; issues.push({ severity: 'medium', msg: `${homepage.imgNoAlt} Bilder ohne alt-Attribut` }); }

  return {
    responseMs,
    scriptCount,
    styleCount,
    imgCount,
    imgNoAlt: homepage.imgNoAlt,
    score: Math.max(0, score),
    issues
  };
}

// ── Stage 3: SEO Analysis ────────────────────────────────────────────────────

function analyzeSeo(crawl) {
  const hp = crawl.homepage;
  if (!hp || hp.error) return { score: 0, issues: [{ severity: 'critical', msg: 'Website nicht erreichbar' }] };

  let score = 40;
  const issues = [];
  const wins = [];

  if (hp.title)                          { score += 10; wins.push('Title-Tag vorhanden'); }
  else                                    issues.push({ severity: 'high',     msg: 'Kein <title> Tag' });
  if (hp.description)                    { score += 10; wins.push('Meta-Description vorhanden'); }
  else                                    issues.push({ severity: 'high',     msg: 'Keine Meta-Description' });
  if (hp.h1)                             { score += 8;  wins.push('H1 vorhanden'); }
  else                                    issues.push({ severity: 'medium',   msg: 'Kein H1-Tag' });
  if (hp.hasSSL)                         { score += 8;  wins.push('HTTPS aktiv'); }
  else                                    issues.push({ severity: 'critical', msg: 'Kein HTTPS' });
  if (hp.hasOG)                          { score += 5;  wins.push('Open-Graph-Tags vorhanden'); }
  else                                    issues.push({ severity: 'low',      msg: 'Keine OG-Tags (Social Sharing)' });
  if (hp.schemaOrg)                      { score += 8;  wins.push('Schema.org Markup vorhanden'); }
  else                                    issues.push({ severity: 'medium',   msg: 'Kein Schema.org/JSON-LD Markup' });
  if (hp.canonical)                       score += 3;
  else                                    issues.push({ severity: 'low',      msg: 'Kein Canonical-Tag' });
  if (hp.hasViewport)                    { score += 5;  wins.push('Viewport-Meta vorhanden (mobile-ready)'); }
  else                                    issues.push({ severity: 'high',     msg: 'Kein Viewport-Meta — mobile-Probleme' });
  if (hp.wordCount > 600)                { score += 5;  wins.push(`Guter Content-Umfang (${hp.wordCount} Wörter)`); }
  else if (hp.wordCount < 300)            issues.push({ severity: 'medium',   msg: `Wenig Content (${hp.wordCount} Wörter)` });
  if (hp.h2s && hp.h2s.length > 1)       score += 3;

  // Multi-page checks
  const pagesWithTitle = crawl.pages.filter(p => p.title && !p.error).length;
  if (crawl.pages.length > 1 && pagesWithTitle < crawl.pages.length) {
    issues.push({ severity: 'medium', msg: `${crawl.pages.length - pagesWithTitle} Sub-Seiten ohne Title-Tag` });
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    wins,
    details: {
      title: hp.title,
      description: hp.description,
      h1: hp.h1,
      h2s: hp.h2s,
      canonical: hp.canonical,
      hasSchemaOrg: hp.schemaOrg,
      robots: hp.robots,
      ogTitle: hp.ogTitle
    }
  };
}

// ── Stage 4: Copy Analysis (AI) ───────────────────────────────────────────────

async function analyzeCopy({ homepage, businessName, industry }) {
  if (!homepage || homepage.error || !homepage.bodyText) return null;

  const prompt = `Du bist ein Senior Copywriter + Conversion-Experte. Analysiere diesen Website-Text für "${businessName}" (Branche: ${industry}).

WEBSITE CONTENT (Homepage):
---
Title: ${homepage.title}
H1: ${homepage.h1}
H2s: ${(homepage.h2s || []).join(' | ')}
CTAs: ${(homepage.ctaButtons || []).join(' | ')}
Body (Auszug): ${homepage.bodyText.slice(0, 1500)}
---

Antworte AUSSCHLIESSLICH als JSON:
{
  "headline_score": 0-100,
  "cta_score": 0-100,
  "clarity_score": 0-100,
  "value_prop_score": 0-100,
  "overall_copy_score": 0-100,
  "headline_verdict": "1-Satz Bewertung der Headline",
  "cta_verdict": "1-Satz Bewertung der CTAs",
  "value_prop_verdict": "1-Satz zum Unique Value Proposition",
  "tone": "professional|casual|aggressive|bland|unclear",
  "target_audience_match": "passt die Sprache zur Zielgruppe? 1 Satz",
  "quick_wins": [
    {"fix": "Was ändern", "example": "Konkret umformuliert", "impact": "high|medium|low"}
  ],
  "rewrite_suggestions": [
    {"element": "H1|CTA|Description|etc.", "current": "...", "improved": "..."}
  ]
}`;

  const raw = await llm(prompt, MODEL_SMART, 2000);
  return parseJson(raw, null);
}

// ── Stage 5: Workflow Analysis (AI) ──────────────────────────────────────────

async function analyzeWorkflows({ businessName, industry, tools, websiteData }) {
  const toolsList = tools?.map(t => t.service).join(', ') || 'keine bekannt';
  const siteContext = websiteData
    ? `Website: ${websiteData.title}, CTAs: ${(websiteData.ctaButtons || []).join(', ')}`
    : 'keine Website-Daten';

  const prompt = `Du bist ein AI-Systems-Architekt. Analysiere das Business "${businessName}" (Branche: ${industry}).

Bekannte Tools/Integrationen: ${toolsList}
${siteContext}

Identifiziere:
1. Top-5 Workflow-Schwachstellen (wo wird Zeit verschwendet / läuft manuell)
2. KI-Integrations-Chancen mit konkretem Business-Impact
3. Automatisierungs-Quick-Wins (umsetzbar in <1 Woche)

Antworte AUSSCHLIESSLICH als JSON:
{
  "workflow_score": 0-100,
  "pain_points": [
    {"area": "z.B. Lead-Nurturing", "problem": "konkret was passiert manuell", "severity": "high|medium|low"}
  ],
  "automation_opportunities": [
    {
      "title": "z.B. Automatisches Lead-Follow-up",
      "category": "marketing|sales|ops|customer_service|data|content",
      "description": "Was wird automatisiert und wie",
      "ai_component": "welche KI-Technologie (z.B. LLM für E-Mail-Drafts, CV für Bildanalyse)",
      "effort": "low|medium|high",
      "impact": "high|medium|low",
      "revenue_potential": "z.B. +15% Conversion oder -5h/Woche"
    }
  ],
  "quick_wins": [
    {"action": "konkreter Schritt", "tool": "empfohlenes Tool", "timeline": "z.B. 2 Tage"}
  ],
  "missing_integrations": ["fehlende aber wichtige Tools für diesen Typ Business"]
}`;

  const raw = await llm(prompt, MODEL_SMART, 2500);
  return parseJson(raw, null);
}

// ── Stage 6: Full Report (AI Summary) ────────────────────────────────────────

async function generateFullReport({ businessName, industry, seo, speed, copy, workflow }) {
  const summary = `
SEO-Score: ${seo?.score ?? '—'}/100, ${seo?.issues?.length ?? 0} Issues
Speed-Score: ${speed?.score ?? '—'}/100, TTFB: ${speed?.responseMs ?? '—'}ms
Copy-Score: ${copy?.overall_copy_score ?? '—'}/100
Workflow-Score: ${workflow?.workflow_score ?? '—'}/100
Top SEO-Issues: ${(seo?.issues ?? []).filter(i => i.severity === 'high' || i.severity === 'critical').map(i => i.msg).slice(0, 3).join('; ')}
Top Copy-Issues: ${(copy?.quick_wins ?? []).slice(0, 2).map(w => w.fix).join('; ')}
Top Workflow-Opp: ${(workflow?.automation_opportunities ?? []).slice(0, 2).map(o => o.title).join('; ')}
  `.trim();

  const prompt = `Du bist Carlos Wrusch, Gründer von AEVUM. Du hast gerade ein vollständiges Business-Audit für "${businessName}" (${industry}) abgeschlossen.

AUDIT-ERGEBNISSE:
${summary}

Schreibe eine Executive Summary für dieses Audit.
Antworte AUSSCHLIESSLICH als JSON:
{
  "executive_summary": "3-4 Sätze — was ist der Gesamtzustand, was sind die 2-3 wichtigsten Hebel",
  "overall_score": 0-100,
  "top_priorities": [
    {"rank": 1, "category": "seo|copy|speed|workflow", "action": "Konkrete Maßnahme", "impact": "high|medium", "effort": "low|medium|high", "revenue_impact": "z.B. +20% organischer Traffic"}
  ],
  "quick_wins_this_week": ["Aktion 1", "Aktion 2", "Aktion 3"],
  "estimated_revenue_impact": "Realistisches Upside wenn alle High-Impact-Items umgesetzt",
  "aevum_fit": "Was AEVUM konkret für dieses Business tun würde"
}`;

  const raw = await llm(prompt, MODEL_SMART, 2000);
  return parseJson(raw, null);
}

// ── Haupt-Export ─────────────────────────────────────────────────────────────

export async function runIntelligenceAudit({
  projectId, accountId, businessName, websiteUrl, linkedinUrl, industry, existingTools = []
}) {
  // Row anlegen
  const row = await supabase.insert('project_intelligence', {
    project_id: projectId,
    status: 'running',
    website_url: websiteUrl ?? null,
    linkedin_url: linkedinUrl ?? null,
    audit_version: 2
  });
  if (!row.ok || !row.data?.length) {
    console.error('[intelligence] Row-Anlage fehlgeschlagen:', row.error);
    return;
  }
  const rowId = row.data[0].id;
  const log = (msg) => console.log(`[intelligence:${rowId}] ${msg}`);

  try {
    log('Stage 1: Deep Crawl...');
    const [crawl, linkedinData] = await Promise.all([
      websiteUrl ? deepCrawl(websiteUrl) : Promise.resolve(null),
      linkedinUrl ? fetchLinkedIn(linkedinUrl) : Promise.resolve(null)
    ]);

    const homepage = crawl?.homepage ?? null;

    log('Stage 2: Speed + SEO Analysis...');
    const speedData = analyzeSpeed(homepage);
    const seoData   = analyzeSeo(crawl ?? { pages: [], homepage: null });

    log('Stage 3: Copy Analysis (AI)...');
    const copyData = await analyzeCopy({ homepage, businessName, industry });

    log('Stage 4: Workflow Analysis (AI)...');
    const workflowData = await analyzeWorkflows({
      businessName,
      industry,
      tools: existingTools,
      websiteData: homepage
    });

    log('Stage 5: Full Report (AI Summary)...');
    const fullReport = await generateFullReport({
      businessName, industry,
      seo: seoData,
      speed: speedData,
      copy: copyData,
      workflow: workflowData
    });

    const allIssues = [
      ...(seoData?.issues ?? []),
      ...(speedData?.issues ?? [])
    ];

    await supabase.update('project_intelligence', `id=eq.${rowId}`, {
      seo_score:        seoData?.score ?? 0,
      seo_raw:          seoData,
      website_meta:     homepage ? {
        title:       homepage.title,
        description: homepage.description,
        h1:          homepage.h1,
        h2s:         homepage.h2s,
        hasSSL:      homepage.hasSSL,
        wordCount:   homepage.wordCount,
        ctaButtons:  homepage.ctaButtons
      } : null,
      website_issues:   allIssues,
      linkedin_data:    linkedinData ?? {},
      crawl_pages:      crawl?.pages?.map(p => ({
        url: p.url, title: p.title, h1: p.h1, status: p.status, error: p.error ?? null
      })) ?? [],
      speed_data:       speedData,
      copy_analysis:    copyData,
      workflow_analysis: workflowData,
      optimizations:    fullReport?.top_priorities ?? [],
      full_report:      fullReport,
      audit_summary:    fullReport?.executive_summary
        ?? `Audit abgeschlossen. SEO: ${seoData?.score ?? 0}/100, Speed: ${speedData?.score ?? 0}/100.`,
      status:           'done',
      updated_at:       new Date().toISOString()
    });

    log(`Done — SEO: ${seoData?.score}, Speed: ${speedData?.score}, Copy: ${copyData?.overall_copy_score ?? '—'}, Workflow: ${workflowData?.workflow_score ?? '—'}`);
  } catch (err) {
    console.error('[intelligence] Error:', err.message);
    await supabase.update('project_intelligence', `id=eq.${rowId}`, {
      status: 'error',
      error_msg: err.message,
      updated_at: new Date().toISOString()
    });
  }
}

// ── LinkedIn Scrape (public) ─────────────────────────────────────────────────

async function fetchLinkedIn(linkedinUrl) {
  try {
    const res = await fetch(linkedinUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AEVUM-Audit/1.0)' },
      signal: AbortSignal.timeout(8000)
    });
    const html = await res.text();
    return {
      name:        html.match(/<title[^>]*>([^<|]+)/)?.[1]?.trim() ?? null,
      description: html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ?? null,
      followers:   html.match(/(\d[\d.,]+)\s*Follower/i)?.[1] ?? null,
      url:         linkedinUrl,
      reachable:   res.ok
    };
  } catch (e) {
    return { error: e.message, url: linkedinUrl, reachable: false };
  }
}
