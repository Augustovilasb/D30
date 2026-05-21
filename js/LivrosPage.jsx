/* LivrosPage.jsx — Livros gratuitos agrupados por área de trabalho */

const JOB_BUCKETS = [
  { id: 'frontend', label: 'Frontend'    },
  { id: 'backend',  label: 'Backend'     },
  { id: 'mobile',   label: 'Mobile'      },
  { id: 'devops',   label: 'DevOps'      },
  { id: 'data',     label: 'Data & IA'   },
  { id: 'security', label: 'Segurança'   },
  { id: 'cs',       label: 'Fundamentos' },
];

/* Exatos primeiro (nomes curtos/ambíguos) */
const EXACT = { 'c':'backend', 'r':'data', 'go':'backend', 'lua':'backend' };

/* Palavras-chave por bucket — verificadas em ordem, primeira que bate vence */
const BUCKET_KW = [
  { id: 'frontend', kw: [
    'javascript','typescript','html','css','react','vue','angular','svelte',
    'next.js','jquery','sass','less','web dev','frontend','front-end','bootstrap',
  ]},
  { id: 'backend', kw: [
    'java','python','rust','c++','c#','ruby','php','elixir','scala','kotlin',
    '.net','node','spring','django','laravel','flask','express','fastapi',
    'sql','database','banco de dados','mysql','postgresql','mongodb','nosql',
    'redis','graphql','api','rest','grpc','microservice',
  ]},
  { id: 'mobile', kw: [
    'android','swift','dart','flutter','ios','mobile','react native','kotlin multiplatform',
  ]},
  { id: 'devops', kw: [
    'git','docker','kubernetes','linux','bash','shell','zsh','devops',
    'cloud','nuvem','network','redes','operating system','sistema operacional',
    'ansible','terraform','arduino','infraestrutura','infrastructure','ci/cd',
    'nginx','apache','prometheus','grafana','monitoring',
  ]},
  { id: 'data', kw: [
    'data science','machine learning','deep learning','artificial intelligence',
    'inteligência artificial','ciência de dados','analytics','tensorflow',
    'pytorch','pandas','numpy','spark','bigdata','big data','estatística','statistics',
  ]},
  { id: 'security', kw: [
    'security','cybersecurity','segurança','criptografia','pentest',
    'hacking','owasp','criptograf','infosec',
  ]},
  { id: 'cs', kw: [
    'algorithm','algoritmo','estrutura de dado','data structure',
    'computer science','ciência da computação','software engineering',
    'engenharia de software','mathematics','matemática','cálculo',
    'programação','programming','design pattern','padrão de projeto',
    'metodologia','markdown','latex','web performance','clean code',
    'refactoring','fundamento',
  ]},
];

function getBucket(category) {
  const c = category.toLowerCase().trim();
  if (EXACT[c]) return EXACT[c];
  for (const { id, kw } of BUCKET_KW) {
    if (kw.some(k => c.includes(k))) return id;
  }
  return null;
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

/* Busca capa: Google Books + Open Library em paralelo, usa o que chegar primeiro */
function fetchCover(title) {
  const q = encodeURIComponent(title);
  const gb = fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=items/volumeInfo/imageLinks`)
    .then(r => r.json())
    .then(d => {
      const t = d?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:');
      if (!t) throw new Error('no cover');
      return t;
    });
  const ol = fetch(`https://openlibrary.org/search.json?title=${q}&limit=1&fields=cover_i`)
    .then(r => r.json())
    .then(d => {
      const id = d?.docs?.[0]?.cover_i;
      if (!id) throw new Error('no cover');
      return `https://covers.openlibrary.org/b/id/${id}-M.jpg`;
    });
  return Promise.any([gb, ol]).catch(() => null);
}

/* Capa lazy — tenta Google Books e Open Library quando entra no viewport */
function BookCover({ title, category }) {
  const [src, setSrc] = React.useState(null);
  const ref     = React.useRef(null);
  const fetched = React.useRef(false);

  React.useEffect(() => {
    if (!ref.current) return;
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
