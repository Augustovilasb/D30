/* api/vagas.js — agrega RemoteOK + Remotive + Jobicy em paralelo */

const H = { 'User-Agent': 'D30Community/1.0', 'Accept': 'application/json' };

const REMOTEOK_TAGS = {
  all:      'dev,javascript,java,python,backend,frontend,fullstack,devops,data,security',
  dev:      'dev,javascript,java,python,backend,frontend,fullstack,react,nodejs,java',
  devops:   'devops,cloud,aws,kubernetes,docker,infrastructure,sre',
  security: 'security,cybersecurity,infosec',
  support:  'support,technical-support',
  data:     'data,machine-learning,python,analytics,data-science',
  design:   'design,ux,ui',
};

const REMOTIVE_CAT = {
  all:      'software-dev',
  dev:      'software-dev',
  devops:   'devops-sysadmin',
  security: 'software-dev',
  support:  'customer-support',
  data:     'data',
  design:   'design',
};

const JOBICY_TAG = {
  all:      'developer',
  dev:      'developer',
  devops:   'devops',
  security: 'security',
  support:  'support',
  data:     'data',
  design:   'design',
};

async function fetchRemoteOK(cat) {
  try {
    const tags = REMOTEOK_TAGS[cat] || REMOTEOK_TAGS.all;
    const r = await fetch(`https://remoteok.com/api?tags=${tags}`, { headers: H });
    if (!r.ok) return [];
    const raw = await r.json();
    return (Array.isArray(raw) ? raw.filter(j => j.id && j.position) : [])
      .slice(0, 25)
      .map(j => ({
        id:                   'rok-' + j.id,
        title:                j.position,
        company:              j.company || '',
        company_location:     j.company_headquarters || null,
        location_restriction: j.location && j.location !== '' ? j.location : null,
        location_type:        'remote',
        is_remote:            true,
        tags:                 Array.isArray(j.tags) ? j.tags.slice(0, 6) : [],
        salary:               (j.salary_min && j.salary_max) ? `$${Math.round(j.salary_min/1000)}k–$${Math.round(j.salary_max/1000)}k` : null,
        link:                 j.url || `https://remoteok.com/remote-jobs/${j.slug}`,
        date:                 j.date || new Date().toISOString(),
        source:               'RemoteOK',
      }));
  } catch { return []; }
}

async function fetchRemotive(cat) {
  try {
    const category = REMOTIVE_CAT[cat] || 'software-dev';
    const r = await fetch(`https://remotive.com/api/remote-jobs?category=${category}&limit=25`, { headers: H });
    if (!r.ok) return [];
    const raw = await r.json();
    return (raw.jobs || []).slice(0, 25).map(j => ({
      id:                   'rem-' + j.id,
      title:                j.title,
      company:              j.company_name || '',
      company_location:     null,
      location_restriction: j.candidate_required_location && j.candidate_required_location !== 'Worldwide' ? j.candidate_required_location : null,
      location_type:        'remote',
      is_remote:            true,
      tags:                 (j.tags || '').split(',').map(t => t.trim()).filter(Boolean).slice(0, 6),
      salary:               j.salary || null,
      link:                 j.url,
      date:                 j.publication_date || new Date().toISOString(),
      source:               'Remotive',
    }));
  } catch { return []; }
}

async function fetchJobicy(cat) {
  try {
    const tag = JOBICY_TAG[cat] || 'developer';
    const r = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=25&tag=${tag}`, { headers: H });
    if (!r.ok) return [];
    const raw = await r.json();
    return (raw.jobs || []).slice(0, 25).map(j => ({
      id:                   'jcy-' + j.id,
      title:                j.jobTitle,
      company:              j.companyName || '',
      company_location:     j.jobLocation || null,
      location_restriction: j.jobGeo && j.jobGeo !== 'Worldwide' ? j.jobGeo : null,
      location_type:        'remote',
      is_remote:            true,
      tags:                 Array.isArray(j.jobIndustry) ? j.jobIndustry.slice(0, 6) : [],
      salary:               j.annualSalaryMin ? `$${Math.round(j.annualSalaryMin/1000)}k–$${Math.round(j.annualSalaryMax/1000)}k` : null,
      link:                 j.url,
      date:                 j.pubDate || new Date().toISOString(),
      source:               'Jobicy',
    }));
  } catch { return []; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const cat = req.query.cat || 'all';

  const [rok, rem, jcy] = await Promise.all([
    fetchRemoteOK(cat),
    fetchRemotive(cat),
    fetchJobicy(cat),
  ]);

  /* Intercala as fontes pra não ficar tudo de um mesmo site */
  const merged = [];
  const max = Math.max(rok.length, rem.length, jcy.length);
  for (let i = 0; i < max; i++) {
    if (rok[i]) merged.push(rok[i]);
    if (rem[i]) merged.push(rem[i]);
    if (jcy[i]) merged.push(jcy[i]);
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({ results: merged });
};
