/* VagasPage.jsx — curated + Adzuna job listings */

const ADZUNA_ID  = '141de08a';
const ADZUNA_KEY = 'fa60364764187e6580cefc55800ef82e';
const OWNER_EMAIL = 'augustovilasb@hotmail.com';

const CATEGORIES = [
  { id: 'all',      label: 'Todas' },
  { id: 'dev',      label: 'Dev' },
  { id: 'devops',   label: 'DevOps' },
  { id: 'security', label: 'Segurança' },
  { id: 'support',  label: 'Suporte TI' },
  { id: 'data',     label: 'Dados' },
  { id: 'design',   label: 'Design' },
];

const LEVELS = [
  { id: 'all',    label: 'Qualquer nível' },
  { id: 'intern', label: 'Estágio' },
  { id: 'junior', label: 'Júnior' },
  { id: 'mid',    label: 'Pleno' },
  { id: 'senior', label: 'Sênior' },
];

const TYPES = [
  { id: 'all',        label: 'Qualquer tipo' },
  { id: 'remote',     label: 'Remoto' },
  { id: 'hybrid',     label: 'Híbrido' },
  { id: 'presential', label: 'Presencial' },
];

const ADZUNA_QUERIES = {
  all:      'desenvolvedor programador TI tecnologia',
  dev:      'desenvolvedor programador software engineer',
  devops:   'devops sre cloud infraestrutura',
  security: 'segurança cibersegurança cyber security',
  support:  'suporte TI help desk técnico',
  data:     'dados data science analista BI',
  design:   'UX UI design produto',
};

const LEVEL_LABELS = { intern: 'Estágio', junior: 'Júnior', mid: 'Pleno', senior: 'Sênior', any: 'Qualquer nível' };
const TYPE_LABELS  = { remote: 'Remoto', hybrid: 'Híbrido', presential: 'Presencial' };
const CAT_LABELS   = { dev: 'Dev', devops: 'DevOps', security: 'Segurança', support: 'Suporte TI', data: 'Dados', design: 'Design', other: 'Outros' };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'hoje';
  if (d === 1) return 'ontem';
  if (d < 7)  return `${d} dias atrás`;
  if (d < 30) return `${Math.floor(d/7)} sem atrás`;
  return `${Math.floor(d/30)} meses atrás`;
}

/* ── Job Card ── */
function JobCard({ job }) {
  const isCurated = job.source === 'manual';
  return (
    <div className="vaga-card">
      <div className="vaga-card-top">
        <div className="vaga-card-badges">
          {isCurated && <span className="vaga-badge vaga-badge--curated">D30 Curado</span>}
          {job.category && CAT_LABELS[job.category] && (
            <span className="vaga-badge vaga-badge--cat">{CAT_LABELS[job.category]}</span>
          )}
          {job.level && job.level !== 'any' && LEVEL_LABELS[job.level] && (
            <span className="vaga-badge vaga-badge--level">{LEVEL_LABELS[job.level]}</span>
          )}
          {job.location_type && TYPE_LABELS[job.location_type] && (
            <span className="vaga-badge vaga-badge--type">{TYPE_LABELS[job.location_type]}</span>
          )}
        </div>
        <span className="vaga-card-time">{timeAgo(job.created_at)}</span>
      </div>

      <h3 className="vaga-card-title">{job.title}</h3>
      {job.company && <p className="vaga-card-company">{job.company}</p>}
      {job.salary_range && <p className="vaga-card-salary">{job.salary_range}</p>}
      {job.description && <p className="vaga-card-desc">{job.description}</p>}

      <a
        className="vaga-card-btn"
        href={job.link}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="hover"
      >
        Ver vaga →
      </a>
    </div>
  );
}

/* ── Admin: Add Job Form ── */
function AdminJobForm({ onSaved, toast }) {
  const empty = { title: '', company: '', location_type: 'remote', category: 'dev', level: 'junior', salary_range: '', description: '', link: '' };
  const [form, setForm] = React.useState(empty);
  const [saving, setSaving] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim() || !form.link.trim()) { toast('error', 'Título e link são obrigatórios.'); return; }
    setSaving(true);
    try {
      const { error } = await window.sb.from('vagas').insert({ ...form, title: form.title.trim(), link: form.link.trim() });
      if (error) throw error;
      toast('success', 'Vaga adicionada!');
      setForm(empty);
      setOpen(false);
      onSaved();
    } catch (e) {
      toast('error', e.message || 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  if (!open) return (
    <button className="vagas-admin-toggle" data-cursor="hover" onClick={() => setOpen(true)}>
      + Adicionar vaga
    </button>
  );

  return (
    <div className="vagas-admin-form">
      <div className="vagas-admin-form-header">
        <span>Nova vaga</span>
        <button className="vagas-admin-close" data-cursor="hover" onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className="vagas-admin-grid">
        <div className="vagas-admin-field vagas-admin-field--full">
          <label>Título *</label>
          <input className="settings-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Desenvolvedor Java Júnior" />
        </div>
        <div className="vagas-admin-field">
          <label>Empresa</label>
          <input className="settings-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Nome da empresa" />
        </div>
        <div className="vagas-admin-field">
          <label>Salário</label>
          <input className="settings-input" value={form.salary_range} onChange={e => set('salary_range', e.target.value)} placeholder="Ex: R$ 3.000 – 5.000" />
        </div>
        <div className="vagas-admin-field">
          <label>Categoria</label>
          <select className="settings-input" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            <option value="other">Outros</option>
          </select>
        </div>
        <div className="vagas-admin-field">
          <label>Nível</label>
          <select className="settings-input" value={form.level} onChange={e => set('level', e.target.value)}>
            {LEVELS.filter(l => l.id !== 'all').map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            <option value="any">Qualquer</option>
          </select>
        </div>
        <div className="vagas-admin-field">
          <label>Tipo</label>
          <select className="settings-input" value={form.location_type} onChange={e => set('location_type', e.target.value)}>
            {TYPES.filter(t => t.id !== 'all').map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div className="vagas-admin-field vagas-admin-field--full">
          <label>Link da vaga *</label>
          <input className="settings-input" type="url" value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://linkedin.com/jobs/..." />
        </div>
        <div className="vagas-admin-field vagas-admin-field--full">
          <label>Descrição curta</label>
          <textarea className="settings-input settings-textarea" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Contexto sobre a vaga (opcional)" />
        </div>
      </div>
      <button className="settings-save-btn" data-cursor="hover" onClick={save} disabled={saving}>
        {saving ? 'Salvando…' : 'Publicar vaga'}
      </button>
    </div>
  );
}

/* ── Main Page ── */
function VagasPage({ user, toast }) {
  const isAdmin = user?.email === OWNER_EMAIL;

  const [catFilter,   setCatFilter]   = React.useState('all');
  const [levelFilter, setLevelFilter] = React.useState('all');
  const [typeFilter,  setTypeFilter]  = React.useState('all');

  const [manualJobs, setManualJobs] = React.useState([]);
  const [adzunaJobs, setAdzunaJobs] = React.useState([]);
  const [loadingManual, setLoadingManual] = React.useState(true);
  const [loadingAdzuna, setLoadingAdzuna] = React.useState(false);
  const [adzunaError,   setAdzunaError]   = React.useState(false);

  const fetchManual = React.useCallback(async () => {
    if (!window.sb) return;
    setLoadingManual(true);
    try {
      let q = window.sb.from('vagas').select('*').eq('active', true).order('created_at', { ascending: false });
      const { data } = await q;
      setManualJobs(data || []);
    } catch { setManualJobs([]); }
    finally { setLoadingManual(false); }
  }, []);

  const fetchAdzuna = React.useCallback(async (cat) => {
    setLoadingAdzuna(true);
    setAdzunaError(false);
    try {
      const res = await fetch(`/api/vagas?cat=${cat}`);
      if (!res.ok) throw new Error('gupy error');
      const json = await res.json();
      /* Gupy response: { data: [...] } */
      const list = json.data || json.results || [];
      const jobs = list.map(j => ({
        id:           j.id || j.jobCode || String(Math.random()),
        title:        j.name || j.title || '',
        company:      j.careerPageName || j.company?.name || '',
        description:  (j.description || '').replace(/<[^>]+>/g, '').slice(0, 160) + '…',
        link:         j.jobUrl || j.redirect_url || '#',
        created_at:   j.publishedDate || j.created || new Date().toISOString(),
        source:       'gupy',
        location_type: j.isRemoteWork ? 'remote' : (j.workplaceType === 'hybrid' ? 'hybrid' : null),
        category:     cat === 'all' ? null : cat,
        level:        null,
        salary_range: null,
      }));
      setAdzunaJobs(jobs);
    } catch {
      setAdzunaError(true);
      setAdzunaJobs([]);
    } finally { setLoadingAdzuna(false); }
  }, []);

  React.useEffect(() => { fetchManual(); }, [fetchManual]);
  React.useEffect(() => { fetchAdzuna(catFilter); }, [catFilter, fetchAdzuna]);

  const filteredManual = React.useMemo(() => {
    return manualJobs.filter(j => {
      if (catFilter   !== 'all' && j.category      !== catFilter)   return false;
      if (levelFilter !== 'all' && j.level         !== levelFilter) return false;
      if (typeFilter  !== 'all' && j.location_type !== typeFilter)  return false;
      return true;
    });
  }, [manualJobs, catFilter, levelFilter, typeFilter]);

  const filteredAdzuna = React.useMemo(() => {
    return adzunaJobs.filter(j => {
      if (levelFilter !== 'all' && j.level         !== levelFilter) return false;
      if (typeFilter  !== 'all' && j.location_type !== typeFilter)  return false;
      return true;
    });
  }, [adzunaJobs, levelFilter, typeFilter]);

  const allJobs = [...filteredManual, ...filteredAdzuna];
  const loading = loadingManual || loadingAdzuna;

  return (
    <div className="page active fade-in">
      <div className="vagas-wrap">

        <div className="vagas-header">
          <h1 className="vagas-title">Vagas</h1>
          <p className="vagas-sub">Filtradas pra quem está começando ou em transição. Link direto, sem enrolação.</p>
          {isAdmin && <AdminJobForm onSaved={fetchManual} toast={toast} />}
        </div>

        {/* Filtros */}
        <div className="vagas-filters">
          <div className="vagas-filter-row">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                className={'vagas-filter-chip' + (catFilter === c.id ? ' active' : '')}
                data-cursor="hover"
                onClick={() => setCatFilter(c.id)}
              >{c.label}</button>
            ))}
          </div>
          <div className="vagas-filter-row vagas-filter-row--secondary">
            <select className="vagas-filter-select" value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
              {LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <select className="vagas-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading && (
          <div className="vagas-loading">
            {[1,2,3,4,5,6].map(i => <div key={i} className="vaga-card vaga-card--skeleton" />)}
          </div>
        )}

        {!loading && allJobs.length === 0 && (
          <div className="vagas-empty">
            <p>Nenhuma vaga encontrada com esses filtros.</p>
          </div>
        )}

        {!loading && allJobs.length > 0 && (
          <div className="vagas-grid">
            {filteredManual.map(j => <JobCard key={j.id} job={j} />)}
            {!adzunaError && filteredAdzuna.map(j => <JobCard key={j.id} job={j} />)}
          </div>
        )}

        {adzunaError && (
          <p className="vagas-adzuna-err">Não foi possível carregar vagas automáticas agora. Tente novamente mais tarde.</p>
        )}

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { VagasPage });
