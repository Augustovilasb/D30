/* VagasPage.jsx — remote global jobs + manual curation */

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

const CAT_LABELS = { dev: 'Dev', devops: 'DevOps', security: 'Segurança', support: 'Suporte TI', data: 'Dados', design: 'Design', other: 'Outros' };
const LEVEL_LABELS = { intern: 'Estágio', junior: 'Júnior', mid: 'Pleno', senior: 'Sênior', any: 'Qualquer' };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'hoje';
  if (d === 1) return 'ontem';
  if (d < 7)   return `${d}d atrás`;
  if (d < 30)  return `${Math.floor(d/7)}sem atrás`;
  return `${Math.floor(d/30)}m atrás`;
}

/* ── Job Card ── */
function JobCard({ job }) {
  const isCurated   = job.source === 'manual';
  const sourceLabel = { RemoteOK: 'RemoteOK', Remotive: 'Remotive', Jobicy: 'Jobicy' }[job.source];
  const isRemote    = job.location_type === 'remote' || job.is_remote !== false;
  const needsEn     = job.requires_english !== false; // externas = true por padrão
  const salary      = job.salary || job.salary_range;
  const restriction = job.location_restriction;

  return (
    <div className="vaga-card">
      {/* Topo: fonte + data */}
      <div className="vaga-card-top">
        <div className="vaga-card-badges">
          {isCurated   && <span className="vaga-badge vaga-badge--curated">D30 Curado</span>}
          {sourceLabel && <span className="vaga-badge vaga-badge--source">{sourceLabel}</span>}
          {job.level && job.level !== 'any' && LEVEL_LABELS[job.level] && (
            <span className="vaga-badge vaga-badge--level">{LEVEL_LABELS[job.level]}</span>
          )}
        </div>
        <span className="vaga-card-time">{timeAgo(job.created_at || job.date)}</span>
      </div>

      {/* Título + empresa */}
      <h3 className="vaga-card-title">{job.title}</h3>
      {job.company && <p className="vaga-card-company">{job.company}</p>}

      {/* 3 campos fixos: tipo · idioma · salário */}
      <div className="vaga-card-pillars">
        <div className={'vaga-pillar' + (isRemote ? ' vaga-pillar--green' : ' vaga-pillar--yellow')}>
          {isRemote ? '🌐 Remoto' : '🏢 Presencial'}
        </div>
        <div className={'vaga-pillar' + (needsEn ? ' vaga-pillar--blue' : ' vaga-pillar--green')}>
          {needsEn ? '🇺🇸 Inglês' : '🇧🇷 Português'}
        </div>
        <div className={'vaga-pillar' + (salary ? ' vaga-pillar--salary' : '')}>
          {salary || '— salário'}
        </div>
      </div>

      {/* Restrição geográfica */}
      {restriction && (
        <p className="vaga-card-restriction">⚠️ Requer: {restriction}</p>
      )}

      {/* Stack tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="vaga-card-tags">
          {job.tags.slice(0, 6).map((t, i) => <span key={i} className="vaga-tag">{t}</span>)}
        </div>
      )}

      <a className="vaga-card-btn" href={job.link} target="_blank" rel="noopener noreferrer" data-cursor="hover">
        Ver vaga →
      </a>
    </div>
  );
}

/* ── Admin Form ── */
function AdminJobForm({ onSaved, toast }) {
  const empty = {
    title: '', company: '', location_type: 'remote', category: 'dev',
    level: 'junior', salary_range: '', description: '', link: '',
    requires_english: true,
  };
  const [form, setForm] = React.useState(empty);
  const [saving, setSaving] = React.useState(false);
  const [open,   setOpen]   = React.useState(false);
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
    <button className="vagas-admin-toggle" data-cursor="hover" onClick={() => setOpen(true)}>+ Adicionar vaga</button>
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
          <input className="settings-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Dev Java Júnior" />
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
            <option value="intern">Estágio</option>
            <option value="junior">Júnior</option>
            <option value="mid">Pleno</option>
            <option value="senior">Sênior</option>
            <option value="any">Qualquer</option>
          </select>
        </div>
        <div className="vagas-admin-field">
          <label>Tipo</label>
          <select className="settings-input" value={form.location_type} onChange={e => set('location_type', e.target.value)}>
            <option value="remote">Remoto</option>
            <option value="hybrid">Híbrido</option>
            <option value="presential">Presencial</option>
          </select>
        </div>
        <div className="vagas-admin-field">
          <label>Idioma exigido</label>
          <select className="settings-input" value={form.requires_english} onChange={e => set('requires_english', e.target.value === 'true')}>
            <option value="true">Inglês</option>
            <option value="false">Português</option>
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

  const [catFilter,  setCatFilter]  = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all'); // all | remote | presential
  const [langFilter, setLangFilter] = React.useState('all'); // all | english | portuguese

  const [manualJobs,    setManualJobs]    = React.useState([]);
  const [externalJobs,  setExternalJobs]  = React.useState([]);
  const [loadingManual, setLoadingManual] = React.useState(true);
  const [loadingExt,    setLoadingExt]    = React.useState(false);
  const [extError,      setExtError]      = React.useState(false);

  const fetchManual = React.useCallback(async () => {
    if (!window.sb) return;
    setLoadingManual(true);
    try {
      const { data } = await window.sb.from('vagas').select('*').eq('active', true).order('created_at', { ascending: false });
      setManualJobs(data || []);
    } catch { setManualJobs([]); }
    finally { setLoadingManual(false); }
  }, []);

  const fetchExternal = React.useCallback(async (cat) => {
    setLoadingExt(true);
    setExtError(false);
    try {
      const res  = await fetch(`/api/vagas?cat=${cat}`);
      if (!res.ok) throw new Error('error');
      const json = await res.json();
      const jobs = (json.results || []).map(j => ({ ...j, category: cat === 'all' ? null : cat }));
      setExternalJobs(jobs);
    } catch {
      setExtError(true);
      setExternalJobs([]);
    } finally { setLoadingExt(false); }
  }, []);

  React.useEffect(() => { fetchManual(); },            [fetchManual]);
  React.useEffect(() => { fetchExternal(catFilter); }, [catFilter, fetchExternal]);

  const filtered = React.useMemo(() => {
    const all = [
      ...manualJobs.filter(j => catFilter === 'all' || j.category === catFilter),
      ...externalJobs,
    ];
    return all.filter(j => {
      /* tipo: manual jobs têm location_type, externas são sempre remote */
      const jType = j.location_type || 'remote';
      if (typeFilter === 'remote'     && jType !== 'remote')     return false;
      if (typeFilter === 'presential' && jType !== 'presential') return false;

      /* idioma: externas = inglês por padrão, manuais conforme campo */
      const jLang = j.requires_english === false ? 'portuguese' : 'english';
      if (langFilter === 'english'    && jLang !== 'english')    return false;
      if (langFilter === 'portuguese' && jLang !== 'portuguese') return false;

      return true;
    });
  }, [manualJobs, externalJobs, catFilter, typeFilter, langFilter]);

  const loading = loadingManual || loadingExt;

  return (
    <div className="page active fade-in">
      <div className="vagas-wrap">

        <div className="vagas-header">
          <h1 className="vagas-title">Vagas</h1>
          <p className="vagas-sub">Remotas do mundo todo + curadas pela D30. Link direto, sem enrolação.</p>
          {isAdmin && <AdminJobForm onSaved={fetchManual} toast={toast} />}
        </div>

        {/* Filtros */}
        <div className="vagas-filters">
          {/* Categoria */}
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

          {/* Tipo + Idioma */}
          <div className="vagas-filter-row">
            <div className="vagas-filter-group">
              {[
                { id: 'all',        label: 'Remoto + Presencial' },
                { id: 'remote',     label: '🌐 Só Remoto' },
                { id: 'presential', label: '🏢 Só Presencial' },
              ].map(o => (
                <button
                  key={o.id}
                  className={'vagas-filter-chip' + (typeFilter === o.id ? ' active' : '')}
                  data-cursor="hover"
                  onClick={() => setTypeFilter(o.id)}
                >{o.label}</button>
              ))}
            </div>
            <div className="vagas-filter-group">
              {[
                { id: 'all',        label: 'Qualquer idioma' },
                { id: 'english',    label: '🇺🇸 Inglês' },
                { id: 'portuguese', label: '🇧🇷 Português' },
              ].map(o => (
                <button
                  key={o.id}
                  className={'vagas-filter-chip' + (langFilter === o.id ? ' active' : '')}
                  data-cursor="hover"
                  onClick={() => setLangFilter(o.id)}
                >{o.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading && (
          <div className="vagas-loading">
            {[1,2,3,4,5,6].map(i => <div key={i} className="vaga-card vaga-card--skeleton" />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="vagas-empty">
            <p>Nenhuma vaga encontrada com esses filtros.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="vagas-grid">
            {filtered.map(j => <JobCard key={j.id} job={j} />)}
          </div>
        )}

        {extError && (
          <p className="vagas-adzuna-err">Não foi possível carregar vagas automáticas agora.</p>
        )}

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { VagasPage });
