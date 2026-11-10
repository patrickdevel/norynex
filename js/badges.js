// Chat-Abzeichen (gemeinsam für Website und OBS-Overlays)
(function () {
  const P = {
    owner: ['#ef4444', '<path d="M4 7h10v10H4z" fill="#fff"/><path d="M15 10l5-3v10l-5-3z" fill="#fff"/>', 'Streamer'],
    staff: ['#7c3aed', '<path d="M6 18V6h2.6l6.8 8.2V6H18v12h-2.6L8.6 9.8V18z" fill="#fff"/>', 'Norynex-Team'],
    mod: ['#16a34a', '<path d="M12 3l7 3v5c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6z" fill="#fff"/>', 'Moderator'],
    vip: ['#db2777', '<path d="M6 4h12l3 5-9 11L3 9z" fill="#fff"/>', 'VIP'],
    gifter: ['#ea580c', '<path d="M4 10h16v3H4zM5 13h14v7H5z" fill="#fff"/><path d="M11 10h2v10h-2z" fill="#ea580c"/><path d="M12 10c-2-4-6-4-6-1.5S10 10 12 10c2 0 6 1 6-1.5S14 6 12 10z" fill="#fff"/>', 'Geschenk-Abo-Spender'],
    premium: ['#ca8a04', '<path d="M3 8l4.5 3L12 5l4.5 6L21 8l-2 10H5z" fill="#fff"/>', 'Premium'],
    verified: ['#2563eb', '<path d="M10 16.5l-4-4 1.6-1.6 2.4 2.4 6.4-6.4L18 8.5z" fill="#fff"/>', 'Verifiziert'],
    affiliate: ['#7c3aed', '<path d="M12 3l2.3 5.8 6.2.4-4.8 4 1.6 6-5.3-3.4-5.3 3.4 1.6-6-4.8-4 6.2-.4z" fill="#fff"/>', 'Norynex-Affiliate'],
    partner: ['#9333ea', '<path d="M12 2l2.4 2.1 3.2-.3.8 3.1 2.8 1.6-1.3 2.9 1.3 2.9-2.8 1.6-.8 3.1-3.2-.3L12 22l-2.4-2.1-3.2.3-.8-3.1-2.8-1.6 1.3-2.9-1.3-2.9 2.8-1.6.8-3.1 3.2.3z" fill="#fff"/><path d="M10.5 15.2l-3-3 1.4-1.4 1.6 1.6 4.6-4.6 1.4 1.4z" fill="#9333ea"/>', 'Norynex-Partner'],
    bot: ['#52525b', '<rect x="5" y="8" width="14" height="10" rx="2" fill="#fff"/><circle cx="9.5" cy="13" r="1.4" fill="#52525b"/><circle cx="14.5" cy="13" r="1.4" fill="#52525b"/><path d="M11 4h2v4h-2z" fill="#fff"/>', 'Bot'],
  };
  const TIER = { 1: '#9333ea', 2: '#2563eb', 3: '#d97706' };
  const star = '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" fill="#fff"/>';
  function one(bg, inner, title, extra) {
    return `<span class="nxb" title="${title}" style="background:${bg}"><svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">${inner}</svg>${extra || ''}</span>`;
  }
  window.nxChatBadges = function (list) {
    return (list || []).map(b => {
      if (typeof b !== 'string') return '';
      if (b.startsWith('sub:')) {
        const [, tier, months] = b.split(':');
        return one(TIER[tier] || TIER[1], star, `Live-Abonnent (Stufe ${tier}) · ${months} Monat${+months === 1 ? '' : 'e'}`);
      }
      if (b.startsWith('shop:')) { const id = b.slice(5); return typeof window.nxBadgeHtml === 'function' ? `<span class="nxb nxb-shop">${window.nxBadgeHtml(id)}</span>` : ''; }
      if (b.startsWith('gifter:')) { const n = b.split(':')[1]; const p = P.gifter; return one(p[0], p[1], `${p[2]} · ${n} verschenkt`); }
      const p = P[b]; return p ? one(p[0], p[1], p[2]) : '';
    }).join('');
  };
})();
