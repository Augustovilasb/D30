/* api/vagas.js — Vercel serverless proxy para RemoteOK (vagas remotas globais) */

const TAGS = {
  all:      'dev,javascript,java,python,backend,frontend,fullstack,devops,data',
  dev:      'dev,javascript,java,python,backend,frontend,fullstack,react,nodejs',
  devops:   'devops,cloud,aws,kubernetes,docker,infrastructure,sre',
  security: 'security,cybersecurity,infosec',
  support:  'support,technical-support',
  data:     'data,machine-learning,python,analytics,data-science,bi',
  design:   'design,ux,ui,product-design',
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const cat  = req.query.cat || 'all';
  const tags = TAGS[cat] || TAGS.all;
  const url  = `https://remoteok.com/api?tags=${tags}`;

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'D30Community/1.0', 'Accept': 'application/json' }
    });
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'upstream error', status: upstream.status });
    }
    const data = await upstream.json();
    /* RemoteOK retorna [{legal notice...}, {job}, {job}...] — primeiro item é aviso legal */
    const jobs = Array.isArray(data) ? data.filter(j => j.id && j.position) : [];
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ results: jobs.slice(0, 20) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
