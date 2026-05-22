/* api/delete-user.js — exclui auth.users via service role (GDPR Art. 17) */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://d30.com.br');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL        = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY   = process.env.SUPABASE_ANON_KEY;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  /* 1. Verifica o JWT do usuário */
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ error: 'Missing authorization token' });

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
  }).catch(() => null);

  if (!userRes || !userRes.ok) return res.status(401).json({ error: 'Invalid or expired token' });

  const userData = await userRes.json().catch(() => null);
  const userId = userData?.id;
  if (!userId) return res.status(401).json({ error: 'Cannot resolve user id' });

  /* 2. Exclui o usuário via Admin API (service role) */
  const delRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
    },
  }).catch(() => null);

  if (!delRes || !delRes.ok) {
    const body = delRes ? await delRes.text().catch(() => '') : 'fetch failed';
    console.error('[delete-user] admin delete failed:', body);
    return res.status(500).json({ error: 'Failed to delete auth record' });
  }

  return res.status(200).json({ success: true, deleted_id: userId });
};
