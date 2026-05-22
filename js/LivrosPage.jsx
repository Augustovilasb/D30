/* LivrosPage.jsx — Livros gratuitos + Recomendados */

const OWNER_EMAIL = 'augustovilasb@hotmail.com';

const JOB_BUCKETS = [
  { id: 'frontend', label: 'Frontend'    },
  { id: 'backend',  label: 'Backend'     },
  { id: 'mobile',   label: 'Mobile'      },
  { id: 'devops',   label: 'DevOps'      },
  { id: 'data',     label: 'Data & IA'   },
  { id: 'security', label: 'Segurança'   },
  { id: 'cs',       label: 'Fundamentos' },
];

const EXACT = { 'c':'backend', 'r':'data', 'go':'backend', 'lua':'backend' };

const BUCKET_KW = [
  { id: 'frontend', kw: ['javascript','typescript','html','css','react','vue','angular','svelte','next.js','jquery','sass','less','web dev','frontend','front-end','bootstrap'] },
  { id: 'backend',  kw: ['java','python','rust','c++','c#','ruby','php','elixir','scala','kotlin','.net','node','spring','django','laravel','flask','express','fastapi','sql','database','banco de dados','mysql','postgresql','mongodb','nosql','redis','graphql','api','rest','grpc','microservice'] },
  { id: 'mobile',   kw: ['android','swift','dart','flutter','ios','mobile','react native','kotlin multiplatform'] },
  { id: 'devops',   kw: ['git','docker','kubernetes','linux','bash','shell','zsh','devops','cloud','nuvem','network','redes','operating system','sistema operacional','ansible','terraform','arduino','infraestrutura','infrastructure','ci/cd','nginx','apache','prometheus','grafana','monitoring'] },
  { id: 'data',     kw: ['data science','machine learning','deep learning','artificial intelligence','inteligência artificial','ciência de dados','analytics','tensorflow','pytorch','pandas','numpy','spark','bigdata','big data','estatística','statistics'] },
  { id: 'security', kw: ['security','cybersecurity','segurança','criptografia','pentest','hacking','owasp','infosec'] },
  { id: 'cs',       kw: ['algorithm','algoritmo','estrutura de dado','data structure','computer science','ciência da computação','software engineering','engenharia de software','mathematics','matemática','cálculo','programação','programming','design pattern','padrão de projeto','metodologia','markdown','latex','web performance','clean code','refactoring','fundamento'] },
];

function getBucket(cat) {
  const c = (cat || '').toLowerCase().trim();
  if (EXACT[c]) return EXACT[c];
  for (const { id, kw } of BUCKET_KW) {
    if (kw.some(k => c.includes(k))) return id;
  }
  return null;
}

const BUCKET_COLORS = {
  frontend:'#1a4a7a', backend:'#2d5a27', mobile:'#5a2d7a',
  devops:'#7a4a1a',   data:'#1a5a5a',    security:'#7a1a1a',
  cs:'#3a3a5a',       default:'#2a2a3a',
};

function placeholderBg(cat) {
  return BUCKET_COLORS[getBucket(cat)] || BUCKET_COLORS[cat] || BUCKET_COLORS.default;
}

/* ── Capa lazy (Google Books + Open Library) ── */
function fetchCover(title) {
  const q = encodeURIComponent(title);
  const gb = fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=items/volumeInfo/imageLinks`)
    .then(r => r.json())
    .then(d => { const t = d?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail?.replace('http:','https:'); if (!t) throw 0; return t; });
  const ol = fetch(`https://openlibrary.org/search.json?title=${q}&limit=1&fields=cover_i`)
    .then(r => r.json())
    .then(d => { const id = d?.docs?.[0]?.cover_i; if (!id) throw 0; return `https://covers.openlibrary.org/b/id/${id}-M.jpg`; });
  return Promise.any([gb, ol]).catch(() => null);
}

function BookCover({ title, category, staticSrc }) {
  const [src, setSrc] = React.useState(staticSrc || null);
  const ref     = React.useRef(null);
  const fetched = React.useRef(!!staticSrc);

  React.useEffect(() => {
    if (!ref.current || fetched.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || fetched.current) return;
      fetched.current = true;
      obs.disconnect();
      fetchCover(title).then(url => { if (url) setSrc(url); });
    }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [title]);

  return (
    <div ref={ref} className="livro-cover">
      {src
        ? <img src={src} alt={title} className="livro-cover-img" onError={() => setSrc(null)} />
        : <div className="livro-cover-ph" style={{ background: placeholderBg(category) }}><span className="livro-cover-ph-text">{title}</span></div>
      }
    </div>
  );
}

/* ── Livros lidos (localStorage — escopado por userId) ── */
function useLivrosLidos(userId) {
  const KEY = userId ? `d30_livros_lidos_v2_${userId}` : 'd30_livros_lidos_v2';
  const [books, setBooks] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  });
  const ids = React.useMemo(() => new Set(books.map(b => b.id)), [books]);
  const toggle = (id, info) => setBooks(prev => {
    const next = prev.some(b => b.id === id)
      ? prev.filter(b => b.id !== id)
      : [...prev, { id, title: info?.title || '', author: info?.author || '' }];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    return next;
  });
  return [ids, toggle];
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

/* ── Card livro gratuito ── */
function BookCard({ book, readIds, onToggle }) {
  const id   = book.url;
  const read = readIds.has(id);
  return (
    <div className="livro-card-wrap" data-highlight-id={book.url}>
      <a className={'livro-card' + (read ? ' livro-card--read' : '')} href={book.url} target="_blank" rel="noopener noreferrer" data-cursor="hover">
        <BookCover title={book.title} category={book.category} />
        <div className="livro-card-info">
          <p className="livro-card-title">{book.title}</p>
          {book.author && <p className="livro-card-author">{book.author}</p>}
        </div>
      </a>
      <button className={'livro-read-btn' + (read ? ' active' : '')} data-cursor="hover" onClick={() => onToggle(id, { title: book.title, author: book.author })} title={read ? 'Marcar como não lido' : 'Marcar como lido'}>
        <CheckIcon />
      </button>
    </div>
  );
}

/* ── Card livro recomendado ── */
function RecomCard({ book, readIds, onToggle }) {
  const id   = book.id;
  const read = readIds.has(id);
  return (
    <div className="livro-card-wrap" data-highlight-id={book.id}>
      <a className={'livro-card' + (read ? ' livro-card--read' : '')} href={book.link} target="_blank" rel="noopener noreferrer" data-cursor="hover">
        <BookCover title={book.title} category={book.category} staticSrc={book.cover_url || null} />
        <div className="livro-card-info">
          <span className="livro-recom-badge">D30 Pick</span>
          <p className="livro-card-title">{book.title}</p>
          {book.author && <p className="livro-card-author">{book.author}</p>}
          {book.description && <p className="livro-card-desc">{book.description}</p>}
        </div>
      </a>
      <button className={'livro-read-btn' + (read ? ' active' : '')} data-cursor="hover" onClick={() => onToggle(id, { title: book.title, author: book.author })} title={read ? 'Marcar como não lido' : 'Marcar como lido'}>
        <CheckIcon />
      </button>
    </div>
  );
}

/* ── Admin form ── */
function AdminLivroForm({ onSaved, toast }) {
  const empty = { title:'', author:'', cover_url:'', category:'backend', description:'', link:'' };
  const [form,   setForm]   = React.useState(empty);
  const [saving, setSaving] = React.useState(false);
  const [open,   setOpen]   = React.useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim() || !form.link.trim()) { toast('error', 'Título e link são obrigatórios.'); return; }
    setSaving(true);
    try {
      const { error } = await window.sb.from('livros_recomendados').insert({
        ...form,
        title: form.title.trim(),
        link:  form.link.trim(),
        cover_url: form.cover_url.trim() || null,
        author: form.author.trim() || null,
        description: form.description.trim() || null,
      });
      if (error) throw error;
      toast('success', 'Livro adicionado!');
      setForm(empty);
      setOpen(false);
      onSaved();
    } catch (e) {
      toast('error', e.message || 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  if (!open) return (
    <button className="vagas-admin-toggle" data-cursor="hover" onClick={() => setOpen(true)}>+ Adicionar livro recomendado</button>
  );

  return (
    <div className="vagas-admin-form">
      <div className="vagas-admin-form-header">
        <span>Novo livro recomendado</span>
        <button className="vagas-admin-close" data-cursor="hover" onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className="vagas-admin-grid">
        <div className="vagas-admin-field vagas-admin-field--full">
          <label>Título *</label>
          <input className="settings-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Clean Code" />
        </div>
        <div className="vagas-admin-field">
          <label>Autor</label>
          <input className="settings-input" value={form.author} onChange={e => set('author', e.target.value)} placeholder="Ex: Robert C. Martin" />
        </div>
        <div className="vagas-admin-field">
          <label>Área</label>
          <select className="settings-input" value={form.category} onChange={e => set('category', e.target.value)}>
            {JOB_BUCKETS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>
        <div className="vagas-admin-field vagas-admin-field--full">
          <label>URL da capa</label>
          <input className="settings-input" value={form.cover_url} onChange={e => set('cover_url', e.target.value)} placeholder="https://..." />
        </div>
        <div className="vagas-admin-field vagas-admin-field--full">
          <label>Link *</label>
          <input className="settings-input" type="url" value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://amazon.com.br/..." />
        </div>
        <div className="vagas-admin-field vagas-admin-field--full">
          <label>Por que ler?</label>
          <textarea className="settings-input settings-textarea" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Uma linha sobre por que esse livro vale a pena..." />
        </div>
      </div>
      <button className="settings-save-btn" data-cursor="hover" onClick={save} disabled={saving}>
        {saving ? 'Salvando…' : 'Publicar'}
      </button>
    </div>
  );
}

/* ── Main Page ── */
function LivrosPage({ user, toast }) {
  const isAdmin = user?.email === OWNER_EMAIL;

  const [readIds, toggleRead] = useLivrosLidos(user?.id);

  const [tab,          setTab]          = React.useState('free'); // free | recom
  const [lang,         setLang]         = React.useState('pt');
  const [books,        setBooks]        = React.useState([]);
  const [recom,        setRecom]        = React.useState([]);
  const [bucket,       setBucket]       = React.useState('all');
  const [recomBucket,  setRecomBucket]  = React.useState('all');
  const [loading,      setLoading]      = React.useState(true);
  const [loadingRecom, setLoadingRecom] = React.useState(true);
  const [error,        setError]        = React.useState(false);

  React.useEffect(() => {
    setLoading(true); setError(false); setBucket('all');
    fetch(`/api/livros?lang=${lang}`)
      .then(r => { if (!r.ok) throw 0; return r.json(); })
      .then(d => setBooks(d.books || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lang]);

  const fetchRecom = React.useCallback(async () => {
    if (!window.sb) { console.warn('[D30] window.sb not ready'); return; }
    setLoadingRecom(true);
    try {
      const { data, error } = await window.sb.from('livros_recomendados').select('*').eq('active', true).order('created_at', { ascending: false });
      if (error) console.error('[D30] livros_recomendados error:', error);
      setRecom(data || []);
    } catch (e) { console.error('[D30] livros fetch threw:', e); }
    finally { setLoadingRecom(false); }
  }, []);

  React.useEffect(() => { fetchRecom(); }, [fetchRecom]);

  React.useEffect(() => {
    const id = window.__livrosHighlight;
    if (!id || loading || loadingRecom) return;
    window.__livrosHighlight = null;
    if (id.startsWith('http')) { setTab('free'); setBucket('all'); }
    else { setTab('recom'); setRecomBucket('all'); }
    setTimeout(() => {
      const el = Array.from(document.querySelectorAll('[data-highlight-id]')).find(e => e.dataset.highlightId === id);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        el.classList.remove('highlight-flash');
        void el.offsetWidth;
        document.body.classList.add('book-highlight-active');
        el.classList.add('highlight-flash');
        setTimeout(() => {
          document.body.classList.remove('book-highlight-active');
          el.classList.remove('highlight-flash');
        }, 3000);
      }, 500);
    }, 700);
  }, [loading, loadingRecom]);

  /* Contagens */
  const freeCounts = React.useMemo(() => {
    const c = { all: books.length };
    books.forEach(b => { const bk = getBucket(b.category); if (bk) c[bk] = (c[bk] || 0) + 1; });
    return c;
  }, [books]);

  const recomCounts = React.useMemo(() => {
    const c = { all: recom.length };
    recom.forEach(b => { if (b.category) c[b.category] = (c[b.category] || 0) + 1; });
    return c;
  }, [recom]);

  const visibleFree  = bucket === 'all'      ? books : books.filter(b => getBucket(b.category) === bucket);
  const visibleRecom = recomBucket === 'all' ? recom : recom.filter(b => b.category === recomBucket);

  const skeletons = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="page active fade-in">
      <div className="livros-wrap">

        <div className="livros-header">
          <h1 className="livros-title">Livros</h1>
          <p className="livros-sub">Gratuitos do mundo todo e os melhores recomendados pela D30.</p>
        </div>

        {/* Tabs principais */}
        <div className="vagas-tabs">
          <button className={'vagas-tab' + (tab === 'free' ? ' active' : '')} data-cursor="hover" onClick={() => setTab('free')}>
            Gratuitos
            {!loading && <span className="vagas-tab-count">{books.length}</span>}
          </button>
          <button className={'vagas-tab' + (tab === 'recom' ? ' active' : '')} data-cursor="hover" onClick={() => setTab('recom')}>
            D30 Recomenda
            {!loadingRecom && <span className="vagas-tab-count">{recom.length}</span>}
          </button>
        </div>

        {/* ── GRATUITOS ── */}
        {tab === 'free' && (
          <React.Fragment>
            {/* Sub-tabs idioma */}
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {[['pt','🇧🇷 Português'],['en','🇺🇸 English']].map(([l, label]) => (
                <button key={l} className={'livros-cat' + (lang === l ? ' active' : '')} data-cursor="hover" onClick={() => setLang(l)}>{label}</button>
              ))}
            </div>

            {/* Filtro área */}
            {!loading && !error && (
              <div className="livros-cats">
                <button className={'livros-cat' + (bucket === 'all' ? ' active' : '')} data-cursor="hover" onClick={() => setBucket('all')}>
                  Todas <span className="livros-cat-count">{freeCounts.all}</span>
                </button>
                {JOB_BUCKETS.filter(b => freeCounts[b.id] > 0).map(b => (
                  <button key={b.id} className={'livros-cat' + (bucket === b.id ? ' active' : '')} data-cursor="hover" onClick={() => setBucket(b.id)}>
                    {b.label} <span className="livros-cat-count">{freeCounts[b.id]}</span>
                  </button>
                ))}
              </div>
            )}

            {loading && <div className="livros-grid">{skeletons.map(i => <div key={i} className="livro-card"><div className="livro-cover livro-cover--skeleton" /></div>)}</div>}
            {!loading && error && <div className="vagas-empty"><p>Não foi possível carregar. Tente novamente.</p></div>}
            {!loading && !error && (
              visibleFree.length === 0
                ? <div className="vagas-empty"><p>Nenhum livro nessa área.</p></div>
                : <div className="livros-grid">{visibleFree.map((b, i) => <BookCard key={b.url + i} book={b} readIds={readIds} onToggle={toggleRead} />)}</div>
            )}
          </React.Fragment>
        )}

        {/* ── RECOMENDADOS ── */}
        {tab === 'recom' && (
          <React.Fragment>
            {isAdmin && <AdminLivroForm onSaved={fetchRecom} toast={toast} />}

            {/* Filtro área */}
            {!loadingRecom && recom.length > 0 && (
              <div className="livros-cats" style={{ marginTop: isAdmin ? 16 : 0 }}>
                <button className={'livros-cat' + (recomBucket === 'all' ? ' active' : '')} data-cursor="hover" onClick={() => setRecomBucket('all')}>
                  Todos <span className="livros-cat-count">{recomCounts.all}</span>
                </button>
                {JOB_BUCKETS.filter(b => recomCounts[b.id] > 0).map(b => (
                  <button key={b.id} className={'livros-cat' + (recomBucket === b.id ? ' active' : '')} data-cursor="hover" onClick={() => setRecomBucket(b.id)}>
                    {b.label} <span className="livros-cat-count">{recomCounts[b.id]}</span>
                  </button>
                ))}
              </div>
            )}

            {loadingRecom && <div className="livros-grid">{skeletons.map(i => <div key={i} className="livro-card"><div className="livro-cover livro-cover--skeleton" /></div>)}</div>}

            {!loadingRecom && visibleRecom.length === 0 && (
              <div className="vagas-empty">
                <p>Nenhum livro recomendado ainda.</p>
                {!isAdmin && <p style={{ fontSize:13, marginTop:6 }}>Em breve o Augusto vai listar os melhores.</p>}
              </div>
            )}

            {!loadingRecom && visibleRecom.length > 0 && (
              <div className="livros-grid">{visibleRecom.map(b => <RecomCard key={b.id} book={b} readIds={readIds} onToggle={toggleRead} />)}</div>
            )}
          </React.Fragment>
        )}

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { LivrosPage });
