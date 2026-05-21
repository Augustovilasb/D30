/* LivrosPage.jsx — Livros gratuitos (PT-BR + EN) */

/* Gera cor de fundo para o placeholder a partir do nome da categoria */
function catColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360}, 40%, 30%)`;
}

/* Capa: tenta buscar via Google Books, fallback para placeholder colorido */
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
          <div className="livro-cover-ph" style={{ background: catColor(category) }}>
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
  const [lang,      setLang]      = React.useState('pt');
  const [books,     setBooks]     = React.useState([]);
  const [cats,      setCats]      = React.useState([]);
  const [cat,       setCat]       = React.useState('all');
  const [loading,   setLoading]   = React.useState(true);
  const [error,     setError]     = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    setError(false);
    setCat('all');
    fetch(`/api/livros?lang=${lang}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setBooks(d.books || []); setCats(d.categories || []); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lang]);

  const visible = cat === 'all' ? books : books.filter(b => b.category === cat);

  const skeletons = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="page active fade-in">
      <div className="livros-wrap">

        <div className="livros-header">
          <h1 className="livros-title">Livros</h1>
          <p className="livros-sub">Livros gratuitos e legais — curados pelo repositório open-source mais completo da internet.</p>
        </div>

        {/* Tabs de idioma */}
        <div className="vagas-tabs">
          <button className={'vagas-tab' + (lang === 'pt' ? ' active' : '')} data-cursor="hover" onClick={() => setLang('pt')}>
            🇧🇷 Português
          </button>
          <button className={'vagas-tab' + (lang === 'en' ? ' active' : '')} data-cursor="hover" onClick={() => setLang('en')}>
            🇺🇸 English
          </button>
        </div>

        {/* Filtro de categoria */}
        {!loading && !error && cats.length > 0 && (
          <div className="livros-cats">
            <button
              className={'livros-cat' + (cat === 'all' ? ' active' : '')}
              data-cursor="hover"
              onClick={() => setCat('all')}
            >
              Todas <span className="livros-cat-count">{books.length}</span>
            </button>
            {cats.map(c => (
              <button
                key={c}
                className={'livros-cat' + (cat === c ? ' active' : '')}
                data-cursor="hover"
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="livros-grid">
            {skeletons.map(i => (
              <div key={i} className="livro-card livro-card--skeleton">
                <div className="livro-cover livro-cover--skeleton" />
              </div>
            ))}
          </div>
        )}

        {/* Erro */}
        {!loading && error && (
          <div className="vagas-empty"><p>Não foi possível carregar os livros. Tente novamente.</p></div>
        )}

        {/* Grid */}
        {!loading && !error && (
          visible.length === 0
            ? <div className="vagas-empty"><p>Nenhum livro nessa categoria.</p></div>
            : (
              <div className="livros-grid">
                {visible.map((b, i) => <BookCard key={b.url + i} book={b} />)}
              </div>
            )
        )}

      </div>
      <Footer />
    </div>
  );
}

Object.assign(window, { LivrosPage });
