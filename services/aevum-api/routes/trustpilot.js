// AEVUM Trustpilot — Wave I Final
// Created: 2026-05-24
//
// GET /api/trustpilot/reviews   → cached published reviews aus DB
//
// Cache wird befüllt von externem Sync (TBD: Trustpilot API → upsert per trustpilot_review_id).
// Aktuell: leerer Cache → Widget zeigt Trustpilot-CDN-Embed (Frontend-Fallback).

import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const trustpilotRouter = Router();

trustpilotRouter.get('/reviews', async (_req, res) => {
  try {
    const { ok, data } = await supabase.select(
      'trustpilot_reviews',
      '?is_published=eq.true&select=trustpilot_review_id,author_name,star_rating,text,language,created_ts&order=created_ts.desc&limit=10'
    );
    if (!ok) {
      return res.json({ ok: true, reviews: [] }); // graceful — leerer Cache statt Fehler
    }
    res.json({ ok: true, reviews: data || [] });
  } catch (e) {
    // Sicheres Fail: leere Liste statt Fehler an Public
    res.json({ ok: true, reviews: [] });
  }
});

export default trustpilotRouter;
