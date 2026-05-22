/* sanitize.js — wrapper DOMPurify para conteúdo gerado por usuário */

const Sanitize = {

  /* Sanitiza HTML de mensagens do fórum.
   * Falha fechada: sem DOMPurify carregado → retorna texto puro (strip tags). */
  forum(html) {
    if (!html) return '';
    const raw = String(html);

    if (!window.DOMPurify) {
      return raw.replace(/<[^>]+>/g, '');
    }

    const clean = window.DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'pre', 'br',
                     'a', 'ul', 'ol', 'li', 'p', 'blockquote', 's', 'strike'],
      ALLOWED_ATTR: ['href'],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover'],
    });

    /* Garante que links sejam seguros e abram em nova aba */
    const div = document.createElement('div');
    div.innerHTML = clean;
    div.querySelectorAll('a').forEach(a => {
      const href = (a.getAttribute('href') || '').trim();
      if (!/^https?:\/\//i.test(href)) {
        a.removeAttribute('href');
      } else {
        a.setAttribute('rel', 'noopener noreferrer');
        a.setAttribute('target', '_blank');
      }
    });
    return div.innerHTML;
  },

  /* Valida se uma URL usa protocolo seguro (http/https apenas) */
  isSafeUrl(url) {
    if (!url || !url.trim()) return true;
    try {
      const u = new URL(url.trim());
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch {
      return false;
    }
  },

  /* Valida um conjunto de campos de URL no objeto de formulário.
   * Retorna null se tudo ok, ou a mensagem de erro. */
  validateUrls(fields) {
    const labels = {
      avatar_url:    'foto de perfil',
      github_url:    'GitHub',
      linkedin_url:  'LinkedIn',
      instagram_url: 'Instagram',
      twitter_url:   'Twitter / X',
      website_url:   'Website',
    };
    for (const [key, val] of Object.entries(fields)) {
      if (val && !Sanitize.isSafeUrl(val)) {
        return `URL inválida no campo ${labels[key] || key}. Use https://...`;
      }
    }
    return null;
  },
};

window.Sanitize = Sanitize;
