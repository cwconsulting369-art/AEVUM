// lib/social-publish.js — DIE GATED AKTIVE SCHNITTSTELLE
// ──────────────────────────────────────────────────────────────────────────
// Dies ist der EINZIGE Ort, an dem ein realer Schreib-Call gegen Facebook
// (Graph API) bzw. LinkedIn (UGC API) gefeuert wird. Der Code ist VOLL
// ausimplementiert und FEUERT SOFORT, sobald Patrick seinen Account verbindet
// und ein gültiges OAuth-Token in project_apis liegt.
//
// Bis dahin wird dieser Code GAR NICHT erreicht: die Routen in routes/content.js
// liefern vorher 409 (channel_not_connected) bzw. 503 (oauth_not_configured)
// zurück. publishPiece() wirft zusätzlich defensiv {code:'NO_TOKEN'}, falls es
// doch ohne Token aufgerufen würde.
//
// Tokens kommen NUR entschlüsselt aus project_apis (AES-256-GCM) herein und
// werden NIE geloggt.
// ──────────────────────────────────────────────────────────────────────────

const FB_GRAPH_VERSION = process.env.FB_GRAPH_VERSION || 'v21.0';

/**
 * Publiziert ein Content-Piece auf der angegebenen Plattform.
 *
 * @param {object}  args
 * @param {string}  args.platform   'facebook' | 'linkedin'
 * @param {string}  args.token      OAuth/Page-Access-Token (entschlüsselt). Pflicht.
 * @param {string}  args.externalId FB: Page-ID  ·  LinkedIn: Person/Org-URN (z.B. 'urn:li:person:xxxx')
 * @param {object}  args.piece      content_pieces-Zeile ({ title, body, visual_url, ... })
 * @returns {Promise<{ ok:true, external_post_id:string, raw:object }>}
 * @throws  {{ code:'NO_TOKEN' }} wenn kein Token vorliegt
 * @throws  {Error} bei API-Fehlern (mit .code, .status, .platform)
 */
export async function publishPiece({ platform, token, externalId, piece }) {
  // GATED-Grenze: ohne Token kein realer Call.
  if (!token) {
    const err = new Error('no_token');
    err.code = 'NO_TOKEN';
    throw err;
  }
  if (platform === 'facebook') return publishFacebook({ token, pageId: externalId, piece });
  if (platform === 'linkedin') return publishLinkedIn({ token, authorUrn: externalId, piece });

  const err = new Error(`unsupported_platform:${platform}`);
  err.code = 'UNSUPPORTED_PLATFORM';
  err.platform = platform;
  throw err;
}

// ──────────────────────────────────────────────────────────────────────────
// Facebook — POST /{page-id}/feed
// Doku: https://developers.facebook.com/docs/pages-api/posts
// Erwartet ein PAGE-Access-Token (nicht das User-Token). externalId = Page-ID.
// ──────────────────────────────────────────────────────────────────────────
async function publishFacebook({ token, pageId, piece }) {
  if (!pageId) {
    const err = new Error('missing_page_id');
    err.code = 'MISSING_EXTERNAL_ID';
    err.platform = 'facebook';
    throw err;
  }

  // Post-Text: Body bevorzugt; Titel als Fallback (FB hat kein Titel-Feld).
  const message = (piece?.body || piece?.title || '').trim();

  const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${encodeURIComponent(pageId)}/feed`;
  const params = new URLSearchParams();
  params.set('message', message);
  // Optional: Visual als Link-Vorschau (kein nackter Link im Text — Brand-Vorgabe).
  if (piece?.visual_url) params.set('link', piece.visual_url);
  params.set('access_token', token);

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const err = new Error(`facebook_publish_failed:${data?.error?.message || resp.status}`);
    err.code = 'PUBLISH_FAILED';
    err.platform = 'facebook';
    err.status = resp.status;
    throw err;
  }

  // FB liefert { id: '<page-id>_<post-id>' }
  return { ok: true, external_post_id: data.id, raw: data };
}

// ──────────────────────────────────────────────────────────────────────────
// LinkedIn — POST /v2/ugcPosts
// Doku: https://learn.microsoft.com/linkedin/marketing/community-management/shares/ugc-post-api
// Erwartet OAuth-Token mit w_member_social (Person) bzw. w_organization_social (Org).
// externalId = Author-URN, z.B. 'urn:li:person:xxxx' oder 'urn:li:organization:123'.
// ──────────────────────────────────────────────────────────────────────────
async function publishLinkedIn({ token, authorUrn, piece }) {
  if (!authorUrn) {
    const err = new Error('missing_author_urn');
    err.code = 'MISSING_EXTERNAL_ID';
    err.platform = 'linkedin';
    throw err;
  }

  const text = (piece?.body || piece?.title || '').trim();

  const payload = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };

  const resp = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify(payload)
  });
  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const err = new Error(`linkedin_publish_failed:${data?.message || resp.status}`);
    err.code = 'PUBLISH_FAILED';
    err.platform = 'linkedin';
    err.status = resp.status;
    throw err;
  }

  // LinkedIn liefert die Post-URN entweder im Header 'x-restli-id' oder data.id.
  const postId = resp.headers.get('x-restli-id') || data.id || null;
  return { ok: true, external_post_id: postId, raw: data };
}
