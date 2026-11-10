// ⚠️  AUTOMATISCH ERZEUGT aus client/ergaenzungen/*.js — bitte NICHT hier bearbeiten, sondern dort; danach "npm run build".
// ─── Teil: client/ergaenzungen/010-start.js ───
/* =====================================================================
   Norynex v1.72 · Ergänzungen (Final)
   – Benachrichtigungen: Live-Zähler an der Glocke, Strike-/Entfernungs-Hinweis
   – „Meine Verwarnungen“ (Transparenz nach DSA)
   Weitere Abschnitte folgen weiter unten (Einstellungen → Nexa, Studio → Werbung,
   Login-Optionen, Upload-Fortschritt, Live-Studio).
   ===================================================================== */

/* ---------- Kleine Helfer ---------- */
const _nx172 = { socketHooked: false };
function _nxDe() { return (typeof cl === 'function' ? cl() : 'de') !== 'en'; }
function _nxDate(iso) { try { return new Date(iso).toLocaleDateString(_nxDe() ? 'de-DE' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' }); } catch { return ''; } }

/* =====================================================================
   BENACHRICHTIGUNGEN · Zähler an der Glocke + Live-Ereignisse
   ===================================================================== */
async function nxUpdateNotifBadge() {
  const badge = document.getElementById('notif-count');
  if (!badge || !currentUser) { if (badge) badge.style.display = 'none'; return; }
  try {
    const list = await apiGet('/api/users/me/notifications');
    const unread = (list || []).filter(n => !n.read).length;
    badge.textContent = unread > 99 ? '99+' : String(unread);
    badge.style.display = unread ? 'inline-flex' : 'none';
    // Ungelesene Verwarnung, die der Nutzer noch nicht gesehen hat → einmal groß anzeigen
    const strike = (list || []).find(n => n.type === 'strike' && !n.read);
    if (strike && localStorage.getItem('nx_strike_seen') !== strike.id) {
      try { localStorage.setItem('nx_strike_seen', strike.id); } catch {}
      nxShowStrikeModal({ reason: strike.reason, strikeCount: strike.strikeCount, banned: strike.banned, contentTitle: strike.contentTitle });
    }
  } catch {}
}
function _nxHookSocket() {
  if (_nx172.socketHooked || typeof socket === 'undefined' || !socket) return;
  _nx172.socketHooked = true;
  socket.on('notification', (n) => {
    const badge = document.getElementById('notif-count');
    if (badge) { const c = (parseInt(badge.textContent, 10) || 0) + 1; badge.textContent = c > 99 ? '99+' : String(c); badge.style.display = 'inline-flex'; }
    if (n && n.type === 'takedown') showToast(tr({ en: 'One of your contents was removed', de: 'Einer deiner Inhalte wurde entfernt' }) + (n.contentTitle ? `: „${n.contentTitle}“` : ''), 'error');
    else if (n && n.type === 'report_status') showToast(n.commentText || tr({ en: 'Update on your report', de: 'Update zu deiner Meldung' }), 'info');
    const panel = document.getElementById('notifications-panel');
    if (panel && panel.style.display !== 'none' && typeof loadNotifications === 'function') loadNotifications();
  });
}
setInterval(_nxHookSocket, 1000);
setTimeout(() => { if (currentUser) nxUpdateNotifBadge(); }, 2500);
setInterval(() => { if (currentUser && !document.hidden) nxUpdateNotifBadge(); }, 120000);

/* =====================================================================
   VERWARNUNG (STRIKE) · großer Hinweis + Übersicht
   ===================================================================== */
function nxShowStrikeModal(d) {
  d = d || {};
  const count = Math.max(1, Math.min(3, d.strikeCount || 1));
  const dots = [1, 2, 3].map(i => `<span class="nx-strike-dot ${i <= count ? 'is-on' : ''}"></span>`).join('');
  _nxModal('nx-strike', `
    <div class="nx-strike">
      <div class="nx-strike-ico ${d.banned ? 'is-ban' : ''}"><i class="fas ${d.banned ? 'fa-ban' : 'fa-triangle-exclamation'}"></i></div>
      <h3>${d.banned ? tr({ en: 'Your account has been suspended', de: 'Dein Konto wurde gesperrt' }) : tr({ en: 'You received a strike', de: 'Du hast eine Verwarnung erhalten' })}</h3>
      <div class="nx-strike-dots" aria-label="${count}/3">${dots}<b>${count} / 3</b></div>
      <div class="nx-strike-reason">
        <span>${tr({ en: 'Reason', de: 'Grund' })}</span>
        <p>${escHtml(d.reason || tr({ en: 'Violation of the community guidelines', de: 'Verstoß gegen die Community-Richtlinien' }))}</p>
        ${d.contentTitle ? `<small>${tr({ en: 'Content', de: 'Inhalt' })}: „${escHtml(d.contentTitle)}“</small>` : ''}
      </div>
      <ul class="nx-strike-info">
        <li><i class="fas fa-clock"></i> ${tr({ en: 'Strikes expire after 90 days.', de: 'Verwarnungen verfallen nach 90 Tagen.' })}</li>
        <li><i class="fas fa-lock"></i> ${tr({ en: '3 active strikes lead to a suspension.', de: 'Bei 3 aktiven Verwarnungen wird das Konto gesperrt.' })}</li>
        <li><i class="fas fa-scale-balanced"></i> ${tr({ en: 'You can appeal within 6 months – a human will review it.', de: 'Du kannst innerhalb von 6 Monaten Widerspruch einlegen – ein Mensch prüft ihn.' })}</li>
      </ul>
      <div class="nx-strike-actions">
        <button class="co-btn co-btn--sec" data-h-click="h_ergaenzungen__nxCloseModal_69"><i class="fas fa-headset"></i> ${tr({ en: 'Appeal', de: 'Widerspruch einlegen' })}</button>
        <button class="co-btn co-btn--primary" data-action="_nxCloseModal" data-args="[&quot;nx-strike&quot;]">${tr({ en: 'Understood', de: 'Verstanden' })}</button>
      </div>
      <a class="nx-strike-link" href="/agb" target="_blank" rel="noopener">${tr({ en: 'Read the community guidelines', de: 'Community-Richtlinien lesen' })} <i class="fas fa-arrow-up-right-from-square"></i></a>
    </div>`);
  if (typeof NXD !== 'undefined' && NXD.play) { try { NXD.play('notification'); } catch {} }
  if (navigator.vibrate) { try { navigator.vibrate([120, 60, 120]); } catch {} }
}
async function nxOpenMyStrikes() {
  if (!currentUser) { openAuthModal('login'); return; }
  _nxModal('nx-mystrikes', `<div class="nxm-head"><div class="nxm-head-ico"><i class="fas fa-shield-halved"></i></div><div class="nxm-head-text"><h3>${tr({ en: 'Account status', de: 'Kontostatus' })}</h3><p>${tr({ en: 'Strikes and removed content', de: 'Verwarnungen und entfernte Inhalte' })}</p></div><button class="nxm-x" data-action="_nxCloseModal" data-args="[&quot;nx-mystrikes&quot;]" aria-label="Schließen"><i class="fas fa-xmark"></i></button></div><div class="nxm-body" id="nx-mystrikes-body"><div class="co-loading"><i class="fas fa-spinner fa-spin"></i></div></div>`);
  try {
    const d = await apiGet('/api/users/me/strikes');
    const body = document.getElementById('nx-mystrikes-body');
    if (!body) return;
    const ok = d.active === 0;
    body.innerHTML = `
      <div class="nx-acct-status ${ok ? 'is-ok' : 'is-warn'}">
        <i class="fas ${ok ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
        <div><b>${ok ? tr({ en: 'All good', de: 'Alles in Ordnung' }) : `${d.active} / ${d.max} ${tr({ en: 'active strikes', de: 'aktive Verwarnungen' })}`}</b>
        <small>${ok ? tr({ en: 'Your account has no active strikes.', de: 'Dein Konto hat keine aktiven Verwarnungen.' }) : tr({ en: 'Strikes expire after 90 days.', de: 'Verwarnungen verfallen nach 90 Tagen.' })}</small></div>
      </div>
      ${d.strikes.length ? `<div class="nx-strike-list">${d.strikes.map(s => `
        <div class="nx-strike-row ${s.active ? '' : 'is-expired'}">
          <i class="fas fa-triangle-exclamation"></i>
          <div><b>${escHtml(s.reason)}</b>${s.contentTitle ? `<small>„${escHtml(s.contentTitle)}“</small>` : ''}
          <small>${_nxDate(s.createdAt)} · ${s.active ? tr({ en: 'expires', de: 'verfällt am' }) + ' ' + _nxDate(s.expiresAt) : tr({ en: 'expired', de: 'abgelaufen' })}</small></div>
        </div>`).join('')}</div>` : ''}
      <button class="co-btn co-btn--sec co-btn--block" style="margin-top:14px" data-h-click="h_ergaenzungen__nxCloseModal_99"><i class="fas fa-scale-balanced"></i> ${tr({ en: 'Appeal a decision', de: 'Gegen eine Entscheidung Widerspruch einlegen' })}</button>`;
  } catch (e) { const b = document.getElementById('nx-mystrikes-body'); if (b) b.innerHTML = `<p class="co-err">${escHtml(e.message)}</p>`; }
}
// Link aus Push-Benachrichtigung/E-Mail: /#strikes
function _nxHashActions() {
  if (location.hash === '#strikes') { history.replaceState(null, '', '#home'); setTimeout(nxOpenMyStrikes, 600); }
}
window.addEventListener('hashchange', _nxHashActions);
setTimeout(_nxHashActions, 1500);

// Beim Seitenwechsel offene Bottom-Sheets/Abdunklungen immer schließen
(function () {
  const orig = window.navigateTo;
  if (typeof orig !== 'function' || orig._nx172) return;
  const wrapped = function (...a) {
    document.body.classList.remove('nx-sheet-open');
    document.querySelectorAll('.watch-more-dropdown.open').forEach(d => d.classList.remove('open'));
    document.getElementById('nx-short-menu')?.remove();
    return orig.apply(this, a);
  };
  wrapped._nx172 = true;
  window.navigateTo = wrapped;
})();

window.NX_VERSION = '1.72';

/* =====================================================================
   EINSTELLUNGEN → NEXA AI
   Eigener Bereich für die KI-Assistentin: an/aus, Tonfall, Sprache, Antwortlänge,
   ob Kanal-Daten genutzt werden dürfen, Support-Auto-Antworten, Verlauf löschen.
   ===================================================================== */
function nxNexaSettingsHtml() {
  return `<div id="nx-nexa-settings"><div class="co-loading"><i class="fas fa-spinner fa-spin"></i></div></div>`;
}
async function nxLoadNexaSettings() {
  const box = document.getElementById('nx-nexa-settings');
  if (!box) return;
  let d;
  try { d = await apiGet('/api/users/me/nexa-settings'); }
  catch (e) { box.innerHTML = `<p class="co-err">${escHtml(e.message)}</p>`; return; }
  const p = d.prefs, L = o => tr(o);
  const seg = (key, opts) => `<div class="st-seg" role="radiogroup">${opts.map(([v, label]) => `<button class="${p[key] === v ? 'is-on' : ''}" data-action="nxSaveNexaPref" data-args="${nxA(String(key), String(v))}">${label}</button>`).join('')}</div>`;
  const convCount = (() => { try { return JSON.parse(localStorage.getItem('nx_convs_' + (currentUser?.id || '')) || localStorage.getItem('nx_convs') || '[]').length; } catch { return 0; } })();
  box.innerHTML = `
    <div class="nx-nexa-hero ${p.enabled ? '' : 'is-off'}">
      <div class="nx-nexa-orb"><i class="fas fa-wand-magic-sparkles"></i></div>
      <div class="nx-nexa-hero-text">
        <b>Nexa</b>
        <span>${d.available ? (p.enabled ? L({ en: 'Your AI assistant is on', de: 'Deine KI-Assistentin ist eingeschaltet' }) : L({ en: 'Nexa is turned off for your account', de: 'Nexa ist für dein Konto ausgeschaltet' })) : L({ en: 'Nexa is currently unavailable on this server', de: 'Nexa ist auf diesem Server gerade nicht verfügbar' })}</span>
      </div>
      ${_stToggle('nx-nexa-enabled', p.enabled, function (event) { nxSaveNexaPref('enabled',this.checked); })}
    </div>
    ${_stGroup(L({ en: 'Answers', de: 'Antworten' }), [
      _stRow({ icon: 'fa-face-smile', title: L({ en: 'Tone', de: 'Tonfall' }), control: seg('tone', [['friendly', L({ en: 'Friendly', de: 'Freundlich' })], ['neutral', L({ en: 'Neutral', de: 'Sachlich' })], ['casual', L({ en: 'Casual', de: 'Locker' })]]) }),
      _stRow({ icon: 'fa-align-left', title: L({ en: 'Answer length', de: 'Antwortlänge' }), control: seg('detail', [['short', L({ en: 'Short', de: 'Kurz' })], ['normal', 'Normal'], ['detailed', L({ en: 'Detailed', de: 'Ausführlich' })]]) }),
      _stRow({ icon: 'fa-language', title: L({ en: 'Language', de: 'Sprache' }), control: seg('language', [['auto', 'Auto'], ['de', 'Deutsch'], ['en', 'English']]) }),
    ])}
    ${_stGroup(L({ en: 'Data & privacy', de: 'Daten & Privatsphäre' }), [
      _stRow({ icon: 'fa-chart-line', title: L({ en: 'Use my channel data', de: 'Meine Kanal-Daten nutzen' }), desc: L({ en: 'Nexa may read your video titles and statistics to give personal tips. Off = Nexa only knows your channel name.', de: 'Nexa darf deine Videotitel und Statistiken lesen, um dir persönliche Tipps zu geben. Aus = Nexa kennt nur deinen Kanalnamen.' }), control: _stToggle('nx-nexa-data', p.useChannelData, function (event) { nxSaveNexaPref('useChannelData',this.checked); }) }),
      _stRow({ icon: 'fa-headset', title: L({ en: 'Instant answers in support chat', de: 'Sofort-Antworten im Support-Chat' }), desc: L({ en: 'Nexa answers first; a human from the team takes over anytime.', de: 'Nexa antwortet zuerst, ein Mensch aus dem Team übernimmt jederzeit.' }), control: _stToggle('nx-nexa-support', p.supportAutoReply, function (event) { nxSaveNexaPref('supportAutoReply',this.checked); }) }),
      _stRow({ icon: 'fa-trash-can', title: L({ en: 'Delete Nexa chat history', de: 'Nexa-Chatverlauf löschen' }), desc: convCount ? `${convCount} ${L({ en: 'conversations on this device', de: 'Unterhaltungen auf diesem Gerät' })}` : L({ en: 'Stored only on this device', de: 'Nur auf diesem Gerät gespeichert' }), control: `<button class="st-btn st-btn-danger" data-action="nxClearNexaHistory">${L({ en: 'Delete', de: 'Löschen' })}</button>` }),
    ])}
    <div class="nx-nexa-info">
      <i class="fas fa-circle-info"></i>
      <p>${L({ en: `Nexa is an AI, not a human (Art. 50 EU AI Act). Answers can be wrong – please check important information. Your questions are processed by our AI provider ${escHtml(d.provider)} (model ${escHtml(d.model)}); Nexa never sees your password, email address or private messages.`, de: `Nexa ist eine KI, kein Mensch (Art. 50 KI-Verordnung). Antworten können Fehler enthalten – prüfe wichtige Angaben bitte nach. Deine Fragen verarbeitet unser KI-Dienstleister ${escHtml(d.provider)} (Modell ${escHtml(d.model)}); Passwort, E-Mail-Adresse und private Nachrichten sieht Nexa nie.` })}
      <a href="/datenschutz" target="_blank" rel="noopener">${L({ en: 'Privacy policy', de: 'Datenschutzerklärung' })}</a></p>
    </div>`;
}
async function nxSaveNexaPref(key, value) {
  try {
    await apiPatch('/api/users/me/nexa-settings', { [key]: value });
    if (key === 'detail') { try { localStorage.setItem('nx_detail', value); } catch {} if (typeof NX !== 'undefined') NX.detail = value; }
    if (currentUser) { currentUser.nexaPrefs = { ...(currentUser.nexaPrefs || {}), [key]: value }; }
    showToast(tr({ en: 'Saved', de: 'Gespeichert' }), 'success');
    nxLoadNexaSettings();
  } catch (e) { showToast(e.message, 'error'); nxLoadNexaSettings(); }
}
function nxClearNexaHistory() {
  if (!confirm(tr({ en: 'Delete all Nexa conversations on this device?', de: 'Alle Nexa-Unterhaltungen auf diesem Gerät löschen?' }))) return;
  try { Object.keys(localStorage).filter(k => /^nx_convs/.test(k) || k === 'nx_active_conv').forEach(k => localStorage.removeItem(k)); } catch {}
  if (typeof NX !== 'undefined') { NX.convs = []; NX.active = null; }
  showToast(tr({ en: 'Chat history deleted', de: 'Chatverlauf gelöscht' }), 'success');
  nxLoadNexaSettings();
}

/* =====================================================================
   CREATOR STUDIO → WERBUNG
   Video bewerben mit Paketen (je mehr Aufrufe, desto günstiger), echter Link-Prüfung
   für Video- und Website-Link und Live-Statistik der eigenen Kampagnen.
   ===================================================================== */
const _nxAds = { pkgs: [], video: null, pkg: null, clickUrl: null, clickOk: true, myVideos: [] };
const _fmtN = n => Number(n || 0).toLocaleString(_nxDe() ? 'de-DE' : 'en-US');

async function nxRenderAdsStudio(content) {
  if (!currentUser) return;
  content.innerHTML = `<div class="spinner" style="margin:40px auto;display:block"></div>`;
  try {
    const [pk, mine] = await Promise.all([apiGet('/api/promote/packages'), apiGet(`/api/videos?authorId=${currentUser.id}`).catch(() => [])]);
    _nxAds.pkgs = pk.packages || [];
    _nxAds.myVideos = (mine || []).filter(v => !v.isPrivate && !v.takenDown);
  } catch (e) { content.innerHTML = `<p class="co-err" style="padding:20px">${escHtml(e.message)}</p>`; return; }
  if (!_nxAds.pkg) _nxAds.pkg = (_nxAds.pkgs.find(p => p.badge === 'beliebt') || _nxAds.pkgs[0])?.id || null;
  const L = o => tr(o);
  content.innerHTML = `
    <div class="ads">
      <div class="ads-hero">
        <div class="ads-hero-ico"><i class="fas fa-bullhorn"></i></div>
        <div><h2>${L({ en: 'Promote your videos', de: 'Deine Videos bewerben' })}</h2>
        <p>${L({ en: 'Your video is shown as an ad before other videos and in the Shorts feed. You only pay for real views – the more you book, the cheaper each view.', de: 'Dein Video wird als Werbung vor anderen Videos und im Shorts-Feed gezeigt. Du zahlst nur echte Aufrufe – je mehr du buchst, desto günstiger wird jeder Aufruf.' })}</p></div>
      </div>

      <section class="ads-step">
        <div class="ads-step-head"><span class="ads-num">1</span><h3>${L({ en: 'Choose a video', de: 'Video auswählen' })}</h3></div>
        <div class="ads-link-row">
          <div class="ads-input-wrap"><i class="fas fa-link"></i><input id="ads-video-url" type="url" inputmode="url" autocomplete="off" placeholder="${L({ en: 'Paste your video link, e.g. norynex.com/video/…', de: 'Video-Link einfügen, z. B. norynex.com/video/…' })}"></div>
          <button class="co-btn co-btn--sec" data-action="nxAdsCheckVideo">${L({ en: 'Check', de: 'Prüfen' })}</button>
        </div>
        <div class="ads-field-msg" id="ads-video-msg"></div>
        ${_nxAds.myVideos.length ? `<div class="ads-or">${L({ en: 'or pick one of your videos', de: 'oder eines deiner Videos wählen' })}</div>
        <div class="ads-vlist">${_nxAds.myVideos.slice(0, 12).map(v => `
          <button class="ads-vitem" data-id="${v.id}" data-action="nxAdsPickVideo" data-args="${nxA(String(v.id))}">
            <span class="ads-vthumb">${v.thumbnailPath ? `<img src="${escHtml(v.thumbnailPath)}" alt="" loading="lazy">` : '<i class="fas fa-film"></i>'}${v.isShort ? '<em>Short</em>' : ''}</span>
            <span class="ads-vtitle">${escHtml(v.title || '')}</span>
          </button>`).join('')}</div>` : `<p class="ads-empty">${L({ en: 'You have no public videos yet.', de: 'Du hast noch keine öffentlichen Videos.' })}</p>`}
        <div id="ads-video-card"></div>
      </section>

      <section class="ads-step">
        <div class="ads-step-head"><span class="ads-num">2</span><h3>${L({ en: 'Choose a package', de: 'Paket wählen' })}</h3></div>
        <div class="ads-pkgs" id="ads-pkgs">${_nxAds.pkgs.map(p => `
          <button class="ads-pkg ${p.id === _nxAds.pkg ? 'is-on' : ''}" data-id="${p.id}" data-action="nxAdsPickPkg" data-args="${nxA(String(p.id))}">
            ${p.badge ? `<span class="ads-pkg-badge ads-pkg-badge--${p.badge}">${p.badge === 'beliebt' ? L({ en: 'Popular', de: 'Beliebt' }) : L({ en: 'Best value', de: 'Bester Preis' })}</span>` : ''}
            <span class="ads-pkg-views">${_fmtN(p.views)}</span>
            <span class="ads-pkg-lbl">${L({ en: 'views', de: 'Aufrufe' })}</span>
            <span class="ads-pkg-price">${_eur(p.price)}</span>
            <span class="ads-pkg-per">${_eur(p.perThousand)} / 1.000</span>
            ${p.savePercent ? `<span class="ads-pkg-save">−${p.savePercent}%</span>` : `<span class="ads-pkg-save is-base">${L({ en: 'Base price', de: 'Grundpreis' })}</span>`}
          </button>`).join('')}</div>
      </section>

      <section class="ads-step">
        <div class="ads-step-head"><span class="ads-num">3</span><h3>${L({ en: 'Website link', de: 'Website-Link' })} <small>${L({ en: '(optional)', de: '(optional)' })}</small></h3></div>
        <div class="ads-input-wrap"><i class="fas fa-globe"></i><input id="ads-click-url" type="url" inputmode="url" autocomplete="off" placeholder="https://deine-seite.de" data-h-blur="h_ergaenzungen_nxAdsCheckClick_241" data-h-input="h_ergaenzungen_trim_241"></div>
        <div class="ads-field-msg" id="ads-click-msg"></div>
        <p class="ads-hint">${L({ en: 'Viewers can tap the ad to open this page. We check that the link really exists.', de: 'Zuschauer können auf die Werbung tippen und landen auf dieser Seite. Wir prüfen, ob der Link wirklich existiert.' })}</p>
      </section>

      <div class="ads-summary" id="ads-summary"></div>

      <section class="ads-step">
        <div class="ads-step-head"><span class="ads-num"><i class="fas fa-chart-simple"></i></span><h3>${L({ en: 'My campaigns', de: 'Meine Kampagnen' })}</h3></div>
        <div id="ads-campaigns"><div class="co-loading"><i class="fas fa-spinner fa-spin"></i></div></div>
      </section>
      <p class="ads-legal"><i class="fas fa-shield-halved"></i> ${L({ en: 'Every ad is reviewed before it starts. If it is rejected you get the full amount back as balance. Ads are labelled as "Ad" for viewers.', de: 'Jede Werbung wird vor dem Start geprüft. Wird sie abgelehnt, bekommst du den vollen Betrag als Guthaben zurück. Für Zuschauer ist sie als „Werbung“ gekennzeichnet.' })}</p>
    </div>`;
  if (window._nxPromoteVideoId) { const id = window._nxPromoteVideoId; window._nxPromoteVideoId = null; nxAdsPickVideo(id); }
  else if (_nxAds.video) nxAdsPickVideo(_nxAds.video.id);
  const vi = document.getElementById('ads-video-url');
  vi?.addEventListener('keydown', e => { if (e.key === 'Enter') nxAdsCheckVideo(); });
  vi?.addEventListener('paste', () => setTimeout(nxAdsCheckVideo, 50));
  nxAdsSync();
  nxLoadCampaigns();
}
function _nxAdsMsg(id, html, ok) { const el = document.getElementById(id); if (el) { el.className = 'ads-field-msg ' + (ok ? 'is-ok' : 'is-err'); el.innerHTML = html; } }
async function nxAdsCheckVideo() {
  const raw = document.getElementById('ads-video-url')?.value.trim();
  if (!raw) { _nxAdsMsg('ads-video-msg', `<i class="fas fa-circle-exclamation"></i> ${tr({ en: 'Please paste a video link.', de: 'Bitte füge einen Video-Link ein.' })}`); return; }
  _nxAdsMsg('ads-video-msg', `<i class="fas fa-spinner fa-spin"></i> ${tr({ en: 'Checking link…', de: 'Link wird geprüft …' })}`, true);
  try {
    const r = await apiPost('/api/promote/check-link', { videoUrl: raw });
    _nxAdsSetVideo(r.video);
    _nxAdsMsg('ads-video-msg', `<i class="fas fa-circle-check"></i> ${tr({ en: 'Valid link – video found.', de: 'Gültiger Link – Video gefunden.' })}`, true);
  } catch (e) { _nxAds.video = null; document.getElementById('ads-video-card').innerHTML = ''; _nxAdsMsg('ads-video-msg', `<i class="fas fa-circle-exclamation"></i> ${escHtml(e.message)}`); nxAdsSync(); }
}
async function nxAdsPickVideo(id) {
  const inp = document.getElementById('ads-video-url');
  if (inp) inp.value = `${location.origin}/watch/${id}`;
  await nxAdsCheckVideo();
}
function _nxAdsSetVideo(v) {
  _nxAds.video = v;
  document.querySelectorAll('.ads-vitem').forEach(b => b.classList.toggle('is-on', b.dataset.id === v?.id));
  const card = document.getElementById('ads-video-card');
  if (card && v) card.innerHTML = `<div class="ads-vcard"><span class="ads-vthumb">${v.thumbnailPath ? `<img src="${escHtml(v.thumbnailPath)}" alt="">` : '<i class="fas fa-film"></i>'}</span>
    <div><b>${escHtml(v.title || '')}</b><small>${v.isShort ? 'Short · ' : ''}${_fmtN(v.views)} ${tr({ en: 'views so far', de: 'Aufrufe bisher' })}</small></div></div>`;
  nxAdsSync();
}
function nxAdsPickPkg(id) { _nxAds.pkg = id; document.querySelectorAll('.ads-pkg').forEach(b => b.classList.toggle('is-on', b.dataset.id === id)); nxAdsSync(); }
async function nxAdsCheckClick() {
  const raw = document.getElementById('ads-click-url')?.value.trim();
  if (!raw) { _nxAds.clickUrl = null; _nxAds.clickOk = true; document.getElementById('ads-click-msg').innerHTML = ''; nxAdsSync(); return true; }
  _nxAdsMsg('ads-click-msg', `<i class="fas fa-spinner fa-spin"></i> ${tr({ en: 'Checking link…', de: 'Link wird geprüft …' })}`, true);
  try {
    const r = await apiPost('/api/promote/check-link', { clickUrl: raw });
    _nxAds.clickUrl = r.clickUrl; _nxAds.clickOk = true;
    document.getElementById('ads-click-url').value = r.clickUrl;
    _nxAdsMsg('ads-click-msg', `<i class="fas fa-circle-check"></i> ${r.clickUrlUnverified ? tr({ en: 'Link looks valid.', de: 'Link sieht gültig aus.' }) : tr({ en: 'Link checked – the website exists.', de: 'Link geprüft – die Website existiert.' })}`, true);
  } catch (e) { _nxAds.clickUrl = null; _nxAds.clickOk = false; _nxAdsMsg('ads-click-msg', `<i class="fas fa-circle-exclamation"></i> ${escHtml(e.message)}`); }
  nxAdsSync();
  return _nxAds.clickOk;
}
function nxAdsSync() {
  const box = document.getElementById('ads-summary');
  if (!box) return;
  const p = _nxAds.pkgs.find(x => x.id === _nxAds.pkg);
  const ready = !!(_nxAds.video && p && _nxAds.clickOk);
  const missing = !_nxAds.video ? tr({ en: 'Choose a video first', de: 'Wähle zuerst ein Video' }) : !p ? tr({ en: 'Choose a package', de: 'Wähle ein Paket' }) : !_nxAds.clickOk ? tr({ en: 'Fix the website link or leave it empty', de: 'Website-Link korrigieren oder leer lassen' }) : '';
  box.innerHTML = `
    <div class="ads-sum-row"><span>${tr({ en: 'Views', de: 'Aufrufe' })}</span><b>${p ? _fmtN(p.views) : '–'}</b></div>
    <div class="ads-sum-row"><span>${tr({ en: 'Price per 1,000 views', de: 'Preis pro 1.000 Aufrufe' })}</span><b>${p ? _eur(p.perThousand) : '–'}</b></div>
    ${p && p.savePercent ? `<div class="ads-sum-row is-save"><span>${tr({ en: 'You save', de: 'Du sparst' })}</span><b>${p.savePercent}%</b></div>` : ''}
    <div class="ads-sum-total"><span>${tr({ en: 'Total', de: 'Gesamt' })}</span><b>${p ? _eur(p.price) : '–'}</b></div>
    <button class="co-btn co-btn--primary co-btn--block" ${ready ? '' : 'disabled'} data-action="nxAdsContinue"><i class="fas fa-rocket"></i> ${ready ? tr({ en: 'Continue to payment', de: 'Weiter zur Zahlung' }) : escHtml(missing)}</button>`;
}
async function nxAdsContinue() {
  const raw = document.getElementById('ads-click-url')?.value.trim();
  if (raw && raw !== _nxAds.clickUrl) { if (!(await nxAdsCheckClick())) return; }
  const p = _nxAds.pkgs.find(x => x.id === _nxAds.pkg);
  if (!_nxAds.video || !p) return;
  openCheckout({ type: 'ad', videoId: _nxAds.video.id, videoTitle: _nxAds.video.title, adPackage: p.id, views: p.views, amount: p.price, clickUrl: _nxAds.clickUrl || null });
}
async function nxLoadCampaigns() {
  const box = document.getElementById('ads-campaigns');
  if (!box) return;
  try {
    const list = await apiGet('/api/promote/campaigns');
    if (!list.length) { box.innerHTML = `<p class="ads-empty">${tr({ en: 'No campaigns yet. Your booked ads will appear here with live statistics.', de: 'Noch keine Kampagnen. Gebuchte Werbung erscheint hier mit Live-Statistik.' })}</p>`; return; }
    const st = { review: ['fa-hourglass-half', tr({ en: 'In review', de: 'In Prüfung' })], active: ['fa-circle-play', tr({ en: 'Running', de: 'Läuft' })], done: ['fa-flag-checkered', tr({ en: 'Completed', de: 'Abgeschlossen' })], paused: ['fa-pause', tr({ en: 'Paused', de: 'Pausiert' })], rejected: ['fa-ban', tr({ en: 'Rejected', de: 'Abgelehnt' })] };
    box.innerHTML = list.map(c => {
      const pct = c.purchased ? Math.min(100, Math.round(c.impressions / c.purchased * 100)) : 0;
      const ctr = c.impressions ? (c.clicks / c.impressions * 100).toFixed(1) : '0.0';
      const [ico, label] = st[c.status] || st.review;
      return `<div class="ads-camp">
        <span class="ads-vthumb">${c.thumbnail ? `<img src="${escHtml(c.thumbnail)}" alt="" loading="lazy">` : '<i class="fas fa-film"></i>'}</span>
        <div class="ads-camp-main">
          <div class="ads-camp-top"><b>${escHtml(c.title || '')}</b><span class="ads-st ads-st--${c.status}"><i class="fas ${ico}"></i> ${label}</span></div>
          <div class="ads-bar"><span style="width:${pct}%"></span></div>
          <div class="ads-camp-stats"><span><b>${_fmtN(c.impressions)}</b> / ${_fmtN(c.purchased)} ${tr({ en: 'views', de: 'Aufrufe' })}</span><span><b>${_fmtN(c.completions)}</b> ${tr({ en: 'watched fully', de: 'ganz gesehen' })}</span>${c.clickUrl ? `<span><b>${_fmtN(c.clicks)}</b> ${tr({ en: 'clicks', de: 'Klicks' })} (${ctr}%)</span>` : ''}<span>${_eur(c.budget)}</span></div>
          ${c.status === 'rejected' && c.rejectReason ? `<small class="ads-rej">${escHtml(c.rejectReason)}</small>` : ''}
        </div></div>`;
    }).join('');
  } catch (e) { box.innerHTML = `<p class="co-err">${escHtml(e.message)}</p>`; }
}

/* =====================================================================
   ANMELDEN MIT APPLE
   Button unter „Mit Google anmelden“ (Login und Registrierung). Läuft über die echte
   Anmeldeseite von Apple. Ist Apple auf dem Server nicht eingerichtet, bleibt der Button weg.
   (Microsoft- und Telefon-Login wurden in v1.80 entfernt.)
   ===================================================================== */
let _nxProviders = null;
async function _nxGetProviders() {
  if (_nxProviders) return _nxProviders;
  try { _nxProviders = typeof _nxAuthProviders !== 'undefined' ? await _nxAuthProviders : await apiGet('/api/auth/providers'); } catch { _nxProviders = {}; }
  return _nxProviders;
}
const _NX_APPLE_SVG = '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>';
function _nxSocialButtons(mode) {
  const de = _nxDe();
  const verb = mode === 'register' ? (de ? 'registrieren' : 'Sign up') : (de ? 'anmelden' : 'Sign in');
  const lbl = (who) => de ? `Mit ${who} ${verb}` : `${verb} with ${who}`;
  const wrap = document.createElement('div');
  wrap.className = 'nx-social-btns';
  wrap.hidden = true; // erst zeigen, wenn der Server Apple meldet
  wrap.innerHTML = `
    <button type="button" class="nx-social-btn nx-social-apple" data-action="nxOAuthStart" data-args='["apple","${mode === 'register' ? 'register' : 'login'}"]'>${_NX_APPLE_SVG}<span>${lbl('Apple')}</span></button>`;
  _nxGetProviders().then(pv => { if (pv && pv.apple) wrap.hidden = false; });
  return wrap;
}
function _nxInjectSocialButtons() {
  [['google-signin-btn-login', 'login'], ['google-signin-btn-register', 'register']].forEach(([id, mode]) => {
    const g = document.getElementById(id);
    if (!g || g.nextElementSibling?.classList.contains('nx-social-btns')) return;
    g.after(_nxSocialButtons(mode));
  });
}
(function () {
  const orig = window._initGoogleButtons;
  if (typeof orig === 'function' && !orig._nx172) {
    const w = function (...a) { const r = orig.apply(this, a); try { _nxInjectSocialButtons(); } catch {} return r; };
    w._nx172 = true; window._initGoogleButtons = w;
  }
  document.addEventListener('DOMContentLoaded', _nxInjectSocialButtons);
  setTimeout(_nxInjectSocialButtons, 800);
})();

async function nxOAuthStart(provider, mode) {
  const pv = await _nxGetProviders();
  if (provider !== 'apple' || !pv.apple) {
    showToast(tr({ en: 'Sign in with Apple is not set up on this server yet.', de: 'Die Anmeldung mit Apple ist auf diesem Server noch nicht eingerichtet.' }), 'info');
    return;
  }
  location.href = `/api/auth/oauth/${provider}/start?mode=${mode === 'register' ? 'register' : 'login'}`;
}

// ── Rückkehr vom Anbieter: #social=<ticket> bzw. #social-error=<text> ──
async function _nxHandleSocialReturn() {
  const h = location.hash;
  if (h.startsWith('#social-error=')) {
    const msg = decodeURIComponent(h.slice('#social-error='.length));
    history.replaceState(null, '', '#home');
    showToast(msg, 'error');
    return;
  }
  if (!h.startsWith('#social=')) return;
  const params = new URLSearchParams(h.slice(1));
  const ticket = params.get('social');
  history.replaceState(null, '', '#home');
  if (ticket) await nxSocialComplete(ticket, {});
}
async function _nxSocialPost(payload) {
  let data = await apiPost('/api/auth/social/complete', payload);
  for (let i = 0; data && data.requires2FA && i < 3; i++) {
    const code = await nxAskCode(tr({ en: 'Two-factor authentication: enter the 6-digit code from your authenticator app', de: 'Zwei-Faktor-Authentifizierung: Gib den 6-stelligen Code aus deiner Authenticator-App ein' }));
    if (!code) throw new Error(tr({ en: 'Login cancelled', de: 'Anmeldung abgebrochen' }));
    data = await apiPost('/api/auth/social/complete', { ...payload, totpToken: code.trim() });
  }
  return data;
}
async function nxSocialComplete(ticket, extra) {
  try {
    const data = await _nxSocialPost({ ticket, ...extra });
    if (data.needsSignup) return _nxSocialSignup(ticket, data);
    _completeGoogleLogin(data);
  } catch (e) { showToast(e.message, 'error'); }
}
function _nxSocialSignup(ticket, info) {
  const prov = info.provider === 'apple' ? 'Apple' : '';
  const ico = _NX_APPLE_SVG;
  _nxModal('nx-social-signup', `
    <div class="nxm-head"><div class="nxm-head-ico">${ico}</div><div class="nxm-head-text"><h3>${tr({ en: 'Create your Norynex account', de: 'Norynex-Konto erstellen' })}</h3><p>${escHtml(prov)}${info.email ? ': ' + escHtml(info.email) : ''}</p></div><button class="nxm-x" data-action="_nxCloseModal" data-args="[&quot;nx-social-signup&quot;]" aria-label="Schließen"><i class="fas fa-xmark"></i></button></div>
    <div class="nxm-body">
      <label class="gs-field"><span>${tr({ en: 'Display name', de: 'Anzeigename' })}</span><input type="text" id="ss-display" maxlength="40" value="${escHtml(info.suggestedDisplayName || '')}" autocomplete="name"></label>
      <label class="gs-field"><span>${tr({ en: 'Username', de: 'Benutzername' })}</span><div class="gs-input-prefix"><em>@</em><input type="text" id="ss-user" maxlength="20" value="${escHtml(info.suggestedUsername || '')}" autocomplete="username" spellcheck="false"></div><small id="ss-user-hint"></small></label>
      <label class="gs-check"><input type="checkbox" id="ss-terms"><span>${tr({ en: 'I accept the <a href="/agb" target="_blank">terms</a> and have read the <a href="/datenschutz" target="_blank">privacy policy</a>.', de: 'Ich akzeptiere die <a href="/agb" target="_blank">AGB</a> und habe die <a href="/datenschutz" target="_blank">Datenschutzerklärung</a> gelesen.' })}</span></label>
      <p class="co-err" id="ss-err"></p>
      <button class="co-btn co-btn--primary co-btn--block" id="ss-go">${tr({ en: 'Create account', de: 'Konto erstellen' })}</button>
    </div>`);
  const u = document.getElementById('ss-user'), hint = document.getElementById('ss-user-hint');
  let t = null;
  const check = async () => {
    u.value = u.value.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '');
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(u.value)) { hint.className = 'is-bad'; hint.textContent = tr({ en: '3–20 characters: letters, numbers, _', de: '3–20 Zeichen: Buchstaben, Zahlen, _' }); return; }
    try { const r = await apiGet('/api/auth/username-available?u=' + encodeURIComponent(u.value)); hint.className = r.available ? 'is-ok' : 'is-bad'; hint.textContent = r.available ? tr({ en: 'Available', de: 'Verfügbar' }) : tr({ en: 'Already taken', de: 'Schon vergeben' }); } catch {}
  };
  u.addEventListener('input', () => { clearTimeout(t); t = setTimeout(check, 250); }); check();
  document.getElementById('ss-go').onclick = async () => {
    const err = document.getElementById('ss-err'); err.textContent = '';
    if (!document.getElementById('ss-terms').checked) { err.textContent = tr({ en: 'Please accept the terms and privacy policy.', de: 'Bitte bestätige AGB und Datenschutzerklärung.' }); return; }
    const btn = document.getElementById('ss-go'); btn.disabled = true;
    try {
      const data = await _nxSocialPost({ ticket, create: true, desiredUsername: u.value.trim(), desiredDisplayName: document.getElementById('ss-display').value.trim(), acceptTerms: true });
      _nxCloseModal('nx-social-signup');
      _completeGoogleLogin(data);
    } catch (e) { err.textContent = e.message; btn.disabled = false; }
  };
}
// ─── Teil: client/ergaenzungen/020-apple-rueckkehr.js ───

// ── Rückkehr von „Mit Apple anmelden“ (#social=<ticket>) ──
// (Die Anmeldung per Telefonnummer wurde in v1.80 entfernt.)
setTimeout(_nxHandleSocialReturn, 900);
window.addEventListener('hashchange', _nxHandleSocialReturn);
// ─── Teil: client/ergaenzungen/995-ereignis-handler.js ───
// ── Ereignis-Handler (v1.82: statt Inline-Handlern im HTML – CSP ohne 'unsafe-inline'; Verteiler: public/js/nx-events.js) ──
(window.NX_H = window.NX_H || {}).h_ergaenzungen__nxCloseModal_69 = function (event, v) { _nxCloseModal('nx-strike');if(typeof openSupportChatWidget==='function')openSupportChatWidget() };
(window.NX_H = window.NX_H || {}).h_ergaenzungen__nxCloseModal_99 = function (event, v) { _nxCloseModal('nx-mystrikes');if(typeof openSupportChatWidget==='function')openSupportChatWidget() };
(window.NX_H = window.NX_H || {}).h_ergaenzungen_nxAdsCheckClick_241 = function (event, v) { nxAdsCheckClick() };
(window.NX_H = window.NX_H || {}).h_ergaenzungen_trim_241 = function (event, v) { _nxAds.clickOk=!this.value.trim();document.getElementById('ads-click-msg').innerHTML='';nxAdsSync() };
