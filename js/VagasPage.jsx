/* VagasPage.jsx — Vagas Internacionais + Nacionais */

const OWNER_EMAIL = 'augustovilasb@hotmail.com';
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

const PlaneIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}>
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
  </svg>
);

/* ── Row Internacional ── */
function IntlJobRow({ job }) {
  const salary = job.salary || job.salary_range;

  return (
    <div className="vagas-row">
      <div style={{display:'flex',alignItems:'center'}}>
        <span className="vagas-pill vagas-pill--intl"><PlaneIcon /> Remoto</span>
        {job.location_restriction && (
          <span className="vagas-row-warn" title={'Requer: ' + job.location_restriction}>!</span>
        )}
      </div>
      <div className="vagas-row-empresa">{job.company || <span className="vagas-muted">-</span>}</div>
      <div className="vagas-row-posicao">
        <span className="vagas-row-title">{job.title}</span>
        <span className="vagas-row-sub">{job.source}</span>
      </div>
      <div className="vagas-row-salario">
        {salary ? <span className="vagas-salary-val">{salary}</span> : <span className="vagas-muted">-</span>}
      </div>
      <div className="vagas-row-data">{timeAgo(job.date)}</div>
      <div>
        <a className="vagas-row-btn" href={job.link} target="_blank" rel="noopener noreferrer" data-cursor="hover">Ver →</a>
      </div>
    </div>
  );
}

/* ── Row Nacional ── */
function NatlJobRow({ job }) {
  const salary    = job.salary_range;
  const isRemote  = job.location_type === 'remote';
  const isHybrid  = job.location_type === 'hybrid';
  const pillClass = isRemote ? 'vagas-pill--remote' : isHybrid ? 'vagas-pill--hybrid' : 'vagas-pill--presential';
  const pillLabel = isRemote ? 'Remoto' : isHybrid ? 'Híbrido' : 'Presencial';
  const level     = job.level && job.level !== 'any' ? LEVEL_LABELS[job.level] : null;

  return (
    <div className="vagas-row">
      <div>
        <span className={'vagas-pill ' + pillClass}>{pillLabel}</span>
      </div>
      <div className="vagas-row-empresa">{job.company || <span className="vagas-muted">-</span>}</div>
      <div className="vagas-row-posicao">
        <span className="vagas-row-title">{job.title}</span>
        {level && <span className="vagas-row-sub">{level}</span>}
      </div>
      <div className="vagas-row-salario">
        {salary ? <span className="vagas-salary-val">{salary}</span> : <span className="vagas-muted">-</span>}
      </div>
      <div className="vagas-row-data">{timeAgo(job.created_at)}</div>
      <div>
        <a className="vagas-row-btn" href={job.link} target="_blank" rel="noopener noreferrer" data-cursor="hover">Ver →</a>
      </div>
    </div>
  );
}

/* ── Admin Form ── */
function AdminJobForm({ onSaved, toast }) {
  const empty = {
    title: '', company: '', location_type: 'remote', category: 'dev',
    level: 'junior', salary_range: '', description: '', link: '',
  };
  const [form,   setForm]   = React.useState(empty);
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
    <button className="vagas-admin-toggle" data-cursor="hover" onClick={() => setOpen(true)}>+ Adicionar vaga nacional</button>
  );

  return (
    <div className="vagas-admin-form">
      <div className="vagas-admin-form-header">
        <span>Nova vaga nacional</span>
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
        <div className="vagas-admin-field vagas-admin-field--full">
          <label>Link da vaga *</label>
          <input className="settings-input" type="url" value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://linkedin.com/jobs/..." />
        </div>
        <div className="vagas-admin-field vagas-admin-field--full">
          <label>Contexto</label>
          <textarea className="settings-input settings-textarea" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Aceita transição? Remoto real? Qualquer contexto útil..." />
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

  const [tab,           setTab]          = React.useState('intl');
  const [manualJobs,    setManualJobs]   = React.useState([]);
  const [externalJobs,  setExternalJobs] = React.useState([]);
  const [loadingManual, setLoadingManual] = React.useState(true);
  const [loadingExt,    setLoadingExt]   = React.useState(false);
  const [extError,      setExtError]     = React.useState(false);

  const fetchManual = React.useCallback(async () => {
    if (!window.sb) return;
    setLoadingManual(true);
    try {
      const { data } = await window.sb.from('vagas').select('*').eq('active', true).order('created_at', { ascending: false });
      setManualJobs(data || []);
    } catch { setManualJobs([]); }
    finally { setLoadingManual(false); }
  }, []);

  const fetchExternal = React.useCallback(async () => {
    setLoadingExt(true);
    setExtError(false);
    try {
      const res  = await fetch('/api/vagas?cat=all');
      if (!res.ok) throw new Error('error');
      const json = await res.json();
      setExternalJobs(json.results || []);
    } catch {
      setExtError(true);
      setExternalJobs([]);
    } finally { setLoadingExt(false); }
  }, []);

  React.useEffect(() => { fetchManual();   }, [fetchManual]);
  React.useEffect(() => { fetchExternal(); }, [fetchExternal]);

  const loading = tab === 'intl' ? loadingExt : loadingManual;
  const jobs    = tab === 'intl' ? externalJobs : manualJobs;

  const skeletons = [1,2,3,4,5,6,7,8];

  return (
    <div className="page active fade-in">
      <div className="vagas-wrap">

        <div className="vagas-header">
          <h1 className="vagas-title">Vagas</h1>
          <p className="vagas-sub">Remotas do mundo todo e curadas pela D30 para o mercado brasileiro.</p>
          {isAdmin && tab === 'natl' && <AdminJobForm onSaved={fetchManual} toast={toast} />}
        </div>

        {/* Abas */}
        <div className="vagas-tabs">
          <button className={'vagas-tab' + (tab === 'intl' ? ' active' : '')} data-cursor="hover" onClick={() => setTab('intl')}>
            <PlaneIcon /> Internacionais
            {!loadingExt && <span className="vagas-tab-count">{externalJobs.length}</span>}
          </button>
          <button className={'vagas-tab' + (tab === 'natl' ? ' active' : '')} data-cursor="hover" onClick={() => setTab('natl')}>
            🇧🇷 Nacionais
            {!loadingManual && <span className="vagas-tab-count">{manualJobs.length}</span>}
          </button>
        </div>

        {/* Lista */}
        <div className="vagas-list">
          {/* Header */}
          <div className="vagas-list-head">
            <span>Tipo</span>
            <span>Empresa</span>
            <span>Posição</span>
            <span>Salário</span>
            <span>Data</span>
            <span></span>
          </div>

          {/* Skeleton */}
          {loading && skeletons.map(i => <div key={i} className="vagas-row--skeleton" />)}

          {/* Rows */}
          {!loading && jobs.length === 0 && (
            <div className="vagas-empty">
              {tab === 'intl'
                ? <p>Nenhuma vaga encontrada.</p>
                : (
                  <React.Fragment>
                    <p>Nenhuma vaga nacional cadastrada ainda.</p>
                    {!isAdmin && <p style={{fontSize:13,marginTop:6}}>Volte em breve, o Augusto está garimpando as melhores.</p>}
                  </React.Fragment>
                )
              }
            </div>
          )}

          {!loading && tab === 'intl' && jobs.map(j => <IntlJobRow key={j.id} job={j} />)}
          {!loading && tab === 'natl' && jobs.map(j => <NatlJobRow key={j.id} job={j} />)}
        </div>

        {extError && tab === 'intl' && (
          <p className="vagas-adzuna-err">Não foi possível carregar vagas automáticas agora.</p>
        )}

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { VagasPage });
