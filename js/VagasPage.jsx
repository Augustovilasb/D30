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

/* ── Card Internacional ── */
function IntlJobCard({ job }) {
  const sourceLabel = { RemoteOK: 'RemoteOK', Remotive: 'Remotive', Jobicy: 'Jobicy' }[job.source];
  const salary      = job.salary || job.salary_range;
  const restriction = job.location_restriction;

  return (
    <div className="vaga-card">
      <div className="vaga-card-top">
        <div className="vaga-card-badges">
          {sourceLabel && <span className="vaga-badge vaga-badge--source">{sourceLabel}</span>}
        </div>
        <span className="vaga-card-time">{timeAgo(job.date)}</span>
      </div>

      <h3 className="vaga-card-title">{job.title}</h3>
      {job.company && <p className="vaga-card-company">{job.company}</p>}

      <div className="vaga-card-pillars">
        <div className="vaga-pillar vaga-pillar--green">🌐 Remoto</div>
        <div className="vaga-pillar vaga-pillar--blue">🇺🇸 Inglês</div>
        <div className={'vaga-pillar' + (salary ? ' vaga-pillar--salary' : '')}>
          {salary || '— salário'}
        </div>
      </div>

      {restriction && (
        <p className="vaga-card-restriction">⚠️ Requer: {restriction}</p>
      )}

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

/* ── Card Nacional ── */
function NatlJobCard({ job }) {
  const salary  = job.salary_range;
  const isRemote = job.location_type === 'remote';
  const isHybrid = job.location_type === 'hybrid';

  return (
    <div className="vaga-card vaga-card--national">
      <div className="vaga-card-top">
        <div className="vaga-card-badges">
          <span className="vaga-badge vaga-badge--curated">D30 Curado</span>
          {job.level && job.level !== 'any' && LEVEL_LABELS[job.level] && (
            <span className="vaga-badge vaga-badge--level">{LEVEL_LABELS[job.level]}</span>
          )}
        </div>
        <span className="vaga-card-time">{timeAgo(job.created_at)}</span>
      </div>

      <h3 className="vaga-card-title">{job.title}</h3>
      {job.company && <p className="vaga-card-company">{job.company}</p>}

      <div className="vaga-card-pillars">
        <div className={'vaga-pillar' + (isRemote ? ' vaga-pillar--green' : isHybrid ? ' vaga-pillar--yellow' : ' vaga-pillar--muted')}>
          {isRemote ? '🌐 Remoto' : isHybrid ? '🔀 Híbrido' : '🏢 Presencial'}
        </div>
        <div className="vaga-pillar vaga-pillar--green">🇧🇷 Português</div>
        <div className={'vaga-pillar' + (salary ? ' vaga-pillar--salary' : '')}>
          {salary || '— salário'}
        </div>
      </div>

      {job.description && <p className="vaga-card-desc">{job.description}</p>}

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

  const [tab,          setTab]          = React.useState('intl'); // intl | natl
  const [manualJobs,   setManualJobs]   = React.useState([]);
  const [externalJobs, setExternalJobs] = React.useState([]);
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
          <button
            className={'vagas-tab' + (tab === 'intl' ? ' active' : '')}
            data-cursor="hover"
            onClick={() => setTab('intl')}
          >
            🌐 Internacionais
            {!loadingExt && <span className="vagas-tab-count">{externalJobs.length}</span>}
          </button>
          <button
            className={'vagas-tab' + (tab === 'natl' ? ' active' : '')}
            data-cursor="hover"
            onClick={() => setTab('natl')}
          >
            🇧🇷 Nacionais
            {!loadingManual && <span className="vagas-tab-count">{manualJobs.length}</span>}
          </button>
        </div>

        {/* Conteúdo */}
        {loading && (
          <div className="vagas-loading">
            {[1,2,3,4,5,6].map(i => <div key={i} className="vaga-card vaga-card--skeleton" />)}
          </div>
        )}

        {/* Internacionais */}
        {!loading && tab === 'intl' && (
          externalJobs.length === 0
            ? <div className="vagas-empty"><p>Nenhuma vaga encontrada.</p></div>
            : <div className="vagas-grid">{externalJobs.map(j => <IntlJobCard key={j.id} job={j} />)}</div>
        )}

        {/* Nacionais */}
        {!loading && tab === 'natl' && (
          manualJobs.length === 0
            ? (
              <div className="vagas-empty">
                <p>Nenhuma vaga nacional cadastrada ainda.</p>
                {!isAdmin && <p style={{ fontSize: 13, marginTop: 6 }}>Volte em breve — o Augusto está garimpando as melhores.</p>}
              </div>
            )
            : <div className="vagas-grid">{manualJobs.map(j => <NatlJobCard key={j.id} job={j} />)}</div>
        )}

        {extError && tab === 'intl' && (
          <p className="vagas-adzuna-err">Não foi possível carregar vagas automáticas agora.</p>
        )}

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { VagasPage });
