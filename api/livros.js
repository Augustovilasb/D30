/* api/livros.js — parseia free-programming-books PT-BR e EN */

const H = { 'User-Agent': 'D30Community/1.0', 'Accept': 'text/plain' };

const PT_URL = 'https://raw.githubusercontent.com/EbookFoundation/free-programming-books/main/books/free-programming-books-pt_BR.md';
const EN_URL = 'https://raw.githubusercontent.com/EbookFoundation/free-programming-books/main/books/free-programming-books.md';

/* Categorias relevantes para comunidade dev (matching em lowercase) */
const EN_KEEP = new Set([
  'javascript','typescript','python','java','go','rust','c','c++','c#','kotlin',
  'swift','ruby','php','scala','elixir','dart','r','lua',
  'html and css','html','css','html / css',
  'node.js','react','vue.js','angular','svelte','next.js',
  'git','docker','kubernetes','linux','bash','shell scripting',
  'algorithms & data structures','algorithms and data structures',
  'data science','machine learning','deep learning','artificial intelligence',
  'database','sql','nosql','postgresql','mysql','mongodb',
  'security','cybersecurity','networking','devops','cloud computing',
  'operating systems','computer science','software engineering','programming',
  'mathematics for programmers','math','web performance','graphql','rest api',
]);

function parseMarkdown(md, lang) {
  const lines = md.split('\n');
  const books = [];
  const seen  = new Set();
  let mainCat = null;
  let subCat  = null;

  for (const line of lines) {
    const hMatch = line.match(/^(#{2,3})\s+(.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const name  = hMatch[2]
        .replace(/<[^>]+>/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`]/g, '')
        .trim();
      if (level === 2) { mainCat = name; subCat = null; }
      else             { subCat  = name; }
      continue;
    }

    const category = subCat || mainCat;
    if (!category) continue;

    /* Para inglês, só categorias relevantes */
    if (lang === 'en' && !EN_KEEP.has(category.toLowerCase())) continue;

    const bMatch = line.match(/^\*\s+\[([^\]]+)\]\(([^)]+)\)(.*)/);
    if (!bMatch) continue;

    const title = bMatch[1].trim();
    const url   = bMatch[2].trim();
    const meta  = bMatch[3].trim();

    if (!url.startsWith('http')) continue;
    if (seen.has(url)) continue;
    seen.add(url);

    /* Extrai autor */
    let author = null;
    const aMeta = meta.replace(/^\s*[-–:]\s*/, '');
    if (aMeta) {
      author = aMeta
        .replace(/\*[^*]+\*/g, '')
        .replace(/\([^)]*\)/g, '')
        .replace(/,?\s*\d{4}[^,]*.*$/, '')
        .replace(/^\s*[-–]\s*/, '')
        .trim() || null;
      if (author && author.length > 80) author = author.slice(0, 77) + '...';
    }

    books.push({ title, url, author, category, lang });
  }

  /* Inglês: máx 20 por categoria */
  if (lang === 'en') {
    const cnt = {};
    return books.filter(b => {
      cnt[b.category] = (cnt[b.category] || 0) + 1;
      return cnt[b.category] <= 20;
    });
  }

  return books;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const lang = (req.query.lang || 'pt').toLowerCase();

  try {
    const fetches = [];
    if (lang === 'pt') fetches.push(fetch(PT_URL, { headers: H }).then(r => r.ok ? r.text() : '').then(md => parseMarkdown(md, 'pt')));
    if (lang === 'en') fetches.push(fetch(EN_URL, { headers: H }).then(r => r.ok ? r.text() : '').then(md => parseMarkdown(md, 'en')));

    const results = await Promise.all(fetches);
    const books   = results.flat();

    const categories = [...new Set(books.map(b => b.category))].sort((a, b) => a.localeCompare(b));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json({ books, categories, count: books.length });
  } catch (e) {
    return res.status(500).json({ error: e.message, books: [], categories: [] });
  }
};
