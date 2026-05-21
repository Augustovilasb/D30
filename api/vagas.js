/* api/vagas.js — Vercel serverless proxy para Gupy (evita CORS) */

const QUERIES = {
  all:      'desenvolvedor programador TI tecnologia suporte',
  dev:      'desenvolvedor programador software engineer',
  devops:   'devops cloud infraestrutura sre',
  security: 'segurança cyber security cibersegurança',
  support:  'suporte TI help desk técnico',
  data:     'dados data science analista BI',
  design:   'UX UI design produto',
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const cat   = req.query.cat || 'all';
  const query = encodeURIComponent(QUERIES[cat] || QUERIES.all);
  const url   = `https://portal.api.gupy.io/api/v1/jobs?name=${query}&limit=20&offset=0`;

  try {
    const upstream = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'D30Community/1.0' }
    });
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'upstream error', status: upstream.status });
    }
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
