/* api/vagas.js — Vercel serverless proxy para Adzuna (evita CORS) */

const ADZUNA_ID  = '141de08a';
const ADZUNA_KEY = 'fa60364764187e6580cefc55800ef82e';

const QUERIES = {
  all:      'desenvolvedor programador TI tecnologia',
  dev:      'desenvolvedor programador software engineer',
  devops:   'devops sre cloud infraestrutura',
  security:  'segurança cibersegurança cyber security',
  support:  'suporte TI help desk técnico',
  data:     'dados data science analista BI',
  design:   'UX UI design produto',
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const cat   = req.query.cat || 'all';
  const query = encodeURIComponent(QUERIES[cat] || QUERIES.all);
  const url   = `https://api.adzuna.com/v1/api/jobs/br/search/1?app_id=${ADZUNA_ID}&app_key=${ADZUNA_KEY}&results_per_page=12&what=${query}&content-type=application/json`;

  try {
    const upstream = await fetch(url);
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
