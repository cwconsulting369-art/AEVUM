export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.AIRTABLE_TOKEN;
  const base  = process.env.AIRTABLE_BASE;

  if (!token || !base) {
    return res.status(503).json({ error: 'Dashboard not configured' });
  }

  const hours = parseInt(req.query.hours) || 6;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const url = `https://api.airtable.com/v0/${base}/Leads?` +
    `filterByFormula=IS_AFTER({Timestamp},'${since}')` +
    `&fields[]=Status&fields[]=Revenue&fields[]=Creative+ID&fields[]=Timestamp&fields[]=Name`;

  try {
    const airtableRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!airtableRes.ok) {
      return res.status(airtableRes.status).json({ error: 'Airtable error' });
    }

    const data = await airtableRes.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Internal error' });
  }
}
