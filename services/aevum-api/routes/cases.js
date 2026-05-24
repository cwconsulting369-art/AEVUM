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
    'select=slug,hero_title,hero_subtitle,brand_url,activated_services,testimonial_author,sort_order,hero_image_url,' +
      'allow_show_brand_name,allow_show_logo,allow_show_testimonial,allow_show_services' +
      '&public=eq.true' +
      '&order=sort_order.asc'
  );

  if (!r.ok) {
    return res.status(500).json({ ok: false, error: r.error });
  }

  // Wave E4 — Permission-Filter auf List-Output
  const cases = (r.data || []).map(c => ({
    slug: c.slug,
    hero_title: c.hero_title,
    hero_subtitle: c.hero_subtitle,
    brand_url: c.allow_show_brand_name === false ? null : c.brand_url,
    hero_image_url: c.allow_show_logo === true ? c.hero_image_url : null,
    activated_services: c.allow_show_services !== false && Array.isArray(c.activated_services) ? c.activated_services : [],
    testimonial_author: c.allow_show_testimonial === true ? c.testimonial_author : null,
    sort_order: c.sort_order
  }));

  res.json({
    ok: true,
    $schema: 'aevum/cases/v2',
    cases
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

  // ──────────────────────────────────────────────────────────
  // Wave E4: Customer-Permission-Filter (case_pages.allow_show_*)
  // Hero-Title + hero_subtitle bleiben immer sichtbar (sonst leerer Case).
  // brand_url + brand_name nur wenn allow_show_brand_name.
  // logo (hero_image_url) nur wenn allow_show_logo.
  // testimonial nur wenn allow_show_testimonial.
  // services nur wenn allow_show_services.
  // collaboration_story nur wenn allow_show_collaboration_story.
  // vision nur wenn allow_show_vision.
  // live_kpis nur subset wenn show_revenue/users/growth (existierende Logik oben).
  // ──────────────────────────────────────────────────────────
  const allowBrand    = row.allow_show_brand_name          !== false;
  const allowLogo     = row.allow_show_logo               === true;
  const allowQuote    = row.allow_show_testimonial        === true;
  const allowServices = row.allow_show_services           !== false;
  const allowStory    = row.allow_show_collaboration_story !== false;
  const allowVision   = row.allow_show_vision             !== false;

  res.json({
    ok: true,
    $schema: 'aevum/case/v2',
    case: {
      slug: row.slug,
      hero_title: row.hero_title,
      hero_subtitle: row.hero_subtitle,
      brand_url: allowBrand ? row.brand_url : null,
      hero_image_url: allowLogo ? row.hero_image_url : null,
      project_description: row.project_description,
      collaboration_story: allowStory ? row.collaboration_story : null,
      vision: allowVision ? row.vision : null,
      activated_services: allowServices && Array.isArray(row.activated_services) ? row.activated_services : [],
      live_kpis: liveKpis,
      testimonial_quote: allowQuote ? row.testimonial_quote : null,
      testimonial_author: allowQuote ? row.testimonial_author : null,
      permissions: {
        brand_name: allowBrand,
        logo: allowLogo,
        testimonial: allowQuote,
        services: allowServices,
        collaboration_story: allowStory,
        vision: allowVision,
        revenue: row.show_revenue === true,
        users: row.show_users === true,
        growth: row.show_growth === true
      }
    }
  });
});
