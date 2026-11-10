// ⚠️  AUTOMATISCH ERZEUGT aus client/beta-bugs/*.js — bitte NICHT hier bearbeiten, sondern dort; danach "npm run build".
// ─── Teil: client/beta-bugs/010-beta-und-bugs.js ───
/* =====================================================================
   NORYNEX v1.78 — Beta-Modus & "Bugs melden"
   - Beta-Hinweis oben in der App
   - Zahlungen/Monetarisierung/Werbung: Knöpfe zeigen in der Beta einen Hinweis statt der Kasse
     (wieder einschalten über die .env, siehe server/app/085-beta-modus.js)
   - Seite /bugs: Bugs mit Screenshots melden, eigene Meldungen, Bug-Punkte einlösen,
     Bestenliste und (für Admins) die Prüf-Ansicht
   ===================================================================== */
(function () {
  'use strict';
  const L = (de, en) => tr({ de, en });
  const esc = (s) => escHtml(String(s ?? ''));
  const bpCfg = () => (window.NX_FEATURES && window.NX_FEATURES.bugPoints) || {};
  const fmt = (n) => Number(n || 0).toLocaleString('de-DE');
  const CATS = [
    ['video', L('Videos & Player', 'Videos & player')], ['shorts', 'Shorts'], ['upload', L('Hochladen', 'Upload')],
    ['live', L('Livestreams', 'Livestreams')], ['konto', L('Konto & Login', 'Account & login')], ['shop', L('Shop & Premium', 'Shop & premium')],
    ['design', L('Design & Anzeige', 'Design & layout')], ['mobil', L('Handy / App', 'Phone / app')], ['sonstiges', L('Sonstiges', 'Other')],
  ];
  const STATUS = {
    open: { icon: 'fa-hourglass-half', de: 'Wird geprüft', en: 'In review', cls: 'is-open' },
    confirmed: { icon: 'fa-circle-check', de: 'Bestätigt', en: 'Confirmed', cls: 'is-ok' },
    fixed: { icon: 'fa-screwdriver-wrench', de: 'Behoben', en: 'Fixed', cls: 'is-ok' },
    rejected: { icon: 'fa-circle-xmark', de: 'Kein Bug', en: 'Not a bug', cls: 'is-no' },
    duplicate: { icon: 'fa-clone', de: 'Schon gemeldet', en: 'Duplicate', cls: 'is-no' },
  };
  const SEV = { klein: L('Klein', 'Minor'), mittel: L('Mittel', 'Medium'), schwer: L('Schwer', 'Major'), kritisch: L('Kritisch', 'Critical') };

  /* ── Zahlungen in der Beta abfangen (Originale bleiben erhalten → nach der Beta wieder aktiv) ── */
  function guard(name, kind) {
    const orig = window[name];
    if (typeof orig !== 'function' || orig._nxBeta) return;
    const w = function (...a) {
      const on = kind === 'ads' ? nxAdsOn() : kind === 'monetization' ? nxMonetizationOn() : nxPayOn();
      if (!on) { nxBetaPaymentsModal(kind); return; }
      return orig.apply(this, a);
    };
    w._nxBeta = true;
    window[name] = w;
  }
  ['openCheckout', 'openTopup', 'openTopupCheckout', 'purchaseVideo', '_openPaymentModal', 'openPremiumPayment', 'payWithNorynexBalance',
    'activatePremium', 'openGiftPremiumModal', 'sendGiftPremium', 'lvOpenSub', 'lvOpenGift', 'lvGiftTo', 'lvContinueSub', 'lvContinueGift',
    '_payWithGooglePay', '_payWithApplePay', '_payWithKlarna', 'renderBalancePage'].forEach(n => guard(n, 'payments'));
  ['openAdPayment'].forEach(n => guard(n, 'ads'));
  ['checkMonetizationEligibility'].forEach(n => guard(n, 'monetization'));

  /* ── Studio: Monetarisierung & Werbung in der Beta als Hinweis anzeigen ── */
  (function () {
    const orig = window.switchStudio;
    if (typeof orig !== 'function' || orig._nxBeta) return;
    const w = async function (panel, linkEl, targetEl) {
      const off = (panel === 'monetize' && !nxMonetizationOn()) || (panel === 'ads' && !nxAdsOn());
      if (!off) return orig.apply(this, arguments);
      document.querySelectorAll('.studio-nav a').forEach(a => a.classList.toggle('active', a === linkEl));
      try { history.replaceState(null, '', '#studio/' + panel); } catch {}
      const box = targetEl || document.getElementById('studio-panel');
      if (box) box.innerHTML = `<div class="nx-beta-card">
        <div class="nx-beta-card-ico"><i class="fas fa-flask"></i></div>
        <h3>${panel === 'ads' ? L('Werbung ist in der Beta pausiert', 'Ads are paused during the beta') : L('Monetarisierung ist in der Beta pausiert', 'Monetization is paused during the beta')}</h3>
        <p>${L('Norynex befindet sich in der Beta – alles ist noch in der Testphase. Geld verdienen, Auszahlungen und bezahlte Werbung kommen nach der Beta zurück. Deine bisherigen Daten bleiben erhalten.',
               'Norynex is in beta – everything is in the test phase. Earning money, payouts and paid ads will come back after the beta. Your existing data is kept.')}</p>
        <p>${L('Creator-Codes funktionieren weiterhin.', 'Creator codes keep working.')}</p>
        <button class="co-btn co-btn--sec" data-h-click="h_beta_bugs_switchStudio_62"><i class="fas fa-user-tag"></i> ${L('Zum Creator-Code', 'Go to creator code')}</button>
      </div>`;
    };
    w._nxBeta = true;
    window.switchStudio = w;
  })();

  /* ── Premium-Seite: in der Beta per Bug-Punkte statt Bezahlung ── */
  (function () {
    const orig = window.renderPremiumPage;
    if (typeof orig !== 'function' || orig._nxBeta) return;
    const w = function () {
      const r = orig.apply(this, arguments);
      if (!nxPayOn()) nxPremiumBetaBox();
      return r;
    };
    w._nxBeta = true;
    window.renderPremiumPage = w;
  })();
  function nxPremiumBetaBox() {
    const el = document.getElementById('page-premium');
    if (!el) return;
    const cost = bpCfg().premium30 || 150;
    const have = currentUser ? (currentUser.bugPoints || 0) : 0;
    const box = `<section class="pm-section nx-pm-beta" id="pm-plans">
      <div class="pm-section-head"><h2><i class="fas fa-flask"></i> ${L('Premium in der Beta', 'Premium during the beta')}</h2>
        <p>${L('Norynex ist in der Testphase, deshalb gibt es Premium gerade nicht gegen Geld – sondern für Bug-Punkte. Melde echte Bugs, sammle Punkte und löse sie hier ein.',
               'Norynex is in the test phase, so Premium is not sold for money right now – you get it with bug points instead. Report real bugs, earn points and redeem them here.')}</p></div>
      <div class="pm-checkout">
        <div class="pm-checkout-info"><b>Premium · 30 ${L('Tage', 'days')}</b><span>${fmt(cost)} ${L('Bug-Punkte', 'bug points')} · ${currentUser ? `${L('du hast', 'you have')} ${fmt(have)}` : L('Anmeldung nötig', 'login required')}</span></div>
        ${!currentUser ? `<button class="pm-btn pm-btn--primary" data-h-click="h_beta_bugs_openAuthModal_93">${t('login_btn')}</button>`
          : have >= cost ? `<button class="pm-btn pm-btn--primary" data-h-click="h_beta_bugs_nxRedeemPremium_94"><i class="fas fa-bug"></i> ${L('Für', 'Redeem for')} ${fmt(cost)} ${L('Punkte einlösen', 'points')}</button>`
          : `<button class="pm-btn pm-btn--primary" data-h-click="h_beta_bugs_navigateTo_95"><i class="fas fa-bug"></i> ${L('Bugs melden & Punkte sammeln', 'Report bugs & earn points')}</button>`}
      </div>
    </section>`;
    const plans = el.querySelector('#pm-plans');
    if (plans) plans.outerHTML = box;
    else { const hero = el.querySelector('.pm-hero'); if (hero) hero.insertAdjacentHTML('afterend', box); }
    el.querySelectorAll('.pm-hero-note').forEach(n => { n.textContent = `${fmt(cost)} ${L('Bug-Punkte / 30 Tage', 'bug points / 30 days')}`; });
    el.querySelectorAll('.pm-hero-cta .pm-btn--primary').forEach(b => { b.textContent = L('Mit Bug-Punkten holen', 'Get it with bug points'); });
  }
  window.nxRedeemPremium = async function (btn) {
    const cost = bpCfg().premium30 || 150;
    if (!confirm(L(`30 Tage Premium für ${cost} Bug-Punkte einlösen?`, `Redeem 30 days of Premium for ${cost} bug points?`))) return;
    if (btn) btn.disabled = true;
    try {
      const r = await apiPost('/api/bugpoints/redeem/premium', {});
      if (r.user) { currentUser = { ...currentUser, ...r.user }; try { localStorage.setItem('nxd_user', JSON.stringify(currentUser)); } catch {} }
      showToast(L('Premium ist aktiv – viel Spaß!', 'Premium is active – enjoy!'), 'success');
      if (typeof renderAuthSection === 'function') renderAuthSection();
      if (currentPage === 'premium') renderPremiumPage(); else if (currentPage === 'bugs') renderBugsPage('redeem');
    } catch (e) { showToast(e.message, 'error'); if (btn) btn.disabled = false; }
  };

  /* ── Beta-Hinweis oben in der App ── */
  function nxBetaStrip() {
    if (!window.NX_FEATURES.beta || document.getElementById('nx-beta-strip')) return;
    let hidden = false; try { hidden = sessionStorage.getItem('nx_beta_strip_hidden') === '1'; } catch {}
    if (hidden) return;
    const main = document.getElementById('main-content');
    if (!main) return;
    main.insertAdjacentHTML('afterbegin', `<div id="nx-beta-strip" class="nx-beta-strip" role="status">
      <span class="nx-beta-pill">BETA</span>
      <span class="nx-beta-strip-text">${L('Norynex ist in der Beta – alles befindet sich noch in der Testphase. Zahlungen sind deaktiviert.', 'Norynex is in beta – everything is still in the test phase. Payments are disabled.')}</span>
      <a href="/bugs" class="nx-beta-strip-link"><i class="fas fa-bug"></i> ${L('Bug melden', 'Report a bug')}</a>
      <button class="nx-beta-strip-x" aria-label="${esc(L('Schließen', 'Close'))}" data-h-click="h_beta_bugs_remove_128"><i class="fas fa-xmark"></i></button>
    </div>`);
  }
  const showStrip = () => (window.nxFeaturesReady || Promise.resolve()).then(nxBetaStrip);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showStrip); else showStrip();

  // Von welcher Seite kam man zu "Bugs melden"? (wird automatisch in die Meldung übernommen)
  (function () {
    const orig = window.navigateTo;
    if (typeof orig !== 'function' || orig._nxBugs) return;
    const w = function (page, ...rest) {
      if (page === 'bugs' && currentPage !== 'bugs') window._nxBugFrom = location.pathname + location.search;
      return orig.call(this, page, ...rest);
    };
    w._nxBugs = true; Object.keys(orig).forEach(k => { w[k] = orig[k]; });
    window.navigateTo = w;
  })();

  /* =====================================================================
     SEITE /bugs
     ===================================================================== */
  let _bugShots = []; // { file, url }
  let _bugData = null;
  const _shotUrls = {};

  async function authBlobUrl(path) {
    if (_shotUrls[path]) return _shotUrls[path];
    const token = localStorage.getItem('nxd_token');
    const r = await fetch(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!r.ok) throw new Error('Bild nicht verfügbar');
    return (_shotUrls[path] = URL.createObjectURL(await r.blob()));
  }
  function hydrateShots(root) {
    root.querySelectorAll('img[data-shot]').forEach(img => {
      authBlobUrl(img.dataset.shot).then(u => { img.src = u; img.closest('a')?.setAttribute('href', u); }).catch(() => { img.alt = '⚠'; });
    });
  }

  window.renderBugsPage = async function (param) {
    const el = document.getElementById('page-bugs');
    if (!el) return;
    const isAdmin = !!currentUser?.isAdmin;
    const tabs = [['report', 'fa-bug', L('Bug melden', 'Report bug')], ['mine', 'fa-list-check', L('Meine Meldungen', 'My reports')], ['redeem', 'fa-gift', L('Punkte einlösen', 'Redeem points')]];
    if (isAdmin) tabs.push(['admin', 'fa-shield-halved', L('Prüfen (Admin)', 'Review (admin)')]);
    const tab = tabs.some(t => t[0] === param) ? param : 'report';
    if (tab !== 'report') nxReplaceRoute('bugs/' + tab); else if (param) nxReplaceRoute('bugs');
    const cfg = bpCfg();
    const rewards = cfg.rewards || {};
    el.innerHTML = `<div class="nx-bugs">
      <header class="nx-bugs-hero">
        <div>
          <span class="nx-beta-pill">BETA</span>
          <h1><i class="fas fa-bug"></i> ${L('Bugs melden', 'Report bugs')}</h1>
          <p>${L('Norynex ist in der Beta – alles befindet sich noch in der Testphase. Hilf uns, Fehler zu finden: Melde Bugs mit Screenshots. Für jeden echten, hilfreichen Bug bekommst du <b>Bug-Punkte</b>, die du gegen <b>Premium</b> und <b>Shop-Artikel</b> eintauschen kannst.',
                 'Norynex is in beta – everything is still in the test phase. Help us find problems: report bugs with screenshots. Every real, helpful bug earns you <b>bug points</b> that you can trade for <b>Premium</b> and <b>shop items</b>.')}</p>
        </div>
        <div class="nx-bugs-score">
          <small>${L('Deine Bug-Punkte', 'Your bug points')}</small>
          <b id="nx-bp-balance">${currentUser ? fmt(currentUser.bugPoints || 0) : '–'}</b>
          <span>${L('Premium (30 Tage)', 'Premium (30 days)')}: ${fmt(cfg.premium30 || 150)}</span>
        </div>
      </header>
      <div class="nx-bugs-steps">
        <div><i class="fas fa-camera"></i><b>1. ${L('Melden', 'Report')}</b><span>${L('Was ist passiert? Screenshot dazu.', 'What happened? Add a screenshot.')}</span></div>
        <div><i class="fas fa-magnifying-glass"></i><b>2. ${L('Prüfung', 'Review')}</b><span>${L('Das Team prüft jede Meldung.', 'The team reviews every report.')}</span></div>
        <div><i class="fas fa-coins"></i><b>3. ${L('Punkte', 'Points')}</b><span>${Object.entries(rewards).map(([k, v]) => `${SEV[k] || k} ${v}`).join(' · ')}</span></div>
        <div><i class="fas fa-crown"></i><b>4. ${L('Einlösen', 'Redeem')}</b><span>${L('Premium & Shop-Artikel', 'Premium & shop items')}</span></div>
      </div>
      <div class="sh-tabs nx-bugs-tabs" role="tablist">${tabs.map(([k, i, l]) => `<button class="${tab === k ? 'is-active' : ''}" data-h-click="h_beta_bugs_renderBugsPage_196" data-hv-click="${nxHv(String(k))}"><i class="fas ${i}"></i>${l}</button>`).join('')}</div>
      <div id="nx-bugs-body"><div class="spinner" style="margin:40px auto;display:block"></div></div>
    </div>`;
    const body = el.querySelector('#nx-bugs-body');
    if (!currentUser) {
      body.innerHTML = `<div class="nx-beta-card"><div class="nx-beta-card-ico"><i class="fas fa-right-to-bracket"></i></div><h3>${L('Bitte melde dich an', 'Please log in')}</h3>
        <p>${L('Damit wir dir Bug-Punkte gutschreiben können, brauchst du ein Norynex-Konto.', 'You need a Norynex account so we can credit your bug points.')}</p>
        <button class="co-btn co-btn--primary" data-h-click="h_beta_bugs_openAuthModal_202">${t('login_btn')}</button></div>`;
      return;
    }
    try {
      if (tab === 'admin') return await drawAdmin(body);
      _bugData = await apiGet('/api/bugs/mine');
      currentUser.bugPoints = _bugData.bugPoints;
      const bal = document.getElementById('nx-bp-balance'); if (bal) bal.textContent = fmt(_bugData.bugPoints);
      if (tab === 'report') drawReportForm(body);
      else if (tab === 'mine') drawMine(body);
      else drawRedeem(body);
    } catch (e) { body.innerHTML = `<div class="ax-card ax-empty"><i class="fas fa-triangle-exclamation"></i>${esc(e.message)}</div>`; }
  };

  function drawReportForm(body) {
    _bugShots.forEach(s => URL.revokeObjectURL(s.url)); _bugShots = [];
    const max = bpCfg().maxScreenshots || 5;
    const from = window._nxBugFrom && !window._nxBugFrom.startsWith('/bugs') ? window._nxBugFrom : '';
    body.innerHTML = `<form class="nx-bug-form" id="nx-bug-form" data-h-submit="h_beta_bugs_preventDefault_221">
      <div class="form-group"><label>${L('Was ist kaputt? (kurzer Titel)', 'What is broken? (short title)')}</label>
        <input type="text" name="title" maxlength="140" required minlength="5" placeholder="${esc(L('z. B. Video startet nach dem Spulen nicht mehr', 'e.g. video stops after seeking'))}"></div>
      <div class="nx-bug-row">
        <div class="form-group"><label>${L('Bereich', 'Area')}</label><select name="category">${CATS.map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}</select></div>
        <div class="form-group"><label>${L('Wo ist es passiert? (Seite)', 'Where did it happen? (page)')}</label><input type="text" name="pageUrl" maxlength="300" value="${esc(from ? location.origin + from : '')}" placeholder="${esc(location.origin)}/watch/…"></div>
      </div>
      <div class="form-group"><label>${L('Beschreibung – was ist passiert, was hast du erwartet?', 'Description – what happened, what did you expect?')}</label>
        <textarea name="description" rows="5" maxlength="4000" required minlength="20" placeholder="${esc(L('Beschreibe den Fehler so genau wie möglich …', 'Describe the problem as precisely as possible …'))}"></textarea></div>
      <div class="form-group"><label>${L('Schritte zum Nachstellen (optional)', 'Steps to reproduce (optional)')}</label>
        <textarea name="steps" rows="3" maxlength="2000" placeholder="1. …&#10;2. …&#10;3. …"></textarea></div>
      <div class="form-group"><label>${L('Screenshots', 'Screenshots')} <small>(${L(`bis zu ${max}, je max. 8 MB – auch per Strg+V einfügen`, `up to ${max}, 8 MB each – paste with Ctrl+V too`)})</small></label>
        <div class="nx-bug-drop" id="nx-bug-drop" tabindex="0" data-h-click="h_beta_bugs_getElementById_232">
          <i class="fas fa-images"></i><span>${L('Bilder hierher ziehen, klicken oder einfügen', 'Drop, click or paste images')}</span>
          <input type="file" id="nx-bug-file" accept="image/png,image/jpeg,image/gif,image/webp" multiple hidden data-h-change="h_beta_bugs_nxBugAddFiles_234">
        </div>
        <div class="nx-bug-shots" id="nx-bug-shots"></div>
      </div>
      <p class="sh-fine"><i class="fas fa-circle-info"></i> ${L('Screenshots sieht nur das Norynex-Team. Bitte keine Passwörter oder privaten Daten zeigen. Doppelte oder erfundene Meldungen bringen keine Punkte.', 'Only the Norynex team can see screenshots. Please do not show passwords or private data. Duplicate or made-up reports earn no points.')}</p>
      <button class="co-btn co-btn--primary co-btn--block" type="submit" id="nx-bug-submit"><i class="fas fa-paper-plane"></i> ${L('Bug senden', 'Send bug')}</button>
    </form>`;
    const drop = body.querySelector('#nx-bug-drop');
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
    drop.addEventListener('drop', e => nxBugAddFiles(e.dataTransfer.files));
  }
  // Screenshot aus der Zwischenablage einfügen (Druck-Taste → Strg+V)
  document.addEventListener('paste', (e) => {
    if (currentPage !== 'bugs' || !document.getElementById('nx-bug-form')) return;
    const files = [...(e.clipboardData?.items || [])].filter(i => i.kind === 'file' && i.type.startsWith('image/')).map(i => i.getAsFile()).filter(Boolean);
    if (files.length) { e.preventDefault(); nxBugAddFiles(files); }
  });
  window.nxBugAddFiles = function (list) {
    const max = bpCfg().maxScreenshots || 5;
    for (const f of [...(list || [])]) {
      if (_bugShots.length >= max) { showToast(L(`Höchstens ${max} Screenshots.`, `At most ${max} screenshots.`), 'error'); break; }
      if (!/^image\/(png|jpe?g|gif|webp)$/.test(f.type)) { showToast(L('Nur Bilder (PNG, JPG, GIF, WebP).', 'Images only (PNG, JPG, GIF, WebP).'), 'error'); continue; }
      if (f.size > 8 * 1024 * 1024) { showToast(L('Bild ist größer als 8 MB.', 'Image is larger than 8 MB.'), 'error'); continue; }
      _bugShots.push({ file: f, url: URL.createObjectURL(f) });
    }
    drawShots();
  };
  window.nxBugRemoveShot = function (i) { const s = _bugShots.splice(i, 1)[0]; if (s) URL.revokeObjectURL(s.url); drawShots(); };
  function drawShots() {
    const box = document.getElementById('nx-bug-shots');
    if (box) box.innerHTML = _bugShots.map((s, i) => `<div class="nx-bug-shot"><img src="${s.url}" alt=""><button type="button" data-h-click="h_beta_bugs_nxBugRemoveShot_266" data-hv-click="${nxHv(String(i))}" aria-label="${esc(L('Entfernen', 'Remove'))}"><i class="fas fa-xmark"></i></button></div>`).join('');
  }
  window.nxSubmitBug = async function (form) {
    const btn = document.getElementById('nx-bug-submit');
    const fd = new FormData();
    ['title', 'category', 'pageUrl', 'description', 'steps'].forEach(k => fd.append(k, (form.elements[k]?.value || '').trim()));
    _bugShots.forEach(s => fd.append('screenshots', s.file, s.file.name || 'screenshot.png'));
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${L('Wird gesendet …', 'Sending …')}`; }
    try {
      const token = localStorage.getItem('nxd_token');
      const r = await fetch('/api/bugs', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || L('Senden fehlgeschlagen', 'Sending failed'));
      _bugShots.forEach(s => URL.revokeObjectURL(s.url)); _bugShots = [];
      showToast(L('Danke! Dein Bug wurde gemeldet – wir prüfen ihn.', 'Thanks! Your bug was reported – we will review it.'), 'success');
      renderBugsPage('mine');
    } catch (e) {
      showToast(e.message, 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fas fa-paper-plane"></i> ${L('Bug senden', 'Send bug')}`; }
    }
  };

  function reportCard(b, admin) {
    const st = STATUS[b.status] || STATUS.open;
    const cat = (CATS.find(c => c[0] === b.category) || [, b.category])[1];
    return `<article class="nx-bug-card" id="bug-${esc(b.id)}">
      <header>
        <span class="nx-bug-status ${st.cls}"><i class="fas ${st.icon}"></i> ${L(st.de, st.en)}</span>
        ${b.points ? `<span class="nx-bug-points">+${fmt(b.points)} ${L('Punkte', 'points')}</span>` : ''}
        ${b.severity ? `<span class="nx-bug-sev">${esc(SEV[b.severity] || b.severity)}</span>` : ''}
        <span class="nx-bug-cat">${esc(cat)}</span>
        <time>${new Date(b.createdAt).toLocaleString(cl() === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</time>
      </header>
      <h3>${esc(b.title)}</h3>
      ${admin && b.user ? `<p class="nx-bug-user">${L('von', 'by')} <a href="/channel/${encodeURIComponent(b.user.username)}">@${esc(b.user.username)}</a></p>` : ''}
      <p class="nx-bug-desc">${esc(b.description).replace(/\n/g, '<br>')}</p>
      ${b.steps ? `<details><summary>${L('Schritte zum Nachstellen', 'Steps to reproduce')}</summary><p class="nx-bug-desc">${esc(b.steps).replace(/\n/g, '<br>')}</p></details>` : ''}
      ${b.pageUrl ? `<p class="nx-bug-meta"><i class="fas fa-link"></i> ${esc(b.pageUrl)}</p>` : ''}
      ${admin && b.device ? `<p class="nx-bug-meta"><i class="fas fa-display"></i> ${esc(b.device)}</p>` : ''}
      ${b.screenshots.length ? `<div class="nx-bug-shots">${b.screenshots.map(s => `<a class="nx-bug-shot" target="_blank" rel="noopener"><img data-shot="${esc(s)}" alt="Screenshot"></a>`).join('')}</div>` : ''}
      ${b.adminNote && !admin ? `<p class="nx-bug-note"><i class="fas fa-comment-dots"></i> ${esc(b.adminNote)}</p>` : ''}
      ${admin ? adminControls(b) : ''}
    </article>`;
  }

  function drawMine(body) {
    const d = _bugData;
    body.innerHTML = d.reports.length ? `<div class="nx-bug-list">${d.reports.map(b => reportCard(b, false)).join('')}</div>`
      : `<div class="sh-empty"><i class="fas fa-bug"></i><b>${L('Noch keine Meldungen', 'No reports yet')}</b><span>${L('Hast du einen Fehler gefunden? Melde ihn und sammle Punkte.', 'Found a problem? Report it and earn points.')}</span><button class="co-btn co-btn--primary" data-h-click="h_beta_bugs_renderBugsPage_314">${L('Bug melden', 'Report bug')}</button></div>`;
    hydrateShots(body);
  }

  async function drawRedeem(body) {
    const d = _bugData, cfg = bpCfg(), cost = cfg.premium30 || 150;
    const rar = cfg.rarity || {};
    let board = [];
    try { board = await apiGet('/api/bugs/leaderboard'); } catch {}
    body.innerHTML = `<div class="nx-bugs-redeem">
      <section class="sh-card nx-redeem-card">
        <div class="nx-redeem-ico"><i class="fas fa-crown"></i></div>
        <div><b>Premium · 30 ${L('Tage', 'days')}</b><span>${L('Ohne Werbung, Downloads, Hintergrund-Wiedergabe und mehr. Läuft Premium schon, wird es verlängert.', 'No ads, downloads, background play and more. If you already have Premium it gets extended.')}</span></div>
        <button class="co-btn co-btn--primary" ${d.bugPoints < cost ? 'disabled' : ''} data-h-click="h_beta_bugs_nxRedeemPremium_327"><i class="fas fa-bug"></i> ${fmt(cost)}</button>
      </section>
      <section class="sh-card nx-redeem-card">
        <div class="nx-redeem-ico"><i class="fas fa-store"></i></div>
        <div><b>${L('Shop-Artikel', 'Shop items')}</b><span>${L('Rahmen, Namensstile, Abzeichen, Sticker und Bundles', 'Frames, name styles, badges, stickers and bundles')} – ${L('gewöhnlich', 'common')} ${fmt(rar.common)}, ${L('selten', 'rare')} ${fmt(rar.rare)}, ${L('episch', 'epic')} ${fmt(rar.epic)}, ${L('legendär', 'legendary')} ${fmt(rar.legendary)} ${L('Punkte', 'points')}</span></div>
        <button class="co-btn co-btn--sec" data-h-click="h_beta_bugs_navigateTo_331"><i class="fas fa-store"></i> ${L('Zum Shop', 'Open shop')}</button>
      </section>
      <div class="nx-redeem-grid">
        <section class="sh-card"><small>${L('Letzte Buchungen', 'Recent activity')}</small>
          ${(d.log || []).length ? `<div class="sh-tx">${d.log.map(l => `<div class="sh-tx-row"><i class="fas ${l.delta > 0 ? 'fa-arrow-down is-in' : 'fa-arrow-up'}"></i><div><b>${esc(l.reason)}</b><span>${new Date(l.at).toLocaleDateString(cl() === 'de' ? 'de-DE' : 'en-GB')}</span></div><em class="${l.delta > 0 ? 'is-in' : ''}">${l.delta > 0 ? '+' : ''}${fmt(l.delta)}</em></div>`).join('')}</div>`
            : `<div class="sh-empty sh-empty--sm"><span>${L('Noch keine Punkte – melde deinen ersten Bug!', 'No points yet – report your first bug!')}</span></div>`}
        </section>
        <section class="sh-card"><small>${L('Top Bug-Jäger', 'Top bug hunters')}</small>
          ${board.length ? `<ol class="nx-bug-board">${board.map(u => `<li><a href="/channel/${encodeURIComponent(u.username)}">${esc(u.displayName || u.username)}</a><span>${fmt(u.points)} ${L('Punkte', 'pts')} · ${u.confirmed} ${L('Bugs', 'bugs')}</span></li>`).join('')}</ol>`
            : `<div class="sh-empty sh-empty--sm"><span>${L('Noch niemand – sei der/die Erste!', 'Nobody yet – be the first!')}</span></div>`}
        </section>
      </div>
    </div>`;
  }

  /* ── Admin: Meldungen prüfen ── */
  let _adminFilter = 'open';
  function adminControls(b) {
    const sevs = Object.keys(bpCfg().rewards || SEV);
    return `<div class="nx-bug-admin">
      <div class="nx-bug-row">
        <label>${L('Schwere', 'Severity')} <select id="bsev-${b.id}">${sevs.map(s => `<option value="${s}" ${(b.severity || 'mittel') === s ? 'selected' : ''}>${esc(SEV[s] || s)} (${fmt((bpCfg().rewards || {})[s])})</option>`).join('')}</select></label>
        <label>${L('Eigene Punkte (optional)', 'Custom points (optional)')} <input type="number" id="bpts-${b.id}" min="1" max="1000" placeholder="–" ${b.points ? 'disabled' : ''}></label>
      </div>
      <input type="text" id="bnote-${b.id}" maxlength="1000" placeholder="${esc(L('Notiz an den/die Melder:in (optional)', 'Note to the reporter (optional)'))}" value="${esc(b.adminNote || '')}">
      <div class="nx-bug-admin-btns">
        <button class="co-btn co-btn--primary co-btn--sm" data-h-click="h_beta_bugs_nxReviewBug_356" data-hv-click="${nxHv(String(b.id))}"><i class="fas fa-check"></i> ${L('Bestätigen', 'Confirm')}${b.points ? '' : ' + ' + L('Punkte', 'points')}</button>
        <button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_beta_bugs_nxReviewBug_358" data-hv-click="${nxHv(String(b.id))}"><i class="fas fa-screwdriver-wrench"></i> ${L('Behoben', 'Fixed')}</button>
        <button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_beta_bugs_nxReviewBug_359" data-hv-click="${nxHv(String(b.id))}"><i class="fas fa-clone"></i> ${L('Doppelt', 'Duplicate')}</button>
        <button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_beta_bugs_nxReviewBug_360" data-hv-click="${nxHv(String(b.id))}"><i class="fas fa-xmark"></i> ${L('Kein Bug', 'Not a bug')}</button>
        <button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_beta_bugs_nxDeleteBug_361" data-hv-click="${nxHv(String(b.id))}" title="${esc(L('Löschen', 'Delete'))}" aria-label="${esc(L('Löschen', 'Delete'))}"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  }
  async function drawAdmin(body) {
    const d = await apiGet('/api/admin/bugs?status=' + encodeURIComponent(_adminFilter));
    const f = [['open', L('Offen', 'Open')], ['confirmed', L('Bestätigt', 'Confirmed')], ['fixed', L('Behoben', 'Fixed')], ['rejected', L('Kein Bug', 'Not a bug')], ['duplicate', L('Doppelt', 'Duplicate')], ['all', L('Alle', 'All')]];
    body.innerHTML = `<div class="nx-bug-filter">${f.map(([k, l]) => `<button class="${_adminFilter === k ? 'is-active' : ''}" data-h-click="h_beta_bugs_nxBugFilter_369" data-hv-click="${nxHv(String(k))}">${l}${k !== 'all' ? ` <b>${d.counts[k] || 0}</b>` : ''}</button>`).join('')}</div>
      ${d.reports.length ? `<div class="nx-bug-list">${d.reports.map(b => reportCard(b, true)).join('')}</div>` : `<div class="sh-empty sh-empty--sm"><span>${L('Keine Meldungen in dieser Ansicht.', 'No reports in this view.')}</span></div>`}`;
    hydrateShots(body);
  }
  window.nxBugFilter = function (k) { _adminFilter = k; renderBugsPage('admin'); };
  window.nxReviewBug = async function (id, status) {
    const sev = document.getElementById('bsev-' + id)?.value;
    const pts = document.getElementById('bpts-' + id)?.value;
    const note = document.getElementById('bnote-' + id)?.value || '';
    try {
      const r = await apiPost(`/api/admin/bugs/${id}/review`, { status, severity: sev, points: pts ? parseInt(pts, 10) : undefined, note });
      showToast(r.awarded ? L(`Gespeichert – ${r.awarded} Bug-Punkte gutgeschrieben.`, `Saved – ${r.awarded} bug points credited.`) : L('Gespeichert.', 'Saved.'), 'success');
      renderBugsPage('admin');
    } catch (e) { showToast(e.message, 'error'); }
  };
  window.nxDeleteBug = async function (id) {
    if (!confirm(L('Meldung inkl. Screenshots endgültig löschen?', 'Delete report including screenshots permanently?'))) return;
    try {
      const token = localStorage.getItem('nxd_token');
      const r = await fetch('/api/admin/bugs/' + encodeURIComponent(id), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Fehler');
      document.getElementById('bug-' + id)?.remove();
      showToast(L('Gelöscht.', 'Deleted.'), 'success');
    } catch (e) { showToast(e.message, 'error'); }
  };

  window.NX_VERSION = '1.78';
})();
// ─── Teil: client/beta-bugs/995-ereignis-handler.js ───
// ── Ereignis-Handler (v1.82: statt Inline-Handlern im HTML – CSP ohne 'unsafe-inline'; Verteiler: public/js/nx-events.js) ──
(window.NX_H = window.NX_H || {}).h_beta_bugs_switchStudio_62 = function (event, v) { switchStudio('creator-code', document.querySelector('[data-studio="creator-code"]')) };
(window.NX_H = window.NX_H || {}).h_beta_bugs_openAuthModal_93 = function (event, v) { openAuthModal('login') };
(window.NX_H = window.NX_H || {}).h_beta_bugs_nxRedeemPremium_94 = function (event, v) { nxRedeemPremium(this) };
(window.NX_H = window.NX_H || {}).h_beta_bugs_navigateTo_95 = function (event, v) { navigateTo('bugs') };
(window.NX_H = window.NX_H || {}).h_beta_bugs_remove_128 = function (event, v) { this.parentNode.remove();try{sessionStorage.setItem('nx_beta_strip_hidden','1')}catch{} };
(window.NX_H = window.NX_H || {}).h_beta_bugs_renderBugsPage_196 = function (event, v) { renderBugsPage('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_beta_bugs_openAuthModal_202 = function (event, v) { openAuthModal('login') };
(window.NX_H = window.NX_H || {}).h_beta_bugs_preventDefault_221 = function (event, v) { event.preventDefault();nxSubmitBug(this) };
(window.NX_H = window.NX_H || {}).h_beta_bugs_getElementById_232 = function (event, v) { document.getElementById('nx-bug-file').click() };
(window.NX_H = window.NX_H || {}).h_beta_bugs_nxBugAddFiles_234 = function (event, v) { nxBugAddFiles(this.files);this.value='' };
(window.NX_H = window.NX_H || {}).h_beta_bugs_nxBugRemoveShot_266 = function (event, v) { nxBugRemoveShot(NX_H.$l(v[0])) };
(window.NX_H = window.NX_H || {}).h_beta_bugs_renderBugsPage_314 = function (event, v) { renderBugsPage('report') };
(window.NX_H = window.NX_H || {}).h_beta_bugs_nxRedeemPremium_327 = function (event, v) { nxRedeemPremium(this) };
(window.NX_H = window.NX_H || {}).h_beta_bugs_navigateTo_331 = function (event, v) { navigateTo('shop','shop') };
(window.NX_H = window.NX_H || {}).h_beta_bugs_nxReviewBug_356 = function (event, v) { nxReviewBug('' + NX_H.$s(v[0]) + '','confirmed') };
(window.NX_H = window.NX_H || {}).h_beta_bugs_nxReviewBug_358 = function (event, v) { nxReviewBug('' + NX_H.$s(v[0]) + '','fixed') };
(window.NX_H = window.NX_H || {}).h_beta_bugs_nxReviewBug_359 = function (event, v) { nxReviewBug('' + NX_H.$s(v[0]) + '','duplicate') };
(window.NX_H = window.NX_H || {}).h_beta_bugs_nxReviewBug_360 = function (event, v) { nxReviewBug('' + NX_H.$s(v[0]) + '','rejected') };
(window.NX_H = window.NX_H || {}).h_beta_bugs_nxDeleteBug_361 = function (event, v) { nxDeleteBug('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_beta_bugs_nxBugFilter_369 = function (event, v) { nxBugFilter('' + NX_H.$s(v[0]) + '') };
