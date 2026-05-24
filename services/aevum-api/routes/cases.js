// /api/cases — Public, permissions-gated case pages for AEVUM website
//
// Schema lives in migrations/026_case_pages.sql (table: public.case_pages).
// Carlos pflegt Inhalte ueber die Tabelle (Admin-UI folgt) — diese Route
// liefert nur public=true Eintraege und merged optional Live-KPIs aus
// project_intelligence wenn show_revenue / show_users / show_growth.
//
// Brand-Memory: Anti-Fake-it. Keine erfundenen KPIs. Wenn ein Wert nicht
// aus DB kommt, ist source='manual' (Carlos hat ihn von Hand gesetzt).

import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const casesRouter = Router();

// ──────────────────────────────────────────────────────────
// GET /api/cases — list public cases, sorted
// ──────────────────────────────────────────────────────────
casesRouter.get('/', async (_req, res) => {
  const r = await supabase.select(
    'case_pages',
    'select=slug,hero_title,hero_subtitle,brand_url,activated_services,testimonial_author,sort_order,hero_image_url' +
      '&public=eq.true' +
      '&order=sort_order.asc'
  );

  if (!r.ok) {
    return res.status(500).json({ ok: false, error: r.error });
  }

  res.json({
    ok: true,
    $schema: 'aevum/cases/v2',
    cases: r.data || []
  });
});

// ──────────────────────────────────────────────────────────
// GET /api/cases/:slug — single case detail (public)
// ──────────────────────────────────────────────────────────
casesRouter.get('/:slug', async (req, res) => {
  const slug = String(req.params.slug || '').trim().toLowerCase();
  if (!slug || !/^[a-z0-9-]{1,80}$/.test(slug)) {
    return res.status(400).json({ ok: false, error: 'invalid_slug' });
  }

  const r = await supabase.select(
    'case_pages',
    `select=*&slug=eq.${encodeURIComponent(slug)}&public=eq.true&limit=1`
  );

  if (!r.ok) {
    return res.status(500).json({ ok: false, error: r.error });
  }

  const row = (r.data || [])[0];
  if (!row) {
    return res.status(404).json({ ok: false, error: 'not_found' });
  }

  // Live-KPI-Merge: ziehe optional Daten aus project_intelligence wenn
  // show_revenue / show_users / show_growth aktiv. Nur additiv — manuelle
  // Eintraege in row.live_kpis bleiben erhalten.
  const liveKpis = Array.isArray(row.live_kpis) ? [...row.live_kpis] : [];

  const wantsLive = row.show_revenue || row.show_users || row.show_growth;
  if (wantsLive && row.account_id) {
    try {
      const pi = await supabase.select(
        'project_intelligence',
        `select=metric_key,metric_value,metric_unit,updated_at&account_id=eq.${row.account_id}&order=updated_at.desc&limit=20`
      );
      if (pi.ok && Array.isArray(pi.data)) {
        const wantedKeys = new Set();
        if (row.show_revenue) {
          wantedKeys.add('mrr');
          wantedKeys.add('revenue_month');
        }
        if (row.show_users) {
          wantedKeys.add('active_users');
          wantedKeys.add('total_users');
        }
        if (row.show_growth) {
          wantedKeys.add('growth_pct');
          wantedKeys.add('mom_growth');
        }
        for (const m of pi.data) {
          if (!wantedKeys.has(m.metric_key)) continue;
          liveKpis.push({
            label: m.metric_key,
            value: m.metric_value,
            unit: m.metric_unit || '',
            source: 'db',
            updated_at: m.updated_at
          });
        }
      }
    } catch (e) {
      // Soft-fail: Live-KPI-Merge darf den Case nicht brechen
      console.warn('[cases] live-kpi merge fail:', e?.message);
    }
  }

  res.json({
    ok: true,
    $schema: 'aevum/case/v2',
    case: {
      slug: row.slug,
      hero_title: row.hero_title,
      hero_subtitle: row.hero_subtitle,
      brand_url: row.brand_url,
      hero_image_url: row.hero_image_url,
      project_description: row.project_description,
      collaboration_story: row.collaboration_story,
      vision: row.vision,
      activated_services: Array.isArray(row.activated_services) ? row.activated_services : [],
      live_kpis: liveKpis,
      testimonial_quote: row.testimonial_quote,
      testimonial_author: row.testimonial_author
    }
  });
});
