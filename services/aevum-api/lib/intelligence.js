// intelligence.js — Auto-Audit bei Kunden-Anlage
// Sammelt: Website, SEO, LinkedIn, GBP, Social
// Läuft async im Hintergrund, speichert in project_intelligence

import { supabase } from './supabase.js';

const OR_KEY  = process.env.OPENROUTER_API_KEY;
const OR_MODEL = 'anthropic/claude-haiku-4-5';

// ── LLM helper ──────────────────────────────────────────────────────────────
async function llm(prompt) {
  if (!OR_KEY) return null;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OR_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://aevum-system.de',
      'X-Title': 'AEVUM Intelligence'
    },
    body: JSON.stringify({
      model: OR_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200
    })
  });
  const j = await res.json();
  return j.choices?.[0]?.message?.content ?? null;
}

// ── Website Meta Fetch ───────────────────────────────────────────────────────
async function fetchWebsiteMeta(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AEVUM-Intelligence/1.0' },
      signal: AbortSignal.timeout(8000)
    });
    const html = await res.text();
    const title       = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null;
    const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ?? null;
    const h1          = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim() ?? null;
    const hasSSL      = url.startsWith('https://');
    const hasFavicon  = /<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(html);
    const hasOG       = /<meta[^>]+property=["']og:/i.test(html);
    const wordCount   = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const issues = [];
    if (!title)       issues.push({ type: 'seo', severity: 'high',   msg: 'Kein <title> Tag gefunden' });
    if (!description) issues.push({ type: 'seo', severity: 'high',   msg: 'Keine Meta-Description gefunden' });
    if (!h1)          issues.push({ type: 'content', severity: 'medium', msg: 'Kein H1-Tag auf der Startseite' });
    if (!hasSSL)      issues.push({ type: 'security', severity: 'critical', msg: 'Kein HTTPS — HTTP only' });
    if (!hasOG)       issues.push({ type: 'social', severity: 'low',  msg: 'Keine Open-Graph-Tags (Social Sharing)' });
    if (wordCount < 300) issues.push({ type: 'content', severity: 'medium', msg: `Sehr wenig Content (${wordCount} Wörter)` });
    return { title, description, h1, hasSSL, hasFavicon, hasOG, wordCount, issues, status: res.status };
  } catch (e) {
    return { error: e.message, issues: [{ type: 'availability', severity: 'critical', msg: `Website nicht erreichbar: ${e.message}` }] };
  }
}

// ── LinkedIn Scrape (public profile) ────────────────────────────────────────
async function fetchLinkedIn(linkedinUrl) {
  if (!linkedinUrl) return null;
  try {
    const res = await fetch(linkedinUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AEVUM-Bot/1.0)' },
      signal: AbortSignal.timeout(8000)
    });
    const html = await res.text();
    const name        = html.match(/<title[^>]*>([^<|]+)/)?.[1]?.trim() ?? null;
    const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ?? null;
    const followers   = html.match(/(\d[\d.,]+)\s*Follower/i)?.[1] ?? null;
    return { name, description, followers, url: linkedinUrl, reachable: res.ok };
  } catch (e) {
    return { error: e.message, url: linkedinUrl, reachable: false };
  }
}

// ── SEO-Score berechnen ──────────────────────────────────────────────────────
function calcSeoScore(websiteMeta) {
  if (!websiteMeta) return 0;
  let score = 50;
  if (websiteMeta.title)       score += 15;
  if (websiteMeta.description) score += 15;
  if (websiteMeta.h1)          score += 10;
  if (websiteMeta.hasSSL)      score += 10;
  if (websiteMeta.hasOG)       score += 5;
  if (websiteMeta.wordCount > 500) score += 5;
  const criticals = (websiteMeta.issues ?? []).filter(i => i.severity === 'critical').length;
  score -= criticals * 20;
  return Math.max(0, Math.min(100, score));
}

// ── AI-Optimierungsreport generieren ────────────────────────────────────────
async function generateOptimizations({ websiteMeta, linkedinData, businessName, industry }) {
  const context = `
Business: ${businessName}
Industry: ${industry}
Website SEO-Issues: ${JSON.stringify(websiteMeta?.issues ?? [])}
Website Meta: title="${websiteMeta?.title}", description="${websiteMeta?.description}"
LinkedIn: ${linkedinData ? `${linkedinData.followers ?? '?'} Follower, reachable: ${linkedinData.reachable}` : 'nicht angegeben'}
  `.trim();

  const prompt = `Du bist ein digitaler Business-Auditor. Analysiere diese Daten und gib 5-8 konkrete Optimierungsempfehlungen aus.
Antworte NUR als JSON-Array: [{"priority":"high|medium|low","category":"seo|website|social|branding|marketing","title":"Kurztitel","action":"Konkrete Maßnahme in 1-2 Sätzen"}]

${context}`;

  try {
    const raw = await llm(prompt);
    if (!raw) return [];
    const match = raw.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch { return []; }
}

// ── Haupt-Audit-Funktion ─────────────────────────────────────────────────────
export async function runIntelligenceAudit({ projectId, accountId, businessName, websiteUrl, linkedinUrl, industry }) {
  // Row anlegen mit status=running
  const row = await supabase.insert('project_intelligence', {
    project_id: projectId,
    status: 'running',
    website_url: websiteUrl ?? null,
    linkedin_url: linkedinUrl ?? null
  });
  if (!row.ok || !row.data?.length) {
    console.error('[intelligence] Failed to create row:', row.error);
    return;
  }
  const rowId = row.data[0].id;

  try {
    // Parallel: Website + LinkedIn
    const [websiteMeta, linkedinData] = await Promise.all([
      websiteUrl ? fetchWebsiteMeta(websiteUrl) : Promise.resolve(null),
      linkedinUrl ? fetchLinkedIn(linkedinUrl) : Promise.resolve(null)
    ]);

    const seoScore = calcSeoScore(websiteMeta);
    const optimizations = await generateOptimizations({ websiteMeta, linkedinData, businessName, industry });

    const allIssues = [
      ...(websiteMeta?.issues ?? []),
    ];

    const summary = optimizations.length > 0
      ? `${optimizations.filter(o => o.priority === 'high').length} kritische Optimierungen identifiziert. SEO-Score: ${seoScore}/100.`
      : `Audit abgeschlossen. SEO-Score: ${seoScore}/100.`;

    await supabase.update('project_intelligence', `id=eq.${rowId}`, {
      seo_score: seoScore,
      seo_raw: websiteMeta ?? {},
      website_meta: { title: websiteMeta?.title, description: websiteMeta?.description, h1: websiteMeta?.h1, hasSSL: websiteMeta?.hasSSL, wordCount: websiteMeta?.wordCount },
      website_issues: allIssues,
      linkedin_data: linkedinData ?? {},
      optimizations,
      audit_summary: summary,
      status: 'done',
      updated_at: new Date().toISOString()
    });

    console.log(`[intelligence] Audit done for project ${projectId} — score: ${seoScore}, ${optimizations.length} optimizations`);
  } catch (err) {
    console.error('[intelligence] Audit error:', err.message);
    await supabase.update('project_intelligence', `id=eq.${rowId}`, {
      status: 'error',
      error_msg: err.message,
      updated_at: new Date().toISOString()
    });
  }
}
