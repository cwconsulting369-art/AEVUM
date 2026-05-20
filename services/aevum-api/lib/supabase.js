// Minimal Supabase REST client (avoids supabase-js schema cache issues)
// IMPORTANT: read process.env lazily — ES module imports hoist before dotenv loads

function getCreds() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
  }
  return { url, key };
}

async function rpc(method, path, body) {
  const { url, key } = getCreds();
  const fullUrl = `${url}/rest/v1${path}`;
  const res = await fetch(fullUrl, {
    method,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) {
    console.error(`[supabase] ${method} ${fullUrl} → ${res.status}: ${text.slice(0,200)}`);
    return { ok: false, status: res.status, error: data };
  }
  return { ok: true, status: res.status, data };
}

function normaliseQuery(query = '') {
  if (!query) return '';
  return query.startsWith('?') ? query : '?' + query;
}

export const supabase = {
  insert: (table, row) => rpc('POST', `/${table}`, row),
  select: (table, query = '') => rpc('GET', `/${table}${normaliseQuery(query)}`),
  update: (table, query, patch) => rpc('PATCH', `/${table}${normaliseQuery(query)}`, patch),
  delete: (table, query) => rpc('DELETE', `/${table}${normaliseQuery(query)}`)
};
