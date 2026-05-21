/* LivrosPage.jsx — Livros gratuitos agrupados por área de trabalho */

/* Mapeamento: categoria do markdown → bucket de carreira */
const CAT_TO_BUCKET = {
  /* Frontend */
  'javascript':'frontend','typescript':'frontend','html / css':'frontend',
  'html and css':'frontend','html':'frontend','css':'frontend',
  'react':'frontend','vue.js':'frontend','angular':'frontend',
  'svelte':'frontend','next.js':'frontend','jquery':'frontend',
  'web development':'frontend','bootstrap':'frontend',

  /* Backend */
  'java':'backend','python':'backend','go':'backend','rust':'backend',
  'c':'backend','c++':'backend','c#':'backend','ruby':'backend',
  'php':'backend','elixir':'backend','scala':'backend','lua':'backend',
  '.net':'backend','node.js':'backend','kotlin':'backend',
  'sql':'backend','database':'backend','nosql':'backend',
  'postgresql':'backend','mysql':'backend','mongodb':'backend',
  'graphql':'backend','rest api':'backend','spring':'backend',

  /* Mobile */
  'android':'mobile','swift':'mobile','dart':'mobile',
  'flutter':'mobile','ios':'mobile','react native':'mobile',

  /* DevOps */
  'git':'devops','docker':'devops','kubernetes':'devops','linux':'devops',
  'bash':'devops','shell scripting':'devops','shell / bash / zsh / etc':'devops',
  'devops':'devops','cloud computing':'devops','networking':'devops',
  'operating systems':'devops','ansible':'devops','terraform':'devops',
  'arduino':'devops',

  /* Data & IA */
  'data science':'data','machine learning':'data','deep learning':'data',
  'artificial intelligence':'data','r':'data','ciência de dados':'data',
  'inteligência artificial':'data','matlab':'data',

  /* Segurança */
  'security':'security','cybersecurity':'security','segurança':'security',
  'criptografia':'security',

  /* Fundamentos */
  'algorithms & data structures':'cs','algorithms and data structures':'cs',
  'computer science':'cs','software engineering':'cs','mathematics':'cs',
  'engenharia de software':'cs','metodologias de desenvolvimento de software':'cs',
  'matemática':'cs','programming':'cs','web performance':'cs',
  'markdown':'cs','latex':'cs','estruturas de dados':'cs','algoritmos':'cs',
};

const JOB_BUCKETS = [
  { id: 'frontend', label: 'Frontend'   },
  { id: 'backend',  label: 'Backend'    },
  { id: 'mobile',   label: 'Mobile'     },
  { id: 'devops',   label: 'DevOps'     },
  { id: 'data',     label: 'Data & IA'  },
  { id: 'security', label: 'Segurança'  },
  { id: 'cs',       label: 'Fundamentos'},
];

function getBucket(category) {
  return CAT_TO_BUCKET[category.toLowerCase().trim()] || null;
}

/* Cor de placeholder baseada no bucket */
const BUCKET_COLORS = {
  frontend: '#1a4a7a', backend: '#2d5a27', mobile: '#5a2d7a',
  devops:   '#7a4a1a', data:    '#1a5a5a', security:'#7a1a1a',
  cs:       '#3a3a5a', default: '#2a2a3a',
};

function placeholderBg(category) {
  const bucket = getBucket(category);
  return BUCKET_COLORS[bucket] || BUCKET_COLORS.default;
}

/* Capa lazy via Google Books, fallback colorido */
function BookCover({ title, category }) {
  const [src,   setSrc]   = React.useState(null);
  const [tried, setTried] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current || tried) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setTried(true);
      obs.disconnect();
      fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=1&fields=items/volumeInfo/imageLinks`)
        .then(r => r.json())
        .then(d => {
          const t = d?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
          if (t) setSrc(t.replace('http:', 'https:'));
        })
        .catch(() => {});
    }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [title, tried]);

  return (
    <div ref={ref} className="livro-cover">
      {src
        ? <img src={src} alt={title} className="livro-cover-img" onError={() => setSrc(null)} />
        : (
          <div className="livro-cover-ph" style={{ background: placeholderBg(category) }}>
            <span className="livro-cover-ph-text">{title}</span>
          </div>
        )
      }
    </div>
  );
}

function BookCard({ book }) {
  return (
    <a className="livro-card" href={book.url} target="_blank" rel="noopener noreferrer" data-cursor="hover">
      <BookCover title={book.title} category={book.category} />
      <div className="livro-card-info">
        <p className="livro-card-title">{book.title}</p>
        {book.author && <p className="livro-card-author">{book.author}</p>}
      </div>
    </a>
  );
}

function LivrosPage({ user }) {
  const [lang,    setLang]    = React.useState('pt');
  const [books,   setBooks]   = React.useState([]);
  const [bucket,  setBucket]  = React.useState('all');
  const [loading, setLoading] = React.useState(true);
  const [error,   setError]   = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    setError(false);
    setBucket('all');
    fetch(`/api/livros?lang=${lang}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setBooks(d.books || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lang]);

  /* Contagem por bucket */
  const counts = React.useMemo(() => {
    const c = { all: 0 };
    JOB_BUCKETS.forEach(b => { c[b.id] = 0; });
    books.forEach(b => {
      c.all++;
      const bk = getBucket(b.category);
      if (bk) c[bk] = (c[bk] || 0) + 1;
    });
    return c;
  }, [books]);

  const visible = React.useMemo(() => {
    if (bucket === 'all') return books;
    return books.filter(b => getBucket(b.category) === bucket);
  }, [books, bucket]);

  const skeletons = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="page active fade-in">
      <div className="livros-wrap">

        <div className="livros-header">
          <h1 className="livros-title">Livros</h1>
          <p className="livros-sub">Livros gratuitos e legais — organizados por área de trabalho.</p>
        </div>

        {/* Tabs idioma */}
        <div className="vagas-tabs">
          <button className={'vagas-tab' + (lang === 'pt' ? ' active' : '')} data-cursor="hover" onClick={() => setLang('pt')}>
            🇧🇷 Português
          </button>
          <button className={'vagas-tab' + (lang === 'en' ? ' active' : '')} data-cursor="hover" onClick={() => setLang('en')}>
            🇺🇸 English
          </button>
        </div>

        {/* Filtro por área */}
        {!loading && !error && (
          <div className="livros-cats">
            <button className={'livros-cat' + (bucket === 'all' ? ' active' : '')} data-cursor="hover" onClick={() => setBucket('all')}>
              Todas <span className="livros-cat-count">{counts.all}</span>
            </button>
            {JOB_BUCKETS.filter(b => counts[b.id] > 0).map(b => (
              <button key={b.id} className={'livros-cat' + (bucket === b.id ? ' active' : '')} data-cursor="hover" onClick={() => setBucket(b.id)}>
                {b.label} <span className="livros-cat-count">{counts[b.id]}</span>
              </button>
            ))}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="livros-grid">
            {skeletons.map(i => <div key={i} className="livro-card"><div className="livro-cover livro-cover--skeleton" /></div>)}
          </div>
        )}

        {/* Erro */}
        {!loading && error && (
          <div className="vagas-empty"><p>Não foi possível carregar os livros. Tente novamente.</p></div>
        )}

        {/* Grid */}
        {!loading && !error && (
          visible.length === 0
            ? <div className="vagas-empty"><p>Nenhum livro nessa área ainda.</p></div>
            : <div className="livros-grid">{visible.map((b, i) => <BookCard key={b.url + i} book={b} />)}</div>
        )}

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { LivrosPage });
