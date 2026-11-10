// ⚠️  AUTOMATISCH ERZEUGT aus client/shop-pro/*.js — bitte NICHT hier bearbeiten, sondern dort; danach "npm run build".
// ─── Teil: client/shop-pro/010-start.js ───
/* =====================================================================
   Norynex · Shop, Guthaben & Bezahlen
   – openCheckout(): ein Bezahlfenster für Premium, Guthaben, Videos, Werbung
     (Kreditkarte, Apple Pay, Google Pay, SEPA über Mollie · paysafecard · Guthaben)
   – openTopup(): Guthaben aufladen (5 – 100 €)
   – renderShopPage(): großer Tages-Shop (Bundles, Highlights, Täglich), Spind, Guthaben
   – Kosmetik: Namensstile, Abzeichen, Kommentar-Sticker, Kommentar-Stile
   ===================================================================== */

/* ---------- Kosmetik-Definitionen (Darstellung) ---------- */
// Text-/Symbol-Sticker im Die-Cut-Look (weißer Rand wie echte Sticker), Meme-Sticker als Bild.
const NX_STICKERS = {
  st_gg:     { label: 'GG',    color: '#22c55e', c2: '#15803d', icon: 'fa-handshake' },
  st_w:      { label: 'W',     color: '#3b82f6', c2: '#1d4ed8', cls: 'st-big' },
  st_l:      { label: 'L',     color: '#ef4444', c2: '#991b1b', cls: 'st-big st-tilt-r' },
  st_lol:    { label: 'LOL',   color: '#f59e0b', c2: '#c2410c', icon: 'fa-face-laugh-squint', cls: 'st-wobble' },
  st_100:    { label: '100',   color: '#ef4444', c2: '#b91c1c', cls: 'st-stamp' },
  st_rip:    { label: 'RIP',   color: '#64748b', c2: '#1e293b', icon: 'fa-skull' },
  st_ez:     { label: 'EZ',    color: '#06b6d4', c2: '#0e7490', icon: 'fa-check' },
  st_omg:    { label: 'OMG',   color: '#ec4899', c2: '#9d174d', cls: 'st-boing' },
  st_love:   { icon: 'fa-heart', color: '#f43f5e', c2: '#be123c', cls: 'st-icon st-beat' },
  st_fire:   { icon: 'fa-fire', color: '#f97316', c2: '#dc2626', cls: 'st-icon st-flicker' },
  st_clap:   { icon: 'fa-hands-clapping', color: '#f59e0b', c2: '#b45309', cls: 'st-icon st-clap' },
  st_skull:  { icon: 'fa-skull', color: '#94a3b8', c2: '#334155', cls: 'st-icon st-wobble' },
  st_nope:   { label: 'NOPE',  color: '#dc2626', c2: '#7f1d1d', icon: 'fa-ban', cls: 'st-stamp' },
  st_hype:   { label: 'HYPE',  color: '#a855f7', c2: '#6d28d9', icon: 'fa-bolt', cls: 'st-shake' },
  st_rocket: { label: 'TO THE MOON', color: '#06b6d4', c2: '#4338ca', icon: 'fa-rocket', cls: 'st-launch' },
  st_goat:   { label: 'GOAT',  color: '#eab308', c2: '#a16207', icon: 'fa-crown' },
  st_clutch: { label: 'CLUTCH', color: '#10b981', c2: '#065f46', icon: 'fa-crosshairs', cls: 'st-shake' },
  st_legend: { label: 'LEGEND', color: '#f59e0b', c2: '#7c2d12', icon: 'fa-star', cls: 'st-legend' },
  // Meme-Sticker (Bilder)
  st_m_bruh:     { img: 'bruh' },
  st_m_hehe:     { img: 'hehe' },
  st_m_meltdown: { img: 'meltdown' },
  st_m_giggle:   { img: 'giggle' },
  st_m_cheeky:   { img: 'cheeky' },
  st_m_grrr:     { img: 'grrr' },
  st_m_smug:     { img: 'smug' },
};
const NX_BADGES = {
  bd_night:  { icon: 'fa-moon', color: '#818cf8', title: 'Night Owl' },
  bd_gamer:  { icon: 'fa-gamepad', color: '#22c55e', title: 'Gamer' },
  bd_music:  { icon: 'fa-music', color: '#ec8a2f', title: 'Music Fan' },
  bd_film:   { icon: 'fa-film', color: '#94a3b8', title: 'Cinephile' },
  bd_heart:  { icon: 'fa-heart', color: '#f43f5e', title: 'Heart' },
  bd_camera: { icon: 'fa-video', color: '#38bdf8', title: 'Creator' },
  bd_bolt:   { icon: 'fa-bolt', color: '#facc15', title: 'Bolt' },
  bd_flame:  { icon: 'fa-fire-flame-curved', color: '#f97316', title: 'Flame' },
  bd_ghost:  { icon: 'fa-ghost', color: '#a3e635', title: 'Ghost' },
  bd_rocket: { icon: 'fa-rocket', color: '#22d3ee', title: 'Rocket' },
  bd_star:   { icon: 'fa-star', color: '#a855f7', title: 'Star' },
  bd_gem:    { icon: 'fa-gem', color: '#7dd3fc', title: 'Gem' },
  bd_dragon: { icon: 'fa-dragon', color: '#ef4444', title: 'Dragon' },
  bd_crown:  { icon: 'fa-crown', color: '#f59e0b', title: 'Crown' },
};
const NX_RARITY_L = { common: { de: 'Gewöhnlich', en: 'Common' }, rare: { de: 'Selten', en: 'Rare' }, epic: { de: 'Episch', en: 'Epic' }, legendary: { de: 'Legendär', en: 'Legendary' } };
const NX_TYPE_L = { frame: { de: 'Profilrahmen', en: 'Profile frame' }, name: { de: 'Namensstil', en: 'Name style' }, sticker: { de: 'Sticker', en: 'Sticker' }, badge: { de: 'Abzeichen', en: 'Badge' }, bubble: { de: 'Kommentar-Stil', en: 'Comment style' }, bundle: { de: 'Bundle', en: 'Bundle' } };
const NX_RARITY_COLOR = { common: '#8b95a7', rare: '#3b82f6', epic: '#9b5de5', legendary: '#e0a200' };

function nxStickerHtml(id, size) {
  const s = NX_STICKERS[id];
  if (!s) return '';
  const lg = size === 'lg' ? ' is-lg' : size === 'sm' ? ' is-sm' : '';
  if (s.img) return `<img class="nx-sticker-img${lg}" src="/assets/stickers/${s.img}.webp" alt="" loading="lazy" draggable="false">`;
  return `<span class="nx-sticker ${s.cls || 'st-text'}${lg}" style="--c:${s.color};--c2:${s.c2 || s.color}">${s.icon ? `<i class="fas ${s.icon}"></i>` : ''}${s.label ? `<b>${escHtml(s.label)}</b>` : ''}</span>`;
}
// Text-Sticker so weit verkleinern, dass sie samt weißem Rand komplett in ihre Kachel passen
// (Shop-Karten, Bundle-Collage, Sticker-Auswahl). Läuft automatisch bei jedem Neu-Rendern.
function nxFitStickers(root) {
  (root || document).querySelectorAll('.si-prev--sticker .nx-sticker, .sb-art-cell .nx-sticker, .stp-art .nx-sticker').forEach(el => {
    const box = el.closest('.sb-art-cell') || el.closest('.si-prev') || el.parentElement;
    if (!box || !box.clientWidth) return;
    const cs = getComputedStyle(box);
    const availW = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const availH = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const es = getComputedStyle(el);
    // Breite inkl. Außenabstand + weißem Rand (box-shadow ~6px) + etwas Luft für die Schräglage
    const needW = el.offsetWidth + parseFloat(es.marginLeft) + parseFloat(es.marginRight) + 16;
    const needH = el.offsetHeight + parseFloat(es.marginTop) + parseFloat(es.marginBottom) + 16;
    let f = Math.min(1, availW / needW, availH > 20 ? availH / needH : 1);
    f = Math.max(0.35, Math.floor(f * 100) / 100);
    if (f < 1) el.style.setProperty('--nx-fit', f); else el.style.removeProperty('--nx-fit');
  });
}
(function () {
  let raf = 0;
  const run = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => nxFitStickers()); };
  const start = () => {
    run();
    new MutationObserver(muts => { if (muts.some(m => m.addedNodes.length)) run(); }).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', run);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
function nxBadgeHtml(id) {
  const b = NX_BADGES[id];
  return b ? `<i class="fas ${b.icon} nx-badge" style="--c:${b.color}" title="${escHtml(b.title)}"></i>` : '';
}
// Name mit gekauftem Namensstil + Abzeichen (für Kommentare, Kanal, Chat …)
function nxNameHtml(user, fallback) {
  const name = escHtml(user?.displayName || user?.username || fallback || t('label_anonymous'));
  const c = user?.cosmetics || {};
  return `<span class="nx-name${c.nameStyle ? ' ' + c.nameStyle.replace(/_/g, '-') : ''}" data-text="${name}">${name}</span>${c.badge ? nxBadgeHtml(c.badge) : ''}`;
}
function nxBubbleClass(user) { const b = user?.cosmetics?.bubble; return b ? ' nx-bubble ' + b.replace(/_/g, '-') : ''; }

/* ---------- Kleine Helfer ---------- */
const _eur = n => (Number(n) || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
function _nxModal(id, html, opts = {}) {
  document.getElementById(id)?.remove();
  const ov = document.createElement('div');
  ov.id = id; ov.className = 'nxm-overlay';
  ov.innerHTML = `<div class="nxm ${opts.wide ? 'nxm--wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  ov.addEventListener('pointerdown', e => { if (e.target === ov) _nxCloseModal(id); });
  document.body.appendChild(ov);
  document.body.classList.add('nxm-open');
  requestAnimationFrame(() => ov.classList.add('is-open'));
  const onKey = e => { if (e.key === 'Escape') { _nxCloseModal(id); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);
  return ov;
}
function _nxCloseModal(id) {
  const ov = document.getElementById(id);
  if (!ov) return;
  ov.classList.remove('is-open');
  setTimeout(() => { ov.remove(); if (!document.querySelector('.nxm-overlay')) document.body.classList.remove('nxm-open'); }, 180);
}
async function _nxRefreshMe() {
  try { const me = await apiGet('/api/auth/me'); currentUser = me; localStorage.setItem('nxd_user', JSON.stringify(me)); if (typeof renderAuthSection === 'function') renderAuthSection(); } catch {}
}

/* =====================================================================
   BEZAHLFENSTER
   ===================================================================== */
const _NX_CHECKOUT = { ctx: null, cfg: null, quote: null };

// Kompatibel zur alten Signatur aus app.js
function _openPaymentModal(type, videoId, videoTitle, amount, planKey) {
  if (type === 'premium_promo') type = 'premium';
  return openCheckout({ type, videoId, videoTitle, amount, adBudget: type === 'ad' ? amount : undefined, plan: planKey || window._selectedPremiumPlan, clickUrl: window.__adClickUrl || null });
}
function purchaseVideo(videoId, price, title) {
  if (!currentUser) { openAuthModal('login'); return; }
  openCheckout({ type: 'video', videoId, videoTitle: title || '', amount: price });
}
function openTopupCheckout(amount) { openCheckout({ type: 'balance', amount }); }

function _checkoutTitle(ctx) {
  const plans = window._premiumPlans || [];
  const plan = plans.find(p => p.key === ctx.plan);
  return {
    premium: [tr({ en: 'Norynex Premium', de: 'Norynex Premium' }), plan ? _premiumPlanLabel(plan.months) : '', 'fa-crown'],
    balance: [tr({ en: 'Top up balance', de: 'Guthaben aufladen' }), tr({ en: 'Credited instantly', de: 'Wird sofort gutgeschrieben' }), 'fa-wallet'],
    video: [tr({ en: 'Unlock video', de: 'Video freischalten' }), ctx.videoTitle || '', 'fa-lock-open'],
    ad: [tr({ en: 'Promote video', de: 'Video bewerben' }), `${Number(ctx.views || 0).toLocaleString('de-DE')} ${tr({ en: 'views', de: 'Aufrufe' })}${ctx.videoTitle ? ' · ' + ctx.videoTitle : ''}`, 'fa-bullhorn'],
    live_sub: [tr({ en: 'Live subscription', de: 'Live-Abo' }) + (ctx.channelName ? ' · ' + ctx.channelName : ''), `${tr({ en: 'Tier', de: 'Stufe' })} ${ctx.tier || 1} · ${ctx.months || 1} ${(ctx.months || 1) > 1 ? tr({ en: 'months', de: 'Monate' }) : tr({ en: 'month', de: 'Monat' })}${ctx.autoRenew ? ' · ' + tr({ en: 'renews automatically', de: 'verlängert sich automatisch' }) : ''}`, 'fa-star'],
    live_gift_sub: [tr({ en: 'Gift live subs', de: 'Live-Abos verschenken' }) + (ctx.channelName ? ' · ' + ctx.channelName : ''), ctx.recipientName ? `${tr({ en: 'for', de: 'für' })} ${ctx.recipientName}` : `${ctx.count || 1}× ${tr({ en: 'to the community', de: 'an die Community' })}`, 'fa-gift'],
    live_gift: [tr({ en: 'Live gift', de: 'Live-Geschenk' }) + (ctx.channelName ? ' · ' + ctx.channelName : ''), ctx.giftName ? `${ctx.quantity || 1}× ${ctx.giftName}` : '', 'fa-gift'],
    shop_item: [ctx.itemName || tr({ en: 'Shop item', de: 'Shop-Artikel' }), tr({ en: 'Delivered instantly to your inventory', de: 'Sofort in deinem Inventar' }), 'fa-bag-shopping'],
    shop_bundle: [ctx.bundleName || tr({ en: 'Shop bundle', de: 'Shop-Paket' }), tr({ en: 'Delivered instantly to your inventory', de: 'Sofort in deinem Inventar' }), 'fa-box-open'],
  }[ctx.type] || ['Norynex', '', 'fa-bag-shopping'];
}

async function openCheckout(ctx) {
  if (!currentUser) { openAuthModal('login'); return; }
  ctx = { ...ctx };
  if (ctx.type === 'premium') ctx.plan = ctx.plan || window._selectedPremiumPlan || 'monthly';
  _NX_CHECKOUT.ctx = ctx; _NX_CHECKOUT.creatorCode = null;
  const [title, sub, icon] = _checkoutTitle(ctx);
  _nxModal('nx-checkout', `
    <div class="nxm-head">
      <div class="nxm-head-ico"><i class="fas ${icon}"></i></div>
      <div class="nxm-head-text"><h3>${escHtml(title)}</h3>${sub ? `<p>${escHtml(sub)}</p>` : ''}</div>
      <button class="nxm-x" data-h-click="h_shop_pro__nxCloseModal_174" aria-label="${tr({ en: 'Close', de: 'Schließen' })}"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="nxm-body">
      <div class="co-total"><span>${tr({ en: 'Total', de: 'Gesamt' })}</span><b id="co-amount">…</b></div>
      <div id="co-note" class="co-note"></div>
      ${_CO_CC_TYPES.includes(ctx.type) ? `<div class="co-cc" id="co-cc-box"></div>` : ''}
      <div class="co-sec-label">${tr({ en: 'Payment method', de: 'Zahlungsart' })}</div>
      <div class="co-methods" id="co-methods" role="radiogroup"><div class="co-loading"><i class="fas fa-spinner fa-spin"></i></div></div>
      <label class="co-consent">
        <input type="checkbox" id="co-consent">
        <span>${ctx.type === 'live_sub' && ctx.autoRenew
          ? tr({ en: 'I want to subscribe with automatic renewal. After the first period it renews every 30 days at the monthly price of the tier until I cancel it; I can cancel at any time effective at the end of the current period (Settings → Subscriptions). I request immediate start and know that my right of withdrawal expires once the service is fully provided; on earlier withdrawal I pay for the part already used.', de: 'Ich möchte ein Abo mit automatischer Verlängerung abschließen. Nach der ersten Laufzeit verlängert es sich jeweils um 30 Tage zum Monatspreis der Stufe, bis ich kündige; ich kann jederzeit zum Ende des laufenden Zeitraums kündigen (Einstellungen → Abos). Ich verlange den sofortigen Beginn und weiß, dass ich bei einem Widerruf den bis dahin genutzten Anteil bezahle (§ 357a BGB).' })
          : ['live_sub', 'live_gift_sub'].includes(ctx.type)
          ? tr({ en: 'I request that the subscription starts immediately. It ends automatically after the chosen period, without renewal. I know that if I withdraw, I pay for the part already used.', de: 'Ich verlange, dass das Abo sofort beginnt. Es endet automatisch nach dem gewählten Zeitraum, ohne Verlängerung. Mir ist bekannt, dass ich bei einem Widerruf den bis dahin genutzten Anteil bezahle.' })
          : ctx.type === 'premium'
          ? tr({ en: 'I request that Norynex starts the service immediately. I know that if I withdraw, I pay for the part already used.', de: 'Ich verlange, dass Norynex sofort mit der Leistung beginnt. Mir ist bekannt, dass ich bei einem Widerruf den bis dahin genutzten Anteil bezahle.' })
          : ctx.type === 'balance'
            ? tr({ en: 'I agree that my balance is credited immediately.', de: 'Ich bin einverstanden, dass mein Guthaben sofort gutgeschrieben wird.' })
            : tr({ en: 'I agree that Norynex starts immediately and I know that I thereby lose my right of withdrawal.', de: 'Ich stimme zu, dass Norynex sofort mit der Ausführung beginnt, und weiß, dass ich dadurch mein Widerrufsrecht verliere.' })}
          <a href="/agb#widerruf" target="_blank" rel="noopener">${tr({ en: 'Withdrawal policy', de: 'Widerrufsbelehrung' })}</a></span>
      </label>
      <button class="co-btn co-btn--primary co-btn--block co-pay" id="co-pay" data-h-click="h_shop_pro__coPay_194" disabled>
        <i class="fas fa-lock"></i> <span id="co-pay-label">${tr({ en: 'Buy now', de: 'Zahlungspflichtig bestellen' })}</span>
      </button>
      <p class="co-legal">${tr({ en: 'Final price incl. all fees. Small business under § 19 UStG – no VAT is charged. By ordering you accept the', de: 'Endpreis inkl. aller Gebühren. Gemäß § 19 UStG wird keine Umsatzsteuer berechnet. Mit der Bestellung akzeptierst du die' })} <a href="/agb" target="_blank" rel="noopener">${tr({ en: 'terms', de: 'AGB' })}</a> ${tr({ en: 'and the', de: 'und die' })} <a href="/datenschutz" target="_blank" rel="noopener">${tr({ en: 'privacy policy', de: 'Datenschutzerklärung' })}</a>.</p>
    </div>`);
  try { _NX_CHECKOUT.cfg = await apiGet('/api/payment/config'); } catch { _NX_CHECKOUT.cfg = {}; }
  await _coRefreshQuote();
  _coRenderMethods();
  document.getElementById('co-consent')?.addEventListener('change', _coSyncPay);
}

function _coBody() {
  const c = _NX_CHECKOUT.ctx;
  return { type: c.type, plan: c.plan, videoId: c.videoId, amount: c.amount, adPackage: c.adPackage, creatorCode: _NX_CHECKOUT.creatorCode, clickUrl: c.clickUrl,
    channelId: c.channelId, tier: c.tier, months: c.months, autoRenew: !!c.autoRenew, count: c.count, recipient: c.recipient, giftId: c.giftId, quantity: c.quantity, message: c.message,
    itemId: c.itemId, bundleId: c.bundleId };
}
const _coIsSubRenew = () => { const c = _NX_CHECKOUT.ctx || {}; return c.type === 'live_sub' && !!c.autoRenew; };
async function _coRefreshQuote() {
  const amt = document.getElementById('co-amount');
  try {
    const q = await apiPost('/api/payment/quote', _coBody());
    _NX_CHECKOUT.quote = q;
    if (amt) amt.textContent = _eur(q.amount);
    const note = document.getElementById('co-note');
    if (note) note.innerHTML = '';
    _coRenderCC(false);
  } catch (e) {
    if (amt) amt.textContent = '–';
    const note = document.getElementById('co-note');
    if (note) note.innerHTML = `<span class="co-err"><i class="fas fa-circle-exclamation"></i> ${escHtml(e.message)}</span>`;
    _NX_CHECKOUT.quote = null;
  }
}
// Creator-Code („Creator unterstützen“): gilt für alle Käufe, bleibt 14 Tage beim Nutzer gespeichert
const _CO_CC_TYPES = ['premium', 'video', 'live_sub', 'live_gift_sub', 'live_gift', 'shop_item', 'shop_bundle'];
function _coRenderCC(editing) {
  const box = document.getElementById('co-cc-box'); if (!box) return;
  const q = _NX_CHECKOUT.quote, info = q && q.creatorCodeInfo;
  if (info && !editing) {
    box.innerHTML = `<div class="co-cc-on"><i class="fas fa-heart"></i><div><small>${tr({ en: 'You support', de: 'Du unterstützt' })}</small><b>${escHtml(info.creatorName)}</b><span>${tr({ en: 'Code', de: 'Code' })} ${escHtml(info.code)}${info.discountPercent ? ` · −${info.discountPercent}%` : ''}</span></div>
      <button type="button" class="co-inline-link" data-h-click="h_shop_pro__coRenderCC_236">${tr({ en: 'Change', de: 'Ändern' })}</button><button type="button" class="co-inline-link" data-h-click="h_shop_pro__coRemoveCode_237">${tr({ en: 'Remove', de: 'Entfernen' })}</button></div>`;
    return;
  }
  box.innerHTML = `<details class="co-code" ${editing ? 'open' : ''}><summary><i class="fas fa-heart"></i> ${tr({ en: 'Support a creator (creator code)', de: 'Creator unterstützen (Creator-Code)' })}<i class="fas fa-chevron-down co-chev"></i></summary>
    <div class="co-code-row"><input id="co-code-input" maxlength="20" placeholder="${tr({ en: 'Code', de: 'Code' })}" autocomplete="off" data-h-input="h_shop_pro_toUpperCase_241" data-h-keydown="h_shop_pro_if_241">
    <button type="button" class="co-btn co-btn--sec" data-h-click="h_shop_pro__coApplyCode_241">${tr({ en: 'Apply', de: 'Anwenden' })}</button></div>
    <div id="co-code-msg" class="co-msg"></div>
    <p class="co-cc-hint">${tr({ en: 'The creator gets a share of this and your other purchases for 14 days – at no extra cost for you.', de: 'Der Creator bekommt 14 Tage lang einen Anteil an diesem und deinen weiteren Käufen – ohne Mehrkosten für dich.' })}</p></details>`;
  if (editing) setTimeout(() => document.getElementById('co-code-input')?.focus(), 30);
}
async function _coApplyCode() {
  const inp = document.getElementById('co-code-input'), msg = document.getElementById('co-code-msg');
  const code = (inp?.value || '').trim();
  if (!code) return;
  try {
    await apiPost('/api/creator-codes/support', { code });
    _NX_CHECKOUT.creatorCode = null;
    await _coRefreshQuote(); _coRenderMethods(); _coSyncPay();
    if (typeof nxRenderSupportCard === 'function') nxRenderSupportCard();
  } catch (e) { if (msg) { msg.className = 'co-msg is-err'; msg.textContent = e.message || tr({ en: 'Invalid code', de: 'Ungültiger Code' }); } }
}
async function _coRemoveCode() {
  try { await fetch('/api/creator-codes/support', { method: 'DELETE', headers: { Authorization: 'Bearer ' + (localStorage.getItem('nxd_token') || '') } }); } catch {}
  await _coRefreshQuote(); _coRenderMethods(); _coSyncPay();
  if (typeof nxRenderSupportCard === 'function') nxRenderSupportCard();
}
// Zahlungsarten (v1.72): Kreditkarte, Apple Pay, Google Pay, SEPA (über Mollie),
// paysafecard und Norynex-Guthaben. PayPal und Klarna werden nicht mehr angeboten.
const _CO_METHODS = [
  { id: 'card', logo: '<i class="fas fa-credit-card"></i>', cls: 'co-card', de: ['Kreditkarte', 'Visa, Mastercard, Amex'], en: ['Credit card', 'Visa, Mastercard, Amex'] },
  { id: 'applepay', logo: '<i class="fab fa-apple"></i>', cls: 'co-apple', de: ['Apple Pay', 'iPhone, iPad, Mac mit Safari'], en: ['Apple Pay', 'iPhone, iPad, Mac with Safari'] },
  { id: 'googlepay', logo: '<i class="fab fa-google"></i>', cls: 'co-google', de: ['Google Pay', 'Android & Chrome'], en: ['Google Pay', 'Android & Chrome'] },
  { id: 'sepa', logo: '<i class="fas fa-building-columns"></i>', cls: 'co-sepa', de: ['SEPA-Überweisung', 'Gutschrift nach Zahlungseingang (1–2 Werktage)'], en: ['SEPA bank transfer', 'Credited after receipt (1–2 business days)'] },
  { id: 'paysafecard', logo: 'paysafe<br>card', cls: 'co-psc', de: ['paysafecard', 'Mit deinem 16-stelligen PIN bezahlen'], en: ['paysafecard', 'Pay with your 16-digit PIN'] },
  { id: 'balance', logo: '<i class="fas fa-wallet"></i>', cls: 'co-bal', de: ['Norynex-Guthaben', ''], en: ['Norynex balance', ''] },
];
function _coRenderMethods() {
  const box = document.getElementById('co-methods');
  if (!box) return;
  const cfg = _NX_CHECKOUT.cfg || {}, q = _NX_CHECKOUT.quote, ctx = _NX_CHECKOUT.ctx;
  const avail = cfg.methods || {};
  const bal = q ? q.balance : (currentUser?.balance || 0);
  const need = q ? q.amount : 0;
  const isApple = /iPhone|iPad|Macintosh/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|Edg/.test(navigator.userAgent);
  const rows = _CO_METHODS.filter(m => !(m.id === 'balance' && ctx.type === 'balance')).map(m => {
    const L = _nxDe() ? m.de : m.en;
    let sub = L[1], on = !!avail[m.id], note = '';
    if (m.id === 'balance') {
      const enough = bal + 0.0001 >= need;
      on = enough;
      sub = `${tr({ en: 'Available', de: 'Verfügbar' })}: ${_eur(bal)}`;
      if (!enough) note = `<button type="button" class="co-inline-link" data-h-click="h_shop_pro_stopPropagation_288">${tr({ en: 'Top up', de: 'Aufladen' })}</button>`;
    } else if (!on) sub = tr({ en: 'Currently unavailable', de: 'Derzeit nicht verfügbar' });
    if (m.id === 'applepay' && on && !isApple) sub = tr({ en: 'Only on Apple devices with Safari', de: 'Nur auf Apple-Geräten mit Safari' });
    return `<button type="button" role="radio" aria-checked="false" class="co-method" data-m="${m.id}" ${on ? '' : 'disabled'} data-h-click="h_shop_pro__coPick_291" data-hv-click="${nxHv(String(m.id))}">
      <span class="co-method-logo ${m.cls}">${m.logo}</span>
      <span class="co-method-main"><b>${L[0]}</b><small>${sub}</small></span>
      ${note}<span class="co-radio"></span></button>`;
  });
  box.innerHTML = rows.join('');
  document.getElementById('co-renew-note')?.remove();
  if (_coIsSubRenew()) box.insertAdjacentHTML('afterend', `<div class="co-unavail" id="co-renew-note"><i class="fas fa-rotate"></i> ${tr({ en: 'Automatic renewal works with credit card, Apple Pay, Google Pay and Norynex balance. With SEPA transfer or paysafecard the subscription runs for the chosen period and does not renew automatically.', de: 'Automatische Verlängerung klappt mit Kreditkarte, Apple Pay, Google Pay und Norynex-Guthaben. Mit SEPA-Überweisung oder paysafecard läuft das Abo für den gewählten Zeitraum und verlängert sich nicht automatisch.' })}</div>`);
  // Sinnvolle Vorauswahl: Guthaben (falls genug), sonst Apple Pay auf Apple-Geräten, sonst Karte
  const first = (avail.balance !== false && ctx.type !== 'balance' && bal + 0.0001 >= need && need > 0) ? 'balance'
    : (isApple && avail.applepay) ? 'applepay' : avail.card ? 'card' : (avail.paysafecard ? 'paysafecard' : null);
  if (first) _coPick(first);
  if (!Object.keys(avail).some(k => k !== 'balance' && avail[k]) && ctx.type === 'balance') {
    box.insertAdjacentHTML('afterend', `<div class="co-unavail" id="co-unavail"><i class="fas fa-circle-info"></i> ${tr({ en: 'Online payments are not set up on this server yet.', de: 'Online-Zahlungen sind auf diesem Server noch nicht eingerichtet.' })}</div>`);
  }
}
function _coPick(id) {
  _NX_CHECKOUT.method = id;
  document.querySelectorAll('#co-methods .co-method').forEach(b => { const on = b.dataset.m === id; b.classList.toggle('is-selected', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); });
  _coSyncPay();
}
function _coSyncPay() {
  const btn = document.getElementById('co-pay'), lbl = document.getElementById('co-pay-label');
  if (!btn) return;
  const ok = !!_NX_CHECKOUT.method && !!_NX_CHECKOUT.quote && !!document.getElementById('co-consent')?.checked;
  btn.disabled = !ok;
  if (lbl && _NX_CHECKOUT.quote) {
    const rec = _coIsSubRenew() && ['card', 'applepay', 'googlepay', 'balance'].includes(_NX_CHECKOUT.method);
    lbl.textContent = rec ? `${tr({ en: 'Subscribe (payment required)', de: 'Zahlungspflichtig abonnieren' })} · ${_eur(_NX_CHECKOUT.quote.amount)}` : `${tr({ en: 'Buy now', de: 'Zahlungspflichtig bestellen' })} · ${_eur(_NX_CHECKOUT.quote.amount)}`;
  }
}
async function _coPay() {
  const m = _NX_CHECKOUT.method, btn = document.getElementById('co-pay');
  if (!m || !btn) return;
  if (!document.getElementById('co-consent')?.checked) { showToast(tr({ en: 'Please confirm the notice above.', de: 'Bitte bestätige den Hinweis oben.' }), 'error'); return; }
  btn.disabled = true;
  const lbl = document.getElementById('co-pay-label');
  const prev = lbl ? lbl.textContent : '';
  if (lbl) lbl.textContent = m === 'balance' ? tr({ en: 'Processing…', de: 'Wird verarbeitet …' }) : tr({ en: 'Redirecting to secure payment…', de: 'Weiterleitung zur sicheren Zahlung …' });
  try {
    if (m === 'balance') return await _coPayBalance(btn);
    const cfg = _NX_CHECKOUT.cfg || {};
    let r;
    if (m === 'paysafecard' && cfg.paysafecardDirect) r = await apiPost('/api/payment/paysafecard/create', _coBody());
    else r = await apiPost('/api/payment/mollie/create', { ..._coBody(), method: m });
    try { sessionStorage.setItem('nx_pending_intent', r.intentId || ''); sessionStorage.setItem('nx_pending_ctx', JSON.stringify(_NX_CHECKOUT.ctx || {})); } catch {}
    location.href = r.redirectUrl;
  } catch (e) {
    showToast(e.message, 'error');
    btn.disabled = false; if (lbl) lbl.textContent = prev;
  }
}

async function _coPayBalance(btn) {
  btn.disabled = true;
  const body = _coBody();
  try {
    const r = await apiPost('/api/balance/pay', body);
    if (currentUser) currentUser.balance = r.balance;
    await _coSuccess(body.type);
  } catch (e) { showToast(e.message, 'error'); btn.disabled = false; }
}
async function _coSuccess(type) {
  const ctx = _NX_CHECKOUT.ctx || {};
  _nxCloseModal('nx-checkout');
  await _nxRefreshMe();
  if (type === 'premium') { showToast(tr({ en: 'Premium is active. Enjoy!', de: 'Premium ist aktiv. Viel Spaß!' }), 'success'); if (currentPage === 'premium') renderPremiumPage(); }
  else if (type === 'balance') { showToast(tr({ en: 'Balance topped up', de: 'Guthaben aufgeladen' }), 'success'); if (currentPage === 'shop') renderShopPage(window._shopTab); }
  else if (type === 'video') { showToast(tr({ en: 'Video unlocked', de: 'Video freigeschaltet' }), 'success'); navigateTo('watch', ctx.videoId); }
  else if (type === 'ad') { document.getElementById('promote-modal-overlay')?.remove(); showToast(tr({ en: 'Ad booked – it goes live after a short review.', de: 'Werbung gebucht – sie startet nach einer kurzen Prüfung.' }), 'success'); if (typeof nxLoadCampaigns === 'function') nxLoadCampaigns(); }
  else if (['live_sub', 'live_gift_sub', 'live_gift'].includes(type)) {
    ['lv-sub-modal', 'lv-gift-modal', 'lv-giftsub-modal'].forEach(id => { try { _nxCloseModal(id); } catch {} });
    showToast(type === 'live_sub' ? tr({ en: 'Thanks for subscribing! Confirmation sent by email.', de: 'Danke fürs Abonnieren! Die Bestätigung kommt per E-Mail.' }) : type === 'live_gift_sub' ? tr({ en: 'Subs gifted – thank you!', de: 'Abos verschenkt – danke!' }) : tr({ en: 'Gift sent!', de: 'Geschenk gesendet!' }), 'success');
    if (typeof window.lvReloadInfo === 'function') window.lvReloadInfo();
  }
  else if (type === 'shop_item' || type === 'shop_bundle') { showToast(tr({ en: 'Purchased – it is now in your inventory.', de: 'Gekauft – liegt jetzt in deinem Inventar.' }), 'success'); if (currentPage === 'shop' && typeof renderShopPage === 'function') renderShopPage(window._shopTab); }
}

// Rückkehr von paysafecard (Server leitet auf #payment-result?… weiter)
function _nxHandlePaymentReturn() {
  const h = location.hash;
  if (!h.startsWith('#payment-result')) return;
  const p = new URLSearchParams(h.split('?')[1] || '');
  history.replaceState(null, '', '#home');
  const st = p.get('status'), type = p.get('type');
  if (st === 'success') {
    _nxRefreshMe().then(() => {
      showToast(type === 'balance' ? tr({ en: 'Balance topped up', de: 'Guthaben aufgeladen' }) : type === 'premium' ? tr({ en: 'Premium is active', de: 'Premium ist aktiv' }) : tr({ en: 'Payment successful', de: 'Zahlung erfolgreich' }), 'success');
      let pc = {}; try { pc = JSON.parse(sessionStorage.getItem('nx_pending_ctx') || '{}'); } catch {}
      if (type === 'ad') { history.replaceState(null, '', '#studio/ads'); navigateTo('studio'); }
      else if (/^live_/.test(type || '')) { showToast(type === 'live_sub' ? tr({ en: 'Subscription active – confirmation sent by email.', de: 'Abo aktiv – die Bestätigung kommt per E-Mail.' }) : tr({ en: 'Thank you!', de: 'Danke!' }), 'success'); if (pc.channelId) navigateTo('stream', pc.channelId); }
      else if (/^shop_/.test(type || '')) navigateTo('shop', 'inventory');
      else navigateTo(type === 'premium' ? 'premium' : 'shop', type === 'balance' ? 'wallet' : undefined);
    });
  } else if (st === 'pending') {
    const isSepa = p.get('method') === 'sepa';
    _nxModal('nx-pay-pending', `<div class="nx-strike"><div class="nx-strike-ico" style="color:#3b82f6;background:rgba(59,130,246,.14);border-color:rgba(59,130,246,.35)"><i class="fas ${isSepa ? 'fa-building-columns' : 'fa-hourglass-half'}"></i></div>
      <h3>${isSepa ? tr({ en: 'Almost done – please transfer the amount', de: 'Fast geschafft – bitte überweise den Betrag' }) : tr({ en: 'Payment is being checked', de: 'Zahlung wird geprüft' })}</h3>
      <p style="color:var(--text-secondary);font-size:14px;line-height:1.55;margin:0 0 16px">${isSepa ? tr({ en: 'You will receive the bank details by email from our payment provider Mollie. As soon as the money arrives (usually 1–2 business days), your purchase is activated automatically and you get a confirmation.', de: 'Die Bankverbindung bekommst du per E-Mail von unserem Zahlungsdienstleister Mollie. Sobald das Geld eingegangen ist (meist 1–2 Werktage), wird dein Kauf automatisch freigeschaltet und du bekommst eine Bestätigung.' }) : tr({ en: 'This usually only takes a moment. Your purchase is activated automatically once the payment is confirmed.', de: 'Das dauert meist nur einen Moment. Dein Kauf wird automatisch freigeschaltet, sobald die Zahlung bestätigt ist.' })}</p>
      <button class="co-btn co-btn--primary co-btn--block" data-h-click="h_shop_pro__nxCloseModal_389">OK</button></div>`);
    let intentId = null; try { intentId = sessionStorage.getItem('nx_pending_intent'); } catch {}
    if (intentId && !isSepa) {
      let n = 0;
      const poll = async () => {
        try { const r = await apiGet('/api/payment/mollie/status/' + intentId); if (r.status === 'paid') { _nxCloseModal('nx-pay-pending'); await _nxRefreshMe(); showToast(tr({ en: 'Payment successful', de: 'Zahlung erfolgreich' }), 'success'); return; } } catch {}
        if (++n < 20) setTimeout(poll, 3000);
      };
      setTimeout(poll, 2000);
    }
  } else if (st === 'cancelled') showToast(tr({ en: 'Payment cancelled', de: 'Zahlung abgebrochen' }), 'info');
  else showToast(tr({ en: 'Payment failed', de: 'Zahlung fehlgeschlagen' }) + (p.get('msg') ? ': ' + p.get('msg') : ''), 'error');
}
setTimeout(_nxHandlePaymentReturn, 1200);

/* =====================================================================
   GUTHABEN AUFLADEN
   ===================================================================== */
function openTopup() {
  if (!currentUser) { openAuthModal('login'); return; }
  const packs = [5, 10, 20, 50, 100];
  _nxModal('nx-topup', `
    <div class="nxm-head">
      <div class="nxm-head-ico"><i class="fas fa-wallet"></i></div>
      <div class="nxm-head-text"><h3>${tr({ en: 'Top up balance', de: 'Guthaben aufladen' })}</h3><p>${tr({ en: 'Current balance', de: 'Aktuelles Guthaben' })}: ${_eur(currentUser.balance || 0)}</p></div>
      <button class="nxm-x" data-h-click="h_shop_pro__nxCloseModal_414" aria-label="Schließen"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="nxm-body">
      <div class="tp-packs">${packs.map((p, i) => `<button class="tp-pack ${i === 1 ? 'is-selected' : ''}" data-v="${p}" data-h-click="h_shop_pro__tpPick_418" data-hv-click="${nxHv(String(p))}"><b>${p} €</b></button>`).join('')}</div>
      <label class="tp-custom"><span>${tr({ en: 'Custom amount', de: 'Eigener Betrag' })}</span>
        <div class="tp-custom-row"><input id="tp-amount" type="number" inputmode="decimal" min="5" max="100" step="1" value="10" data-h-input="h_shop_pro__tpSync_419"><em>€</em></div>
        <small>${tr({ en: 'Between 5 € and 100 €', de: 'Zwischen 5 € und 100 €' })}</small>
      </label>
      <button class="co-btn co-btn--primary co-btn--block" id="tp-go" data-h-click="h_shop_pro__tpContinue_421">${tr({ en: 'Continue', de: 'Weiter' })} · 10,00 €</button>
      <div class="tp-redeem">
        <span>${tr({ en: 'Have a gift code?', de: 'Gutscheincode?' })}</span>
        <div class="co-code-row"><input id="tp-code" placeholder="XXXXX-XXXXX" autocomplete="off" data-h-input="h_shop_pro_toUpperCase_425"><button class="co-btn co-btn--sec" data-h-click="h_shop_pro__tpRedeem_425">${tr({ en: 'Redeem', de: 'Einlösen' })}</button></div>
      </div>
    </div>`);
}
function _tpPick(v) { const i = document.getElementById('tp-amount'); if (i) { i.value = v; _tpSync(); } }
function _tpSync() {
  const v = parseFloat(document.getElementById('tp-amount')?.value);
  document.querySelectorAll('.tp-pack').forEach(b => b.classList.toggle('is-selected', +b.dataset.v === v));
  const ok = v >= 5 && v <= 100;
  const go = document.getElementById('tp-go');
  if (go) { go.disabled = !ok; go.textContent = `${tr({ en: 'Continue', de: 'Weiter' })} · ${ok ? _eur(v) : '–'}`; }
}
function _tpContinue() {
  const v = Math.round(parseFloat(document.getElementById('tp-amount').value) * 100) / 100;
  if (!(v >= 5 && v <= 100)) return showToast(tr({ en: 'Amount must be 5–100 €', de: 'Betrag muss zwischen 5 und 100 € liegen' }), 'error');
  _nxCloseModal('nx-topup');
  setTimeout(() => openCheckout({ type: 'balance', amount: v }), 200);
}
async function _tpRedeem() {
  const code = document.getElementById('tp-code')?.value.trim();
  if (!code) return;
  try {
    const r = await apiPost('/api/balance/redeem-code', { code });
    currentUser.balance = r.balance;
    showToast(`${_eur(r.credit)} ${tr({ en: 'added', de: 'gutgeschrieben' })}`, 'success');
    _nxCloseModal('nx-topup');
    if (currentPage === 'shop') renderShopPage(window._shopTab);
  } catch (e) { showToast(e.message, 'error'); }
}

/* =====================================================================
   ITEM-SHOP — ein großer Tages-Shop (wie Fortnite), Reset jeden Tag um Mitternacht
   ===================================================================== */
let _shopData = null, _shopTimer = null;
const _nm = x => (cl() === 'de' ? x.name : (x.nameEn || x.name));

function _shopPreview(item, big) {
  const u = currentUser || { displayName: 'Norynex', username: 'norynex' };
  if (item.type === 'name') return `<div class="si-prev si-prev--name"><span class="nx-name ${item.id.replace(/_/g, '-')}" data-text="${escHtml(u.displayName || u.username)}">${escHtml(u.displayName || u.username)}</span></div>`;
  if (item.type === 'sticker') return `<div class="si-prev si-prev--sticker">${nxStickerHtml(item.id, 'lg')}</div>`;
  if (item.type === 'badge') { const b = NX_BADGES[item.id]; return `<div class="si-prev si-prev--badge"><i class="fas ${b?.icon || 'fa-star'}" style="--c:${b?.color || '#fff'}"></i></div>`; }
  if (item.type === 'bubble') return `<div class="si-prev"><div class="si-bubble nx-bubble ${item.id.replace(/_/g, '-')}"><b>${escHtml(u.displayName || u.username)}</b><span>${tr({ en: 'Nice video!', de: 'Starkes Video!' })}</span></div></div>`;
  return '<div class="si-prev"></div>';
}
function _frameRing(item, size) {
  const known = (typeof SHOP_FRAMES !== 'undefined') && SHOP_FRAMES.find(f => f.id === item.id);
  if (known) item = { ...item, css: known.css, anim: known.anim };
  const u = currentUser || { displayName: 'N' };
  const pad = Math.max(3, Math.round(size * 0.07)), outer = size + pad * 2;
  const inner = u.avatar ? `<img src="${escHtml(u.avatar)}" alt="" style="width:100%;height:100%;object-fit:cover">` : `<span style="font-weight:800;font-size:${Math.round(size * .38)}px;color:var(--text-primary)">${escHtml(((u.displayName || u.username || '?')[0] || '?').toUpperCase())}</span>`;
  return `<div style="position:relative;width:${outer}px;height:${outer}px;border-radius:50%"><div style="position:absolute;inset:0;border-radius:50%;background:${item.css};animation:${item.anim || 'rotate 4s linear infinite'}"></div><div style="position:absolute;inset:${pad}px;border-radius:50%;overflow:hidden;background:var(--bg-secondary);display:grid;place-items:center">${inner}</div></div>`;
}
// ─── Teil: client/shop-pro/020-shop-pro.js ───
function _itemPreview(item, big) {
  if (item.type === 'frame') return `<div class="si-prev">${_frameRing(item, big ? 92 : 58)}</div>`;
  return _shopPreview(item, big);
}
function _xpFmt(n) { return Number(n || 0).toLocaleString('de-DE'); }
function _bpFmt(n) { return Number(n || 0).toLocaleString('de-DE'); }
function _priceHtml(item) {
  if (item.owned) return `<span class="si-owned"><i class="fas fa-check"></i> ${tr({ en: 'Owned', de: 'Im Besitz' })}</span>`;
  // Beta: Bug-Punkte statt Euro
  if (!nxPayOn()) return `<span class="si-price si-bp"><i class="fas fa-bug"></i>${_bpFmt(item.bp)}</span>${item.xp ? `<span class="si-xp"><i class="fas fa-bolt"></i>${_xpFmt(item.xp)}</span>` : ''}`;
  return `<span class="si-price">${item.onSale ? `<s>${_eur(item.basePrice)}</s>` : ''}${_eur(item.price)}</span>${item.xp ? `<span class="si-xp"><i class="fas fa-bolt"></i>${_xpFmt(item.xp)}</span>` : ''}`;
}
function _itemCard(item, size) {
  return `<button class="si ${size === 'lg' ? 'si--lg' : size === 'sm' ? 'si--sm' : ''} rar-${item.rarity} ${item.owned ? 'is-owned' : ''}" data-h-click="h_shop_pro_openShopItem_492" data-hv-click="${nxHv(String(item.id))}" style="--rc:${NX_RARITY_COLOR[item.rarity]}">
    <div class="si-top">
      ${item.isNew ? `<span class="si-flag si-flag--new">${tr({ en: 'NEW', de: 'NEU' })}</span>` : item.onSale ? `<span class="si-flag si-flag--sale">−${item.discount}%</span>` : ''}
      ${_itemPreview(item, size === 'lg')}
    </div>
    <div class="si-info">
      <div class="si-name">${escHtml(_nm(item))}</div>
      <div class="si-meta"><span class="si-rar">${escHtml(tr(NX_RARITY_L[item.rarity]))}</span><span>·</span><span>${escHtml(tr(NX_TYPE_L[item.type]))}</span></div>
      <div class="si-bottom">${_priceHtml(item)}</div>
    </div>
  </button>`;
}
// Collage für die große Bundle-Kachel
function _bundleArt(b, byId) {
  const parts = b.items.map(id => byId[id]).filter(Boolean);
  return `<div class="sb-art sb-art--${Math.min(parts.length, 5)}">${parts.map(i => `<div class="sb-art-cell">${_itemPreview(i, false)}</div>`).join('')}</div>`;
}
function _bundleCard(b, byId) {
  const saved = b.owned ? 0 : Math.round((1 - b.price / b.missingValue) * 100);
  return `<button class="sb ${b.owned ? 'is-owned' : ''}" style="--bc:${b.color}" data-h-click="h_shop_pro_openShopBundle_511" data-hv-click="${nxHv(String(b.id))}">
    ${b.isNew ? `<span class="si-flag si-flag--new">${tr({ en: 'NEW', de: 'NEU' })}</span>` : ''}
    ${_bundleArt(b, byId)}
    <div class="sb-info">
      <div class="sb-kicker"><i class="fas fa-layer-group"></i> Bundle · ${b.count} ${tr({ en: 'items', de: 'Items' })}</div>
      <div class="sb-name">${escHtml(_nm(b))}</div>
      <div class="sb-bottom">
        ${b.owned ? `<span class="si-owned"><i class="fas fa-check"></i> ${tr({ en: 'Owned', de: 'Im Besitz' })}</span>` :
          (!nxPayOn() ? `<span class="sb-price si-bp"><i class="fas fa-bug"></i>${_bpFmt(b.bp)}</span><span class="sb-save">−${Math.round((1 - (window.NX_FEATURES.bugPoints?.bundleFactor || 0.6)) * 100)}%</span>`
            : `<span class="sb-price"><s>${_eur(b.missingValue)}</s>${_eur(b.price)}</span><span class="sb-save">−${saved}%</span>`)}
      </div>
    </div>
  </button>`;
}

async function renderShopPage(param) {
  const el = document.getElementById('page-shop');
  if (!el) return;
  if (param === 'catalog') param = 'shop';
  let tab = ['wallet', 'inventory', 'shop'].includes(param) ? param : (window._shopTab === 'catalog' ? 'shop' : (window._shopTab || 'shop'));
  if (tab === 'wallet' && !nxPayOn()) tab = 'shop'; // Beta: kein Guthaben
  window._shopTab = tab;
  if (!_shopData || param === 'reload') el.innerHTML = `<div class="sh"><div class="ax-skel" style="height:120px;margin-bottom:14px"></div><div class="ax-skel" style="height:420px"></div></div>`;
  try {
    const [cat, wallet] = await Promise.all([apiGet('/api/shop/catalog'), currentUser ? apiGet('/api/wallet').catch(() => null) : Promise.resolve(null)]);
    _shopData = { ...cat, wallet };
  } catch (e) {
    el.innerHTML = `<div class="sh"><div class="ax-card ax-empty"><i class="fas fa-triangle-exclamation"></i>${escHtml(e.message)}</div></div>`;
    return;
  }
  const d = _shopData, me = d.me;
  const byId = Object.fromEntries(d.items.map(i => [i.id, i]));
  const featured = d.rotation.featured.map(id => byId[id]).filter(Boolean);
  const daily = d.rotation.daily.map(id => byId[id]).filter(Boolean);
  const dateLabel = new Date(d.rotation.day + 'T12:00:00').toLocaleDateString(cl() === 'de' ? 'de-DE' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  el.innerHTML = `
  <div class="sh">
    <header class="sh-hero">
      <div class="sh-hero-main">
        <span class="sh-hero-kicker"><i class="fas fa-store"></i> ${escHtml(dateLabel)}</span>
        <h1>${tr({ en: 'Item Shop', de: 'Item-Shop' })}</h1>
        <div class="sh-hero-timer"><i class="far fa-clock"></i> ${tr({ en: 'Shop resets in', de: 'Neuer Shop in' })} <b id="sh-countdown">${_tkCountdown(d.rotation.endsAt)}</b></div>
      </div>
      <div class="sh-wallet">
        ${me && !nxPayOn() ? `
          <button class="sh-chip sh-chip--bp" data-h-click="h_shop_pro_navigateTo_556" title="${tr({ en: 'Bug points', de: 'Bug-Punkte' })}"><i class="fas fa-bug"></i><b>${_bpFmt(me.bugPoints)} ${tr({ en: 'points', de: 'Punkte' })}</b></button>
          <button class="sh-chip" data-h-click="h_shop_pro_navigateTo_557" title="${tr({ en: 'Spendable XP', de: 'Ausgebbare XP' })}"><i class="fas fa-bolt"></i><b>${_xpFmt(me.xpAvailable)} XP</b></button>
          <button class="co-btn co-btn--primary" data-h-click="h_shop_pro_navigateTo_558"><i class="fas fa-bug"></i> ${tr({ en: 'Earn points', de: 'Punkte sammeln' })}</button>` :
          me ? `
          <button class="sh-chip" data-h-click="h_shop_pro_renderShopPage_560"><i class="fas fa-wallet"></i><b>${_eur(me.balance)}</b></button>
          <button class="sh-chip" data-h-click="h_shop_pro_navigateTo_561" title="${tr({ en: 'Spendable XP', de: 'Ausgebbare XP' })}"><i class="fas fa-bolt"></i><b>${_xpFmt(me.xpAvailable)} XP</b></button>
          <button class="co-btn co-btn--primary" data-h-click="h_shop_pro_openTopup_562"><i class="fas fa-plus"></i> ${tr({ en: 'Top up', de: 'Aufladen' })}</button>` :
          `<button class="co-btn co-btn--primary" data-h-click="h_shop_pro_openAuthModal_564">${t('login_btn')}</button>`}
      </div>
    </header>

    <div class="sh-tabs" role="tablist">
      ${[['shop', 'fa-store', tr({ en: 'Shop', de: 'Shop' })], ['inventory', 'fa-box-open', tr({ en: 'Locker', de: 'Spind' })], ['wallet', 'fa-wallet', tr({ en: 'Balance', de: 'Guthaben' })]]
        .filter(([k]) => k !== 'wallet' || nxPayOn())
        .map(([k, i, l]) => `<button class="${tab === k ? 'is-active' : ''}" data-h-click="h_shop_pro_renderShopPage_571" data-hv-click="${nxHv(String(k))}"><i class="fas ${i}"></i>${l}</button>`).join('')}
    </div>

    ${tab === 'shop' ? `
      ${d.bundles.length ? `<section class="sh-sec">
        <h2><i class="fas fa-layer-group"></i> ${tr({ en: 'Bundles', de: 'Bundles' })} <span class="sh-sub">${tr({ en: 'Every item is also sold on its own', de: 'Alles auch einzeln kaufbar' })}</span></h2>
        <div class="sh-bundles">${d.bundles.map(b => `
          <div class="sh-bundle-row" style="--bc:${b.color}">
            ${_bundleCard(b, byId)}
            <div class="sh-bundle-items">${b.items.map(id => byId[id]).filter(Boolean).map(i => _itemCard(i, 'sm')).join('')}</div>
          </div>`).join('')}
        </div>
      </section>` : ''}
      <section class="sh-sec"><h2><i class="fas fa-star"></i> ${tr({ en: 'Featured', de: 'Highlights' })}</h2><div class="sh-grid sh-grid--lg">${featured.map(i => _itemCard(i, 'lg')).join('')}</div></section>
      <section class="sh-sec"><h2><i class="fas fa-calendar-day"></i> ${tr({ en: 'Daily', de: 'Täglich' })} ${d.rotation.sale.length ? `<span class="sh-tag">${tr({ en: 'Deals', de: 'Angebote' })}</span>` : ''}</h2><div class="sh-grid">${daily.map(i => _itemCard(i)).join('')}</div></section>
      ${!nxPayOn() ? `
      <p class="sh-fine sh-fine--center"><i class="fas fa-flask"></i> ${tr({ en: 'Beta: everything in the shop is available for bug points – common, rare and epic items also for XP. Report real bugs to earn bug points.', de: 'Beta: Alles im Shop gibt es für Bug-Punkte – gewöhnliche, seltene und epische Items auch für XP. Echte Bugs melden = Bug-Punkte sammeln.' })}</p>
      <section class="sh-sec sh-topup-strip">
        <div><b>${tr({ en: 'Need bug points?', de: 'Bug-Punkte nötig?' })}</b><span>${tr({ en: 'Report bugs with screenshots – every confirmed bug earns points.', de: 'Melde Bugs mit Screenshots – jeder bestätigte Bug bringt Punkte.' })}</span></div>
        <div class="sh-packs"><button data-h-click="h_shop_pro_navigateTo_589"><i class="fas fa-bug"></i> ${tr({ en: 'Report a bug', de: 'Bug melden' })}</button></div>
      </section>` : `
      <p class="sh-fine sh-fine--center"><i class="fas fa-bolt"></i> ${tr({ en: 'Common, rare and epic items can also be bought with XP. Legendary items and bundles are not available for XP. Pay with card, Apple Pay, Google Pay, SEPA, paysafecard or balance.', de: 'Gewöhnliche, seltene und epische Items gibt es auch für XP. Legendäre Items und Bundles nicht für XP. Bezahlen per Karte, Apple Pay, Google Pay, SEPA, paysafecard oder Guthaben.' })}</p>
      <section class="sh-sec sh-topup-strip">
        <div><b>${tr({ en: 'Need balance?', de: 'Guthaben nötig?' })}</b><span>${tr({ en: 'Top up 5–100 € by card, Apple Pay, Google Pay, SEPA or paysafecard.', de: 'Lade 5–100 € per Karte, Apple Pay, Google Pay, SEPA oder paysafecard auf.' })}</span></div>
        <div class="sh-packs">${[5, 10, 20, 50].map(v => `<button data-h-click="h_shop_pro_openTopupCheckout_595" data-hv-click="${nxHv(String(v))}">${v} €</button>`).join('')}<button data-h-click="h_shop_pro_openTopup_595">${tr({ en: 'Other', de: 'Andere' })}</button></div>
      </section>
      `}
      ${me ? `<section class="sh-sec sh-support" id="sh-support"></section>` : ''}` : ''}

    ${tab === 'inventory' ? (me ? _inventoryHtml(d) : `<div class="ax-empty">${t('login_required')}</div>`) : ''}

    ${tab === 'wallet' ? (me ? _walletHtml(d) : `<div class="ax-empty">${t('login_required')}</div>`) : ''}
  </div>`;
  if (me && tab === 'shop') nxRenderSupportCard();
  clearInterval(_shopTimer);
  _shopTimer = setInterval(() => {
    const c = document.getElementById('sh-countdown');
    if (!c) { clearInterval(_shopTimer); return; }
    c.textContent = _tkCountdown(d.rotation.endsAt);
    if (new Date(d.rotation.endsAt) <= new Date()) { clearInterval(_shopTimer); setTimeout(() => renderShopPage('reload'), 3000); }
  }, 30000);
}

function _inventoryHtml(d) {
  const owned = d.items.filter(i => i.owned);
  const eq = d.me.equipped || {};
  const slotOf = { frame: 'frame', name: 'nameStyle', badge: 'badge', bubble: 'bubble' };
  if (!owned.length) return `<div class="sh-empty"><i class="fas fa-box-open"></i><b>${tr({ en: 'Nothing here yet', de: 'Noch nichts hier' })}</b><span>${tr({ en: 'Items you buy show up here.', de: 'Gekaufte Artikel erscheinen hier.' })}</span><button class="co-btn co-btn--primary" data-h-click="h_shop_pro_renderShopPage_618">${tr({ en: 'Go to shop', de: 'Zum Shop' })}</button></div>`;
  const groups = [['frame', tr({ en: 'Frames', de: 'Rahmen' })], ['name', tr({ en: 'Name styles', de: 'Namensstile' })], ['badge', tr({ en: 'Badges', de: 'Abzeichen' })], ['bubble', tr({ en: 'Comment styles', de: 'Kommentar-Stile' })], ['sticker', 'Sticker']];
  return groups.map(([type, label]) => {
    const list = owned.filter(i => i.type === type);
    if (!list.length) return '';
    const slot = slotOf[type];
    return `<section class="sh-sec"><h2>${label}${slot && eq[slot] ? ` <button class="sh-unequip" data-h-click="h_shop_pro_shopEquip_624" data-hv-click="${nxHv(String(slot))}">${tr({ en: 'Remove', de: 'Ablegen' })}</button>` : ''}</h2><div class="sh-grid">${list.map(i => {
      const on = slot && eq[slot] === i.id;
      return `<div class="si rar-${i.rarity} ${on ? 'is-equipped' : ''}" style="--rc:${NX_RARITY_COLOR[i.rarity]}">
        <div class="si-top">${_itemPreview(i)}</div>
        <div class="si-info"><div class="si-name">${escHtml(_nm(i))}</div><div class="si-meta"><span class="si-rar">${escHtml(tr(NX_RARITY_L[i.rarity]))}</span></div>
          <div class="si-bottom">${slot ? (on ? `<span class="si-owned"><i class="fas fa-check"></i> ${tr({ en: 'Equipped', de: 'Ausgerüstet' })}</span>` : `<button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_shop_pro_shopEquip_629" data-hv-click="${nxHv(String(slot), String(i.id))}">${tr({ en: 'Equip', de: 'Ausrüsten' })}</button>`) : `<span class="si-hint">${tr({ en: 'Use it in comments', de: 'In Kommentaren nutzbar' })}</span>`}</div>
        </div></div>`;
    }).join('')}</div></section>`;
  }).join('');
}

function _walletHtml(d) {
  const w = d.wallet || { balance: d.me.balance, transactions: [] };
  const label = { premium: 'Premium', balance: tr({ en: 'Top-up', de: 'Aufladung' }), video: 'Video', ad: tr({ en: 'Ad', de: 'Werbung' }), shop: 'Shop' };
  return `
    <div class="sh-wallet-grid">
      <section class="sh-card">
        <small>${tr({ en: 'Balance', de: 'Guthaben' })}</small>
        <div class="sh-balance">${_eur(w.balance)}</div>
        <div class="sh-packs sh-packs--wrap">${[5, 10, 20, 50, 100].map(v => `<button data-h-click="h_shop_pro_openTopupCheckout_643" data-hv-click="${nxHv(String(v))}">+ ${v} €</button>`).join('')}</div>
        <button class="co-btn co-btn--sec co-btn--block" data-h-click="h_shop_pro_openTopup_643">${tr({ en: 'Custom amount or gift code', de: 'Eigener Betrag oder Gutscheincode' })}</button>
        <p class="sh-fine">${tr({ en: 'Balance can be used for Premium, paid videos, ads and shop items. It cannot be paid out.', de: 'Guthaben kannst du für Premium, kostenpflichtige Videos, Werbung und Shop-Artikel nutzen. Es kann nicht ausgezahlt werden.' })}</p>
      </section>
      <section class="sh-card">
        <small>${tr({ en: 'Recent activity', de: 'Letzte Buchungen' })}</small>
        ${w.transactions.length ? `<div class="sh-tx">${w.transactions.map(tx => {
          const plus = tx.type === 'balance';
          return `<div class="sh-tx-row"><i class="fas ${plus ? 'fa-arrow-down' : 'fa-arrow-up'} ${plus ? 'is-in' : ''}"></i><div><b>${escHtml(tx.itemName || label[tx.type] || tx.type)}</b><span>${new Date(tx.createdAt).toLocaleString(cl() === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })} · ${escHtml(tx.method || '')}</span></div><em class="${plus ? 'is-in' : ''}">${plus ? '+' : '−'}${_eur(tx.amount)}</em></div>`;
        }).join('')}</div>` : `<div class="sh-empty sh-empty--sm"><span>${tr({ en: 'No bookings yet', de: 'Noch keine Buchungen' })}</span></div>`}
      </section>
    </div>`;
}

function openShopItem(id) {
  const item = _shopData?.items.find(i => i.id === id);
  if (!item) return;
  const me = _shopData.me;
  const slot = { frame: 'frame', name: 'nameStyle', badge: 'badge', bubble: 'bubble' }[item.type];
  const equipped = slot && me?.equipped?.[slot] === item.id;
  const canXp = !!item.xp;
  const bundle = (_shopData.bundles || []).find(b => b.items.includes(item.id));
  const desc = {
    frame: tr({ en: 'Animated ring around your profile picture – visible everywhere.', de: 'Animierter Ring um dein Profilbild – überall sichtbar.' }),
    name: tr({ en: 'Your name appears in this style in comments and on your channel.', de: 'Dein Name erscheint in diesem Stil in Kommentaren und auf deinem Kanal.' }),
    sticker: tr({ en: 'Attach it to your comments. Stays yours forever.', de: 'Häng ihn an deine Kommentare. Gehört dir für immer.' }),
    badge: tr({ en: 'Small icon next to your name.', de: 'Kleines Symbol neben deinem Namen.' }),
    bubble: tr({ en: 'Highlights your comments with a special style.', de: 'Hebt deine Kommentare mit einem eigenen Stil hervor.' }),
  }[item.type];
  const buyable = item.inShop;
  _nxModal('nx-item', `
    <div class="si-detail" style="--rc:${NX_RARITY_COLOR[item.rarity]}">
      <button class="nxm-x si-detail-x" data-h-click="h_shop_pro__nxCloseModal_674" aria-label="Schließen"><i class="fas fa-xmark"></i></button>
      <div class="si-detail-top rar-${item.rarity}">${_itemPreview(item, true)}</div>
      <div class="nxm-body">
        <div class="si-meta"><span class="si-rar">${escHtml(tr(NX_RARITY_L[item.rarity]))}</span><span>·</span><span>${escHtml(tr(NX_TYPE_L[item.type]))}</span>${item.isNew ? `<span class="si-flag si-flag--new si-flag--inline">${tr({ en: 'NEW', de: 'NEU' })}</span>` : item.onSale ? `<span class="si-flag si-flag--sale si-flag--inline">−${item.discount}%</span>` : ''}</div>
        <h3 class="si-detail-name">${escHtml(_nm(item))}</h3>
        <p class="si-detail-desc">${desc}</p>
        ${!me ? `<button class="co-btn co-btn--primary co-btn--block" data-h-click="h_shop_pro__nxCloseModal_681">${t('login_btn')}</button>` :
          item.owned ? (slot ? `<button class="co-btn ${equipped ? 'co-btn--sec' : 'co-btn--primary'} co-btn--block" ${nxOn('click', () => shopEquip(slot, equipped ? null : item.id, true))}>${equipped ? tr({ en: 'Unequip', de: 'Ablegen' }) : tr({ en: 'Equip', de: 'Ausrüsten' })}</button>` : `<div class="si-owned si-owned--block"><i class="fas fa-check"></i> ${tr({ en: 'In your locker', de: 'In deinem Spind' })}</div>`) :
          !buyable ? `<div class="si-owned si-owned--block si-owned--off"><i class="far fa-clock"></i> ${tr({ en: 'Not in the shop today', de: 'Heute nicht im Shop' })}</div>` : `
          ${!nxPayOn() ? `<button class="co-btn co-btn--primary co-btn--block" data-h-click="h_shop_pro_shopBuy_684" data-hv-click="${nxHv(String(item.id))}" ${(me.bugPoints || 0) < item.bp ? 'disabled' : ''}><i class="fas fa-bug"></i> ${tr({ en: 'Buy for', de: 'Für' })} ${_bpFmt(item.bp)} ${tr({ en: 'bug points', de: 'Bug-Punkte' })}${(me.bugPoints || 0) < item.bp ? ` · ${tr({ en: 'you have', de: 'du hast' })} ${_bpFmt(me.bugPoints)}` : ''}</button>` : ''}
          <button class="co-btn co-btn--primary co-btn--block nx-pay-only" data-h-click="h_shop_pro_shopBuy_684_2" data-hv-click="${nxHv(String(item.id))}" ${me.balance + 0.0001 < item.price ? 'data-short="1"' : ''}>${tr({ en: 'Buy', de: 'Kaufen' })} · ${item.onSale ? `<s class="co-strike">${_eur(item.basePrice)}</s> ` : ''}${_eur(item.price)}</button>
          ${canXp ? `<button class="co-btn co-btn--xp co-btn--block" data-h-click="h_shop_pro_shopBuy_686" data-hv-click="${nxHv(String(item.id))}" ${me.xpAvailable < item.xp ? 'disabled' : ''}><i class="fas fa-bolt"></i> ${tr({ en: 'Buy for', de: 'Für' })} ${_xpFmt(item.xp)} XP${me.xpAvailable < item.xp ? ` · ${tr({ en: 'you have', de: 'du hast' })} ${_xpFmt(me.xpAvailable)}` : ''}</button>`
                  : `<p class="si-detail-note"><i class="fas fa-gem"></i> ${!nxPayOn() ? tr({ en: 'Legendary items are only available for bug points.', de: 'Legendäre Items gibt es nur für Bug-Punkte.' }) : tr({ en: 'Legendary items are only available for balance.', de: 'Legendäre Items gibt es nur für Guthaben.' })}</p>`}
          ${bundle && !bundle.owned ? `<button class="si-bundle-hint" data-h-click="h_shop_pro_openShopBundle_688" data-hv-click="${nxHv(String(bundle.id))}" style="--bc:${bundle.color}"><i class="fas fa-layer-group"></i><span>${tr({ en: 'Part of', de: 'Teil von' })} <b>${escHtml(_nm(bundle))}</b> · ${nxPayOn() ? _eur(bundle.price) : _bpFmt(bundle.bp) + ' ' + tr({ en: 'points', de: 'Punkte' })}</span><i class="fas fa-chevron-right"></i></button>` : ''}
          <p class="si-detail-note">${nxPayOn() ? `${tr({ en: 'Your balance', de: 'Dein Guthaben' })}: ${_eur(me.balance)}` : `${tr({ en: 'Your bug points', de: 'Deine Bug-Punkte' })}: ${_bpFmt(me.bugPoints)}`} · ${_xpFmt(me.xpAvailable)} XP</p>`}
      </div>
    </div>`);
}

function openShopBundle(id) {
  const b = _shopData?.bundles.find(x => x.id === id);
  if (!b) return;
  _nxCloseModal('nx-item');
  const me = _shopData.me;
  const byId = Object.fromEntries(_shopData.items.map(i => [i.id, i]));
  const parts = b.items.map(i => byId[i]).filter(Boolean);
  _nxModal('nx-bundle', `
    <div class="si-detail sb-detail" style="--bc:${b.color}">
      <button class="nxm-x si-detail-x" data-h-click="h_shop_pro__nxCloseModal_702" aria-label="Schließen"><i class="fas fa-xmark"></i></button>
      <div class="sb-detail-top">${_bundleArt(b, byId)}</div>
      <div class="nxm-body">
        <div class="si-meta"><span class="sb-kicker"><i class="fas fa-layer-group"></i> Bundle · ${b.count} ${tr({ en: 'items', de: 'Items' })}</span>${b.isNew ? `<span class="si-flag si-flag--new si-flag--inline">${tr({ en: 'NEW', de: 'NEU' })}</span>` : ''}</div>
        <h3 class="si-detail-name">${escHtml(_nm(b))}</h3>
        <p class="si-detail-desc">${escHtml(cl() === 'de' ? b.desc : b.descEn)}</p>
        <div class="sb-list">${parts.map(i => `<button class="sb-list-row" data-h-click="h_shop_pro__nxCloseModal_709" data-hv-click="${nxHv(String(i.id))}" style="--rc:${NX_RARITY_COLOR[i.rarity]}">
          <span class="sb-list-art">${i.type === 'frame' ? _frameRing(i, 30) : i.type === 'sticker' ? nxStickerHtml(i.id, 'sm') : i.type === 'badge' ? nxBadgeHtml(i.id) : `<i class="fas ${i.type === 'name' ? 'fa-font' : 'fa-comment'}"></i>`}</span>
          <span class="sb-list-main"><b>${escHtml(_nm(i))}</b><small>${escHtml(tr(NX_RARITY_L[i.rarity]))} · ${escHtml(tr(NX_TYPE_L[i.type]))}</small></span>
          ${i.owned ? `<span class="si-owned"><i class="fas fa-check"></i></span>` : `<span class="sb-list-price">${nxPayOn() ? _eur(i.basePrice) : _bpFmt(i.bp)}</span>`}
        </button>`).join('')}</div>
        ${!me ? `<button class="co-btn co-btn--primary co-btn--block" data-h-click="h_shop_pro__nxCloseModal_714">${t('login_btn')}</button>` :
          b.owned ? `<div class="si-owned si-owned--block"><i class="fas fa-check"></i> ${tr({ en: 'You own the whole bundle', de: 'Du besitzt das ganze Bundle' })}</div>` : `
          ${!nxPayOn() ? `<button class="co-btn co-btn--primary co-btn--block" data-h-click="h_shop_pro_shopBuyBundle_716" data-hv-click="${nxHv(String(b.id))}" ${(me.bugPoints || 0) < b.bp ? 'disabled' : ''}><i class="fas fa-bug"></i> ${tr({ en: 'Bundle for', de: 'Bundle für' })} ${_bpFmt(b.bp)} ${tr({ en: 'bug points', de: 'Bug-Punkte' })}${(me.bugPoints || 0) < b.bp ? ` · ${tr({ en: 'you have', de: 'du hast' })} ${_bpFmt(me.bugPoints)}` : ''}</button>` : ''}
          <button class="co-btn co-btn--primary co-btn--block nx-pay-only" data-h-click="h_shop_pro_shopBuyBundle_716_2" data-hv-click="${nxHv(String(b.id))}" ${me.balance + 0.0001 < b.price ? 'data-short="1"' : ''}>${tr({ en: 'Buy bundle', de: 'Bundle kaufen' })} · <s class="co-strike">${_eur(b.missingValue)}</s> ${_eur(b.price)}</button>
          ${b.ownedCount ? `<p class="si-detail-note"><i class="fas fa-tag"></i> ${tr({ en: `Price reduced – you already own ${b.ownedCount} item(s).`, de: `Preis reduziert – du besitzt schon ${b.ownedCount} Item(s).` })}</p>` : ''}
          <p class="si-detail-note nx-pay-only"><i class="fas fa-wallet"></i> ${tr({ en: 'Pay with card, Apple Pay, Google Pay, SEPA, paysafecard or balance (no XP).', de: 'Bezahlen per Karte, Apple Pay, Google Pay, SEPA, paysafecard oder Guthaben (nicht mit XP).' })} ${tr({ en: 'Your balance', de: 'Dein Guthaben' })}: ${_eur(me.balance)}</p>`}
      </div>
    </div>`, { wide: true });
}

async function shopBuy(id, currency, btn) {
  const item = _shopData?.items.find(i => i.id === id);
  // v1.74: Käufe mit Geld laufen über den normalen Checkout (alle Zahlungsarten + Widerrufs-Hinweis)
  if (currency === 'balance') { _nxCloseModal('nx-item'); return openCheckout({ type: 'shop_item', itemId: id, itemName: item ? _nm(item) : '' }); }
  if (btn) btn.disabled = true;
  try {
    await apiPost('/api/shop/buy', { itemId: id, currency });
    showToast(`${item ? _nm(item) : ''} ${tr({ en: 'is yours', de: 'gehört jetzt dir' })}`, 'success');
    await _nxRefreshMe();
    await renderShopPage(window._shopTab);
    openShopItem(id);
  } catch (e) { showToast(e.message, 'error'); if (btn) btn.disabled = false; }
}
async function shopBuyBundle(id, btn) {
  const b = _shopData?.bundles.find(x => x.id === id);
  // Beta: Bundles mit Bug-Punkten, ohne Bezahlfenster
  if (nxPayOn()) { _nxCloseModal('nx-bundle'); return openCheckout({ type: 'shop_bundle', bundleId: id, bundleName: b ? _nm(b) : '' }); }
  if (btn) btn.disabled = true;
  try {
    await apiPost('/api/shop/buy-bundle', { bundleId: id, currency: 'bugpoints' });
    showToast(`${b ? _nm(b) : 'Bundle'} ${tr({ en: 'is yours', de: 'gehört jetzt dir' })}`, 'success');
    await _nxRefreshMe();
    await renderShopPage(window._shopTab);
    openShopBundle(id);
  } catch (e) { showToast(e.message, 'error'); if (btn) btn.disabled = false; }
}
async function shopEquip(slot, itemId, fromModal) {
  try {
    await apiPost('/api/shop/equip', { slot, itemId });
    await _nxRefreshMe();
    showToast(itemId ? tr({ en: 'Equipped', de: 'Ausgerüstet' }) : tr({ en: 'Removed', de: 'Abgelegt' }), 'success');
    await renderShopPage(window._shopTab);
    if (fromModal && itemId) openShopItem(itemId); else _nxCloseModal('nx-item');
  } catch (e) { showToast(e.message, 'error'); }
}

/* =====================================================================
   STICKER-AUSWAHL BEIM KOMMENTIEREN
   ===================================================================== */
function nxRenderStickerChip() {
  const box = document.getElementById('nx-sticker-chip');
  if (!box) return;
  const id = window._nxPendingSticker;
  box.innerHTML = id ? `${nxStickerHtml(id, 'sm')}<button data-h-click="h_shop_pro_nxRenderStickerChip_767" aria-label="Entfernen"><i class="fas fa-xmark"></i></button>` : '';
  box.style.display = id ? 'inline-flex' : 'none';
}
async function nxOpenStickerPicker(btn) {
  const existing = document.getElementById('nx-sticker-pop');
  if (existing) { existing.remove(); return; }
  if (!currentUser) { openAuthModal('login'); return; }
  const pop = document.createElement('div');
  pop.id = 'nx-sticker-pop'; pop.className = 'st-pop stp';
  pop.innerHTML = '<div class="st-pop-load"><i class="fas fa-circle-notch fa-spin"></i></div>';
  btn.parentElement.style.position = 'relative';
  btn.parentElement.appendChild(pop);
  const close = () => { pop.remove(); document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', esc); };
  const outside = e => { if (!pop.contains(e.target) && !btn.contains(e.target)) close(); };
  const esc = e => { if (e.key === 'Escape') close(); };
  setTimeout(() => { document.addEventListener('pointerdown', outside); document.addEventListener('keydown', esc); }, 0);
  try {
    const cat = await apiGet('/api/shop/catalog');
    const all = cat.items.filter(i => i.type === 'sticker');
    const owned = all.filter(i => i.owned);
    const locked = all.filter(i => !i.owned && i.inShop);
    const cur = window._nxPendingSticker;
    const cell = i => `<button class="stp-item${cur === i.id ? ' is-sel' : ''}" data-id="${i.id}" title="${escHtml(_nm(i))}"><span class="stp-art">${nxStickerHtml(i.id, 'sm')}</span></button>`;
    const lockedCell = i => `<button class="stp-item is-locked" data-shop="${i.id}" title="${escHtml(_nm(i))}"><span class="stp-art">${nxStickerHtml(i.id, 'sm')}</span><span class="stp-price"><i class="fas fa-lock"></i> ${_eur(i.price)}</span></button>`;
    pop.innerHTML = `
      <div class="stp-head">
        <strong>${tr({ en: 'Stickers', de: 'Sticker' })}</strong>
        <button class="stp-link" data-go-shop>${tr({ en: 'Open shop', de: 'Zum Shop' })} <i class="fas fa-arrow-right"></i></button>
      </div>
      <div class="stp-scroll">
        ${owned.length ? `<div class="stp-label">${tr({ en: 'Yours', de: 'Deine Sticker' })} · ${owned.length}</div><div class="stp-grid">${owned.map(cell).join('')}</div>`
          : `<div class="stp-empty"><i class="far fa-face-smile"></i><span>${tr({ en: 'You have no stickers yet. Pick one below to get it in the shop.', de: 'Du hast noch keine Sticker. Wähle unten einen aus, um ihn im Shop zu holen.' })}</span></div>`}
        ${locked.length ? `<div class="stp-label">${tr({ en: 'In the shop today', de: 'Heute im Shop' })}</div><div class="stp-grid">${locked.map(lockedCell).join('')}</div>` : ''}
      </div>`;
    pop.addEventListener('click', e => {
      const own = e.target.closest('.stp-item[data-id]');
      if (own) { window._nxPendingSticker = own.dataset.id; nxRenderStickerChip(); close(); document.getElementById('comment-text-input')?.focus(); return; }
      const shop = e.target.closest('[data-shop]');
      if (shop) { const id = shop.dataset.shop; close(); navigateTo('shop'); setTimeout(() => openShopItem(id), 600); return; }
      if (e.target.closest('[data-go-shop]')) { close(); navigateTo('shop'); }
    });
  } catch { pop.innerHTML = `<p class="st-pop-note">${t('loading_error')}</p>`; }
}


/* =====================================================================
   „Creator unterstützen“ – Creator-Code im Shop (gilt 14 Tage für alle Käufe)
   ===================================================================== */
async function nxRenderSupportCard() {
  const box = document.getElementById('sh-support'); if (!box || !currentUser) return;
  let d = { support: null, days: 14 };
  try { d = await apiGet('/api/creator-codes/support'); } catch {}
  const s = d.support;
  box.innerHTML = `<div class="sh-sup">
    <div class="sh-sup-ico"><i class="fas fa-heart"></i></div>
    <div class="sh-sup-main">
      <h2>${tr({ en: 'Support a creator', de: 'Creator unterstützen' })}</h2>
      ${s ? `<p>${tr({ en: 'You are supporting', de: 'Du unterstützt' })} <b>${escHtml(s.creatorName)}</b> ${tr({ en: 'with code', de: 'mit dem Code' })} <b class="sh-sup-code">${escHtml(s.code)}</b>.</p>
        <div class="sh-sup-bar"><i style="width:${Math.max(4, s.daysLeft / d.days * 100)}%"></i></div>
        <small>${tr({ en: `Still active for ${s.daysLeft} day(s) – then it is removed automatically. You can enter it again at any time.`, de: `Noch ${s.daysLeft} ${s.daysLeft === 1 ? 'Tag' : 'Tage'} aktiv – danach wird er automatisch entfernt. Du kannst ihn jederzeit erneut eintragen.` })}</small>`
        : `<p>${tr({ en: `Enter a creator code. For the next ${d.days} days the creator gets a share of everything you buy on Norynex – Premium, live subs, gifts, shop items and paid videos. It costs you nothing extra.`, de: `Trag einen Creator-Code ein. ${d.days} Tage lang bekommt der Creator einen Anteil an allem, was du auf Norynex kaufst – Premium, Live-Abos, Geschenke, Shop-Artikel und Bezahlvideos. Für dich kostet das nichts extra.` })}</p>`}
      <div class="sh-sup-row"><input id="sh-sup-in" maxlength="20" placeholder="${s ? tr({ en: 'Change code', de: 'Code wechseln' }) : tr({ en: 'Creator code', de: 'Creator-Code' })}" autocomplete="off" data-h-input="h_shop_pro_toUpperCase_828" data-h-keydown="h_shop_pro_if_828">
        <button class="co-btn co-btn--primary" data-h-click="h_shop_pro_nxSetSupportCode_828">${s ? tr({ en: 'Change', de: 'Wechseln' }) : tr({ en: 'Support', de: 'Unterstützen' })}</button>
        ${s ? `<button class="co-btn co-btn--sec" data-h-click="h_shop_pro_nxSetSupportCode_830" data-hv-click="${nxHv(String(escHtml(s.code)))}" title="${tr({ en: 'Restart 14 days', de: '14 Tage neu starten' })}" aria-label="${tr({ en: 'Restart 14 days', de: '14 Tage neu starten' })}"><i class="fas fa-rotate"></i></button><button class="co-btn co-btn--sec" data-h-click="h_shop_pro_nxClearSupportCode_830">${tr({ en: 'Remove', de: 'Entfernen' })}</button>` : ''}</div>
      <div class="co-msg" id="sh-sup-msg"></div>
    </div></div>`;
}
async function nxSetSupportCode(code) {
  const c = code || (document.getElementById('sh-sup-in')?.value || '').trim(); if (!c) return;
  try { const r = await apiPost('/api/creator-codes/support', { code: c }); showToast(tr({ en: `You now support ${r.support.creatorName}`, de: `Du unterstützt jetzt ${r.support.creatorName}` }), 'success'); nxRenderSupportCard(); }
  catch (e) { const m = document.getElementById('sh-sup-msg'); if (m) { m.className = 'co-msg is-err'; m.textContent = e.message; } else showToast(e.message, 'error'); }
}
async function nxClearSupportCode() {
  try { await fetch('/api/creator-codes/support', { method: 'DELETE', headers: { Authorization: 'Bearer ' + (localStorage.getItem('nxd_token') || '') } }); } catch {}
  nxRenderSupportCard();
}

// Kleine Zeile „Du unterstützt … · Ändern“ für Kauf-Fenster außerhalb des Checkouts (z. B. Premium schenken)
async function nxSupportLine(elId) {
  const el = document.getElementById(elId); if (!el || !currentUser) return;
  let d = null; try { d = await apiGet('/api/creator-codes/support'); } catch { return; }
  const s = d && d.support;
  el.innerHTML = s
    ? `<div class="co-cc-on co-cc-on--sm"><i class="fas fa-heart"></i><div><small>${tr({ en: 'This purchase supports', de: 'Dieser Kauf unterstützt' })}</small><b>${escHtml(s.creatorName)}</b><span>${tr({ en: 'Code', de: 'Code' })} ${escHtml(s.code)} · ${tr({ en: `${s.daysLeft} day(s) left`, de: `noch ${s.daysLeft} ${s.daysLeft === 1 ? 'Tag' : 'Tage'}` })}</span></div><button type="button" class="co-inline-link" data-h-click="h_shop_pro_querySelectorAll_850">${tr({ en: 'Change', de: 'Ändern' })}</button></div>`
    : `<button type="button" class="co-inline-link co-cc-add" data-h-click="h_shop_pro_querySelectorAll_851"><i class="fas fa-heart"></i> ${tr({ en: 'Support a creator with a creator code', de: 'Mit einem Creator-Code einen Creator unterstützen' })}</button>`;
}
// ─── Teil: client/shop-pro/995-ereignis-handler.js ───
// ── Ereignis-Handler (v1.82: statt Inline-Handlern im HTML – CSP ohne 'unsafe-inline'; Verteiler: public/js/nx-events.js) ──
(window.NX_H = window.NX_H || {}).h_shop_pro__nxCloseModal_174 = function (event, v) { _nxCloseModal('nx-checkout') };
(window.NX_H = window.NX_H || {}).h_shop_pro__coPay_194 = function (event, v) { _coPay() };
(window.NX_H = window.NX_H || {}).h_shop_pro__coRenderCC_236 = function (event, v) { _coRenderCC(true) };
(window.NX_H = window.NX_H || {}).h_shop_pro__coRemoveCode_237 = function (event, v) { _coRemoveCode() };
(window.NX_H = window.NX_H || {}).h_shop_pro_toUpperCase_241 = function (event, v) { this.value=this.value.toUpperCase() };
(window.NX_H = window.NX_H || {}).h_shop_pro_if_241 = function (event, v) { if(event.key==='Enter')_coApplyCode() };
(window.NX_H = window.NX_H || {}).h_shop_pro__coApplyCode_241 = function (event, v) { _coApplyCode() };
(window.NX_H = window.NX_H || {}).h_shop_pro_stopPropagation_288 = function (event, v) { event.stopPropagation();_nxCloseModal('nx-checkout');openTopup() };
(window.NX_H = window.NX_H || {}).h_shop_pro__coPick_291 = function (event, v) { _coPick('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_shop_pro__nxCloseModal_389 = function (event, v) { _nxCloseModal('nx-pay-pending') };
(window.NX_H = window.NX_H || {}).h_shop_pro__tpPick_418 = function (event, v) { _tpPick(NX_H.$l(v[0])) };
(window.NX_H = window.NX_H || {}).h_shop_pro__nxCloseModal_414 = function (event, v) { _nxCloseModal('nx-topup') };
(window.NX_H = window.NX_H || {}).h_shop_pro__tpSync_419 = function (event, v) { _tpSync() };
(window.NX_H = window.NX_H || {}).h_shop_pro__tpContinue_421 = function (event, v) { _tpContinue() };
(window.NX_H = window.NX_H || {}).h_shop_pro_toUpperCase_425 = function (event, v) { this.value=this.value.toUpperCase() };
(window.NX_H = window.NX_H || {}).h_shop_pro__tpRedeem_425 = function (event, v) { _tpRedeem() };
(window.NX_H = window.NX_H || {}).h_shop_pro_openShopItem_492 = function (event, v) { openShopItem('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_shop_pro_openShopBundle_511 = function (event, v) { openShopBundle('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_shop_pro_navigateTo_556 = function (event, v) { navigateTo('bugs','redeem') };
(window.NX_H = window.NX_H || {}).h_shop_pro_navigateTo_557 = function (event, v) { window._tkTab='quests';navigateTo('tasks') };
(window.NX_H = window.NX_H || {}).h_shop_pro_navigateTo_558 = function (event, v) { navigateTo('bugs') };
(window.NX_H = window.NX_H || {}).h_shop_pro_renderShopPage_560 = function (event, v) { renderShopPage('wallet') };
(window.NX_H = window.NX_H || {}).h_shop_pro_navigateTo_561 = function (event, v) { window._tkTab='quests';navigateTo('tasks') };
(window.NX_H = window.NX_H || {}).h_shop_pro_openTopup_562 = function (event, v) { openTopup() };
(window.NX_H = window.NX_H || {}).h_shop_pro_openAuthModal_564 = function (event, v) { openAuthModal('login') };
(window.NX_H = window.NX_H || {}).h_shop_pro_renderShopPage_571 = function (event, v) { renderShopPage('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_shop_pro_navigateTo_589 = function (event, v) { navigateTo('bugs') };
(window.NX_H = window.NX_H || {}).h_shop_pro_openTopupCheckout_595 = function (event, v) { openTopupCheckout(NX_H.$l(v[0])) };
(window.NX_H = window.NX_H || {}).h_shop_pro_openTopup_595 = function (event, v) { openTopup() };
(window.NX_H = window.NX_H || {}).h_shop_pro_renderShopPage_618 = function (event, v) { renderShopPage('shop') };
(window.NX_H = window.NX_H || {}).h_shop_pro_shopEquip_624 = function (event, v) { shopEquip('' + NX_H.$s(v[0]) + '', null) };
(window.NX_H = window.NX_H || {}).h_shop_pro_shopEquip_629 = function (event, v) { shopEquip('' + NX_H.$s(v[0]) + '','' + NX_H.$s(v[1]) + '') };
(window.NX_H = window.NX_H || {}).h_shop_pro_openTopupCheckout_643 = function (event, v) { openTopupCheckout(NX_H.$l(v[0])) };
(window.NX_H = window.NX_H || {}).h_shop_pro_openTopup_643 = function (event, v) { openTopup() };
(window.NX_H = window.NX_H || {}).h_shop_pro__nxCloseModal_681 = function (event, v) { _nxCloseModal('nx-item');openAuthModal('login') };
(window.NX_H = window.NX_H || {}).h_shop_pro_shopBuy_684 = function (event, v) { shopBuy('' + NX_H.$s(v[0]) + '','bugpoints',this) };
(window.NX_H = window.NX_H || {}).h_shop_pro_shopBuy_686 = function (event, v) { shopBuy('' + NX_H.$s(v[0]) + '','xp',this) };
(window.NX_H = window.NX_H || {}).h_shop_pro_openShopBundle_688 = function (event, v) { openShopBundle('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_shop_pro_shopBuy_684_2 = function (event, v) { shopBuy('' + NX_H.$s(v[0]) + '','balance',this) };
(window.NX_H = window.NX_H || {}).h_shop_pro__nxCloseModal_674 = function (event, v) { _nxCloseModal('nx-item') };
(window.NX_H = window.NX_H || {}).h_shop_pro__nxCloseModal_709 = function (event, v) { _nxCloseModal('nx-bundle');setTimeout(()=>openShopItem('' + NX_H.$s(v[0]) + ''),200) };
(window.NX_H = window.NX_H || {}).h_shop_pro__nxCloseModal_714 = function (event, v) { _nxCloseModal('nx-bundle');openAuthModal('login') };
(window.NX_H = window.NX_H || {}).h_shop_pro_shopBuyBundle_716 = function (event, v) { shopBuyBundle('' + NX_H.$s(v[0]) + '',this) };
(window.NX_H = window.NX_H || {}).h_shop_pro_shopBuyBundle_716_2 = function (event, v) { shopBuyBundle('' + NX_H.$s(v[0]) + '',this) };
(window.NX_H = window.NX_H || {}).h_shop_pro__nxCloseModal_702 = function (event, v) { _nxCloseModal('nx-bundle') };
(window.NX_H = window.NX_H || {}).h_shop_pro_nxRenderStickerChip_767 = function (event, v) { window._nxPendingSticker=null;nxRenderStickerChip() };
(window.NX_H = window.NX_H || {}).h_shop_pro_nxSetSupportCode_830 = function (event, v) { nxSetSupportCode('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_shop_pro_nxClearSupportCode_830 = function (event, v) { nxClearSupportCode() };
(window.NX_H = window.NX_H || {}).h_shop_pro_toUpperCase_828 = function (event, v) { this.value=this.value.toUpperCase() };
(window.NX_H = window.NX_H || {}).h_shop_pro_if_828 = function (event, v) { if(event.key==='Enter')nxSetSupportCode() };
(window.NX_H = window.NX_H || {}).h_shop_pro_nxSetSupportCode_828 = function (event, v) { nxSetSupportCode() };
(window.NX_H = window.NX_H || {}).h_shop_pro_querySelectorAll_850 = function (event, v) { document.querySelectorAll('.nxm-overlay,#nxd-gift-modal').forEach(x=>x.remove());document.body.classList.remove('nxm-open');navigateTo('shop');setTimeout(()=>document.getElementById('sh-support')?.scrollIntoView({behavior:'smooth',block:'center'}),700) };
(window.NX_H = window.NX_H || {}).h_shop_pro_querySelectorAll_851 = function (event, v) { document.querySelectorAll('.nxm-overlay,#nxd-gift-modal').forEach(x=>x.remove());document.body.classList.remove('nxm-open');navigateTo('shop');setTimeout(()=>document.getElementById('sh-support')?.scrollIntoView({behavior:'smooth',block:'center'}),700) };
