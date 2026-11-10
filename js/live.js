// ⚠️  AUTOMATISCH ERZEUGT aus client/live/*.js — bitte NICHT hier bearbeiten, sondern dort; danach "npm run build".
// ─── Teil: client/live/010-uebersicht-player.js ───
/* =====================================================================
   NORYNEX LIVE · v1.73
   Neue Live-Übersicht, neue Stream-Seite (Player, Kanal-Infos, Chat mit Moderation),
   Live-Abos & Geschenke, Melden, Raids, Alerts – und Creator Studio → „Live-Tools“
   (Stream-Info, Moderation, Bots, OBS-Overlays & Alerts, Abos, Statistik).
   ===================================================================== */
(function () {
'use strict';
const L = (de, en) => (typeof cl === 'function' && cl() === 'en') ? en : de;
const esc = (s) => (typeof escHtml === 'function' ? escHtml(s) : String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
const eur = (n) => (Number(n) || 0).toLocaleString(L('de-DE', 'en-IE'), { style: 'currency', currency: 'EUR' });
const fmtNum = (n) => (Number(n) || 0).toLocaleString(L('de-DE', 'en-US'));
const catName = (c) => c ? (L(c.de, c.en || c.de)) : '';
const badges = (list) => (typeof nxChatBadges === 'function' ? nxChatBadges(list) : '');
const $ = (id) => document.getElementById(id);
window.ltEl = (id) => document.getElementById(id);
function dur(ms) { const s = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); }
// System-/Ereignis-Texte vom Server: Emojis aus älteren Vorlagen entfernen, Symbol kommt per Font Awesome
const lvNoEmoji = (t) => String(t == null ? '' : t).replace(/(?:\p{Regional_Indicator}{2}|(?![©®™])\p{Extended_Pictographic}(?:\uFE0F)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F)?)*)\s?/gu, '').replace(/\uFE0F/g, '').trim();
const SYS_ICON = { ad: 'fa-tv', mod: 'fa-shield-halved', mode: 'fa-sliders', raid: 'fa-rocket', poll: 'fa-chart-simple', pred: 'fa-wand-magic-sparkles', end: 'fa-flag-checkered', welcome: 'fa-hand', info: 'fa-circle-info', error: 'fa-triangle-exclamation' };
const SVG = {
  heart: '<i class="fas fa-heart" aria-hidden="true"></i>',
  star: '<i class="fas fa-star" aria-hidden="true"></i>',
  gift: '<i class="fas fa-gift" aria-hidden="true"></i>',
  cast: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm18-7H5v1.63c3.96 1.28 7.09 4.41 8.37 8.37H19V7zM1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.92-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>',
  users: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 13c-3.3 0-7 1.7-7 4.5V20h14v-2.5C16 14.7 12.3 13 9 13zm7 0c-.5 0-1 0-1.5.1 1.5 1 2.5 2.5 2.5 4.4V20h5v-2.5c0-2.8-3.3-4.5-6-4.5z"/></svg>',
  person: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-9 2.2-9 5.5V22h18v-2.5C21 16.2 16.4 14 12 14z"/></svg>',
};

/* ---------------------------------------------------------------
   Zustand & Einstellungen
   --------------------------------------------------------------- */
const LV = window.LV = { cid: null, info: null, autoscroll: true, unread: 0, replyTo: null, uptimeT: null, raidT: null, chatEl: null };
const SET_KEY = 'nx_lv_settings';
function lvSettings() { try { return { size: 'm', time: false, hideBots: false, anim: true, ...(JSON.parse(localStorage.getItem(SET_KEY) || '{}')) }; } catch { return { size: 'm', time: false, hideBots: false, anim: true }; } }
function lvSaveSettings(p) { const s = { ...lvSettings(), ...p }; try { localStorage.setItem(SET_KEY, JSON.stringify(s)); } catch {} return s; }

/* ---------------------------------------------------------------
   LIVE-ÜBERSICHT
   --------------------------------------------------------------- */
let _dirCat = 'all', _dirSort = 'viewers', _dirTimer = null, _dirData = null;
window.renderLivePage = async function renderLivePage() {
  const el = $('page-live'); if (!el) return;
  clearInterval(_dirTimer);
  if (!_dirData) el.innerHTML = `<div class="lvd"><div class="lvd-head"><h2><span class="lvd-dot"></span>${L('Livestreams', 'Live streams')}</h2></div><div class="lvd-grid">${'<div class="lvd-card is-skel"><div class="lvd-thumb"></div><div class="lvd-body"><div class="lvd-skel-line"></div><div class="lvd-skel-line short"></div></div></div>'.repeat(6)}</div></div>`;
  try { _dirData = await apiGet('/api/lv/directory'); }
  catch (e) {
    el.innerHTML = `<div class="lvd"><div class="lvd-head"><h2><span class="lvd-dot"></span>${L('Livestreams', 'Live streams')}</h2></div>` + emptyState('fa-broadcast-tower', t('error_live_title'), t('error_live_desc')) + `<div style="text-align:center"><button class="btn-primary" data-h-click="h_live_renderLivePage_48">${L('Erneut versuchen', 'Try again')}</button></div></div>`;
    return;
  }
  drawDirectory();
  _dirTimer = setInterval(async () => {
    if (currentPage !== 'live' || document.hidden) return;
    try { _dirData = await apiGet('/api/lv/directory'); drawDirectory(); } catch {}
  }, 30000);
};
function dirCard(s) {
  const up = Date.now() - new Date(s.startedAt).getTime();
  const thumb = s.thumb
    ? `<img src="${esc(s.thumb)}" alt="" loading="lazy" data-h-error="h_live_remove_60">`
    : `<div class="lvd-thumb-fallback" style="${s.avatar ? `--ava:url('${esc(s.avatar)}')` : ''}"><span>${esc((s.displayName || '?')[0].toUpperCase())}</span></div>`;
  return `<a class="lvd-card" href="/stream/${esc(s.userId)}" data-h-click="h_live_preventDefault_62" data-hv-click="${nxHv(String(esc(s.userId)))}">
    <div class="lvd-thumb">${thumb}<span class="lvd-live">LIVE</span>${s.mature ? '<span class="lvd-18">18+</span>' : ''}<span class="lvd-viewers">${SVG.person} ${fmtNum(s.viewers)}</span><span class="lvd-up">${dur(up).replace(/:\d\d$/, '')} h</span></div>
    <div class="lvd-body">
      <div class="lvd-ava">${typeof buildAvatarHtml === 'function' ? buildAvatarHtml({ id: s.userId, avatar: s.avatar, activeFrame: s.activeFrame, displayName: s.displayName, username: s.username }, 38, { noVideo: true }) : ''}</div>
      <div class="lvd-text">
        <div class="lvd-title" title="${esc(s.title)}">${esc(s.title)}</div>
        <div class="lvd-name">${esc(s.displayName)}${s.isVerified ? ' <i class="fas fa-circle-check" style="color:#60a5fa;font-size:11px"></i>' : ''}</div>
        <div class="lvd-cat">${esc(catName(s.category))}</div>
        ${s.tags && s.tags.length ? `<div class="lvd-tags">${s.tags.slice(0, 3).map(tg => `<span>${esc(tg)}</span>`).join('')}</div>` : ''}
      </div>
    </div></a>`;
}
function drawDirectory() {
  const el = $('page-live'); if (!el || !_dirData) return;
  const all = _dirData.streams || [];
  if (_dirCat !== 'all' && !all.some(s => s.category.id === _dirCat)) _dirCat = 'all';
  let list = all.filter(s => _dirCat === 'all' || s.category.id === _dirCat);
  if (_dirSort === 'new') list = list.slice().sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  const followed = all.filter(s => s.followed);
  const total = all.reduce((a, s) => a + s.viewers, 0);
  if (!all.length) {
    el.innerHTML = `<div class="lvd"><div class="lvd-head"><h2><span class="lvd-dot is-off"></span>${L('Livestreams', 'Live streams')}</h2></div>
      <div class="lvd-empty"><div class="lvd-empty-ico"><i class="fas fa-broadcast-tower"></i></div><h3>${L('Gerade ist niemand live', 'Nobody is live right now')}</h3><p>${L('Folge Kanälen, dann sagen wir dir Bescheid, sobald sie live gehen.', 'Follow channels and we will let you know when they go live.')}</p>
      ${currentUser ? `<button class="btn-primary" data-h-click="h_live_replaceState_85"><i class="fas fa-video"></i> ${t('go_live_now')}</button>` : ''}</div></div>`;
    return;
  }
  el.innerHTML = `<div class="lvd">
    <div class="lvd-head"><h2><span class="lvd-dot"></span>${L('Livestreams', 'Live streams')}</h2>
      <div class="lvd-sum">${fmtNum(all.length)} ${all.length === 1 ? L('Kanal live', 'channel live') : L('Kanäle live', 'channels live')} · ${fmtNum(total)} ${L('Zuschauer', 'viewers')}</div>
      <select class="lvd-sort" data-h-change="h_live_lvDirSort_90"><option value="viewers" ${_dirSort === 'viewers' ? 'selected' : ''}>${L('Meiste Zuschauer', 'Most viewers')}</option><option value="new" ${_dirSort === 'new' ? 'selected' : ''}>${L('Zuletzt gestartet', 'Recently started')}</option></select>
    </div>
    <div class="lvd-cats"><button class="${_dirCat === 'all' ? 'is-on' : ''}" data-h-click="h_live_lvDirCat_93_2">${L('Alle', 'All')} <b>${all.length}</b></button>${(_dirData.categories || []).map(c => `<button class="${_dirCat === c.id ? 'is-on' : ''}" data-h-click="h_live_lvDirCat_93" data-hv-click="${nxHv(String(esc(c.id)))}">${esc(catName(c))} <b>${c.streams}</b></button>`).join('')}</div>
    ${followed.length && _dirCat === 'all' ? `<h3 class="lvd-sec"><i class="fas fa-heart"></i> ${L('Kanäle, denen du folgst', 'Channels you follow')}</h3><div class="lvd-grid">${followed.map(dirCard).join('')}</div><h3 class="lvd-sec">${L('Alle Livestreams', 'All live streams')}</h3>` : ''}
    <div class="lvd-grid">${list.map(dirCard).join('')}</div>
  </div>`;
}
window.lvDirCat = (c) => { _dirCat = c; drawDirectory(); };
window.lvDirSort = (s) => { _dirSort = s; drawDirectory(); };

/* ---------------------------------------------------------------
   STREAM-SEITE
   --------------------------------------------------------------- */
window.renderStreamPage = async function renderStreamPage(userId) {
  if (!userId) return;
  const el = $('page-stream'); if (!el) return;
  lvLeave();
  el.innerHTML = `<div class="lv-page is-loading"><div class="lv-main"><div class="lv-player lv-skel"></div><div class="lv-skel-line" style="width:60%;margin-top:16px"></div><div class="lv-skel-line" style="width:35%"></div></div><aside class="lv-chat lv-skel"></aside></div>`;
  let info;
  try { info = await apiGet(`/api/lv/${encodeURIComponent(userId)}/info`); }
  catch (e) { el.innerHTML = `<div class="lvd-empty" style="margin-top:60px"><div class="lvd-empty-ico"><i class="fas fa-satellite-dish"></i></div><h3>${L('Stream nicht gefunden', 'Stream not found')}</h3><p>${esc(e.message || '')}</p><button class="btn-primary" data-h-click="h_live_navigateTo_111">${L('Zu den Livestreams', 'Browse live streams')}</button></div>`; return; }
  const cid = info.channel.id;
  LV.cid = cid; LV.info = info; LV.autoscroll = true; LV.unread = 0; LV.replyTo = null;
  window._currentStreamerId = cid; window._currentStreamUserId = cid;
  lvBindSocket();
  if (socket) { try { const tk = localStorage.getItem('nxd_token'); if (tk) socket.emit('join_user', tk); } catch {} socket.emit('join_stream', cid); }
  el.innerHTML = lvPageHtml(info);
  lvApplySettings();
  lvFitHeight(); setTimeout(lvFitHeight, 400); setTimeout(lvFitHeight, 1500);
  // Chat
  const list = $('lv-chat-list');
  (info.chat.history || []).forEach(m => lvAddMsg(m, true));
  if (!list.children.length) lvSysLocal(L('Willkommen im Chat! Sei freundlich und hab Spaß.', 'Welcome to the chat! Be nice and have fun.'));
  lvScrollBottom();
  list.addEventListener('click', (ev) => {
    if (ev.target.closest('button, a')) return;
    const row = ev.target.closest('.lv-msg'); if (!row) return;
    list.querySelectorAll('.lv-msg.is-active').forEach(r => { if (r !== row) r.classList.remove('is-active'); });
    row.classList.toggle('is-active');
  });
  list.addEventListener('scroll', () => {
    const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;
    LV.autoscroll = atBottom;
    if (atBottom) { LV.unread = 0; $('lv-chat-more')?.classList.remove('is-on'); }
  });
  lvRenderPinned(info.chat.pinned); lvRenderModes(info.chat.modes); lvRenderGoal(info.goal);
  // Player
  if (info.live.isLive) {
    const video = $('stream-video');
    if (typeof xpTrack === 'function') xpTrack('live', cid);
    if (video && typeof nxAttachLiveHls === 'function') nxAttachLiveHls(video, cid);
    if (typeof nxInitPlayerControls === 'function') nxInitPlayerControls(video);
    if (video) {
      video.addEventListener('volumechange', () => { try { localStorage.setItem('nx_lv_vol', JSON.stringify({ v: video.volume, m: video.muted })); } catch {} });
      try { const sv = JSON.parse(localStorage.getItem('nx_lv_vol') || 'null'); if (sv) { video.volume = sv.v; const sl = $('nx-volume-slider'); if (sl) sl.value = sv.v; } } catch {}
    }
    lvMediaSession(info);
    clearInterval(LV.uptimeT);
    const started = new Date(info.live.startedAt || Date.now()).getTime();
    const tick = () => { const u = $('lv-uptime'); if (!u) return clearInterval(LV.uptimeT); u.textContent = dur(Date.now() - started); };
    tick(); LV.uptimeT = setInterval(tick, 1000);
  } else lvLoadOfflineVideos(cid);
  lvLoadChannelVideos(cid);
  lvLoadVods(cid);
  lvLoadCommands();
  lvLoadEngage();
  clearInterval(LV.engT); LV.engT = setInterval(() => { if (LV.cid === cid && !document.hidden) lvLoadEngage(); }, 60000);
  // Timeout/Bann anzeigen
  if (info.me && info.me.banned) lvLockInput(L('Du wurdest aus diesem Chat gebannt.', 'You are banned from this chat.'));
  else if (info.me && info.me.timeoutUntil) lvTimeoutLock(info.me.timeoutUntil);
};

// Die Seite füllt genau den sichtbaren Bereich unter der Kopfzeile (und über der Handy-Navigation)
function lvFitHeight() {
  const p = $('lv-page'); if (!p) return;
  const top = Math.max(0, p.getBoundingClientRect().top + window.scrollY);
  const nav = document.querySelector('.mobile-bottom-nav, #mobile-bottom-nav, .bottom-nav');
  const navH = nav && getComputedStyle(nav).display !== 'none' && nav.getBoundingClientRect().height < 120 ? nav.getBoundingClientRect().height : 0;
  p.style.setProperty('--lv-top', top + 'px');
  p.style.setProperty('--lv-bottom', navH + 'px');
}
window.addEventListener('resize', () => { if (LV.cid) lvFitHeight(); });
function lvPageHtml(info) {
  const ch = info.channel, live = info.live, me = info.me;
  const owner = me && me.role === 'owner';
  const canMod = me && ['owner', 'mod', 'staff'].includes(me.role);
  const subsOn = info.subs.enabled && !owner;
  const ava = typeof buildAvatarHtml === 'function' ? buildAvatarHtml({ id: ch.id, avatar: ch.avatar, activeFrame: ch.activeFrame, displayName: ch.displayName, username: ch.username }, 64, { noVideo: true }) : '';
  const player = live.isLive ? `
    <div id="stream-video-container" class="nx-player lv-player">
      <video id="stream-video" autoplay playsinline webkit-playsinline x-webkit-airplay="allow"></video>
      <div id="nx-player-loading" class="nx-player-loading"><div class="nx-spinner"></div><span>${L('Verbinde mit dem Livestream …', 'Connecting to the live stream…')}</span></div>
      <div class="lv-alert-zone" id="lv-alert-zone"></div>
      <div class="lv-ad" id="lv-ad" hidden></div>
      <div class="lv-raid" id="lv-raid" hidden></div>
      <div class="nx-player-controls">
        <button class="nx-ctrl-btn" id="nx-play-btn" data-h-click="h_live_nxTogglePlay_182" title="Play/Pause" aria-label="Play/Pause"><i class="fas fa-pause"></i></button>
        <button class="nx-ctrl-btn" id="nx-mute-btn" data-h-click="h_live_nxToggleMute_182" title="${L('Ton', 'Sound')}" aria-label="${L('Ton', 'Sound')}"><i class="fas fa-volume-high"></i></button>
        <input type="range" id="nx-volume-slider" class="nx-volume-slider" min="0" max="1" step="0.05" value="1" data-h-input="h_live_nxSetVolume_188" aria-label="${L('Lautstärke', 'Volume')}">
        <span class="nx-live-dot"><span class="nx-live-dot-ping"></span>LIVE</span>
        <button class="lv-jump" data-h-click="h_live_lvJumpLive_189" title="${L('Zum Live-Punkt springen', 'Jump to live')}">${L('Zu Live', 'Go live')}</button>
        <span class="nx-ctrl-spacer"></span>
        <button class="nx-ctrl-btn" id="nx-cast-live-btn" data-h-click="h_live_nxCastLive_191" data-hv-click="${nxHv(String(esc(ch.id)))}" title="${L('Auf Fernseher streamen', 'Cast to TV')}" aria-label="Cast">${SVG.cast}</button>
        <button class="nx-ctrl-btn lv-only-desk" data-h-click="h_live_lvTheater_193" title="${L('Kinomodus', 'Theatre mode')}" aria-label="${L('Kinomodus', 'Theatre mode')}"><i class="fas fa-panorama"></i></button>
        <button class="nx-ctrl-btn" id="nx-pip-btn" data-h-click="h_live_nxTogglePip_194" title="Bild-in-Bild" aria-label="PiP"><i class="fas fa-clone"></i></button>
        <button class="nx-ctrl-btn" id="nx-fs-btn" data-h-click="h_live_nxToggleFullscreen_194" title="${L('Vollbild', 'Fullscreen')}" aria-label="${L('Vollbild', 'Fullscreen')}"><i class="fas fa-expand"></i></button>
      </div>
    </div>` : `
    <div class="lv-player lv-offline" style="${ch.banner ? `--banner:url('${esc(ch.banner)}')` : ''}">
      <div class="lv-offline-inner">
        <div class="lv-offline-ava">${ava}</div>
        <span class="lv-offline-pill">OFFLINE</span>
        <h2>${esc(ch.displayName)} ${L('ist gerade offline', 'is offline')}</h2>
        <p>${me && me.isFollower ? L('Du folgst diesem Kanal – wir sagen dir Bescheid, sobald der nächste Stream startet.', 'You follow this channel – we will notify you when the next stream starts.') : L('Folge dem Kanal, um beim nächsten Livestream benachrichtigt zu werden.', 'Follow to get notified when the next stream starts.')}</p>
        <div id="lv-offline-videos" class="lv-offline-videos"></div>
        <div id="lv-vods" class="lv-vods"></div>
      </div>
    </div>`;
  return `
  <div class="lv-page" id="lv-page">
    <div class="lv-main">
      ${player}
      <section class="lv-info">
        <div class="lv-info-row">
          <button class="lv-ava ${live.isLive ? 'is-live' : ''}" data-h-click="h_live_navigateTo_215" data-hv-click="${nxHv(String(esc(ch.id)))}" aria-label="${esc(ch.displayName)}">${ava}${live.isLive ? '<span>LIVE</span>' : ''}</button>
          <div class="lv-info-text">
            <button class="lv-name" data-h-click="h_live_navigateTo_215_2" data-hv-click="${nxHv(String(esc(ch.id)))}">${esc(ch.displayName)}${ch.isVerified ? ' <i class="fas fa-circle-check lv-verified"></i>' : ''}${ch.isOfficial ? ' <span class="lv-official">Norynex</span>' : ''}</button>
            <div class="lv-title-row"><h1 class="lv-title" id="lv-title">${esc(live.title)}</h1>${owner ? `<button class="lv-title-edit" data-h-click="h_live_lvEditInfo_218" title="${L('Titel & Kategorie ändern', 'Edit title & category')}" aria-label="Edit"><i class="fas fa-pen"></i></button>` : ''}</div>
            <div class="lv-meta" id="lv-meta">${lvMetaHtml(live)}</div>
          </div>
          ${live.isLive ? `<div class="lv-stats"><span class="lv-viewers" title="${L('Zuschauer', 'Viewers')}">${SVG.person}<b id="stream-viewer-count">${fmtNum(live.viewers)}</b></span><span class="lv-uptime" id="lv-uptime" title="${L('Laufzeit', 'Uptime')}">0:00</span></div>` : ''}
        </div>
        <div class="lv-actions">
          ${owner ? `<button class="lv-btn lv-btn--primary" data-h-click="h_live_replaceState_224"><i class="fas fa-sliders"></i><span>${L('Stream verwalten', 'Manage stream')}</span></button>
                     <button class="lv-btn lv-btn--ctrl ${live.isLive ? 'is-live' : ''}" data-h-click="h_live_replaceState_225"><span class="lv-btn-ico lv-btn-ico--live"><i class="fas fa-video"></i></span><span>${live.isLive ? L('Stream-Steuerung', 'Stream controls') : L('Live gehen', 'Go live')}</span></button>`
                  : `<button class="lv-btn lv-follow ${me && me.isFollower ? 'is-on' : ''}" id="lv-follow" data-h-click="h_live_lvFollow_226">${SVG.heart}<span>${me && me.isFollower ? L('Abonniert', 'Following') : L('Abonnieren', 'Follow')}</span></button>
                     ${me && me.isFollower ? `<button class="lv-btn lv-icon ${me.bell ? 'is-on' : ''}" id="lv-bell" data-h-click="h_live_lvBell_227" title="${L('Push-Benachrichtigung bei Livestreams', 'Push notifications')}" aria-label="Bell"><i class="fas fa-bell"></i></button>` : ''}
                     ${subsOn ? `<button class="lv-btn lv-sub ${me && me.sub ? 'is-on' : ''}" data-h-click="h_live_lvOpenSub_228"><span class="lv-btn-ico lv-btn-ico--sub">${SVG.star}</span><span>${me && me.sub ? L('Live-Abo', 'Live sub') + ` · ${me.sub.months} M.` : L('Live-Abo', 'Subscribe')}</span></button>` : ''}`}
          ${!owner && info.subs.monetized ? `<button class="lv-btn lv-gift" data-h-click="h_live_lvOpenGift_229"><span class="lv-btn-ico lv-btn-ico--gift">${SVG.gift}</span><span>${L('Schenken', 'Gift')}</span></button>` : ''}
          <button class="lv-btn lv-icon" data-h-click="h_live_lvShare_229" title="${L('Teilen', 'Share')}" aria-label="${L('Teilen', 'Share')}"><i class="fas fa-share"></i></button>
          <button class="lv-btn lv-icon" data-h-click="h_live_lvMoreMenu_230" title="${L('Mehr', 'More')}" aria-label="${L('Mehr', 'More')}"><i class="fas fa-ellipsis"></i></button>
        </div>
        <div class="lv-goal" id="lv-goal" hidden></div>
      </section>
      <div class="lv-mtabs" role="tablist"><button class="is-on" data-tab="chat" data-h-click="h_live_lvMobileTab_231">${L('Chat', 'Chat')}</button><button data-tab="info" data-h-click="h_live_lvMobileTab_235">${L('Über den Kanal', 'About')}</button></div>
      <section class="lv-about" id="lv-about">
        <div class="lv-about-card">
          <div class="lv-about-head">${L('Über', 'About')} ${esc(ch.displayName)}</div>
          <div class="lv-about-stats"><span><b>${fmtNum(ch.followers)}</b> ${L('Abonnenten', 'followers')}</span>${info.subs.enabled ? `<span><b>${fmtNum(info.subs.count)}</b> ${L('Live-Abonnenten', 'live subs')}</span>` : ''}<span>${L('Dabei seit', 'Joined')} ${ch.createdAt ? new Date(ch.createdAt).toLocaleDateString(L('de-DE', 'en-GB'), { month: 'long', year: 'numeric' }) : '—'}</span></div>
          ${ch.bio ? `<p class="lv-about-bio">${esc(ch.bio)}</p>` : ''}
          ${info.subs.enabled && info.subs.perks ? `<div class="lv-perks"><b>${SVG.star} ${L('Vorteile mit Live-Abo', 'Live sub perks')}</b><p>${esc(info.subs.perks)}</p></div>` : ''}
        </div>
        <div class="lv-about-videos"><div class="lv-about-head">${L('Neueste Videos', 'Latest videos')}</div><div id="lv-channel-videos" class="lv-vids"></div></div>
      </section>
    </div>
    <aside class="lv-chat" id="lv-chat">
      <div class="lv-chat-head">
        <span class="lv-chat-title">${L('Stream-Chat', 'Stream chat')}</span>
        <button class="lv-chat-ic" data-h-click="h_live_lvOpenChatters_248" title="${L('Zuschauer im Chat', 'Chatters')}" aria-label="Chatters">${SVG.users}</button>
        ${canMod ? `<button class="lv-chat-ic lv-chat-ic--mod" data-h-click="h_live_lvOpenModPanel_250" title="${L('Moderation', 'Moderation')}" aria-label="Mod"><i class="fas fa-shield-halved"></i></button>` : ''}
        <button class="lv-chat-ic" data-h-click="h_live_lvOpenChatSettings_250" title="${L('Chat-Einstellungen', 'Chat settings')}" aria-label="Settings"><i class="fas fa-gear"></i></button>
        <button class="lv-chat-ic lv-only-desk" data-h-click="h_live_lvToggleChat_251" title="${L('Chat ausblenden', 'Hide chat')}" aria-label="Hide"><i class="fas fa-right-from-bracket"></i></button>
      </div>
      <div class="lv-pinned" id="lv-pinned" hidden></div>
      <div class="lv-engage" id="lv-engage"></div>
      <div class="lv-chat-list" id="lv-chat-list" role="log" aria-live="polite"></div>
      <button class="lv-chat-more" id="lv-chat-more" data-h-click="h_live_lvScrollBottom_252"><i class="fas fa-arrow-down"></i> <span>${L('Neue Nachrichten', 'New messages')}</span></button>
      <div class="lv-panel" id="lv-panel" hidden></div>
      <div class="lv-chat-foot">
        <div class="lv-modes" id="lv-modes"></div>
        <div class="lv-reply" id="lv-reply" hidden></div>
        <div class="lv-input-wrap">
          <textarea id="lv-input" rows="1" maxlength="400" placeholder="${currentUser ? L('Nachricht senden', 'Send a message') : L('Zum Chatten anmelden', 'Log in to chat')}" ${currentUser ? '' : 'readonly data-h-click="h_live_openAuthModal_263"'} data-h-keydown="h_live_lvInputKey_263" data-h-input="h_live_lvInputGrow_263"></textarea>
          <div class="lv-ac" id="lv-ac" hidden></div>
          <button class="lv-emoji-btn" data-h-click="h_live_lvToggleEmoji_263" title="Sticker" aria-label="Sticker"><i class="far fa-note-sticky"></i></button>
          <button class="lv-send-m" data-h-click="h_live_lvSend_263" aria-label="${L('Senden', 'Send')}" ${currentUser ? '' : 'disabled'}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z"/></svg></button>
        </div>
        <div class="lv-foot-row">
          <button class="lv-pts" id="lv-pts" data-h-click="h_live_lvOpenPoints_266" hidden></button>
          <span class="lv-me-tag">${me ? `${badges(lvMyBadges())}<b style="color:${esc(me.color || '#c084fc')}">${esc(currentUser?.displayName || currentUser?.username || '')}</b>` : ''}</span>
          <span class="lv-count" id="lv-count"></span>
          <button class="lv-send" data-h-click="h_live_lvSend_270" ${currentUser ? '' : 'disabled'}>${L('Chat', 'Chat')}</button>
        </div>
      </div>
    </aside>
  </div>`;
}
function lvMetaHtml(live) {
  return `<button class="lv-cat" data-h-click="h_live_lvDirCat_279" data-hv-click="${nxHv(String(esc(live.category.id)))}">${esc(catName(live.category))}</button>${(live.tags || []).map(tg => `<span class="lv-tag">${esc(tg)}</span>`).join('')}${live.mature ? '<span class="lv-tag lv-tag--18">18+</span>' : ''}${live.language ? `<span class="lv-tag">${esc(live.language.toUpperCase())}</span>` : ''}`;
}
function lvMyBadges() {
  const me = LV.info && LV.info.me; if (!me) return [];
  const b = [];
  if (me.role === 'owner') b.push('owner'); if (currentUser && currentUser.isAdmin) b.push('staff');
  if (me.role === 'mod') b.push('mod'); if (me.role === 'vip') b.push('vip');
  const opts = me.badgeOptions || {}; const pick = (me.badgePick && me.badgePick.length ? me.badgePick : Object.keys(opts)).filter(k => opts[k]).slice(0, 2);
  pick.forEach(k => b.push(opts[k]));
  return b;
}

/* ---------- Chat-Nachrichten ---------- */
function lvFormatText(text) {
  let h = esc(text);
  h = h.replace(/(https?:\/\/[^\s<]+)/g, (u) => `<a href="${u}" target="_blank" rel="noopener nofollow ugc">${u.length > 48 ? u.slice(0, 45) + '…' : u}</a>`);
  const myName = currentUser ? String(currentUser.username || '').toLowerCase() : null;
  h = h.replace(/(^|\s)@([\wÄÖÜäöüß.-]{2,30})/g, (all, sp, n) => `${sp}<span class="lv-mention${myName && n.toLowerCase() === myName ? ' is-me' : ''}">@${n}</span>`);
  return h;
}
function lvMsgHtml(m) {
  const set = lvSettings();
  const time = set.time ? `<span class="lv-ts">${new Date(m.ts).toLocaleTimeString(L('de-DE', 'en-GB'), { hour: '2-digit', minute: '2-digit' })}</span>` : '';
  if (m.type === 'sys') { const si = SYS_ICON[m.kind] || 'fa-circle-info'; return `<div class="lv-m lv-sys${m.kind ? ' lv-sys--' + esc(m.kind) : ''}" data-id="${esc(m.id)}">${time}<i class="fas ${si} lv-sys-ico"></i>${esc(lvNoEmoji(m.text))}</div>`; }
  if (m.type === 'event') return `<div class="lv-m lv-ev lv-ev--${esc(m.kind || 'x')}" data-id="${esc(m.id)}">${m.gift && typeof nxGiftIcon === 'function' ? `<span class="lv-ev-gift">${nxGiftIcon(m.gift, 34)}</span>` : typeof nxAlertIcon === 'function' ? `<span class="lv-ev-gift">${nxAlertIcon(m.kind === 'livegift' ? 'livegift' : m.kind, 30)}</span>` : ''}<div><div class="lv-ev-text">${esc(lvNoEmoji(m.text))}</div>${m.message ? `<div class="lv-ev-msg">„${esc(m.message)}“</div>` : ''}</div></div>`;
  const me = LV.info && LV.info.me;
  const canMod = me && ['owner', 'mod', 'staff'].includes(me.role);
  const mine = currentUser && m.uid === currentUser.id;
  const mentionMe = currentUser && !mine && new RegExp('(^|\\s)@' + String(currentUser.username || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(m.text || '');
  const cls = ['lv-m', 'lv-msg'];
  if (m.type === 'me') cls.push('lv-me'); if (m.type === 'bot') cls.push('lv-bot'); if (m.type === 'announce') cls.push('lv-ann');
  if (m.first) cls.push('lv-first'); if (mentionMe) cls.push('lv-mentioned'); if (m.highlight) cls.push('lv-hl');
  const styleCls = m.style ? ' nx-name ' + esc(String(m.style).replace(/_/g, '-')) : '';
  const nameBtn = `<button class="lv-nm${styleCls}" ${m.style ? `data-text="${esc(m.name)}"` : `style="color:${esc(m.color || '#c084fc')}"`} data-h-click="h_live_lvUserCard_312" data-hv-click="${nxHv(String(esc(m.uid)))}">${esc(m.name)}</button>`;
  const tools = (m.uid && m.uid !== 'bot' && currentUser) ? `<span class="lv-tools">
      <button data-h-click="h_live_lvReply_313" data-hv-click="${nxHv(String(esc(m.id)))}" title="${L('Antworten', 'Reply')}" aria-label="Reply"><i class="fas fa-reply"></i></button>
      ${canMod ? `<button data-h-click="h_live_lvPin_315" data-hv-click="${nxHv(String(esc(m.id)))}" title="${L('Anpinnen', 'Pin')}" aria-label="Pin"><i class="fas fa-thumbtack"></i></button>
      <button data-h-click="h_live_lvModAction_315" data-hv-click="${nxHv(String(esc(m.id)))}" title="${L('Löschen', 'Delete')}" aria-label="Delete"><i class="fas fa-trash"></i></button>
      ${!mine ? `<button data-h-click="h_live_lvModAction_317" data-hv-click="${nxHv(String(esc(m.uid)))}" title="Timeout 10 Min." aria-label="Timeout"><i class="fas fa-clock"></i></button>
      <button data-h-click="h_live_lvConfirmBan_317" data-hv-click="${nxHv(String(esc(m.uid)), String(esc(m.name)))}" title="${L('Bannen', 'Ban')}" aria-label="Ban"><i class="fas fa-ban"></i></button>` : ''}`
      : (!mine ? `<button data-h-click="h_live_lvReportMsg_319" data-hv-click="${nxHv(String(esc(m.id)), String(esc(m.name)))}" title="${L('Melden', 'Report')}" aria-label="Report"><i class="fas fa-flag"></i></button>` : '')}
    </span>` : '';
  return `<div class="${cls.join(' ')}" data-id="${esc(m.id)}" data-uid="${esc(m.uid || '')}">
    ${m.type === 'announce' ? `<div class="lv-ann-head"><i class="fas fa-bullhorn"></i> ${L('Ankündigung', 'Announcement')}</div>` : ''}
    ${m.first ? `<div class="lv-first-head">${L('Erste Nachricht im Chat', 'First-time chatter')}</div>` : ''}
    ${m.reply ? `<div class="lv-reply-ctx"><i class="fas fa-reply"></i> ${L('Antwort an', 'Replying to')} <b>@${esc(m.reply.name)}</b>: ${esc(m.reply.text)}</div>` : ''}
    ${m.highlight ? `<div class="lv-hl-head"><i class="fas fa-wand-magic-sparkles"></i> ${L('Hervorgehobene Nachricht', 'Highlighted message')}</div>` : ''}${time}<span class="lv-badges">${badges(m.badges)}</span>${nameBtn}<span class="lv-colon">${m.type === 'me' ? ' ' : ': '}</span><span class="lv-tx"${m.type === 'me' ? ` style="color:${esc(m.color)}"` : ''}>${lvFormatText(m.text || '')}</span>${m.sticker && typeof nxStickerHtml === 'function' ? `<span class="lv-sticker">${nxStickerHtml(m.sticker, 'sm')}</span>` : ''}${tools}
  </div>`;
}
function lvAddMsg(m, silent) {
  const list = $('lv-chat-list'); if (!list || !m) return;
  if (m.type === 'bot' && lvSettings().hideBots) return;
  list.insertAdjacentHTML('beforeend', lvMsgHtml(m));
  while (list.children.length > 250) list.firstElementChild.remove();
  if (LV.autoscroll) lvScrollBottom();
  else if (!silent) { LV.unread++; const b = $('lv-chat-more'); if (b) { b.classList.add('is-on'); b.querySelector('span').textContent = `${LV.unread} ${L('neue Nachricht' + (LV.unread === 1 ? '' : 'en'), 'new message' + (LV.unread === 1 ? '' : 's'))}`; } }
}
function lvSysLocal(text, kind) { lvAddMsg({ id: 'local-' + Date.now() + Math.random(), type: 'sys', kind: kind || 'local', text, ts: Date.now() }); }
window.lvScrollBottom = function (force) { const l = $('lv-chat-list'); if (!l) return; l.scrollTop = l.scrollHeight; if (force) { LV.autoscroll = true; LV.unread = 0; $('lv-chat-more')?.classList.remove('is-on'); } };
function lvRenderPinned(p) {
  const el = $('lv-pinned'); if (!el) return;
  if (!p) { el.hidden = true; el.innerHTML = ''; return; }
  const me = LV.info && LV.info.me; const canMod = me && ['owner', 'mod', 'staff'].includes(me.role);
  el.hidden = false;
  el.innerHTML = `<i class="fas fa-thumbtack"></i><div><div class="lv-pinned-by">${L('Angepinnt von', 'Pinned by')} ${esc(p.by)}</div><b style="color:${esc(p.color || '#c084fc')}">${esc(p.name)}</b>: ${lvFormatText(p.text)}</div>${canMod ? `<button data-h-click="h_live_lvModAction_343" aria-label="Unpin"><i class="fas fa-xmark"></i></button>` : ''}`;
}
function lvRenderModes(m) {
  const el = $('lv-modes'); if (!el || !m) return;
  if (LV.info) LV.info.chat.modes = m;
  const chips = [];
  if (m.enabled === false) chips.push(['fa-comment-slash', L('Chat pausiert', 'Chat paused')]);
  if (m.slow) chips.push(['fa-hourglass-half', L(`Zeitlupe ${m.slow} s`, `Slow ${m.slow}s`)]);
  if (m.followersOnly) chips.push(['fa-heart', L('Nur Follower', 'Followers only')]);
  if (m.subsOnly) chips.push(['fa-star', L('Nur Live-Abonnenten', 'Subs only')]);
  if (m.emoteOnly) chips.push(['fa-face-smile', L('Nur Emojis', 'Emoji only')]);
  if (m.unique) chips.push(['fa-fingerprint', L('Einzigartiger Chat', 'Unique chat')]);
  el.innerHTML = chips.map(([i, tx]) => `<span><i class="fas ${i}"></i> ${tx}</span>`).join('');
}
function lvRenderGoal(g) {
  const el = $('lv-goal'); if (!el) return;
  if (!g || !g.enabled) { el.hidden = true; return; }
  el.hidden = false;
  const pct = Math.min(100, (g.current || 0) / Math.max(1, g.target) * 100);
  el.innerHTML = `<div class="lv-goal-row"><span><i class="fas ${g.type === 'subs' ? 'fa-star' : 'fa-heart'}"></i> ${esc(g.title)}</span><b>${fmtNum(g.current)} / ${fmtNum(g.target)}</b></div><div class="lv-goal-track"><i style="width:${pct}%"></i></div>`;
}

/* ---------- Senden ---------- */
window.lvInputGrow = function (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(110, ta.scrollHeight) + 'px'; const c = $('lv-count'); if (c) c.textContent = ta.value.length > 300 ? `${ta.value.length}/400` : ''; lvAutocomplete(ta); };
window.lvInputKey = function (e) {
  const ac = $('lv-ac');
  if (ac && !ac.hidden) {
    const items = [...ac.querySelectorAll('button')]; let i = items.findIndex(b => b.classList.contains('is-on'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); i = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((b, k) => b.classList.toggle('is-on', k === i)); items[i]?.scrollIntoView({ block: 'nearest' }); return; }
    if ((e.key === 'Tab' || e.key === 'Enter') && items.length) { e.preventDefault(); (items[i >= 0 ? i : 0]).click(); return; }
    if (e.key === 'Escape') { ac.hidden = true; return; }
  }
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); lvSend(); }
  if (e.key === 'Escape') lvCancelReply();
};
window.lvSend = function () {
  if (!currentUser) { openAuthModal('login'); return; }
  const ta = $('lv-input'); if (!ta || ta.disabled) return;
  const text = ta.value.trim(); if (!text || !LV.cid) return;
  if (!socket || !socket.connected) { showToast(L('Keine Verbindung zum Chat – einen Moment …', 'Not connected to chat – one moment…'), 'error'); return; }
  socket.emit('lv_chat', { channelId: LV.cid, text, replyTo: LV.replyTo || undefined });
  ta.value = ''; lvInputGrow(ta); lvCancelReply();
};
window.lvReply = function (id) {
  const row = document.querySelector(`.lv-m[data-id="${CSS.escape(id)}"]`); if (!row) return;
  LV.replyTo = id;
  const name = row.querySelector('.lv-nm')?.textContent || '';
  const box = $('lv-reply'); box.hidden = false;
  box.innerHTML = `<span><i class="fas fa-reply"></i> ${L('Antwort an', 'Replying to')} <b>@${esc(name)}</b></span><button data-h-click="h_live_lvCancelReply_391" aria-label="X"><i class="fas fa-xmark"></i></button>`;
  $('lv-input')?.focus();
};
window.lvCancelReply = function () { LV.replyTo = null; const b = $('lv-reply'); if (b) { b.hidden = true; b.innerHTML = ''; } };
function lvLockInput(text) { const ta = $('lv-input'); if (ta) { ta.disabled = true; ta.value = ''; ta.placeholder = text; } }
function lvUnlockInput() { const ta = $('lv-input'); if (ta && currentUser) { ta.disabled = false; ta.placeholder = L('Nachricht senden', 'Send a message'); } }
function lvTimeoutLock(until) {
  const tick = () => {
    const left = until - Date.now();
    if (left <= 0 || !$('lv-input')) { lvUnlockInput(); return; }
    lvLockInput(L(`Timeout – noch ${Math.ceil(left / 1000)} s`, `Timed out – ${Math.ceil(left / 1000)}s left`));
    setTimeout(tick, 1000);
  };
  tick();
}

/* ---------- Sticker (früher Emojis + Sticker – Emojis gibt es auf Norynex nicht mehr) ---------- */
window.lvToggleEmoji = function (e) {
  e && e.stopPropagation();
  const ex = document.querySelector('.lv-emoji-pop'); if (ex) { ex.remove(); return; }
  const owned = (typeof NX_STICKERS !== 'undefined' && currentUser) ? (currentUser.inventory || []).filter(id => NX_STICKERS[id]) : [];
  const pop = document.createElement('div'); pop.className = 'lv-emoji-pop';
  pop.innerHTML = `<div class="lv-ep-tabs"><button class="is-on" type="button"><i class="fas fa-note-sticky"></i> Sticker${owned.length ? ` (${owned.length})` : ''}</button></div>`
    + (owned.length ? `<div class="lv-ep-stickers">${owned.map(id => `<button type="button" data-st="${esc(id)}" title="${esc(NX_STICKERS[id].label || id)}">${nxStickerHtml(id, 'sm')}</button>`).join('')}</div>`
      : `<div class="lv-ep-empty">${L('Du hast noch keine Sticker. Sticker gibt es im Shop – sie funktionieren dann auch hier im Live-Chat.', 'You have no stickers yet. Get some in the shop – they work in live chat too.')}<button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_navigateTo_415">${L('Zum Shop', 'Go to shop')}</button></div>`);
  pop.addEventListener('click', ev => {
    const st = ev.target.closest('[data-st]');
    if (st) { if (!currentUser || !socket) return; socket.emit('lv_chat', { channelId: LV.cid, text: '', sticker: st.dataset.st }); pop.remove(); }
  });
  $('lv-chat')?.appendChild(pop);
  setTimeout(() => document.addEventListener('click', function off(ev) { if (!pop.isConnected) return document.removeEventListener('click', off); if (!pop.contains(ev.target)) { pop.remove(); document.removeEventListener('click', off); } }), 0);
};

/* ---------- Autovervollständigung: /befehle, !bot-befehle, @namen ---------- */
async function lvLoadCommands() {
  try { LV.cmds = await apiGet(`/api/lv/${LV.cid}/commands`); } catch { LV.cmds = { slash: [], bot: [], users: [] }; }
}
function lvAutocomplete(ta) {
  const ac = $('lv-ac'); if (!ac || !LV.cmds) return;
  const v = ta.value, pos = ta.selectionStart ?? v.length;
  const before = v.slice(0, pos);
  let items = [], kind = null, token = '';
  const mSlash = /^\/(\w*)$/.exec(before), mBang = /^!(\w*)$/.exec(before), mAt = /(?:^|\s)@([\wÄÖÜäöüß.-]*)$/.exec(before);
  if (mSlash) { kind = 'slash'; token = mSlash[1].toLowerCase(); items = LV.cmds.slash.filter(c => c.cmd.startsWith(token)).slice(0, 8).map(c => ({ ins: '/' + c.cmd + ' ', label: `<b>/${esc(c.cmd)}</b> <span>${esc(c.args)}</span><small>${esc(c.desc)}</small>` })); }
  else if (mBang) { kind = 'bang'; token = mBang[1].toLowerCase(); items = LV.cmds.bot.filter(c => c.name.startsWith(token)).slice(0, 8).map(c => ({ ins: '!' + c.name + ' ', label: `<b>!${esc(c.name)}</b><small>${esc(c.desc)}</small>` })); }
  else if (mAt) {
    kind = 'at'; token = mAt[1].toLowerCase();
    const seen = new Map(); (LV.cmds.users || []).forEach(u => seen.set(u.login, u));
    items = [...seen.values()].filter(u => u.login.toLowerCase().startsWith(token) || (u.name || '').toLowerCase().startsWith(token)).slice(0, 8).map(u => ({ ins: '@' + u.login + ' ', label: `<b>@${esc(u.login)}</b><small>${esc(u.name)}</small>`, at: true }));
  }
  if (!items.length || (kind === 'slash' && v.includes(' '))) { ac.hidden = true; return; }
  ac.hidden = false;
  ac.innerHTML = items.map((it, i) => `<button type="button" class="${i === 0 ? 'is-on' : ''}" data-ins="${esc(it.ins)}" data-at="${it.at ? 1 : ''}">${it.label}</button>`).join('');
  ac.querySelectorAll('button').forEach(b => b.onmousedown = (e) => e.preventDefault());
  ac.querySelectorAll('button').forEach(b => b.onclick = () => {
    const ins = b.dataset.ins;
    if (b.dataset.at) { const start = before.lastIndexOf('@'); ta.value = v.slice(0, start) + ins + v.slice(pos); const np = start + ins.length; ta.setSelectionRange(np, np); }
    else { ta.value = ins + v.slice(pos).replace(/^\S*/, '').trimStart(); ta.setSelectionRange(ins.length, ins.length); }
    ac.hidden = true; ta.focus(); lvInputGrow(ta);
  });
}

/* ---------- Panels (Einstellungen, Zuschauer, Moderation) ---------- */
function lvPanel(title, html) {
  let p = $('lv-panel');
  if (!p) { const bg = document.createElement('div'); bg.className = 'lt-modal-bg'; bg.id = 'lt-modal-bg'; bg.onclick = (e) => { if (e.target === bg) lvClosePanel(); }; bg.innerHTML = '<div id="lv-panel" class="lv-panel lt-modal"></div>'; document.body.appendChild(bg); p = $('lv-panel'); }
  p.hidden = false;
  p.innerHTML = `<div class="lv-panel-head"><b>${title}</b><button data-h-click="h_live_lvClosePanel_458" aria-label="X"><i class="fas fa-xmark"></i></button></div><div class="lv-panel-body">${html}</div>`;
  return p;
}
window.lvClosePanel = function () { const bg = $('lt-modal-bg'); if (bg) { bg.remove(); if (_ltTab && $('lt-body')) setTimeout(() => ltRefreshLight(), 300); return; } const p = $('lv-panel'); if (p) { p.hidden = true; p.innerHTML = ''; } };
const lvCid = () => (typeof LV !== 'undefined' && LV.cid && $('lv-chat')) ? LV.cid : (currentUser && currentUser.id);
function lvApplySettings() {
  const s = lvSettings(); const c = $('lv-chat'); if (!c) return;
  c.classList.remove('lv-fs-s', 'lv-fs-m', 'lv-fs-l'); c.classList.add('lv-fs-' + s.size);
  c.classList.toggle('lv-noanim', !s.anim);
}
const CHAT_COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8', '#60a5fa', '#a78bfa', '#c084fc', '#f472b6', '#e5e7eb', '#fda4af'];
// ─── Teil: client/live/020-stream-seite-chat.js ───
window.lvOpenChatSettings = function () {
  const s = lvSettings();
  const me = LV.info && LV.info.me;
  lvPanel(L('Chat-Einstellungen', 'Chat settings'), `
    <div class="lv-set-row"><span>${L('Schriftgröße', 'Font size')}</span><div class="lv-seg">${['s', 'm', 'l'].map(z => `<button class="${s.size === z ? 'is-on' : ''}" data-h-click="h_live_lvSet_474" data-hv-click="${nxHv(String(z))}">${z === 's' ? 'A' : z === 'm' ? 'A+' : 'A++'}</button>`).join('')}</div></div>
    <label class="lv-set-row"><span>${L('Zeitstempel anzeigen', 'Show timestamps')}</span><input type="checkbox" ${s.time ? 'checked' : ''} data-h-change="h_live_lvSet_475"></label>
    <label class="lv-set-row"><span>${L('Bot-Nachrichten ausblenden', 'Hide bot messages')}</span><input type="checkbox" ${s.hideBots ? 'checked' : ''} data-h-change="h_live_lvSet_476"></label>
    <label class="lv-set-row"><span>${L('Animationen', 'Animations')}</span><input type="checkbox" ${s.anim ? 'checked' : ''} data-h-change="h_live_lvSet_477"></label>
    ${me && me.badgeOptions && Object.keys(me.badgeOptions).length ? `<div class="lv-set-label">${L('Deine Abzeichen (max. 2)', 'Your badges (max 2)')}</div><div class="lv-badge-pick">${Object.entries(me.badgeOptions).map(([k, v]) => { const on = (me.badgePick && me.badgePick.length ? me.badgePick : Object.keys(me.badgeOptions).slice(0, 2)).includes(k); return `<label class="${on ? 'is-on' : ''}"><input type="checkbox" ${on ? 'checked' : ''} data-h-change="h_live_lvPickBadge_478" data-hv-change="${nxHv(String(k))}"> ${badges([v])} <span>${{ sub: L('Live-Abo', 'Live sub'), gifter: L('Schenker', 'Gifter'), premium: 'Premium', verified: L('Verifiziert', 'Verified'), affiliate: 'Affiliate', partner: 'Partner', shop: L('Shop-Abzeichen', 'Shop badge') }[k] || k}</span></label>`; }).join('')}</div><p class="lv-set-hint">${L('Rollen-Abzeichen (Streamer, Mod, VIP) werden immer angezeigt.', 'Role badges (broadcaster, mod, VIP) are always shown.')}</p>` : ''}
    ${me ? `<div class="lv-set-label">${L('Deine Namensfarbe', 'Your name color')}</div><div class="lv-colors">${CHAT_COLORS.map(c => `<button style="background:${c}" class="${me.color === c ? 'is-on' : ''}" data-h-click="h_live_lvSetColor_479" data-hv-click="${nxHv(String(c))}" aria-label="${c}"></button>`).join('')}</div>` : ''}
    <div class="lv-set-label">${L('Chat-Befehle', 'Chat commands')}</div>
    <p class="lv-set-hint"><code>/me Text</code> ${L('Aktion schreiben', 'action message')} · <code>@name</code> ${L('erwähnen', 'mention')} · <code>!commands</code> ${L('Bot-Befehle', 'bot commands')}${me && ['owner', 'mod', 'staff'].includes(me.role) ? ` · <code>/help</code> ${L('alle Mod-Befehle', 'all mod commands')}` : ''}</p>`);
};
window.lvSet = function (k, v) {
  lvSaveSettings({ [k]: v }); lvApplySettings();
  if (k === 'time' || k === 'hideBots') { const l = $('lv-chat-list'); if (l && LV.cid) { apiGet(`/api/lv/${LV.cid}/info`).then(i => { l.innerHTML = ''; (i.chat.history || []).forEach(m => lvAddMsg(m, true)); lvScrollBottom(true); }).catch(() => {}); } }
  lvOpenChatSettings();
};
window.lvPickBadge = async function (k, input) {
  const me = LV.info && LV.info.me; if (!me) return;
  let pick = me.badgePick && me.badgePick.length ? me.badgePick.slice() : Object.keys(me.badgeOptions || {}).slice(0, 2);
  if (input.checked) { if (!pick.includes(k)) pick.push(k); if (pick.length > 2) pick = pick.slice(-2); } else pick = pick.filter(x => x !== k);
  try { const r = await apiPatch('/api/lv/me/badges', { pick }); me.badgePick = r.pick; const tag = document.querySelector('.lv-me-tag'); if (tag) { const nm = tag.querySelector('b'); tag.innerHTML = badges(lvMyBadges()); if (nm) tag.appendChild(nm); } } catch (e) { showToast(e.message, 'error'); }
  lvOpenChatSettings();
};
window.lvSetColor = async function (c) {
  try { const r = await apiPatch('/api/lv/me/chat-color', { color: c }); if (LV.info && LV.info.me) LV.info.me.color = r.color; const tag = document.querySelector('.lv-me-tag b'); if (tag) tag.style.color = r.color; lvOpenChatSettings(); showToast(L('Namensfarbe gespeichert', 'Name color saved'), 'success'); }
  catch (e) { showToast(e.message, 'error'); }
};
window.lvOpenChatters = async function () {
  lvPanel(L('Zuschauer', 'Viewers'), `<div class="lv-panel-load"><div class="nx-spinner"></div></div>`);
  try {
    const r = await apiGet(`/api/lv/${LV.cid}/chatters`);
    LV.chatters = r;
    const p = $('lv-panel'); if (!p || p.hidden) return;
    p.querySelector('.lv-panel-body').innerHTML = `<div class="lv-chatters-top"><div class="lv-chatters-sum">${SVG.person} <b>${fmtNum(r.total)}</b> ${L('Zuschauer', 'viewers')}${r.total - r.users.length > 0 ? ` · ${r.total - r.users.length} ${L('ohne Anmeldung', 'logged out')}` : ''}</div>
      <input class="lv-chatters-search" placeholder="${L('Zuschauer suchen …', 'Search viewers…')}" data-h-input="h_live_lvDrawChatters_506"></div><div id="lv-chatters-list"></div>`;
    lvDrawChatters('');
  } catch (e) { showToast(e.message, 'error'); }
};
window.lvDrawChatters = function (q) {
  const box = $('lv-chatters-list'); const r = LV.chatters; if (!box || !r) return;
  q = String(q || '').toLowerCase();
  const me = LV.info && LV.info.me; const canMod = me && ['owner', 'mod', 'staff'].includes(me.role);
  const groups = [['owner', L('Streamer', 'Broadcaster')], ['staff', L('Norynex-Team', 'Norynex staff')], ['mod', L('Moderatoren', 'Moderators')], ['vip', 'VIPs'], ['viewer', L('Zuschauer', 'Viewers')]];
  const html = groups.map(([k, label]) => {
    const us = r.users.filter(u => u.role === k && (!q || u.name.toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q))); if (!us.length) return '';
    return `<div class="lv-set-label">${label} · ${us.length}</div>` + us.map(u => `<div class="lv-chatter">
      <button class="lv-chatter-name" data-h-click="h_live_lvUserCard_517" data-hv-click="${nxHv(String(esc(u.id)))}"><span class="lv-badges">${badges(u.badges || [])}</span><b style="color:${esc(u.color || '#c084fc')}">${esc(u.name)}</b></button>
      ${canMod && u.role !== 'owner' && (!currentUser || u.id !== currentUser.id) ? `<span class="lv-chatter-act"><button title="Shoutout" data-h-click="h_live_lvModAction_519" data-hv-click="${nxHv(String(esc(u.id)))}" aria-label="Shoutout"><i class="fas fa-bullhorn"></i></button><button title="Timeout 10 Min." data-h-click="h_live_lvModAction_519_2" data-hv-click="${nxHv(String(esc(u.id)))}" aria-label="Timeout 10 Min."><i class="fas fa-stopwatch"></i></button><button title="${L('Bannen', 'Ban')}" data-h-click="h_live_lvConfirmBan_519" data-hv-click="${nxHv(String(esc(u.id)), String(esc(u.name)))}" aria-label="${L('Bannen', 'Ban')}"><i class="fas fa-ban"></i></button></span>` : ''}
    </div>`).join('');
  }).join('');
  box.innerHTML = html || `<p class="lv-set-hint">${q ? L('Niemand gefunden.', 'Nobody found.') : L('Noch niemand angemeldet im Chat.', 'No logged-in viewers yet.')}</p>`;
};
window.lvOpenModPanel = function () {
  const m = (LV.info && LV.info.chat.modes) || {};
  const owner = LV.info.me && LV.info.me.role === 'owner';
  const tg = (key, on, off, label, val) => `<label class="lv-set-row"><span>${label}</span><input type="checkbox" ${val ? 'checked' : ''} data-h-change="h_live_lvModAction_527" data-hv-change="${nxHv(String(on), String(off))}"></label>`;
  lvPanel(`<i class="fas fa-shield-halved" style="color:#22c55e"></i> ${L('Moderation', 'Moderation')}`, `
    ${tg('enabled', 'chaton', 'chatoff', L('Chat offen', 'Chat open'), m.enabled !== false)}
    <div class="lv-set-row"><span>${L('Zeitlupe', 'Slow mode')}</span><select data-h-change="h_live_lvModAction_530">${[0, 3, 5, 10, 30, 60, 120].map(s => `<option value="${s}" ${(m.slow || 0) === s ? 'selected' : ''}>${s ? s + ' s' : L('Aus', 'Off')}</option>`).join('')}</select></div>
    ${tg('f', 'followers', 'followersoff', L('Nur Follower', 'Followers only'), m.followersOnly)}
    ${tg('s', 'subsonly', 'subsonlyoff', L('Nur Live-Abonnenten', 'Subscribers only'), m.subsOnly)}
    ${tg('e', 'emoteonly', 'emoteonlyoff', L('Nur Emojis', 'Emoji only'), m.emoteOnly)}
    ${tg('u', 'unique', 'uniqueoff', L('Einzigartiger Chat', 'Unique chat'), m.unique)}
    <div class="lv-mod-btns">
      <button data-h-click="h_live_lvAnnounce_534"><i class="fas fa-bullhorn"></i> ${L('Ankündigung', 'Announce')}</button>
      <button data-h-click="h_live_if_536" data-hv-click="${nxHv(String(L('Den ganzen Chat leeren?', 'Clear the whole chat?')))}"><i class="fas fa-broom"></i> ${L('Chat leeren', 'Clear chat')}</button>
      ${owner ? `<button data-h-click="h_live_lvRaidPrompt_538"><i class="fas fa-rocket"></i> ${L('Raid starten', 'Start raid')}</button>` : ''}
      <button data-h-click="h_live_lvShoutoutPrompt_538"><i class="fas fa-bullhorn"></i> Shoutout</button>
      <button data-h-click="h_live_lvNewPoll_538"><i class="fas fa-square-poll-vertical"></i> ${L('Abstimmung', 'Poll')}</button>
      <button data-h-click="h_live_lvNewPrediction_540"><i class="fas fa-dice"></i> ${L('Vorhersage', 'Prediction')}</button>
      ${owner ? `<button data-h-click="h_live_lvRunAd_542"><i class="fas fa-rectangle-ad"></i> ${L('Werbepause', 'Ad break')}</button>` : ''}
    </div>
    <p class="lv-set-hint">${L('Tipp: Fahre über eine Nachricht für Löschen/Timeout/Bann oder klicke auf einen Namen. Alle Befehle: /help', 'Tip: hover a message for delete/timeout/ban or click a name. All commands: /help')}</p>
    ${owner ? `<button class="lv-link" data-h-click="h_live_replaceState_545"><i class="fas fa-sliders"></i> ${L('Mods, Bots, Sperrwörter & Protokoll im Studio', 'Mods, bots, blocked words & log in Studio')}</button>` : ''}`);
};
window.lvRunAd = async function () { try { await apiPost('/api/lv/studio/adbreak', {}); showToast(L('Werbepause gestartet', 'Ad break started'), 'success'); } catch (e) { showToast(e.message, 'error'); } };
window.lvAnnounce = function () { const t = prompt(L('Text der Ankündigung:', 'Announcement text:')); if (t && t.trim()) lvModAction('announce', { text: t.trim() }); };
window.lvRaidPrompt = function () { const t = prompt(L('Zu welchem Kanal willst du raiden? (Benutzername)', 'Which channel do you want to raid? (username)')); if (t && t.trim()) lvModAction('raid', { target: t.trim() }); };
window.lvShoutoutPrompt = function () { const t = prompt(L('Shoutout für (Benutzername):', 'Shoutout for (username):')); if (t && t.trim()) lvModAction('shoutout', { target: t.trim() }); };

window.lvModAction = function (action, params) {
  if (!socket || !LV.cid) return;
  socket.emit('lv_mod', { channelId: LV.cid, action, ...(params || {}) });
};
window.lvPin = (id) => lvModAction('pin', { msgId: id });
window.lvConfirmBan = function (uid, name) {
  if (!confirm(L(`${name} aus dem Chat bannen?`, `Ban ${name} from chat?`))) return;
  const reason = prompt(L('Grund (optional):', 'Reason (optional):')) || '';
  lvModAction('ban', { target: uid, reason });
};
window.lvReportMsg = function (id, name) {
  if (!currentUser) { openAuthModal('login'); return; }
  if (typeof openReportModal === 'function') openReportModal('livechat', id, L(`Nachricht von ${name}`, `Message from ${name}`));
};

/* ---------- Nutzerkarte ---------- */
window.lvUserCard = async function (uid, e) {
  e && e.stopPropagation();
  if (!uid || uid === 'bot' || !LV.cid) return;
  document.querySelector('.lv-ucard')?.remove();
  const card = document.createElement('div'); card.className = 'lv-ucard';
  card.innerHTML = `<div class="lv-panel-load"><div class="nx-spinner"></div></div>`;
  $('lv-chat')?.appendChild(card);
  const off = (ev) => { if (!card.contains(ev.target)) { card.remove(); document.removeEventListener('pointerdown', off); } };
  setTimeout(() => document.addEventListener('pointerdown', off), 0);
  try {
    const u = await apiGet(`/api/lv/${LV.cid}/usercard/${encodeURIComponent(uid)}`);
    const ava = typeof buildAvatarHtml === 'function' ? buildAvatarHtml({ id: u.id, avatar: u.avatar, activeFrame: u.activeFrame, displayName: u.displayName, username: u.username }, 52, { noVideo: true }) : '';
    const isSelf = currentUser && currentUser.id === u.id;
    const mod = u.canModerate && !isSelf && u.role !== 'owner';
    card.innerHTML = `
      <button class="lv-ucard-x" data-h-click="h_live_closest_582" aria-label="X"><i class="fas fa-xmark"></i></button>
      <div class="lv-ucard-top">${ava}<div><div class="lv-ucard-name" style="color:${esc(u.color)}">${esc(u.displayName)}</div><div class="lv-ucard-login">@${esc(u.username)}</div><div class="lv-badges">${badges(u.badges)}</div></div></div>
      <div class="lv-ucard-facts">
        <span><i class="fas fa-cake-candles"></i> ${L('Konto seit', 'Account since')} ${u.createdAt ? new Date(u.createdAt).toLocaleDateString(L('de-DE', 'en-GB')) : '—'}</span>
        <span><i class="fas fa-heart"></i> ${u.isFollower ? (u.followedAt ? L('Folgt seit ', 'Following since ') + new Date(u.followedAt).toLocaleDateString(L('de-DE', 'en-GB')) : L('Folgt dem Kanal', 'Follows')) : L('Folgt nicht', 'Not following')}</span>
        ${u.sub ? `<span><i class="fas fa-star" style="color:#c084fc"></i> ${L('Live-Abo', 'Live sub')} · ${L('Stufe', 'Tier')} ${u.sub.tier} · ${u.sub.months} ${L('Monat(e)', 'month(s)')}</span>` : ''}
        ${u.banned ? `<span style="color:#f87171"><i class="fas fa-ban"></i> ${L('Gebannt', 'Banned')}</span>` : ''}
        ${u.timeoutUntil && u.timeoutUntil > Date.now() ? `<span style="color:#fbbf24"><i class="fas fa-clock"></i> Timeout ${L('bis', 'until')} ${new Date(u.timeoutUntil).toLocaleTimeString(L('de-DE', 'en-GB'))}</span>` : ''}
      </div>
      <div class="lv-ucard-actions">
        <button data-h-click="h_live_navigateTo_590" data-hv-click="${nxHv(String(esc(u.id)))}"><i class="fas fa-user"></i> ${L('Kanal', 'Channel')}</button>
        ${!isSelf ? `<button data-h-click="h_live_lvMention_594" data-hv-click="${nxHv(String(esc(u.username)))}"><i class="fas fa-at"></i> ${L('Erwähnen', 'Mention')}</button>` : ''}
        ${!isSelf && currentUser && LV.info.subs.enabled ? `<button data-h-click="h_live_lvGiftTo_595" data-hv-click="${nxHv(String(esc(u.username)))}"><i class="fas fa-gift"></i> ${L('Abo schenken', 'Gift sub')}</button>` : ''}
        ${u.canModerate && !isSelf ? `<button class="is-accent" data-h-click="h_live_lvModAction_596" data-hv-click="${nxHv(String(esc(u.id)))}"><i class="fas fa-bullhorn"></i> Shoutout</button>` : ''}
      </div>
      ${mod ? `<div class="lv-set-label">${L('Moderation', 'Moderation')}</div>
      <div class="lv-ucard-mod">
        ${[[60, '1 Min.'], [600, '10 Min.'], [3600, '1 Std.'], [86400, '24 Std.']].map(([s, l]) => `<button data-h-click="h_live_lvModAction_600" data-hv-click="${nxHv(String(esc(u.id)), String(s))}"><i class="fas fa-stopwatch"></i> ${l}</button>`).join('')}
        ${u.timeoutUntil && u.timeoutUntil > Date.now() ? `<button data-h-click="h_live_lvModAction_601" data-hv-click="${nxHv(String(esc(u.id)))}">${L('Timeout aufheben', 'Remove timeout')}</button>` : ''}
        ${u.banned ? `<button class="is-ok" data-h-click="h_live_lvModAction_602" data-hv-click="${nxHv(String(esc(u.id)))}">${L('Entbannen', 'Unban')}</button>` : `<button class="is-danger" data-h-click="h_live_lvConfirmBan_602" data-hv-click="${nxHv(String(esc(u.id)), String(esc(u.displayName)))}"><i class="fas fa-ban"></i> ${L('Bannen', 'Ban')}</button>`}
        ${u.viewerIsOwner ? `<button data-h-click="h_live_lvModAction_603" data-hv-click="${nxHv(String(u.role === 'mod' ? 'unmod' : 'mod'), String(esc(u.id)))}"><i class="fas fa-shield-halved"></i> ${u.role === 'mod' ? L('Mod entfernen', 'Unmod') : L('Zum Mod machen', 'Make mod')}</button>
        <button data-h-click="h_live_lvModAction_603_2" data-hv-click="${nxHv(String(u.role === 'vip' ? 'unvip' : 'vip'), String(esc(u.id)))}"><i class="fas fa-gem"></i> ${u.role === 'vip' ? L('VIP entfernen', 'Remove VIP') : L('VIP geben', 'Give VIP')}</button>` : ''}
      </div>
      ${(u.recent || []).length ? `<div class="lv-set-label">${L('Letzte Nachrichten', 'Recent messages')}</div><div class="lv-ucard-recent">${u.recent.map(r => `<div><span>${new Date(r.ts).toLocaleTimeString(L('de-DE', 'en-GB'), { hour: '2-digit', minute: '2-digit' })}</span> ${esc(r.text)}</div>`).join('')}</div>` : ''}` : ''}
      ${!isSelf && currentUser ? `<button class="lv-ucard-report" data-h-click="h_live_openReportModal_607" data-hv-click="${nxHv(String(esc(u.id)), String(esc(u.displayName)))}"><i class="fas fa-flag"></i> ${L('Nutzer melden', 'Report user')}</button>` : ''}`;
  } catch (err) { card.innerHTML = `<p class="lv-set-hint" style="padding:16px">${esc(err.message)}</p>`; }
};
window.lvMention = function (name) { const ta = $('lv-input'); if (!ta || !currentUser) return; ta.value = (ta.value ? ta.value.trimEnd() + ' ' : '') + '@' + name + ' '; ta.focus(); lvInputGrow(ta); document.querySelector('.lv-ucard')?.remove(); };

/* ---------- Folgen / Glocke / Teilen / Mehr ---------- */
window.lvFollow = async function () {
  if (!currentUser) { openAuthModal('login'); return; }
  const btn = $('lv-follow');
  if (LV.followBusy) return;
  LV.followBusy = true; if (btn) btn.disabled = true;
  setTimeout(() => { LV.followBusy = false; const b = $('lv-follow'); if (b) b.disabled = false; }, 1200);
  try {
    const d = await apiPost(`/api/users/${LV.cid}/subscribe`);
    if (LV.info.me) LV.info.me.isFollower = d.subscribed;
    if (btn) { btn.classList.toggle('is-on', d.subscribed); btn.querySelector('span').textContent = d.subscribed ? L('Abonniert', 'Following') : L('Abonnieren', 'Follow'); if (typeof NXD !== 'undefined' && d.subscribed) { try { NXD.play('subscribe'); NXD.pop(btn); } catch {} } }
    if (d.subscribed && !$('lv-bell') && btn) btn.insertAdjacentHTML('afterend', `<button class="lv-btn lv-icon" id="lv-bell" data-h-click="h_live_lvBell_623" title="${L('Push-Benachrichtigung bei Livestreams', 'Push notifications')}" aria-label="Bell"><i class="fas fa-bell"></i></button>`);
    if (!d.subscribed) $('lv-bell')?.remove();
    showToast(d.subscribed ? L('Du folgst jetzt diesem Kanal', 'You are now following') : L('Nicht mehr abonniert', 'Unfollowed'), 'success');
    if (d.subscribed && typeof xpTrack === 'function') xpTrack('subscribe', LV.cid);
  } catch (e) { showToast(e.message, 'error'); }
};
window.lvBell = async function () {
  try { const d = await apiPost(`/api/users/${LV.cid}/bell`); $('lv-bell')?.classList.toggle('is-on', d.active); showToast(d.active ? L('Du bekommst eine Push-Nachricht, wenn der Stream startet', 'You will get a push when the stream starts') : L('Push-Benachrichtigung aus', 'Push notifications off'), 'success'); } catch (e) { showToast(e.message, 'error'); }
};
window.lvShare = async function () {
  const url = `${location.origin}/#stream/${LV.cid}`;
  const title = LV.info ? LV.info.live.title : 'Norynex Live';
  try { if (navigator.share) { await navigator.share({ title, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(url); showToast(L('Link kopiert', 'Link copied'), 'success'); } catch { prompt(L('Link kopieren:', 'Copy link:'), url); }
};
window.lvMoreMenu = function (e) {
  e && e.stopPropagation();
  const owner = LV.info.me && LV.info.me.role === 'owner';
  const cid = LV.cid;
  const items = [];
  if (LV.info.live.isLive) items.push(['fa-tv', L('Auf Fernseher streamen', 'Cast to TV'), () => nxCastLive(cid)]);
  items.push(['fa-comment-slash', L('Chat ein-/ausblenden', 'Toggle chat'), () => lvToggleChat()]);
  if (LV.info.live.isLive) items.push(['fa-panorama', L('Kinomodus', 'Theatre mode'), () => lvTheater()]);
  if (currentUser && !owner && LV.info.subs.enabled) items.push(['fa-gift', L('Live-Abo verschenken', 'Gift a live sub'), () => lvOpenGift()]);
  items.push(['fa-arrow-up-right-from-square', L('Kanal öffnen', 'Open channel'), () => navigateTo('channel', cid)]);
  if (!owner) items.push(['fa-flag', L('Livestream melden', 'Report live stream'), () => lvReportStream(), true]);
  const ov = document.createElement('div'); ov.className = 'nx-sheet-overlay';
  ov.innerHTML = `<div class="nx-sheet"><div class="nx-sheet-grip"></div>${items.map(([icon, label, fn, danger], i) => `<button class="nx-sheet-item${danger ? ' is-danger' : ''}" data-i="${i}"><i class="fas ${icon}"></i>${label}</button>`).join('')}<button class="nx-sheet-item nx-sheet-cancel">${L('Abbrechen', 'Cancel')}</button></div>`;
  const close = () => { ov.classList.remove('is-open'); document.body.classList.remove('nx-sheet-open'); setTimeout(() => ov.remove(), 200); };
  ov.addEventListener('click', ev => { const b = ev.target.closest('[data-i]'); if (b) { close(); try { items[+b.dataset.i][2](); } catch (er) { console.warn(er); } } else if (ev.target === ov || ev.target.closest('.nx-sheet-cancel')) close(); });
  document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add('is-open'));
};
window.lvReportStream = function () {
  if (!currentUser) { openAuthModal('login'); return; }
  if (typeof openReportModal === 'function') openReportModal('stream', LV.cid, LV.info ? LV.info.channel.displayName : '');
};
window.lvToggleChat = function () { $('lv-page')?.classList.toggle('lv-chat-hidden'); };
window.lvTheater = function () { document.body.classList.toggle('lv-theater'); $('lv-page')?.classList.toggle('lv-theater-on'); };
window.lvMobileTab = function (tab) {
  const p = $('lv-page'); if (!p) return;
  p.classList.toggle('lv-tab-info', tab === 'info');
  p.querySelectorAll('.lv-mtabs button').forEach(b => b.classList.toggle('is-on', b.dataset.tab === tab));
  if (tab === 'chat') setTimeout(() => lvScrollBottom(true), 50);
};
window.lvJumpLive = function () {
  const v = $('stream-video'); if (!v || !v.buffered || !v.buffered.length) return;
  try { v.currentTime = Math.max(0, v.buffered.end(v.buffered.length - 1) - 1.5); v.play().catch(() => {}); } catch {}
};
function lvMediaSession(info) {
  if (!('mediaSession' in navigator)) return;
  try {
    const art = info.channel.avatar ? [{ src: new URL(info.channel.avatar, location.href).href, sizes: '256x256' }] : [];
    navigator.mediaSession.metadata = new MediaMetadata({ title: info.live.title, artist: info.channel.displayName + ' · LIVE', album: 'Norynex Live', artwork: art });
  } catch {}
}
async function lvLoadChannelVideos(cid) {
  const box = $('lv-channel-videos'); if (!box) return;
  try {
    const vids = (await apiGet(`/api/videos?authorId=${encodeURIComponent(cid)}`)).filter(v => !v.isShort).slice(0, 8);
    if (!vids.length) { box.closest('.lv-about-videos')?.remove(); return; }
    box.innerHTML = vids.map(v => `<a class="lv-vid" href="/watch/${esc(v.id)}" data-h-click="h_live_preventDefault_683" data-hv-click="${nxHv(String(esc(v.id)))}"><div class="lv-vid-th">${v.thumbnailPath ? `<img src="${esc(v.thumbnailPath)}" alt="" loading="lazy">` : ''}</div><div class="lv-vid-t">${esc(v.title)}</div><div class="lv-vid-m">${typeof formatViews === 'function' ? formatViews(v.views || 0) : v.views} ${L('Aufrufe', 'views')}</div></a>`).join('');
  } catch { box.closest('.lv-about-videos')?.remove(); }
}
async function lvLoadOfflineVideos(cid) {
  const box = $('lv-offline-videos'); if (!box) return;
  try {
    const v = (await apiGet(`/api/videos?authorId=${encodeURIComponent(cid)}`)).filter(x => !x.isShort)[0];
    if (v) box.innerHTML = `<button class="lv-offline-last" data-h-click="h_live_navigateTo_690" data-hv-click="${nxHv(String(esc(v.id)))}">${v.thumbnailPath ? `<img src="${esc(v.thumbnailPath)}" alt="">` : ''}<span><small>${L('Neuestes Video', 'Latest video')}</small>${esc(v.title)}</span></button>`;
  } catch {}
}

/* ---------- Socket ---------- */
const H = {
  msg: (m) => { if (m && m.cid === LV.cid) { lvAddMsg(m); if (m.login && LV.cmds && !LV.cmds.users.some(u => u.login === m.login)) LV.cmds.users.unshift({ login: m.login, name: m.name }); } },
  del: (d) => { (d && d.ids || []).forEach(id => { const r = document.querySelector(`#lv-chat-list .lv-m[data-id="${CSS.escape(id)}"]`); if (r) { r.classList.add('is-deleted'); r.querySelector('.lv-tx') && (r.querySelector('.lv-tx').textContent = L('<Nachricht gelöscht>', '<message deleted>')); r.querySelector('.lv-tools')?.remove(); } }); },
  clear: () => { const l = $('lv-chat-list'); if (l) l.innerHTML = ''; },
  modevent: (d) => {
    if (!d || !currentUser || d.userId !== currentUser.id) return;
    if (d.action === 'ban') { lvLockInput(L('Du wurdest aus diesem Chat gebannt.', 'You are banned from this chat.')); showToast(L('Du wurdest aus diesem Chat gebannt.', 'You were banned from this chat.'), 'error'); }
    if (d.action === 'timeout') { lvTimeoutLock(Date.now() + d.duration * 1000); showToast(L(`Timeout für ${d.duration} Sekunden`, `Timed out for ${d.duration}s`), 'error'); }
    if (d.action === 'untimeout' || d.action === 'unban') lvUnlockInput();
  },
  modes: (m) => lvRenderModes(m),
  info: (i) => { if (!LV.info) return; Object.assign(LV.info.live, i); const tt = $('lv-title'); if (tt) tt.textContent = i.title; const mt = $('lv-meta'); if (mt) mt.innerHTML = lvMetaHtml(LV.info.live); lvMediaSession(LV.info); },
  pin: (p) => lvRenderPinned(p),
  goal: (g) => lvRenderGoal(g),
  viewers: (d) => { const v = $('stream-viewer-count'); if (v && d) v.textContent = fmtNum(d.count); },
  vcount: (d) => { if (d && d.userId === LV.cid) { const v = $('stream-viewer-count'); if (v) v.textContent = fmtNum(d.count); } },
  sys: (d) => { if (!d) return; if (d.kind === 'login') { openAuthModal('login'); return; } lvSysLocal(d.text, d.kind); if (d.kind === 'timeout' || d.kind === 'banned') lvScrollBottom(true); },
  modres: (r) => { if (r && r.error) showToast(r.error, 'error'); else if (r && r.info) showToast(r.info, 'success'); },
  alert: (a) => {
    const z = $('lv-alert-zone'); if (!z || !a) return;
    const d = document.createElement('div'); d.className = 'lv-alert lv-alert--' + (a.type || 'x');
    d.innerHTML = `<span class="lv-alert-ico">${a.giftId && typeof nxGiftIcon === 'function' ? nxGiftIcon(a.giftId, 34) : typeof nxAlertIcon === 'function' ? nxAlertIcon(a.type, 34) : ''}</span><div><b>${esc(a.text)}</b>${a.message ? `<small>„${esc(a.message)}“</small>` : ''}</div>`;
    z.appendChild(d); setTimeout(() => { d.classList.add('is-out'); setTimeout(() => d.remove(), 400); }, Math.min(8, a.duration || 6) * 1000);
  },
  raid: (r) => {
    const box = $('lv-raid'); if (!box) return;
    clearInterval(LV.raidT);
    if (!r) { box.hidden = true; return; }
    let left = r.seconds || 8;
    box.hidden = false;
    const draw = () => { box.innerHTML = `<div><b><i class="fas fa-rocket"></i> ${L('Raid zu', 'Raiding')} ${esc(r.toName)}</b><small>${L('Du wirst in', 'Joining in')} ${left} s ${L('mitgenommen', '')}</small></div><button data-h-click="h_live_lvRaidGo_725" data-hv-click="${nxHv(String(esc(r.to)))}">${L('Jetzt mit', 'Join now')}</button><button class="is-ghost" data-h-click="h_live_lvRaidStay_725">${L('Hierbleiben', 'Stay')}</button>`; };
    draw();
    LV.raidT = setInterval(() => { left--; if (left <= 0) { clearInterval(LV.raidT); lvRaidGo(r.to); } else draw(); }, 1000);
  },
  ended: (d) => { if (d && d.userId === LV.cid) { lvSysLocal(L('Der Stream wurde beendet. Danke fürs Zuschauen!', 'The stream has ended. Thanks for watching!'), 'end'); clearInterval(LV.uptimeT); } },
  reconnect: () => { if (LV.cid && $('lv-page')) { socket.emit('join_stream', LV.cid); } },
  poll: (p) => { if (!LV.cid) return; LV.poll = p; if (!p) LV.myVote = null; lvRenderEngage(); },
  pred: (p) => { if (!LV.cid) return; if (!p || (LV.pred && LV.pred.id !== p.id)) LV.myBet = null; LV.pred = p; lvRenderEngage(); if (p && p.status === 'resolved') setTimeout(lvLoadEngage, 800); },
  adbreak: (b) => { if (LV.cid) lvStartAdBreak(b); },
};
window.lvRaidGo = function (to) { clearInterval(LV.raidT); navigateTo('stream', to); };
window.lvRaidStay = function () { clearInterval(LV.raidT); const b = $('lv-raid'); if (b) b.hidden = true; };
function lvBindSocket() {
  if (!socket) return;
  const map = { lv_msg: H.msg, lv_del: H.del, lv_clear: H.clear, lv_modevent: H.modevent, lv_modes: H.modes, lv_info: H.info, lv_pin: H.pin, lv_goal: H.goal, lv_viewers: H.viewers, viewer_count: H.vcount, lv_sys: H.sys, lv_mod_result: H.modres, lv_alert: H.alert, lv_raid: H.raid, stream_broadcast_ended: H.ended, connect: H.reconnect, lv_poll: H.poll, lv_pred: H.pred, lv_adbreak: H.adbreak };
  for (const [ev, fn] of Object.entries(map)) { socket.off(ev, fn); socket.on(ev, fn); }
}
function lvLeave() {
  if (typeof LV.adStop === 'function') { try { LV.adStop(); } catch {} }
  clearInterval(LV.uptimeT); clearInterval(LV.raidT); clearInterval(LV.engT); clearInterval(LV.engTick); clearInterval(LV.adTick);
  LV.poll = LV.pred = LV.myVote = LV.myBet = LV.points = null; LV.adPlaying = false; LV.adSeen = null;
  document.body.classList.remove('lv-theater');
  LV.cid = null; LV.info = null;
}
// Beim Verlassen der Stream-Seite aufräumen
(function () {
  const orig = window.navigateTo;
  if (typeof orig === 'function' && !orig._lv173) {
    const w = function (page, ...rest) { if (page !== 'stream') lvLeave(); if (page !== 'live') clearInterval(_dirTimer); return orig.call(this, page, ...rest); };
    w._lv173 = true; Object.keys(orig).forEach(k => { w[k] = orig[k]; }); window.navigateTo = w;
  }
})();

/* ---------------------------------------------------------------
   LIVE-ABO & GESCHENKE
   --------------------------------------------------------------- */
/* ---------------------------------------------------------------
   MITMACHEN: Kanalpunkte, Belohnungen, Abstimmungen, Vorhersagen
   --------------------------------------------------------------- */
const PT_ICON = { spark: 'fa-wand-magic-sparkles', star: 'fa-star', gem: 'fa-gem', coin: 'fa-coins', heart: 'fa-heart', bolt: 'fa-bolt', flame: 'fa-fire', crown: 'fa-crown' };
async function lvLoadEngage() {
  if (!LV.cid) return;
  try {
    const e = await apiGet(`/api/lv/${LV.cid}/engage`);
    LV.points = e.points; LV.poll = e.poll; LV.pred = e.prediction; LV.myVote = e.myVote; LV.myBet = e.myBet; LV.ads = e.ads;
    lvRenderPoints(); lvRenderEngage();
    if (e.ads && e.ads.running && !LV.adPlaying && !LV.adSeen) lvStartAdBreak(e.ads.running);
  } catch {}
}
function lvRenderPoints() {
  const b = $('lv-pts'); const p = LV.points; if (!b) return;
  const owner = LV.info && LV.info.me && LV.info.me.role === 'owner';
  if (!p || !p.enabled || !currentUser || owner) { b.hidden = true; return; }
  b.hidden = false;
  b.classList.toggle('is-bonus', !!p.bonusReady);
  b.innerHTML = `<i class="fas ${PT_ICON[p.icon] || 'fa-wand-magic-sparkles'}"></i><b>${fmtNum(p.balance)}</b>${p.bonusReady ? `<span class="lv-pts-bonus" title="${L('Bonus abholen', 'Claim bonus')}">+${p.bonus}</span>` : ''}`;
  b.title = `${p.name}: ${fmtNum(p.balance)}`;
}
window.lvOpenPoints = async function (e) {
  e && e.stopPropagation();
  const p = LV.points; if (!p) return;
  if (p.bonusReady) { try { LV.points = await apiPost(`/api/lv/${LV.cid}/points/claim`, {}); lvRenderPoints(); showToast(`+${p.bonus} ${p.name}!`, 'success'); return; } catch (er) { showToast(er.message, 'error'); } }
  document.querySelector('.lv-pts-pop')?.remove();
  const pop = document.createElement('div'); pop.className = 'lv-pts-pop';
  pop.innerHTML = `<div class="lv-pts-head"><i class="fas ${PT_ICON[p.icon] || 'fa-wand-magic-sparkles'}"></i><div><b>${fmtNum(p.balance)} ${esc(p.name)}</b><small>${L('Sammle beim Zuschauen, durch Folgen und mit der Bonus-Truhe (alle 15 Min.)', 'Earn by watching, following and with the bonus chest (every 15 min)')}</small></div></div>
    <div class="lv-pts-list">${p.rewards.length ? p.rewards.map(r => `<button class="lv-reward" style="--rc:${esc(r.color)}" ${p.balance < r.cost || r.cooldownLeft ? 'disabled' : ''} data-h-click="h_live_lvRedeem_790" data-hv-click="${nxHv(String(esc(r.id)))}"><span class="lv-reward-ico"><i class="fas ${r.kind === 'highlight' ? 'fa-highlighter' : 'fa-ticket'}"></i></span><span class="lv-reward-t"><b>${esc(r.title)}</b>${r.desc ? `<small>${esc(r.desc)}</small>` : ''}${r.cooldownLeft ? `<small><i class="fas fa-hourglass-half"></i> ${r.cooldownLeft} s</small>` : ''}</span><span class="lv-reward-c"><i class="fas ${PT_ICON[p.icon] || 'fa-wand-magic-sparkles'}"></i> ${fmtNum(r.cost)}</span></button>`).join('') : `<p class="lv-set-hint">${L('Der Streamer hat noch keine Belohnungen eingerichtet.', 'No rewards set up yet.')}</p>`}</div>`;
  $('lv-chat')?.appendChild(pop);
  setTimeout(() => document.addEventListener('click', function off(ev) { if (!pop.contains(ev.target)) { pop.remove(); document.removeEventListener('click', off); } }), 0);
};
window.lvRedeem = async function (rid) {
  const r = LV.points.rewards.find(x => x.id === rid); if (!r) return;
  let input = '';
  if (r.needsInput) { input = prompt(r.kind === 'highlight' ? L('Welche Nachricht soll hervorgehoben werden?', 'Message to highlight:') : r.title); if (input === null) return; }
  try { LV.points = await apiPost(`/api/lv/${LV.cid}/points/redeem`, { rewardId: rid, input }); lvRenderPoints(); document.querySelector('.lv-pts-pop')?.remove(); showToast(L(`„${r.title}“ eingelöst`, `Redeemed “${r.title}”`), 'success'); }
  catch (e) { showToast(e.message, 'error'); }
};
function lvTimeLeft(t) { const s = Math.max(0, Math.round((t - Date.now()) / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function lvRenderEngage() {
  const box = $('lv-engage'); if (!box) return;
  const me = LV.info && LV.info.me; const canMod = me && ['owner', 'mod', 'staff'].includes(me.role);
  const pName = (LV.points && LV.points.name) || 'Funken';
  let h = '';
  const p = LV.poll;
  if (p) {
    const tot = Math.max(1, p.total);
    h += `<div class="lv-card lv-poll ${(LV.engMin || {}).poll ? 'is-min' : ''}"><div class="lv-card-head" data-h-click="h_live_lvEngMin_810" title="${L('Ein-/ausklappen', 'Collapse/expand')}"><span><i class="fas fa-square-poll-vertical"></i> ${L('Abstimmung', 'Poll')}</span><span class="lv-card-time" data-end="${p.status === 'open' ? p.endsAt : ''}">${p.status === 'open' ? lvTimeLeft(p.endsAt) : L('Beendet', 'Ended')}</span>${canMod && p.status === 'open' ? `<button data-h-click="h_live_lvPollEnd_810" title="${L('Beenden', 'End')}" aria-label="${L('Beenden', 'End')}"><i class="fas fa-stop"></i></button>` : ''}</div>
      <div class="lv-card-q">${esc(p.question)}</div>
      ${p.options.map((o, i) => `<button class="lv-opt ${LV.myVote === i ? 'is-mine' : ''}" ${p.status !== 'open' || LV.myVote != null || !currentUser ? 'disabled' : ''} data-h-click="h_live_lvVote_812" data-hv-click="${nxHv(String(i))}"><i style="width:${o.votes / tot * 100}%"></i><span>${esc(o.text)}</span><b>${Math.round(o.votes / tot * 100)} %</b></button>`).join('')}
      <div class="lv-card-foot">${fmtNum(p.total)} ${L('Stimmen', 'votes')}${p.pointsCost && LV.myVote != null && p.status === 'open' ? ` · <button class="lv-linkbtn" data-h-click="h_live_lvVoteExtra_813">${L(`+1 Stimme für ${p.pointsCost} ${pName}`, `+1 vote for ${p.pointsCost} ${pName}`)}</button>` : ''}${!currentUser ? ' · ' + L('Zum Abstimmen anmelden', 'Log in to vote') : ''}</div></div>`;
  }
  const r = LV.pred;
  if (r) {
    const tot = Math.max(1, r.outcomes.reduce((a, o) => a + o.points, 0));
    const st = { open: lvTimeLeft(r.lockAt), locked: L('Einsätze geschlossen', 'Locked'), resolved: L('Aufgelöst', 'Resolved'), cancelled: L('Abgebrochen', 'Cancelled') }[r.status];
    h += `<div class="lv-card lv-pred ${(LV.engMin || {}).pred ? 'is-min' : ''}"><div class="lv-card-head" data-h-click="h_live_lvEngMin_819" title="${L('Ein-/ausklappen', 'Collapse/expand')}"><span><i class="fas fa-dice"></i> ${L('Vorhersage', 'Prediction')}</span><span class="lv-card-time" data-end="${r.status === 'open' ? r.lockAt : ''}">${st}</span></div>
      <div class="lv-card-q">${esc(r.title)}</div>
      ${r.outcomes.map((o, i) => `<div class="lv-pred-o ${r.winner === i ? 'is-win' : ''} ${LV.myBet && LV.myBet.outcome === i ? 'is-mine' : ''}"><div class="lv-pred-top"><b>${esc(o.text)}</b><span>${Math.round(o.points / tot * 100)} %</span></div><div class="lv-pred-meta">${fmtNum(o.points)} ${esc(pName)} · ${o.users} <i class="fas fa-user"></i> · 1:${o.points ? (tot / o.points).toFixed(2) : '—'}</div>
        ${r.status === 'open' && currentUser && (!LV.myBet || LV.myBet.outcome === i) && !(me && me.role === 'owner') ? `<div class="lv-pred-bet"><input type="number" min="1" placeholder="${esc(pName)}" id="lv-bet-${i}"><button data-h-click="h_live_lvBet_822" data-hv-click="${nxHv(String(i))}">${L('Setzen', 'Bet')}</button></div>` : ''}</div>`).join('')}
      ${LV.myBet ? `<div class="lv-card-foot">${L('Dein Einsatz', 'Your bet')}: ${fmtNum(LV.myBet.amount)} ${esc(pName)}</div>` : ''}</div>`;
  }
  box.innerHTML = h;
  clearInterval(LV.engTick);
  if (box.querySelector('[data-end]:not([data-end=""])')) LV.engTick = setInterval(() => { box.querySelectorAll('[data-end]').forEach(el => { if (el.dataset.end) el.textContent = lvTimeLeft(+el.dataset.end); }); }, 1000);
}
window.lvVote = async function (i) {
  try { const r = await apiPost(`/api/lv/${LV.cid}/poll/vote`, { option: i }); LV.poll = r.poll; LV.myVote = r.myVote; lvRenderEngage(); } catch (e) { showToast(e.message, 'error'); }
};
window.lvVoteExtra = async function () {
  try { const r = await apiPost(`/api/lv/${LV.cid}/poll/vote`, { option: LV.myVote, extraVotes: 1 }); LV.poll = r.poll; if (LV.points) LV.points.balance = r.points; lvRenderPoints(); lvRenderEngage(); } catch (e) { showToast(e.message, 'error'); }
};
window.lvEngMin = function (k) { LV.engMin = LV.engMin || {}; LV.engMin[k] = !LV.engMin[k]; lvRenderEngage(); };
window.lvPollEnd = async function () { try { await apiPost(`/api/lv/${LV.cid}/poll`, { action: 'end' }); } catch (e) { showToast(e.message, 'error'); } };
window.lvBet = async function (i) {
  const v = parseInt(($(`lv-bet-${i}`) || {}).value, 10); if (!v) return;
  try { const r = await apiPost(`/api/lv/${LV.cid}/prediction/bet`, { outcome: i, amount: v }); LV.pred = r.prediction; LV.myBet = r.myBet; if (LV.points) LV.points.balance = r.points; lvRenderPoints(); lvRenderEngage(); } catch (e) { showToast(e.message, 'error'); }
};
// Abstimmung / Vorhersage starten (Streamer & Mods, im Moderations-Panel)
window.lvNewPoll = function () {
  lvPanel(`<i class="fas fa-square-poll-vertical"></i> ${L('Neue Abstimmung', 'New poll')}`, `
    <label class="lt-field"><span>${L('Frage', 'Question')}</span><input id="np-q" maxlength="120"></label>
    ${[1, 2, 3, 4, 5].map(i => `<label class="lt-field"><span>${L('Antwort', 'Option')} ${i}${i > 2 ? ' (' + L('optional', 'optional') + ')' : ''}</span><input id="np-o${i}" maxlength="60"></label>`).join('')}
    <div class="lt-grid2"><label class="lt-field"><span>${L('Dauer', 'Duration')}</span><select id="np-d">${[[60, '1 Min.'], [120, '2 Min.'], [300, '5 Min.'], [600, '10 Min.']].map(([v, l]) => `<option value="${v}" ${v === 120 ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="lt-field"><span>${L('Extra-Stimme kostet', 'Extra vote costs')}</span><input id="np-c" type="number" min="0" value="0"></label></div>
    <button class="co-btn co-btn--primary co-btn--block" data-h-click="h_live_lvStartPoll_847">${L('Abstimmung starten', 'Start poll')}</button>`);
};
window.lvStartPoll = async function () {
  const opts = [1, 2, 3, 4, 5].map(i => ($(`np-o${i}`).value || '').trim()).filter(Boolean);
  try { await apiPost(`/api/lv/${lvCid()}/poll`, { question: $('np-q').value, options: opts, duration: +$('np-d').value, pointsCost: +$('np-c').value || 0 }); lvClosePanel(); } catch (e) { showToast(e.message, 'error'); }
};
window.lvNewPrediction = function () {
  const p = $('lv-chat') ? LV.pred : (_lm && _lm.prediction);
  if (p && ['open', 'locked'].includes(p.status)) {
    lvPanel(`<i class="fas fa-dice"></i> ${L('Vorhersage verwalten', 'Manage prediction')}`, `<p><b>${esc(p.title)}</b></p>
      ${p.status === 'open' ? `<button class="co-btn co-btn--sec co-btn--block" data-h-click="h_live_lvPredAct_858">${L('Einsätze schließen', 'Lock bets')}</button>` : ''}
      <div class="lv-set-label">${L('Wer hat gewonnen?', 'Who won?')}</div>${p.outcomes.map((o, i) => `<button class="co-btn co-btn--sec co-btn--block" style="margin-bottom:6px" data-h-click="h_live_lvPredAct_859" data-hv-click="${nxHv(String(i))}"><i class="fas fa-trophy"></i> ${esc(o.text)}</button>`).join('')}
      <button class="co-btn co-btn--block" style="background:#7f1d1d;color:#fff;margin-top:6px" data-h-click="h_live_lvPredAct_859_2">${L('Abbrechen & alles zurückgeben', 'Cancel & refund')}</button>`);
    return;
  }
  lvPanel(`<i class="fas fa-dice"></i> ${L('Neue Vorhersage', 'New prediction')}`, `
    <label class="lt-field"><span>${L('Was wird passieren?', 'What will happen?')}</span><input id="pr-q" maxlength="100" placeholder="${L('z. B. Schaffen wir den Boss?', 'e.g. Will we beat the boss?')}"></label>
    <div class="lt-grid2"><label class="lt-field"><span>${L('Ausgang', 'Outcome')} 1</span><input id="pr-1" maxlength="40" value="${L('Ja', 'Yes')}"></label><label class="lt-field"><span>${L('Ausgang', 'Outcome')} 2</span><input id="pr-2" maxlength="40" value="${L('Nein', 'No')}"></label></div>
    <label class="lt-field"><span>${L('Zeit zum Setzen', 'Betting window')}</span><select id="pr-w">${[[60, '1 Min.'], [120, '2 Min.'], [300, '5 Min.']].map(([v, l]) => `<option value="${v}" ${v === 120 ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <button class="co-btn co-btn--primary co-btn--block" data-h-click="h_live_lvStartPred_866">${L('Vorhersage starten', 'Start prediction')}</button>`);
};
window.lvStartPred = async function () { try { await apiPost(`/api/lv/${lvCid()}/prediction`, { title: $('pr-q').value, outcomes: [$('pr-1').value, $('pr-2').value], window: +$('pr-w').value }); lvClosePanel(); } catch (e) { showToast(e.message, 'error'); } };
window.lvPredAct = async function (b) { try { await apiPost(`/api/lv/${lvCid()}/prediction`, b); lvClosePanel(); } catch (e) { showToast(e.message, 'error'); } };

/* ---------- Werbepausen ---------- */
async function lvStartAdBreak(brk) {
  if (!brk || LV.adPlaying || brk.endsAt < Date.now()) return;
  LV.adSeen = brk.id;
  // Premium, Admins und Live-Abonnenten: nie Werbung – schon bevor der Server gefragt wird
  const _me = (LV.info && LV.info.me) || {};
  const _adFree = !!(currentUser && (currentUser.isPremium || currentUser.isAdmin)) || !!_me.isPremium || !!_me.sub || _me.role === 'owner';
  let d;
  if (_adFree) d = { active: true, exempt: true, reason: _me.role === 'owner' ? 'owner' : _me.sub ? 'sub' : 'premium' };
  else { try { d = await apiGet(`/api/lv/${LV.cid}/adbreak`); } catch { return; } }
  if (d && !d.exempt && currentUser && (currentUser.isPremium || currentUser.isAdmin)) d = { active: true, exempt: true, reason: 'premium' };
  const box = $('lv-ad'); const video = $('stream-video'); if (!box || !d.active) return;
  if (d.exempt) {
    const z = $('lv-alert-zone'); if (!z) return;
    const n = document.createElement('div'); n.className = 'lv-alert lv-alert--info';
    n.innerHTML = `<span class="lv-alert-ico">${typeof nxAlertIcon === 'function' ? nxAlertIcon('ad', 34) : ''}</span><div><b>${L('Werbepause läuft', 'Ad break running')}</b><small>${d.reason === 'owner' ? L('Deine Zuschauer sehen gerade Werbung.', 'Your viewers are seeing ads.') : d.reason === 'sub' ? L('Dank deines Live-Abos siehst du keine Werbung.', 'Thanks to your live sub you see no ads.') : L('Mit Premium siehst du keine Werbung.', 'With Premium you see no ads.')}</small></div>`;
    z.appendChild(n); setTimeout(() => { n.classList.add('is-out'); setTimeout(() => n.remove(), 400); }, 6000);
    return;
  }
  const ads = (d.ads || []).filter(a => a.videoPath);
  if (!ads.length) return;
  LV.adPlaying = true;
  const prevMuted = video ? video.muted : false; if (video) video.muted = true;
  box.hidden = false;
  let i = 0, curTimer = null;
  const finish = () => {
    clearInterval(LV.adTick); clearTimeout(curTimer);
    const old = box.querySelector('video'); if (old) { try { old.pause(); old.removeAttribute('src'); old.load(); } catch {} }
    box.hidden = true; box.innerHTML = ''; LV.adPlaying = false; LV.adStop = null;
    if (video && video.isConnected) { video.muted = prevMuted; try { lvJumpLive(); } catch {} }
  };
  LV.adStop = finish;
  const playNext = () => {
    clearTimeout(curTimer);
    if (!box.isConnected || !LV.adPlaying) return finish();
    if (i >= ads.length || Date.now() > d.endsAt - 2000) return finish();
    const ad = ads[i];
    const left = Math.max(0, (d.endsAt - Date.now()) / 1000);
    // jede Werbung max. 60 s – und nie länger als die restliche Werbepause
    const cap = Math.max(5, Math.min(60, left));
    box.innerHTML = `<video data-nx-ad="1" playsinline autoplay src="${esc(ad.videoPath)}"></video>
      <div class="lv-ad-bar">
        <span class="lv-ad-tag"><i class="fas fa-rectangle-ad"></i> ${ads.length > 1 ? L(`Werbung ${i + 1} von ${ads.length}`, `Ad ${i + 1} of ${ads.length}`) : L('Werbung', 'Ad')}</span>
        <span class="lv-ad-title">${esc(ad.title || '')}</span>
        <span id="lv-ad-left" class="lv-ad-left"></span>
        ${ad.clickUrl ? `<a href="${esc(ad.clickUrl)}" target="_blank" rel="noopener sponsored" data-h-click="h_live_fetch_917" data-hv-click="${nxHv(String(esc(ad.id)))}">${L('Mehr erfahren', 'Learn more')} <i class="fas fa-arrow-up-right-from-square"></i></a>` : ''}
      </div>
      <div class="lv-ad-segs">${ads.map((_, k) => `<span class="${k < i ? 'is-done' : k === i ? 'is-cur' : ''}"></span>`).join('')}</div>
      <div class="lv-ad-note"><i class="fas fa-crown"></i> ${L('Mit einem Live-Abo oder Premium siehst du keine Werbung.', 'Live subs and Premium remove ads.')}</div>`;
    const v = box.querySelector('video'); let counted = false;
    v.addEventListener('playing', () => { if (counted) return; counted = true; fetch(`/api/lv/${LV.cid}/adbreak/impression`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adId: ad.id, impToken: ad.impToken }) }).catch(() => {}); });
    const next = () => { if (box.querySelector('video') !== v) return; i++; playNext(); };
    v.addEventListener('ended', next); v.addEventListener('error', next);
    curTimer = setTimeout(next, cap * 1000);
    v.play().catch(() => { v.muted = true; v.play().catch(next); });
  };
  clearInterval(LV.adTick); LV.adTick = setInterval(() => {
    if (!box.isConnected) return finish();
    const l = $('lv-ad-left'); if (l) l.textContent = L('Stream geht weiter in ', 'Back in ') + lvTimeLeft(d.endsAt);
    if (Date.now() > d.endsAt + 1000) finish();
  }, 500);
  playNext();
}

/* ---------- Aufzeichnungen (VODs) ---------- */
async function lvLoadVods(cid) {
  const box = $('lv-vods'); if (!box) return;
  try {
    const list = await apiGet(`/api/lv/${encodeURIComponent(cid)}/vods`);
    if (!list.length) return;
    box.innerHTML = `<div class="lv-vods-head">${L('Letzte Streams', 'Past streams')} <small>${L('· nur kurze Zeit verfügbar', '· available for a short time')}</small></div><div class="lv-vods-row">${list.slice(0, 4).map(v => `<button class="lv-vod" data-h-click="h_live_navigateTo_942" data-hv-click="${nxHv(String(esc(v.id)))}"><span class="lv-vod-th">${v.thumb ? `<img src="${esc(v.thumb)}" alt="">` : ''}<em>${dur((v.durationSec || 0) * 1000)}</em></span><b>${esc(v.title)}</b><small>${new Date(v.startedAt).toLocaleDateString(L('de-DE', 'en-GB'))} · ${L('noch', '')} ${Math.max(1, Math.round((new Date(v.expiresAt) - Date.now()) / 3600000))} ${L('Std.', 'h left')}</small></button>`).join('')}</div>`;
  } catch {}
}
// ─── Teil: client/live/030-stream-titel-live-tools.js ───
window.renderVodPage = async function (id) {
  const el = $('page-vod'); if (!el) return;
  el.innerHTML = `<div class="spinner" style="margin:40px auto;display:block"></div>`;
  try {
    const v = await apiGet(`/api/lv/vod/${encodeURIComponent(id)}`);
    const left = Math.max(0, Math.round((new Date(v.expiresAt) - Date.now()) / 3600000));
    el.innerHTML = `<div class="lv-vodpage"><div class="lv-vodpage-player"><video controls playsinline preload="metadata" src="${esc(v.playUrl)}" ${v.thumb ? `poster="${esc(v.thumb)}"` : ''}></video></div>
      <div class="lv-vodpage-info"><h1>${esc(v.title)}</h1><div class="lv-meta"><button class="lv-name" data-h-click="h_live_navigateTo_953" data-hv-click="${nxHv(String(esc(v.channel.id)))}">${esc(v.channel.displayName)}</button><span class="lv-tag">${new Date(v.startedAt).toLocaleString(L('de-DE', 'en-GB'))}</span><span class="lv-tag">${dur((v.durationSec || 0) * 1000)}</span><span class="lv-tag lv-tag--18">${L(`Wird in ${left} Std. gelöscht`, `Deleted in ${left} h`)}</span></div>
      ${v.canDownload ? `<div class="lv-actions"><button class="lv-btn lv-btn--primary" data-h-click="h_live_ltVodDl_954" data-hv-click="${nxHv(String(esc(v.id)))}"><i class="fas fa-download"></i> ${L('Herunterladen', 'Download')}</button><button class="lv-btn" data-h-click="h_live_lvDeleteVod_954" data-hv-click="${nxHv(String(esc(v.id)))}"><i class="fas fa-trash"></i> ${L('Jetzt löschen', 'Delete now')}</button></div><p class="lt-hint">${L('Aufzeichnungen werden 48 Stunden gespeichert und danach automatisch und vollständig vom Server gelöscht. Lade sie herunter, wenn du sie behalten möchtest.', 'Recordings are kept for 48 hours and then deleted completely. Download them if you want to keep them.')}</p>` : ''}</div></div>`;
  } catch (e) { el.innerHTML = `<div class="lvd-empty" style="margin-top:60px"><div class="lvd-empty-ico"><i class="fas fa-film"></i></div><h3>${L('Aufzeichnung nicht verfügbar', 'Recording not available')}</h3><p>${esc(e.message)}</p></div>`; }
};
window.lvDeleteVod = async function (id) {
  if (!confirm(L('Aufzeichnung endgültig löschen?', 'Delete recording permanently?'))) return;
  try { await fetch(`/api/lv/vod/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + localStorage.getItem('nxd_token') } }); showToast(L('Gelöscht', 'Deleted'), 'success'); history.back(); } catch (e) { showToast(e.message, 'error'); }
};
// Download braucht das Login → als Blob laden (Links können keinen Authorization-Header senden)
document.addEventListener('click', async (e) => {
  const a = e.target.closest('a[href*="/api/lv/vod/"][download]'); if (!a) return;
  e.preventDefault();
  try {
    showToast(L('Download startet …', 'Download starting…'), 'info');
    const r = await fetch(a.getAttribute('href').split('?')[0], { headers: { Authorization: 'Bearer ' + localStorage.getItem('nxd_token') } });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Download fehlgeschlagen');
    const blob = await r.blob(); const url = URL.createObjectURL(blob);
    const name = decodeURIComponent((/filename\*=UTF-8''([^;]+)/.exec(r.headers.get('content-disposition') || '') || [])[1] || 'Livestream.mp4');
    const x = document.createElement('a'); x.href = url; x.download = name; document.body.appendChild(x); x.click(); x.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (er) { showToast(er.message, 'error'); }
});

/* ---------- Streamer: Titel & Kategorie direkt auf der Stream-Seite ändern ---------- */
window.lvEditInfo = async function () {
  let cats = []; try { cats = await apiGet('/api/lv/categories'); } catch {}
  const li = LV.info.live;
  _nxModal('lv-edit-info', `<div class="nxm-head"><div class="nxm-head-ico"><i class="fas fa-pen"></i></div><div class="nxm-head-text"><h3>${L('Stream-Info bearbeiten', 'Edit stream info')}</h3><p>${L('Wird sofort für alle Zuschauer geändert', 'Changes apply instantly')}</p></div><button class="nxm-x" data-h-click="h_live__nxCloseModal_979" aria-label="X"><i class="fas fa-xmark"></i></button></div>
    <div class="nxm-body"><label class="lt-field"><span>${L('Titel', 'Title')}</span><input id="ei-t" maxlength="120" value="${esc(li.title)}"></label>
    <label class="lt-field"><span>${L('Kategorie', 'Category')}</span><select id="ei-c">${cats.map(c => `<option value="${c.id}" ${c.id === li.category.id ? 'selected' : ''}>${esc(catName(c))}</option>`).join('')}</select></label>
    <label class="lt-field"><span>${L('Tags (mit Komma)', 'Tags (comma separated)')}</span><input id="ei-g" value="${esc((li.tags || []).join(', '))}"></label>
    <button class="co-btn co-btn--primary co-btn--block" data-h-click="h_live_lvSaveInfo_982">${L('Speichern', 'Save')}</button></div>`);
};
window.lvSaveInfo = async function () {
  try { await apiPatch('/api/lv/dock/info', { title: $('ei-t').value, category: $('ei-c').value, tags: $('ei-g').value.split(',').map(x => x.trim()).filter(Boolean) }); _nxCloseModal('lv-edit-info'); showToast(L('Gespeichert', 'Saved'), 'success'); }
  catch (e) { showToast(e.message, 'error'); }
};

// Alle Käufe laufen über das gemeinsame Bezahlfenster (Guthaben, Karte, Apple Pay, Google Pay, SEPA, paysafecard)
let _subSel = { tier: 1, months: 1, autoRenew: true };
window.lvOpenSub = function () {
  if (!currentUser) { openAuthModal('login'); return; }
  const info = LV.info; if (!info) return;
  if (info.me && !info.me.canPurchase) { showToast(L('Käufe sind mit diesem Konto nicht möglich (z. B. Kindermodus).', 'Purchases are not possible with this account.'), 'error'); return; }
  if (!info.subs.enabled) { showToast(L('Dieser Kanal bietet gerade keine Live-Abos an.', 'This channel does not offer live subs right now.'), 'info'); return; }
  _subSel = { tier: (info.me && info.me.sub && info.me.sub.tier) || 1, months: 1, autoRenew: true };
  _nxModal('lv-sub-modal', `
    <div class="nxm-head"><div class="nxm-head-ico" style="background:linear-gradient(135deg,#9333ea,#db2777);color:#fff">${SVG.star}</div><div class="nxm-head-text"><h3>${L('Live-Abo für', 'Live sub for')} ${esc(info.channel.displayName)}</h3><p>${L(`Unterstütze den Kanal direkt – ${Math.round((info.subs.share || .5) * 100)} % gehen an den Creator`, `Support the channel – ${Math.round((info.subs.share || .5) * 100)}% go to the creator`)}</p></div><button class="nxm-x" data-h-click="h_live__nxCloseModal_999" aria-label="X"><i class="fas fa-xmark"></i></button></div>
    <div class="nxm-body" id="lv-sub-body"></div>`, { wide: true });
  lvDrawSub();
};
function lvDrawSub() {
  const body = $('lv-sub-body'); if (!body) return;
  const info = LV.info; const tiers = info.subs.tiers; const durs = info.subs.durations;
  const price = Math.round(tiers[_subSel.tier].price * _subSel.months * (1 - (durs[_subSel.months] || 0)) * 100) / 100;
  const full = Math.round(tiers[_subSel.tier].price * _subSel.months * 100) / 100;
  const perks = { 1: [L('Live-Abo-Abzeichen im Chat', 'Sub badge in chat'), L('Keine Werbepausen im Stream', 'No ad breaks on stream'), L('Schreiben im „Nur Abonnenten“-Chat', 'Chat in sub-only mode'), L('Mehr Kanalpunkte (×1,2)', 'More channel points (×1.2)')], 2: [L('Alles aus Stufe 1', 'Everything in Tier 1'), L('Blaues Stufe-2-Abzeichen', 'Blue Tier 2 badge'), L('Mehr Kanalpunkte (×1,4)', 'More channel points (×1.4)'), L('Doppelte Unterstützung', 'Double support')], 3: [L('Alles aus Stufe 2', 'Everything in Tier 2'), L('Goldenes Stufe-3-Abzeichen', 'Gold Tier 3 badge'), L('Doppelte Kanalpunkte (×2)', 'Double channel points (×2)'), L('Maximale Unterstützung', 'Maximum support')] };
  const cur = info.me && info.me.sub;
  body.innerHTML = `
    ${cur ? `<div class="lvp-cur"><i class="fas fa-circle-check"></i> ${L('Dein Live-Abo läuft bis', 'Your live sub runs until')} <b>${new Date(cur.expiresAt).toLocaleDateString(L('de-DE', 'en-GB'))}</b> (${L('Stufe', 'Tier')} ${cur.tier}) · ${cur.autoRenew ? L('verlängert sich automatisch', 'renews automatically') : L('verlängert sich nicht', 'does not renew')}. <a href="/settings/subscriptions" data-h-click="h_live__nxCloseModal_1011">${L('Verwalten', 'Manage')}</a></div>` : ''}
    <div class="lvp-tiers">${[1, 2, 3].map(t => `<button class="lvp-tier lvp-tier--${t} ${_subSel.tier === t ? 'is-on' : ''}" data-h-click="h_live__subSelSet_1012" data-hv-click="${nxHv(String(t))}"><span class="lvp-tier-name">${L(tiers[t].de, tiers[t].en)}</span><span class="lvp-tier-price">${eur(tiers[t].price)}<small>/${L('30 Tage', '30 days')}</small></span><ul>${perks[t].map(p => `<li>${p}</li>`).join('')}</ul></button>`).join('')}</div>
    <div class="lvp-label">${L('Laufzeit', 'Duration')}</div>
    <div class="lvp-durs">${[1, 3, 6].map(m => `<button class="${_subSel.months === m ? 'is-on' : ''}" data-h-click="h_live__subSelSet_1014" data-hv-click="${nxHv(String(m))}"><b>${m * 30} ${L('Tage', 'days')}</b>${durs[m] ? `<span class="lvp-save">−${Math.round(durs[m] * 100)} %</span>` : `<span>${L('Standard', 'Standard')}</span>`}</button>`).join('')}</div>
    <label class="lvp-renew"><input type="checkbox" ${_subSel.autoRenew ? 'checked' : ''} data-h-change="h_live_lvDrawSub_1015"><span><b>${L('Automatisch verlängern', 'Renew automatically')}</b><small>${_subSel.autoRenew ? L(`${_subSel.months > 1 ? `Nach ${_subSel.months * 30} Tagen` : 'Danach'} alle 30 Tage ${eur(tiers[_subSel.tier].price)} – jederzeit mit einem Klick kündbar (Einstellungen → Abos & Verträge).`, `${_subSel.months > 1 ? `After ${_subSel.months * 30} days` : 'Then'} every 30 days ${eur(tiers[_subSel.tier].price)} – cancel anytime with one click.`) : L('Einmalzahlung – das Live-Abo endet einfach nach der Laufzeit.', 'One-time payment – ends after the period.')}</small></span></label>
    ${info.subs.perks ? `<div class="lv-perks"><b>${SVG.star} ${L('Extras von', 'Extras from')} ${esc(info.channel.displayName)}</b><p>${esc(info.subs.perks)}</p></div>` : ''}
    <div class="co-total"><span>${L('Gesamt', 'Total')}${full !== price ? ` <s style="opacity:.6">${eur(full)}</s>` : ''}</span><b>${eur(price)}</b></div>
    <p class="lvp-fine">${L('Bezahlen kannst du im nächsten Schritt mit Guthaben, Kreditkarte, Apple Pay, Google Pay, SEPA-Überweisung oder paysafecard. Automatische Verlängerung ist mit Guthaben, Karte, Apple Pay und Google Pay möglich.', 'In the next step you can pay with balance, card, Apple Pay, Google Pay, SEPA transfer or paysafecard. Auto-renewal works with balance, card, Apple Pay and Google Pay.')}</p>
    <button class="co-btn co-btn--primary co-btn--block" data-h-click="h_live_lvContinueSub_1018">${L('Weiter zur Zahlung', 'Continue to payment')} · ${eur(price)}</button>`;
}
window._subSelSet = (k, v) => { _subSel[k] = v; lvDrawSub(); };
window.lvReloadInfo = async function () {
  if (!LV.cid || !$('lv-chat')) return;
  try { const i = await apiGet(`/api/lv/${encodeURIComponent(LV.cid)}/info`); LV.info = i; if (typeof lvRenderHeader === 'function') lvRenderHeader(); } catch {}
};
window.lvContinueSub = function () {
  const info = LV.info; if (!info) return;
  _nxCloseModal('lv-sub-modal');
  openCheckout({ type: 'live_sub', channelId: LV.cid, channelName: info.channel.displayName, tier: _subSel.tier, months: _subSel.months, autoRenew: !!_subSel.autoRenew });
};
let _giftSel = { tab: 'subs', tier: 1, count: 1, to: '', gift: 'heart', qty: 1, msg: '' };
window.lvGiftTo = function (username) { document.querySelector('.lv-ucard')?.remove(); _giftSel = { ..._giftSel, tab: 'subs', count: 1, to: username }; lvOpenGift(true); };
window.lvOpenGift = function (keep) {
  if (!currentUser) { openAuthModal('login'); return; }
  const info = LV.info; if (!info) return;
  if (info.me && !info.me.canPurchase) { showToast(L('Käufe sind mit diesem Konto nicht möglich (z. B. Kindermodus).', 'Purchases are not possible with this account.'), 'error'); return; }
  if (!info.subs.monetized) { showToast(L('Dieser Kanal kann noch keine Geschenke annehmen.', 'This channel cannot receive gifts yet.'), 'info'); return; }
  if (keep !== true) _giftSel = { tab: info.subs.enabled ? 'subs' : 'gifts', tier: 1, count: 5, to: '', gift: 'heart', qty: 1, msg: '' };
  if (!info.subs.enabled) _giftSel.tab = 'gifts';
  _nxModal('lv-gift-modal', `
    <div class="nxm-head lvg-head"><div class="nxm-head-ico lvg-head-ico">${SVG.gift}</div><div class="nxm-head-text"><h3>${L('Schenken', 'Gifts')}</h3><p>${esc(info.channel.displayName)} · ${L(`${Math.round((info.subs.share || .5) * 100)} % gehen an den Creator`, `${Math.round((info.subs.share || .5) * 100)}% go to the creator`)}</p></div><button class="nxm-x" data-h-click="h_live__nxCloseModal_1041" aria-label="X"><i class="fas fa-xmark"></i></button></div>
    <div class="nxm-body lvg" id="lv-gift-body"></div>`, { wide: true });
  lvDrawGift();
};
function lvDrawGift() {
  const body = $('lv-gift-body'); if (!body) return;
  const info = LV.info; const s = _giftSel;
  const stars = (n) => '<span class="lvg-stars">' + '<i class="fas fa-star"></i>'.repeat(n) + '</span>';
  let price = 0, inner = '', breakdown = '';
  if (s.tab === 'subs') {
    const n = s.to ? 1 : s.count;
    const unit = info.subs.tiers[s.tier].price;
    price = Math.round(unit * n * 100) / 100;
    breakdown = `${n} × ${eur(unit)}`;
    inner = `
      <div class="lvg-sec">
        <div class="lvg-label"><i class="fas fa-layer-group"></i> ${L('Stufe', 'Tier')}</div>
        <div class="lvg-tiers">${[1, 2, 3].map(t => `<button type="button" class="lvg-tier lvg-tier--${t} ${s.tier === t ? 'is-on' : ''}" data-h-click="h_live__giftSet_1058" data-hv-click="${nxHv(String(t))}">${stars(t)}<b>${L(info.subs.tiers[t].de, info.subs.tiers[t].en)}</b><span>${eur(info.subs.tiers[t].price)}</span></button>`).join('')}</div>
      </div>
      <div class="lvg-sec">
        <div class="lvg-label"><i class="fas fa-user-group"></i> ${L('An wen?', 'Who gets it?')}</div>
        <div class="lvg-seg"><button type="button" class="${!s.to ? 'is-on' : ''}" data-h-click="h_live__giftSet_1062"><i class="fas fa-shuffle"></i> ${L('Zufällige Zuschauer', 'Random viewers')}</button><button type="button" class="${s.to ? 'is-on' : ''}" data-h-click="h_live__giftSet_1062_2" data-hv-click="${nxHv(String(L('Benutzername des Empfängers:', 'Recipient username:')))}"><i class="fas fa-at"></i> ${s.to ? esc(s.to) : L('Bestimmte Person', 'Specific person')}</button></div>
      </div>
      ${!s.to ? `<div class="lvg-sec">
        <div class="lvg-label"><i class="fas fa-hashtag"></i> ${L('Anzahl', 'Amount')}</div>
        <div class="lvg-counts">${info.subs.giftCounts.map(c => `<button type="button" class="${s.count === c ? 'is-on' : ''}" data-h-click="h_live__giftSet_1066" data-hv-click="${nxHv(String(c))}">${c === 5 ? `<em>${L('Beliebt', 'Popular')}</em>` : ''}<b>${c}</b><small>${c === 1 ? 'Abo' : 'Abos'}</small><span>${eur(info.subs.tiers[s.tier].price * c)}</span></button>`).join('')}</div>
      </div>
      <p class="lvg-fine"><i class="fas fa-circle-info"></i><span>${L('Die Live-Abos gehen an angemeldete Zuschauer ohne Abo, die gerade im Stream oder Chat sind. Jeder bekommt 30 Tage, ohne automatische Verlängerung. Sind weniger Empfänger da als bezahlt, bekommst du den Rest als Guthaben zurück.', 'Subs go to logged-in viewers without a sub who are watching or chatting. Each gets 30 days, no auto-renewal. If fewer recipients are available, the rest is refunded to your balance.')}</span></p>`
      : `<p class="lvg-fine"><i class="fas fa-circle-info"></i><span>${L('@' + esc(s.to) + ' bekommt ein Live-Abo für 30 Tage (ohne automatische Verlängerung).', '@' + esc(s.to) + ' gets a 30-day live sub (no auto-renewal).')}</span></p>`}`;
  } else {
    const g = info.gifts.find(x => x.id === s.gift) || info.gifts[0];
    price = Math.round(g.price * s.qty * 100) / 100;
    breakdown = `${s.qty} × ${L(g.de, g.en)}`;
    inner = `
      <div class="lvg-gifts">${info.gifts.map(x => `<button type="button" class="lvg-gift lvg-gift--${esc(x.id)} ${s.gift === x.id ? 'is-on' : ''}" data-h-click="h_live__giftSet_1075" data-hv-click="${nxHv(String(x.id))}"><span class="lvg-gift-ico">${typeof nxGiftIcon === 'function' ? nxGiftIcon(x.id, 46) : ''}</span><b>${L(x.de, x.en)}</b><span class="lvg-price">${eur(x.price)}</span></button>`).join('')}</div>
      <div class="lvg-row">
        <div class="lvg-qty"><span>${L('Anzahl', 'Quantity')}</span><div class="lvg-stepper"><button type="button" data-h-click="h_live__giftSet_1077" data-hv-click="${nxHv(String(s.qty))}" ${s.qty <= 1 ? 'disabled' : ''} aria-label="-"><i class="fas fa-minus"></i></button><b>${s.qty}</b><button type="button" data-h-click="h_live__giftSet_1077_2" data-hv-click="${nxHv(String(s.qty))}" ${s.qty >= 10 ? 'disabled' : ''} aria-label="+"><i class="fas fa-plus"></i></button></div></div>
      </div>
      <label class="lvg-msg"><i class="fas fa-message"></i><input id="lv-gift-msg" maxlength="140" placeholder="${L('Nachricht an den Streamer (optional)', 'Message to the streamer (optional)')}" value="${esc(s.msg)}" data-h-input="h_live_h_1079"></label>
      <p class="lvg-fine"><i class="fas fa-circle-info"></i><span>${L('Dein Geschenk erscheint im Chat und als Einblendung im Stream. Live-Geschenke haben keinen Geldwert und können nicht zurückgetauscht werden.', 'Your gift appears in chat and as an on-stream alert. Gifts have no cash value.')}</span></p>`;
  }
  body.innerHTML = `
    ${info.subs.enabled ? `<div class="lvg-tabs" role="tablist"><button type="button" role="tab" class="${s.tab === 'subs' ? 'is-on' : ''}" data-h-click="h_live__giftSet_1083"><i class="fas fa-star"></i> ${L('Live-Abos verschenken', 'Gift live subs')}</button><button type="button" role="tab" class="${s.tab === 'gifts' ? 'is-on' : ''}" data-h-click="h_live__giftSet_1083_2"><i class="fas fa-gem"></i> ${L('Live-Geschenke', 'Live gifts')}</button></div>` : ''}
    ${inner}
    <div class="lvg-foot">
      <div class="lvg-total"><span>${L('Gesamt', 'Total')}<small>${esc(breakdown)}</small></span><b>${eur(price)}</b></div>
      <button class="lvg-cta" type="button" data-h-click="h_live_lvContinueGift_1086"><i class="fas fa-lock"></i> ${L('Weiter zur Zahlung', 'Continue to payment')}<span>${eur(price)}</span></button>
    </div>`;
}
window._giftSet = (k, v) => { const m = $('lv-gift-msg'); if (m) _giftSel.msg = m.value; _giftSel[k] = typeof v === 'string' ? v.replace(/^@/, '').trim() : v; lvDrawGift(); };
window.lvContinueGift = function () {
  const s = _giftSel; const m = $('lv-gift-msg'); if (m) s.msg = m.value;
  _nxCloseModal('lv-gift-modal');
  if (s.tab === 'subs') openCheckout({ type: 'live_gift_sub', channelId: LV.cid, channelName: LV.info.channel.displayName, tier: s.tier, ...(s.to ? { recipient: s.to, recipientName: s.to } : { count: s.count }) });
  else { const g = (LV.info.gifts || []).find(x => x.id === s.gift); openCheckout({ type: 'live_gift', channelId: LV.cid, channelName: LV.info.channel.displayName, giftId: s.gift, giftName: g ? L(g.de, g.en) : '', quantity: s.qty, message: (s.msg || '').trim() }); }
};

/* ---------------------------------------------------------------
   CREATOR STUDIO → LIVE-TOOLS
   --------------------------------------------------------------- */
let _lt = null, _ltTab = 'dash';
window.nxRenderLiveTools = async function (content) {
  const hashTab = ((typeof nxHash === "function" ? nxHash() : location.hash).match(/^#studio\/stream\/([\w-]+)/) || [])[1];
  if (hashTab) _ltTab = hashTab;
  if (!['dash', 'golive', 'connect', 'mod', 'bot', 'points', 'overlay', 'money', 'vods', 'stats'].includes(_ltTab)) _ltTab = 'dash';
  content.innerHTML = `<div class="spinner" style="margin:40px auto;display:block"></div>`;
  try { [_lt, _lm] = await Promise.all([apiGet('/api/lv/studio'), apiGet('/api/lv/studio/more')]); } catch (e) { content.innerHTML = `<p style="padding:20px;color:var(--text-muted)">${esc(e.message)}</p>`; return; }
  const tabs = [['dash', 'fa-gauge-high', L('Übersicht', 'Overview')], ['golive', 'fa-video', L('Live gehen', 'Go live')], ['connect', 'fa-plug', L('OBS & Apps', 'OBS & apps')], ['mod', 'fa-shield-halved', L('Chat & Moderation', 'Chat & moderation')], ['bot', 'fa-robot', L('Bots', 'Bots')],
    ['points', 'fa-wand-magic-sparkles', L('Funken & Interaktion', 'Points & interaction')], ['overlay', 'fa-layer-group', L('Overlays & Alerts', 'Overlays & alerts')], ['money', 'fa-sack-dollar', L('Monetarisierung', 'Monetization')], ['vods', 'fa-film', L('Aufzeichnungen', 'Recordings')], ['stats', 'fa-chart-simple', L('Statistik', 'Stats')]];
  content.innerHTML = `<div class="lt">
    <div class="lt-head"><div><h3><i class="fas fa-tower-broadcast"></i> ${L('Livestream', 'Live streaming')}</h3><p>${L('Alles an einem Ort: live gehen, Stream-Infos, OBS, Chat & Moderation, Bots, Kanalpunkte, Overlays, Monetarisierung, Aufzeichnungen und Statistiken.', 'Everything in one place: go live, stream info, OBS, chat & moderation, bots, channel points, overlays, monetization, recordings and stats.')}</p></div>
      <div class="lt-head-actions" id="lt-head-actions"></div></div>
    <div class="lt-tabs" role="tablist">${tabs.map(([id, ic, lb]) => `<button class="${_ltTab === id ? 'is-on' : ''}" data-tab="${id}" data-h-click="h_live_ltTab_1113" data-hv-click="${nxHv(String(id))}"><i class="fas ${ic}"></i><span>${lb}</span></button>`).join('')}</div>
    <div id="lt-body" class="lt-body"></div></div>`;
  ltHeadActions();
  ltDraw();
  ltTabsScroll();
};
// Aktiven Tab in den sichtbaren Bereich holen (Handy) und Rand-Verlauf ausblenden, wenn das Ende erreicht ist
function ltTabsScroll() {
  const t = document.querySelector('.lt-tabs'); if (!t) return;
  const on = t.querySelector('button.is-on');
  if (on && t.scrollWidth > t.clientWidth) t.scrollLeft = Math.max(0, on.offsetLeft - (t.clientWidth - on.offsetWidth) / 2);
  const upd = () => t.classList.toggle('is-end', t.scrollLeft + t.clientWidth >= t.scrollWidth - 4);
  if (!t._ltScroll) { t._ltScroll = true; t.addEventListener('scroll', upd, { passive: true }); }
  upd();
}
function ltHeadActions() {
  const h = $('lt-head-actions'); if (!h || !_lt) return;
  h.innerHTML = `${_lt.isLive ? `<span class="lt-live"><span></span>LIVE · ${fmtNum(_lt.viewers)} ${L('Zuschauer', 'viewers')}</span>` : `<span class="lt-off">OFFLINE</span>`}<button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_navigateTo_1130" data-hv-click="${nxHv(String(esc(currentUser.id)))}"><i class="fas fa-eye"></i> ${L('Meine Stream-Seite', 'My stream page')}</button>${_ltTab !== 'golive' ? `<button class="co-btn co-btn--primary co-btn--sm" data-h-click="h_live_ltTab_1130"><i class="fas fa-video"></i> ${_lt.isLive ? L('Stream-Steuerung', 'Stream controls') : L('Live gehen', 'Go live')}</button>` : ''}`;
}
window.ltTab = (id) => {
  _ltTab = id;
  document.querySelectorAll('.lt-tabs button').forEach(b => b.classList.toggle('is-on', b.dataset.tab === id));
  try { history.replaceState(null, '', '#studio/stream/' + id); } catch {}
  ltHeadActions(); ltDraw(); ltTabsScroll();
};
let _lm = null, _lc = null;
async function ltReloadMore() { try { _lm = await apiGet('/api/lv/studio/more'); } catch {} }
async function ltSave(patch, msg) {
  try { _lt = await apiPatch('/api/lv/studio', patch); if (msg !== false) showToast(msg || L('Gespeichert', 'Saved'), 'success'); return true; }
  catch (e) { showToast(e.message, 'error'); return false; }
}
const tog = (id, on, label, desc) => `<label class="lt-row"><div><b>${label}</b>${desc ? `<small>${desc}</small>` : ''}</div><span class="nx-toggle"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><span class="nx-toggle-slider"></span></span></label>`;
function ltDraw() {
  const b = ltEl('lt-body'); if (!b || !_lt) return;
  const c = _lt.cfg;
  if (_ltTab === 'golive') {
    b.innerHTML = `<div id="lt-golive"></div>`;
    if (typeof switchStudio === 'function') switchStudio('stream-core', null, $('lt-golive'));
    return;
  }
  if (_ltTab === 'connect') return ltDrawConnect(b);
  if (_ltTab === 'points') return ltDrawPoints(b);
  if (_ltTab === 'money') return ltDrawMoney(b);
  if (_ltTab === 'vods') return ltDrawVods(b);
  if (_ltTab === 'dash') {
    const s = _lt.live;
    const m = _lm || {};
    const pend = (m.redemptions || []).filter(r => r.status === 'pending');
    const ad = m.ads || {};
    b.innerHTML = `
      ${!_lt.isLive ? `<div class="lt-hero"><div><h4>${L('Du bist gerade offline', 'You are offline')}</h4><p>${L('Gib deinem Stream einen Titel und eine Kategorie und geh live – im Browser, mit dem Handy oder mit OBS.', 'Set a title and category and go live – in the browser, on your phone or with OBS.')}</p></div><button class="co-btn co-btn--primary" data-h-click="h_live_ltTab_1163"><i class="fas fa-video"></i> ${L('Jetzt live gehen', 'Go live now')}</button></div>` : ''}
      ${_lt.isLive && s ? `<div class="lt-kpis">${[[L('Zuschauer jetzt', 'Viewers now'), _lt.viewers], [L('Spitze', 'Peak'), s.peak], [L('Chat-Nachrichten', 'Chat messages'), s.messages], [L('Chatter', 'Chatters'), s.chatters], [L('Neue Follower', 'New followers'), s.follows], [L('Neue Live-Abos', 'New live subs'), s.subs], [L('Einnahmen', 'Revenue'), eur(s.revenue)]].map(([k, v]) => `<div><small>${k}</small><b>${typeof v === 'number' ? fmtNum(v) : v}</b></div>`).join('')}</div>` : ''}
      ${_lt.isLive ? `<div class="lt-quick">
        <button data-h-click="h_live_lvRunAdStudio_1165"><i class="fas fa-rectangle-ad"></i><b>${L('Werbepause', 'Ad break')}</b><small>${ad.running ? L('läuft gerade', 'running') : ad.enabled ? (ad.nextAt ? L('automatisch in ', 'auto in ') + Math.max(0, Math.round((ad.nextAt - Date.now()) / 60000)) + ' Min.' : '') : L('aus', 'off')}</small></button>
        <button data-h-click="h_live_ltQuick_1166"><i class="fas fa-square-poll-vertical"></i><b>${L('Abstimmung', 'Poll')}</b><small>${m.poll && m.poll.status === 'open' ? L('läuft', 'running') : L('starten', 'start')}</small></button>
        <button data-h-click="h_live_ltQuick_1167"><i class="fas fa-dice"></i><b>${L('Vorhersage', 'Prediction')}</b><small>${m.prediction && ['open', 'locked'].includes(m.prediction.status) ? L('läuft', 'running') : L('starten', 'start')}</small></button>
        <button data-h-click="h_live_ltQuick_1168"><i class="fas fa-bullhorn"></i><b>${L('Ankündigung', 'Announce')}</b><small>${L('im Chat', 'in chat')}</small></button>
        <button data-h-click="h_live_ltQuick_1169"><i class="fas fa-rocket"></i><b>Raid</b><small>${L('Zuschauer mitnehmen', 'take viewers')}</small></button>
        <button data-h-click="h_live_ltQuick_1170"><i class="fas fa-hand-point-right"></i><b>Shoutout</b><small>${L('Kanal empfehlen', 'recommend')}</small></button>
      </div>` : ''}
      ${pend.length ? `<div class="lt-card"><h4><i class="fas fa-ticket"></i> ${L('Offene Einlösungen', 'Pending redemptions')} (${pend.length})</h4>${pend.slice(0, 20).map(r => `<div class="lt-red"><div><b>${esc(r.title)}</b><small>${esc(r.user)} · ${new Date(r.at).toLocaleTimeString(L('de-DE', 'en-GB'), { hour: '2-digit', minute: '2-digit' })}${r.input ? ' · „' + esc(r.input) + '“' : ''}</small></div><button class="co-btn co-btn--primary co-btn--sm" data-h-click="h_live_ltRedeem_1173" data-hv-click="${nxHv(String(r.id))}">${L('Erledigt', 'Done')}</button><button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltRedeem_1173_2" data-hv-click="${nxHv(String(r.id))}">${L('Zurückgeben', 'Refund')}</button></div>`).join('')}</div>` : ''}
      <div class="lt-card"><h4>${L('Stream-Infos', 'Stream info')}</h4><p class="lt-hint">${L('Änderungen sind sofort für alle Zuschauer sichtbar – auch während du live bist.', 'Changes are visible to viewers immediately – even while live.')}</p>
        <label class="lt-field"><span>${L('Titel', 'Title')}</span><input id="lt-title" maxlength="120" value="${esc(_lt.title)}" placeholder="${L('Worum geht es heute?', 'What is today about?')}"></label>
        <div class="lt-grid2">
          <label class="lt-field"><span>${L('Kategorie', 'Category')}</span><select id="lt-cat">${_lt.categories.map(x => `<option value="${x.id}" ${c.category === x.id ? 'selected' : ''}>${esc(catName(x))}</option>`).join('')}</select></label>
          <label class="lt-field"><span>${L('Sprache', 'Language')}</span><select id="lt-lang">${[['de', 'Deutsch'], ['en', 'English'], ['tr', 'Türkçe'], ['fr', 'Français'], ['es', 'Español'], ['it', 'Italiano'], ['pl', 'Polski'], ['ar', 'العربية'], ['ru', 'Русский'], ['nl', 'Nederlands']].map(([v, n]) => `<option value="${v}" ${c.language === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        </div>
        <label class="lt-field"><span>${L('Tags (max. 6, mit Komma trennen)', 'Tags (max 6, comma separated)')}</span><input id="lt-tags" maxlength="200" value="${esc((c.tags || []).join(', '))}" placeholder="${L('z. B. Deutsch, Entspannt, Ranked', 'e.g. Chill, Ranked')}"></label>
        ${tog('lt-mature', c.mature, L('Inhalte ab 18', 'Mature content (18+)'), L('Zuschauer sehen einen Hinweis.', 'Viewers see a notice.'))}
        <button class="co-btn co-btn--primary" data-h-click="h_live_ltSaveInfo_1181"><i class="fas fa-floppy-disk"></i> ${L('Speichern', 'Save')}</button>
      </div>
      <div class="lt-card"><h4>${L('Ziel-Anzeige', 'Goal')}</h4><p class="lt-hint">${L('Zeigt Zuschauern (und im OBS-Ziel-Overlay) einen Fortschrittsbalken.', 'Shows a progress bar to viewers and in the OBS goal overlay.')}</p>
        ${tog('lt-goal-on', c.goal.enabled, L('Ziel anzeigen', 'Show goal'))}
        <div class="lt-grid3">
          <label class="lt-field"><span>${L('Art', 'Type')}</span><select id="lt-goal-type"><option value="followers" ${c.goal.type === 'followers' ? 'selected' : ''}>${L('Abonnenten (Follower)', 'Followers')}</option><option value="subs" ${c.goal.type === 'subs' ? 'selected' : ''}>${L('Live-Abos', 'Live subs')}</option></select></label>
          <label class="lt-field"><span>${L('Ziel', 'Target')}</span><input id="lt-goal-target" type="number" min="1" value="${c.goal.target}"></label>
          <label class="lt-field"><span>${L('Beschriftung', 'Label')}</span><input id="lt-goal-title" maxlength="60" value="${esc(c.goal.title)}"></label>
        </div>
        <button class="co-btn co-btn--sec" data-h-click="h_live_ltSave_1189"><i class="fas fa-floppy-disk"></i> ${L('Ziel speichern', 'Save goal')}</button>
      </div>`;
  } else if (_ltTab === 'mod') {
    const ch = c.chat;
    const ulist = (arr, rm, emptyTxt) => arr.length ? arr.map(u => `<div class="lt-user"><span>${esc(u.displayName)} <small>@${esc(u.username)}</small></span><button data-h-click="h_live_ltMod_1195" data-hv-click="${nxHv(String(rm), String(esc(u.id)))}">${rm === 'unban' ? L('Entbannen', 'Unban') : L('Entfernen', 'Remove')}</button></div>`).join('') : `<p class="lt-hint">${emptyTxt}</p>`;
    b.innerHTML = `
      <div class="lt-card"><h4>${L('Chat-Modi', 'Chat modes')}</h4>
        ${tog('lt-c-enabled', ch.enabled, L('Chat aktiviert', 'Chat enabled'))}
        <div class="lt-row"><div><b>${L('Zeitlupe', 'Slow mode')}</b><small>${L('Mindestabstand zwischen Nachrichten', 'Minimum time between messages')}</small></div><select id="lt-c-slow">${[0, 3, 5, 10, 30, 60, 120, 300].map(s => `<option value="${s}" ${ch.slow === s ? 'selected' : ''}>${s ? s + ' s' : L('Aus', 'Off')}</option>`).join('')}</select></div>
        ${tog('lt-c-fol', ch.followersOnly, L('Nur Follower', 'Followers only'))}
        ${tog('lt-c-sub', ch.subsOnly, L('Nur Live-Abonnenten', 'Live subs only'))}
        ${tog('lt-c-emo', ch.emoteOnly, L('Nur Emojis', 'Emoji only'))}
        ${tog('lt-c-uni', ch.unique, L('Einzigartiger Chat', 'Unique chat'), L('Keine identischen Nachrichten innerhalb von 30 s', 'No identical messages within 30s'))}
        ${tog('lt-c-links', ch.blockLinks, L('Links blockieren', 'Block links'), L('Mods und VIPs dürfen weiterhin Links posten', 'Mods and VIPs can still post links'))}
        ${tog('lt-c-caps', ch.capsFilter, L('Großbuchstaben-Filter', 'Caps filter'))}
        <div class="lt-row"><div><b>AutoMod (Nexa)</b><small>${L('Erkennt Beleidigungen, Hass und Spam automatisch', 'Detects insults, hate and spam automatically')}</small></div><div class="lv-seg">${[['off', L('Aus', 'Off')], ['low', L('Niedrig', 'Low')], ['medium', L('Mittel', 'Medium')], ['high', L('Streng', 'Strict')]].map(([v, l]) => `<button class="${ch.automod === v ? 'is-on' : ''}" data-h-click="h_live_querySelectorAll_1206" data-hv-click="${nxHv(String(v))}">${l}</button>`).join('')}</div></div>
        <label class="lt-field"><span>${L('Eigene Sperrwörter (eins pro Zeile oder mit Komma)', 'Blocked words (one per line or comma separated)')}</span><textarea id="lt-c-words" rows="4" placeholder="${L('Nachrichten mit diesen Wörtern werden nicht gesendet', 'Messages with these words are blocked')}">${esc((ch.blockedWords || []).join('\n'))}</textarea></label>
        <button class="co-btn co-btn--primary" data-h-click="h_live_ltSaveChat_1207"><i class="fas fa-floppy-disk"></i> ${L('Speichern', 'Save')}</button>
      </div>
      <div class="lt-grid2 lt-grid2--top">
        <div class="lt-card"><h4><i class="fas fa-shield-halved" style="color:#22c55e"></i> ${L('Moderatoren', 'Moderators')}</h4><p class="lt-hint">${L('Mods können Nachrichten löschen, Timeouts/Banns vergeben und Chat-Modi ändern.', 'Mods can delete messages, timeout/ban and change chat modes.')}</p>
          <div class="lt-add"><input id="lt-add-mod" placeholder="${L('Benutzername', 'Username')}"><button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltMod_1212" aria-label="Hinzufügen"><i class="fas fa-plus"></i></button></div>
          ${ulist(_lt.mods, 'unmod', L('Noch keine Moderatoren.', 'No moderators yet.'))}</div>
        <div class="lt-card"><h4><i class="fas fa-gem" style="color:#db2777"></i> VIPs</h4><p class="lt-hint">${L('VIPs umgehen Zeitlupe, Link-Sperre und Nur-Follower-Modus.', 'VIPs bypass slow mode, link blocking and followers-only.')}</p>
          <div class="lt-add"><input id="lt-add-vip" placeholder="${L('Benutzername', 'Username')}"><button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltMod_1215" aria-label="Hinzufügen"><i class="fas fa-plus"></i></button></div>
          ${ulist(_lt.vips, 'unvip', L('Noch keine VIPs.', 'No VIPs yet.'))}</div>
      </div>
      <div class="lt-card"><h4><i class="fas fa-ban" style="color:#ef4444"></i> ${L('Gebannte Nutzer', 'Banned users')} (${_lt.banned.length})</h4>
        <div class="lt-add"><input id="lt-add-ban" placeholder="${L('Benutzername bannen', 'Username to ban')}"><button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltMod_1219" aria-label="Sperren"><i class="fas fa-ban"></i></button></div>
        ${ulist(_lt.banned, 'unban', L('Niemand gebannt.', 'Nobody banned.'))}</div>
      <div class="lt-card"><h4><i class="fas fa-clipboard-list"></i> ${L('Mod-Protokoll', 'Mod log')}</h4>
        ${_lt.modLog.length ? `<div class="lt-table-wrap"><table class="lt-table"><thead><tr><th>${L('Zeit', 'Time')}</th><th>${L('Von', 'By')}</th><th>${L('Aktion', 'Action')}</th><th>${L('Ziel', 'Target')}</th><th>${L('Details', 'Details')}</th></tr></thead><tbody>${_lt.modLog.map(r => `<tr><td>${new Date(r.at).toLocaleString(L('de-DE', 'en-GB'), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td><td>${esc(r.actor)}</td><td>${esc(r.action)}</td><td>${esc(r.target || '—')}</td><td class="lt-ellip">${esc(r.detail || '')}</td></tr>`).join('')}</tbody></table></div>` : `<p class="lt-hint">${L('Noch keine Moderationsaktionen.', 'No moderation actions yet.')}</p>`}
      </div>`;
  } else if (_ltTab === 'bot') {
    const bot = c.bot;
    b.innerHTML = `
      <div class="lt-card"><h4><i class="fas fa-robot"></i> ${L('Chat-Bot', 'Chat bot')}</h4><p class="lt-hint">${L('Dein eingebauter Bot beantwortet !Befehle, schickt Timer-Nachrichten und bedankt sich bei neuen Followern und Live-Abonnenten.', 'Your built-in bot answers !commands, posts timed messages and thanks new followers and subs.')}</p>
        ${tog('lt-b-on', bot.enabled, L('Bot aktiviert', 'Bot enabled'))}
        <label class="lt-field"><span>${L('Name des Bots', 'Bot name')}</span><input id="lt-b-name" maxlength="24" value="${esc(bot.name)}"></label>
        ${tog('lt-b-tf', bot.thankFollows, L('Danke-Nachricht bei neuen Followern', 'Thank new followers'))}
        ${tog('lt-b-ts', bot.thankSubs, L('Danke-Nachricht bei Live-Abos', 'Thank new subs'))}
        ${tog('lt-b-tg', bot.thankGifts, L('Danke-Nachricht bei Geschenken', 'Thank gifts'))}
      </div>
      <div class="lt-card"><h4>${L('Eigene Befehle', 'Custom commands')}</h4>
        <p class="lt-hint">${L('Variablen:', 'Variables:')} <code>{user}</code> <code>{touser}</code> <code>{channel}</code> <code>{uptime}</code> <code>{viewers}</code> <code>{followers}</code> <code>{subs}</code> <code>{title}</code> <code>{category}</code> <code>{count}</code> <code>{random:1-100}</code></p>
        <div id="lt-cmds">${bot.commands.map(ltCmdRow).join('')}</div>
        <button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltEl_1236"><i class="fas fa-plus"></i> ${L('Befehl hinzufügen', 'Add command')}</button>
        <p class="lt-hint" style="margin-top:12px">${L('Eingebaut:', 'Built in:')} <code>!commands</code> <code>!uptime</code> <code>!followage</code> <code>!title</code> <code>!game</code> <code>!followers</code> · ${L('Mods im Chat:', 'Mods in chat:')} <code>!addcom</code> <code>!editcom</code> <code>!delcom</code></p>
      </div>
      <div class="lt-card"><h4>${L('Timer-Nachrichten', 'Timed messages')}</h4><p class="lt-hint">${L('Werden automatisch in Abständen gepostet, aber nur, wenn im Chat genug los ist.', 'Posted automatically at intervals, but only if the chat is active.')}</p>
        <div id="lt-timers">${bot.timers.map(ltTimerRow).join('')}</div>
        <button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltEl_1241"><i class="fas fa-plus"></i> ${L('Timer hinzufügen', 'Add timer')}</button>
      </div>
      <button class="co-btn co-btn--primary" data-h-click="h_live_ltSaveBot_1242"><i class="fas fa-floppy-disk"></i> ${L('Bot-Einstellungen speichern', 'Save bot settings')}</button>
      <div class="lt-card" style="margin-top:16px"><h4><i class="fas fa-plug"></i> ${L('Externe Bots (Bot-API)', 'External bots (Bot API)')}</h4>
        <p class="lt-hint">${L('Damit können eigene Programme oder Bot-Dienste Nachrichten in deinen Chat schreiben und den Chat lesen. Behandle den Schlüssel wie ein Passwort.', 'Lets your own programs or bot services post to and read your chat. Treat the key like a password.')}</p>
        ${_lt.botKey ? `<div class="lt-url"><input readonly value="${esc(_lt.botKey)}" data-h-click="h_live_select_1247"><button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltCopy_1247" data-hv-click="${nxHv(String(esc(_lt.botKey)))}" aria-label="Kopieren"><i class="fas fa-copy"></i></button></div>
          <pre class="lt-code">curl -X POST ${esc(location.origin)}/api/lv/bot/say \\
  -H "X-Bot-Key: ${esc(_lt.botKey)}" -H "Content-Type: application/json" \\
  -d '{"text":"Hallo Chat!"}'

curl ${esc(location.origin)}/api/lv/bot/messages?since=0 -H "X-Bot-Key: …"</pre>
          <div class="lt-btnrow"><button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltRotate_1252"><i class="fas fa-rotate"></i> ${L('Neuen Schlüssel erzeugen', 'New key')}</button><button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltRotate_1253"><i class="fas fa-power-off"></i> ${L('Bot-API ausschalten', 'Disable Bot API')}</button></div>`
          : `<button class="co-btn co-btn--sec" data-h-click="h_live_ltRotate_1254"><i class="fas fa-key"></i> ${L('Bot-API einschalten', 'Enable Bot API')}</button>`}
      </div>`;
  } else if (_ltTab === 'overlay') {
    const base = `${location.origin}/overlay/`;
    const k = encodeURIComponent(_lt.overlayKey);
    const a = c.alerts;
    b.innerHTML = `
      <div class="lt-card lt-obs-howto"><h4><i class="fas fa-circle-info"></i> ${L('So fügst du ein Overlay in OBS ein', 'How to add an overlay in OBS')}</h4>
        <ol><li>${L('Link unten kopieren.', 'Copy a link below.')}</li><li>${L('In OBS bei „Quellen“ auf <b>+</b> → <b>Browser</b> klicken.', 'In OBS, click <b>+</b> under Sources → <b>Browser</b>.')}</li><li>${L('Link bei „URL“ einfügen, Breite/Höhe wie angegeben einstellen, OK.', 'Paste the link as URL, set width/height as shown, OK.')}</li><li>${L('Funktioniert genauso in Streamlabs, XSplit und Meld.', 'Works the same in Streamlabs, XSplit and Meld.')}</li></ol>
        <p class="lt-hint"><i class="fas fa-lock"></i> ${L('Die Links enthalten deinen geheimen Overlay-Schlüssel – nicht im Stream zeigen. Falls er doch bekannt wird:', 'The links contain your secret overlay key – do not show them on stream. If it leaks:')} <button class="lt-linkbtn" data-h-click="h_live_ltRotate_1263">${L('neuen Schlüssel erzeugen', 'create a new key')}</button></p>
      </div>
      <div class="lt-card"><h4><i class="fas fa-comments"></i> ${L('Chat-Overlay', 'Chat overlay')} <small>(${L('empfohlen', 'recommended')} 400 × 600)</small></h4>
        <div class="lt-grid3">
          <label class="lt-field"><span>${L('Schriftgröße', 'Font size')}</span><input type="number" id="lo-size" min="10" max="48" value="18" data-h-input="h_live_ltOvl_1267"></label>
          <label class="lt-field"><span>${L('Stil', 'Style')}</span><select id="lo-theme" data-h-change="h_live_ltOvl_1268"><option value="dark">${L('Dunkle Boxen', 'Dark boxes')}</option><option value="clear">${L('Transparent', 'Transparent')}</option><option value="light">${L('Hell', 'Light')}</option></select></label>
          <label class="lt-field"><span>${L('Ausblenden nach (s, 0 = nie)', 'Fade after (s, 0 = never)')}</span><input type="number" id="lo-fade" min="0" max="600" value="0" data-h-input="h_live_ltOvl_1269"></label>
        </div>
        <div class="lt-checks"><label><input type="checkbox" id="lo-badges" checked data-h-change="h_live_ltOvl_1269_2"> ${L('Abzeichen', 'Badges')}</label><label><input type="checkbox" id="lo-bots" checked data-h-change="h_live_ltOvl_1271"> ${L('Bot-Nachrichten', 'Bot messages')}</label><label><input type="checkbox" id="lo-events" checked data-h-change="h_live_ltOvl_1271_2"> ${L('Ereignisse', 'Events')}</label><label><input type="checkbox" id="lo-right" data-h-change="h_live_ltOvl_1271_3"> ${L('Rechtsbündig', 'Right aligned')}</label></div>
        <div class="lt-url"><input readonly id="lo-chat-url" data-h-click="h_live_select_1271"><button class="co-btn co-btn--primary co-btn--sm" data-h-click="h_live_ltCopy_1271"><i class="fas fa-copy"></i> ${L('Kopieren', 'Copy')}</button></div>
        <div class="lt-preview"><iframe id="lo-chat-prev" title="Chat preview" loading="lazy"></iframe></div>
      </div>
      <div class="lt-card"><h4><i class="fas fa-bell"></i> ${L('Alert-Overlay', 'Alerts overlay')} <small>(${L('empfohlen', 'recommended')} 1920 × 1080)</small></h4>
        <p class="lt-hint">${L('Zeigt Einblendungen mit Ton für neue Follower, Live-Abos, verschenkte Abos, Live-Geschenke und Raids.', 'Shows alerts with sound for followers, subs, gifted subs, gifts and raids.')}</p>
        <div class="lt-url"><input readonly value="${esc(base)}alerts.html?key=${k}" data-h-click="h_live_select_1277"><button class="co-btn co-btn--primary co-btn--sm" data-h-click="h_live_ltCopy_1277" data-hv-click="${nxHv(String(esc(base)), String(k))}"><i class="fas fa-copy"></i> ${L('Kopieren', 'Copy')}</button></div>
        ${tog('la-on', a.enabled, L('Alerts aktiviert', 'Alerts enabled'))}
        ${tog('la-sound', a.sound, L('Ton abspielen', 'Play sound'))}
        <div class="lt-grid3">
          <label class="lt-field"><span>${L('Dauer (Sekunden)', 'Duration (s)')}</span><input type="number" id="la-dur" min="2" max="20" value="${a.duration}"></label>
          <label class="lt-field"><span>${L('Lautstärke', 'Volume')} (%)</span><input type="number" id="la-vol" min="0" max="100" value="${a.volume}"></label>
          <label class="lt-field"><span>${L('Geschenke ab (€)', 'Gifts from (€)')}</span><input type="number" id="la-min" min="0" step="0.5" value="${a.minGift}"></label>
        </div>
        ${[['follow', L('Neuer Follower', 'New follower'), '{user}'], ['sub', L('Live-Abo', 'Live sub'), '{user} {tier} {months}'], ['gift', L('Verschenkte Abos', 'Gifted subs'), '{user} {count} {tier}'], ['livegift', L('Live-Geschenk', 'Live gift'), '{user} {gift} {amount}'], ['raid', 'Raid', '{user} {viewers}']].map(([k2, lb, vars]) => `
          <div class="lt-alert-row"><label><input type="checkbox" id="la-${k2}-on" ${a[k2].enabled ? 'checked' : ''}> <b>${lb}</b></label><input id="la-${k2}-text" maxlength="160" value="${esc(a[k2].text)}" title="${vars}"><button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltTestAlert_1286" data-hv-click="${nxHv(String(k2))}"><i class="fas fa-play"></i> Test</button></div>`).join('')}
        <button class="co-btn co-btn--primary" data-h-click="h_live_ltSaveAlerts_1286"><i class="fas fa-floppy-disk"></i> ${L('Alerts speichern', 'Save alerts')}</button>
      </div>
      <div class="lt-card"><h4><i class="fas fa-bullseye"></i> ${L('Ziel-Overlay', 'Goal overlay')} <small>(${L('empfohlen', 'recommended')} 600 × 120)</small></h4>
        <p class="lt-hint">${L('Das Ziel stellst du unter „Übersicht“ ein.', 'Set the goal under “Overview”.')}</p>
        <div class="lt-url"><input readonly value="${esc(base)}goal.html?key=${k}" data-h-click="h_live_select_1291"><button class="co-btn co-btn--primary co-btn--sm" data-h-click="h_live_ltCopy_1291" data-hv-click="${nxHv(String(esc(base)), String(k))}"><i class="fas fa-copy"></i> ${L('Kopieren', 'Copy')}</button></div>
      </div>
      <div class="lt-card"><h4><i class="fas fa-square-poll-vertical"></i> ${L('Abstimmungs- & Vorhersage-Overlay', 'Poll & prediction overlay')} <small>(${L('empfohlen', 'recommended')} 500 × 400)</small></h4>
        <p class="lt-hint">${L('Zeigt laufende Abstimmungen und Vorhersagen live mit Balken im Stream.', 'Shows running polls and predictions live on stream.')}</p>
        <div class="lt-url"><input readonly value="${esc(base)}poll.html?key=${k}" data-h-click="h_live_select_1295"><button class="co-btn co-btn--primary co-btn--sm" data-h-click="h_live_ltCopy_1295" data-hv-click="${nxHv(String(esc(base)), String(k))}"><i class="fas fa-copy"></i> ${L('Kopieren', 'Copy')}</button></div>
        <div class="lt-preview lt-preview--sm"><iframe src="${esc(base)}poll.html?preview=1" title="Poll preview" loading="lazy"></iframe></div>
      </div>`;
    ltOvl();
  } else if (_ltTab === 'stats') {
    const ss = _lt.sessions;
    const max = Math.max(1, ...ss.map(s => s.peakViewers || 0));
    b.innerHTML = ss.length ? `
      <div class="lt-kpis">${[[L('Streams', 'Streams'), ss.length], [L('Stunden live', 'Hours live'), (ss.reduce((a, s) => a + (s.durationMin || 0), 0) / 60).toFixed(1)], [L('Höchste Zuschauerzahl', 'Peak viewers'), Math.max(...ss.map(s => s.peakViewers || 0))], [L('Ø Zuschauer', 'Avg viewers'), Math.round(ss.reduce((a, s) => a + (s.avgViewers || 0), 0) / ss.length)], [L('Neue Follower', 'New followers'), ss.reduce((a, s) => a + (s.follows || 0), 0)], [L('Einnahmen', 'Revenue'), eur(ss.reduce((a, s) => a + (s.revenue || 0), 0))]].map(([k, v]) => `<div><small>${k}</small><b>${typeof v === 'number' ? fmtNum(v) : v}</b></div>`).join('')}</div>
      <div class="lt-card"><h4>${L('Spitzen-Zuschauer pro Stream', 'Peak viewers per stream')}</h4><div class="lt-bars">${ss.slice(0, 20).reverse().map(s => `<div title="${esc(s.title || '')} – ${s.peakViewers}"><i style="height:${Math.max(4, (s.peakViewers || 0) / max * 100)}%"></i><small>${new Date(s.startedAt).toLocaleDateString(L('de-DE', 'en-GB'), { day: '2-digit', month: '2-digit' })}</small></div>`).join('')}</div></div>
      <div class="lt-card"><h4>${L('Vergangene Streams', 'Past streams')}</h4><div class="lt-table-wrap"><table class="lt-table"><thead><tr><th>${L('Datum', 'Date')}</th><th>${L('Titel', 'Title')}</th><th>${L('Dauer', 'Duration')}</th><th>${L('Spitze', 'Peak')}</th><th>Ø</th><th>Chatter</th><th>${L('Nachr.', 'Msgs')}</th><th>${L('Follower', 'Follows')}</th><th>${L('Abos', 'Subs')}</th><th>€</th></tr></thead><tbody>${ss.map(s => `<tr><td>${new Date(s.startedAt).toLocaleString(L('de-DE', 'en-GB'), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td><td class="lt-ellip">${esc(s.title || '')}</td><td>${Math.floor((s.durationMin || 0) / 60)}:${String((s.durationMin || 0) % 60).padStart(2, '0')}</td><td>${s.peakViewers}</td><td>${s.avgViewers}</td><td>${s.chatters}</td><td>${s.messages}</td><td>${s.follows}</td><td>${s.subs}</td><td>${eur(s.revenue)}</td></tr>`).join('')}</tbody></table></div></div>`
      : `<div class="lvd-empty"><div class="lvd-empty-ico"><i class="fas fa-chart-simple"></i></div><h3>${L('Noch keine Statistik', 'No stats yet')}</h3><p>${L('Nach deinem ersten Livestream siehst du hier Zuschauer, Chat-Aktivität, neue Follower und Einnahmen.', 'After your first stream you will see viewers, chat activity, followers and revenue here.')}</p></div>`;
  }
}
function ltSubsHtml(c, tog) {
  const st = _lt.subStats;
  return `
      <div class="lt-kpis">${[[L('Aktive Live-Abos', 'Active live subs'), fmtNum(st.active)], [L('Stufe 1 / 2 / 3', 'Tier 1 / 2 / 3'), st.tiers.join(' / ')], [L('Davon verschenkt', 'Gifted'), fmtNum(st.gifted)], [L('Einnahmen 30 Tage', 'Revenue 30 days'), eur(st.revenue30)], [L('Einnahmen gesamt', 'Revenue total'), eur(st.revenueAll)]].map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
      <div class="lt-card"><h4>${L('Live-Abos anbieten', 'Offer live subs')}</h4>
        ${tog('ls-on', c.subs.enabled, L('Live-Abos und Geschenk-Abos aktivieren', 'Enable live subs and gifted subs'), L(`Du bekommst ${Math.round(_lt.share * 100)} % jedes Kaufs als Einnahme (auszahlbar ab 100 €).`, `You receive ${Math.round(_lt.share * 100)}% of every purchase (payout from €100).`))}
        <div class="lt-tiers">${[1, 2, 3].map(t => `<div><b>${L(_lt.tiers[t].de, _lt.tiers[t].en)}</b><span>${eur(_lt.tiers[t].price)} / ${L('Monat', 'month')}</span><small>${L('Dein Anteil', 'Your share')}: ${eur(_lt.tiers[t].price * _lt.share)}</small></div>`).join('')}</div>
        <label class="lt-field"><span>${L('Deine Extras für Live-Abonnenten (wird im Abo-Fenster angezeigt)', 'Your perks for live subs (shown in the sub window)')}</span><textarea id="ls-perks" rows="3" maxlength="500" placeholder="${L('z. B. Discord-Rolle, Mitspielen bei Community-Runden, Namen im Abspann …', 'e.g. Discord role, play with me, name in credits…')}">${esc(c.subs.perks || '')}</textarea></label>
        <button class="co-btn co-btn--primary" data-h-click="h_live_ltSave_1316"><i class="fas fa-floppy-disk"></i> ${L('Speichern', 'Save')}</button>
      </div>
      <div class="lt-card"><h4>${L('Live-Geschenke', 'Live gifts')}</h4><p class="lt-hint">${L('Zuschauer können dir während des Streams Geschenke schicken. Sie erscheinen im Chat und im Alert-Overlay.', 'Viewers can send gifts during the stream. They show in chat and in the alerts overlay.')}</p>
        <div class="lt-gifts">${_lt.gifts.map(g => `<span>${window.nxGiftIcon ? nxGiftIcon(g.id, 22) : g.emoji} ${L(g.de, g.en)} · ${eur(g.price)}</span>`).join('')}</div></div>
      <div class="lt-card"><h4>${L('Deine Live-Abonnenten', 'Your live subscribers')}</h4>
        ${st.list.length ? `<div class="lt-table-wrap"><table class="lt-table"><thead><tr><th>${L('Name', 'Name')}</th><th>${L('Stufe', 'Tier')}</th><th>${L('Monate', 'Months')}</th><th>${L('Läuft bis', 'Expires')}</th><th></th></tr></thead><tbody>${st.list.map(s => `<tr><td>${esc(s.name)}</td><td>${s.tier}</td><td>${s.months}</td><td>${new Date(s.expiresAt).toLocaleDateString(L('de-DE', 'en-GB'))}</td><td>${s.gifted ? '<i class="fas fa-gift" style="color:#fb923c"></i>' : ''}</td></tr>`).join('')}</tbody></table></div>` : `<p class="lt-hint">${L('Noch keine Live-Abonnenten.', 'No live subscribers yet.')}</p>`}
      </div>`;
}
window.ltCmdRow = function (cm) {
  return `<div class="lt-cmd" data-id="${esc(cm.id || '')}"><span class="lt-cmd-bang">!</span><input class="lt-cmd-name" maxlength="30" value="${esc(cm.name)}" placeholder="${L('befehl', 'command')}"><input class="lt-cmd-resp" maxlength="400" value="${esc(cm.response)}" placeholder="${L('Antwort des Bots', 'Bot response')}">
    <select class="lt-cmd-perm" title="${L('Wer darf', 'Who can use')}"><option value="all" ${cm.perm === 'all' ? 'selected' : ''}>${L('Alle', 'Everyone')}</option><option value="sub" ${cm.perm === 'sub' ? 'selected' : ''}>${L('Abonnenten', 'Subs')}</option><option value="vip" ${cm.perm === 'vip' ? 'selected' : ''}>VIP</option><option value="mod" ${cm.perm === 'mod' ? 'selected' : ''}>Mods</option></select>
    <input class="lt-cmd-cd" type="number" min="0" max="3600" value="${cm.cooldown}" title="${L('Abklingzeit (s)', 'Cooldown (s)')}"><label class="lt-cmd-on" title="${L('Aktiv', 'Enabled')}"><input type="checkbox" ${cm.enabled !== false ? 'checked' : ''}></label>${cm.uses ? `<small class="lt-cmd-uses">${cm.uses}×</small>` : ''}<button data-h-click="h_live_closest_1328" aria-label="X"><i class="fas fa-trash"></i></button></div>`;
};
window.ltTimerRow = function (tm) {
  return `<div class="lt-cmd lt-timer" data-id="${esc(tm.id || '')}"><input class="lt-tm-msg" maxlength="400" value="${esc(tm.message)}" placeholder="${L('Nachricht', 'Message')}"><label title="${L('Alle X Minuten', 'Every X minutes')}"><input class="lt-tm-int" type="number" min="1" max="240" value="${tm.interval}"> ${L('Min.', 'min')}</label><label title="${L('Mindestens so viele Chat-Nachrichten dazwischen', 'Minimum chat lines in between')}"><input class="lt-tm-lines" type="number" min="0" max="500" value="${tm.minLines}"> ${L('Zeilen', 'lines')}</label><label class="lt-cmd-on"><input type="checkbox" ${tm.enabled !== false ? 'checked' : ''}></label><button data-h-click="h_live_closest_1331" aria-label="X"><i class="fas fa-trash"></i></button></div>`;
};
window.ltSaveInfo = async function () {
  const tags = (ltEl('lt-tags').value || '').split(',').map(x => x.trim()).filter(Boolean);
  await ltSave({ title: ltEl('lt-title').value, category: ltEl('lt-cat').value, language: ltEl('lt-lang').value, tags, mature: ltEl('lt-mature').checked });
};
window.ltSaveChat = async function () {
  const seg = document.querySelector('#lt-body .lv-seg');
  const am = seg && seg.dataset.v ? seg.dataset.v : (_lt.cfg.chat.automod);
  await ltSave({ chat: { enabled: ltEl('lt-c-enabled').checked, slow: +ltEl('lt-c-slow').value, followersOnly: ltEl('lt-c-fol').checked, subsOnly: ltEl('lt-c-sub').checked, emoteOnly: ltEl('lt-c-emo').checked, unique: ltEl('lt-c-uni').checked, blockLinks: ltEl('lt-c-links').checked, capsFilter: ltEl('lt-c-caps').checked, automod: am, blockedWords: (ltEl('lt-c-words').value || '').split(/[\n,]/).map(x => x.trim()).filter(Boolean) } });
  ltDraw();
};
window.ltSaveBot = async function () {
  const commands = [...document.querySelectorAll('#lt-cmds .lt-cmd')].map(r => ({ id: r.dataset.id || undefined, name: r.querySelector('.lt-cmd-name').value, response: r.querySelector('.lt-cmd-resp').value, perm: r.querySelector('.lt-cmd-perm').value, cooldown: +r.querySelector('.lt-cmd-cd').value, enabled: r.querySelector('.lt-cmd-on input').checked })).filter(x => x.name.trim() && x.response.trim());
  const timers = [...document.querySelectorAll('#lt-timers .lt-timer')].map(r => ({ id: r.dataset.id || undefined, message: r.querySelector('.lt-tm-msg').value, interval: +r.querySelector('.lt-tm-int').value, minLines: +r.querySelector('.lt-tm-lines').value, enabled: r.querySelector('.lt-cmd-on input').checked })).filter(x => x.message.trim());
  if (await ltSave({ bot: { enabled: ltEl('lt-b-on').checked, name: ltEl('lt-b-name').value, thankFollows: ltEl('lt-b-tf').checked, thankSubs: ltEl('lt-b-ts').checked, thankGifts: ltEl('lt-b-tg').checked, commands, timers } })) ltDraw();
};
window.ltSaveAlerts = async function () {
  const p = { enabled: ltEl('la-on').checked, sound: ltEl('la-sound').checked, duration: +ltEl('la-dur').value, volume: +ltEl('la-vol').value, minGift: +ltEl('la-min').value };
  ['follow', 'sub', 'gift', 'livegift', 'raid'].forEach(k => { p[k] = { enabled: $(`la-${k}-on`).checked, text: $(`la-${k}-text`).value }; });
  await ltSave({ alerts: p });
};
window.ltTestAlert = async function (type) {
  try { const r = await apiPost('/api/lv/studio/test-alert', { type }); showToast(r.overlaysConnected ? L(`Test-Alert an ${r.overlaysConnected} Overlay(s) gesendet`, `Test alert sent to ${r.overlaysConnected} overlay(s)`) : L('Test gesendet – aber gerade ist kein Alert-Overlay geöffnet (in OBS einfügen).', 'Test sent – but no alerts overlay is open right now (add it in OBS).'), r.overlaysConnected ? 'success' : 'info'); }
  catch (e) { showToast(e.message, 'error'); }
};
window.ltMod = async function (action, target) {
  target = String(target || '').trim(); if (!target) { showToast(L('Bitte Benutzernamen eingeben', 'Please enter a username'), 'error'); return; }
  try { _lt = await apiPost('/api/lv/studio/mod', { action, target }); showToast(L('Erledigt', 'Done'), 'success'); ltDraw(); }
  catch (e) { showToast(e.message, 'error'); }
};
window.ltRotate = async function (which) {
  if (which === 'overlay' && !confirm(L('Neuen Overlay-Schlüssel erzeugen? Die alten Links in OBS funktionieren dann nicht mehr.', 'Create a new overlay key? Old links in OBS will stop working.'))) return;
  try { const r = await apiPost('/api/lv/studio/rotate-key', { which }); _lt.overlayKey = r.overlayKey; _lt.botKey = r.botKey; ltDraw(); showToast(L('Erledigt', 'Done'), 'success'); }
  catch (e) { showToast(e.message, 'error'); }
};
window.ltCopy = async function (txt) { try { await navigator.clipboard.writeText(txt); showToast(L('Kopiert', 'Copied'), 'success'); } catch { prompt(L('Kopieren:', 'Copy:'), txt); } };
window.ltOvl = function () {
  const u = ltEl('lo-chat-url'); if (!u || !_lt) return;
  const q = new URLSearchParams({ key: _lt.overlayKey, size: ltEl('lo-size').value || 18, theme: ltEl('lo-theme').value, fade: ltEl('lo-fade').value || 0 });
  if (!ltEl('lo-badges').checked) q.set('badges', '0'); if (!ltEl('lo-bots').checked) q.set('bots', '0'); if (!ltEl('lo-events').checked) q.set('events', '0'); if (ltEl('lo-right').checked) q.set('align', 'right');
  u.value = `${location.origin}/overlay/chat.html?${q}`;
  const f = ltEl('lo-chat-prev'); if (f) { q.set('preview', '1'); q.set('demo', '1'); q.delete('key'); clearTimeout(f._t); f._t = setTimeout(() => { f.src = `/overlay/chat.html?${q}`; }, 250); }
};

/* ---------------------------------------------------------------
   Live-Hinweis & Liste aktuell halten
   --------------------------------------------------------------- */
(function hookSocket() {
  const tryBind = () => {
    if (typeof socket === 'undefined' || !socket) return setTimeout(tryBind, 1000);
    if (socket._lv173) return; socket._lv173 = true;
    socket.on('live_list_changed', () => { if (typeof currentPage !== 'undefined' && currentPage === 'live') apiGet('/api/lv/directory').then(d => { _dirData = d; drawDirectory(); }).catch(() => {}); });
  };
  tryBind();
})();

/* =====================================================================
   v1.74 · Livestream-Hub: OBS & Apps, Funken, Monetarisierung, Aufzeichnungen
   ===================================================================== */
async function ltRefreshLight() {
  try { [_lt, _lm] = await Promise.all([apiGet('/api/lv/studio'), apiGet('/api/lv/studio/more')]); } catch { return; }
  ltHeadActions(); if (['dash', 'points', 'vods', 'money'].includes(_ltTab)) ltDraw();
}
window.lvRunAdStudio = async function () { await lvRunAd(); ltRefreshLight(); };
window.ltRedeem = async function (id, action) {
  try { await apiPost('/api/lv/studio/redemptions/' + encodeURIComponent(id), { action }); showToast(action === 'refund' ? L('Zurückgegeben', 'Refunded') : L('Erledigt', 'Done'), 'success'); ltRefreshLight(); } catch (e) { showToast(e.message, 'error'); }
};
window.ltQuick = function (what) {
  if (what === 'poll') { if (_lm && _lm.poll && _lm.poll.status === 'open') { if (confirm(L('Laufende Abstimmung jetzt beenden?', 'End the running poll now?'))) apiPost(`/api/lv/${currentUser.id}/poll`, { action: 'end' }).then(ltRefreshLight).catch(e => showToast(e.message, 'error')); return; } return lvNewPoll(); }
  if (what === 'pred') return lvNewPrediction();
  const lb = { announce: [L('Ankündigung im Chat', 'Chat announcement'), L('Text', 'Text'), 'fa-bullhorn'], raid: ['Raid', L('Kanalname (der gerade live ist)', 'Channel name (currently live)'), 'fa-rocket'], shoutout: ['Shoutout', L('Kanalname', 'Channel name'), 'fa-hand-point-right'] }[what];
  lvPanel(`<i class="fas ${lb[2]}"></i> ${lb[0]}`, `<label class="lt-field"><span>${lb[1]}</span><input id="lq-in" maxlength="${what === 'announce' ? 300 : 40}" ${what !== 'announce' ? 'placeholder="@name"' : ''}></label>
    ${what === 'raid' ? `<p class="lt-hint">${L('Deine Zuschauer werden nach 8 Sekunden zum anderen Kanal weitergeleitet – ein schöner Abschluss für deinen Stream.', 'Your viewers are sent to the other channel after 8 seconds.')}</p>` : ''}
    <button class="co-btn co-btn--primary co-btn--block" data-h-click="h_live_ltQuickGo_1404" data-hv-click="${nxHv(String(what))}">${L('Los', 'Go')}</button>`);
  setTimeout(() => { const i = $('lq-in'); if (i) i.focus(); }, 50);
};
window.ltQuickGo = async function (what) {
  const v = ($('lq-in').value || '').trim().replace(/^@/, ''); if (!v) return;
  try { await apiPost('/api/lv/studio/mod', what === 'announce' ? { action: 'announce', text: v } : { action: what, target: v }); showToast(L('Erledigt', 'Done'), 'success'); lvClosePanel(); } catch (e) { showToast(e.message, 'error'); }
};
// ─── Teil: client/live/040-obs-funken-statistik.js ───

/* ---------- OBS & Apps ---------- */
async function ltDrawConnect(b) {
  b.innerHTML = `<div class="spinner" style="margin:30px auto;display:block"></div>`;
  try { _lc = await apiGet('/api/lv/studio/connect'); } catch (e) { b.innerHTML = `<p class="lt-hint">${esc(e.message)}</p>`; return; }
  const c = _lc;
  b.innerHTML = `
    <div class="lt-hero lt-hero--obs"><div><h4><i class="fas fa-plug"></i> ${L('OBS & andere Streaming-Programme verbinden', 'Connect OBS & other streaming apps')}</h4>
      <p>${L('Erstelle für jedes Programm eine eigene Verbindung. Jede Verbindung hat einen eigenen Schlüssel, den du jederzeit einzeln widerrufen kannst – so wie „Konto verbinden“ bei Twitch.', 'Create a separate connection for every app. Each has its own key you can revoke at any time.')}</p></div></div>
    ${!c.rtmpEnabled ? `<div class="lt-warn"><i class="fas fa-triangle-exclamation"></i> ${L('Der RTMP-Server ist auf dieser Installation nicht aktiv. Bitte den Betreiber kontaktieren.', 'The RTMP server is not active on this installation.')}</div>` : ''}
    <div class="lt-card lt-plugin"><div class="lt-plugin-head"><div class="lt-plugin-ico"><i class="fas fa-tower-broadcast"></i></div><div><h4>${L('OBS-Plugin: Gleichzeitig auf Norynex streamen', 'OBS plugin: stream to Norynex at the same time')}</h4>
      <p class="lt-hint">${L('Du streamst wie gewohnt (z. B. auf Twitch oder YouTube) – und Norynex läuft mit denselben Quellen automatisch mit. Mit eigener Vorschau, wahlweise einer eigenen Szene („2. Bildschirm“) und den Norynex-Docks direkt in OBS.', 'Stream as usual (e.g. Twitch or YouTube) – Norynex runs along with the same sources. With its own preview, an optional separate scene (“second screen”) and the Norynex docks inside OBS.')}</p></div></div>
      <ul class="lt-plugin-feat"><li><i class="fas fa-clone"></i>${L('Multistream mit denselben Quellen', 'Multistream with the same sources')}</li><li><i class="fas fa-display"></i>${L('Eigenes Dock mit Monitor & Start-Knopf', 'Own dock with monitor & start button')}</li><li><i class="fas fa-layer-group"></i>${L('Eigene Quellen über eine Norynex-Szene', 'Own sources via a Norynex scene')}</li><li><i class="fas fa-table-columns"></i>${L('Chat- & Aktionen-Dock automatisch', 'Chat & actions docks automatically')}</li><li><i class="fas fa-bolt"></i>${L('Startet mit „Stream starten“', 'Starts with “Start Streaming”')}</li></ul>
      <div class="lt-btnrow"><button class="co-btn co-btn--primary" data-h-click="h_live_ltPluginZip_1425" ${c.rtmpEnabled ? '' : 'disabled'}><i class="fab fa-windows"></i> ${L('Plugin herunterladen (Windows)', 'Download plugin (Windows)')}</button><button class="co-btn co-btn--sec" data-h-click="h_live_ltPluginCode_1426" ${c.rtmpEnabled ? '' : 'disabled'}><i class="fas fa-key"></i> ${L('Plugin-Code anzeigen', 'Show plugin code')}</button></div>
      <ol class="lt-steps"><li>${L('Herunterladen, entpacken und OBS schließen.', 'Download, unzip and close OBS.')}</li><li>${L('<b>Install.bat</b> doppelklicken – dein Konto ist schon hinterlegt.', 'Double-click <b>Install.bat</b> – your account is already set.')}</li><li>${L('OBS starten: Die Docks <b>Norynex Stream</b> (Monitor, Start/Stopp, Quellen, Qualität), <b>Norynex Chat</b> und <b>Norynex Actions</b> sind da. Das Plugin ist auf Englisch.', 'Start OBS: the docks <b>Norynex Stream</b> (monitor, start/stop, sources, quality), <b>Norynex Chat</b> and <b>Norynex Actions</b> are there.')}</li></ol>
      <p class="lt-hint"><i class="fas fa-circle-info"></i> ${L('Für OBS 30 oder neuer. Zwei Streams gleichzeitig brauchen mehr Upload (Hauptstream + ca. 3,5 Mbit/s) – das Plugin nimmt automatisch den Grafikkarten-Encoder, damit die CPU entlastet wird.', 'For OBS 30 or newer. Two streams need more upload (main + ~3.5 Mbit/s) – the plugin uses the GPU encoder automatically to spare the CPU.')}</p>
    </div>
    <div class="lt-card"><h4>${L('Neue Verbindung', 'New connection')}</h4>
      <div class="lt-grid3"><label class="lt-field"><span>${L('Programm', 'App')}</span><select id="lc-app">${Object.entries(c.appTypes).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select></label>
      <label class="lt-field"><span>${L('Name (z. B. „Gaming-PC“)', 'Name (e.g. “Gaming PC”)')}</span><input id="lc-name" maxlength="40"></label>
      <label class="lt-field"><span>&nbsp;</span><button class="co-btn co-btn--primary" data-h-click="h_live_ltConnAdd_1432"><i class="fas fa-link"></i> ${L('Verbinden', 'Connect')}</button></label></div>
      <div id="lc-created"></div>
    </div>
    <div class="lt-card"><h4>${L('Verbundene Programme', 'Connected apps')} (${c.apps.length}/10)</h4>
      ${c.apps.length ? c.apps.map(a => `<div class="lt-app"><div class="lt-app-ico"><i class="fas ${a.app === 'mobile' ? 'fa-mobile-screen' : a.app === 'obs' ? 'fa-circle-dot' : 'fa-desktop'}"></i></div>
        <div class="lt-app-t"><b>${esc(a.name)}</b><small>${esc(a.appName)} · ${L('Schlüssel', 'Key')} ${esc(a.keyPreview)} · ${a.lastUsedAt ? L('zuletzt genutzt ', 'last used ') + new Date(a.lastUsedAt).toLocaleString(L('de-DE', 'en-GB'), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : L('noch nie genutzt', 'never used')}</small></div>
        <div class="lt-app-a">${a.app === 'obs' || a.app === 'streamlabs' ? `<button class="co-btn co-btn--primary co-btn--sm" data-h-click="h_live_ltObsProfile_1439" data-hv-click="${nxHv(String(a.id))}"><i class="fas fa-file-zipper"></i> ${L('OBS-Profil', 'OBS profile')}</button>` : ''}<button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltConnShow_1439" data-hv-click="${nxHv(String(a.id))}"><i class="fas fa-key"></i> ${L('Zugangsdaten', 'Credentials')}</button><button class="co-btn co-btn--sec co-btn--sm lt-danger" data-h-click="h_live_ltConnDel_1439" data-hv-click="${nxHv(String(a.id))}"><i class="fas fa-link-slash"></i> ${L('Trennen', 'Disconnect')}</button></div></div>`).join('') : `<p class="lt-hint">${L('Noch keine Programme verbunden. Lege oben eine Verbindung an.', 'No apps connected yet.')}</p>`}
    </div>
    <div class="lt-card"><h4><i class="fas fa-circle-info"></i> ${L('So geht\'s mit OBS (2 Minuten)', 'How it works with OBS (2 minutes)')}</h4>
      <ol class="lt-steps"><li>${L('Oben „OBS Studio“ wählen und auf <b>Verbinden</b> klicken.', 'Choose “OBS Studio” above and click <b>Connect</b>.')}</li>
      <li>${L('<b>OBS-Profil</b> herunterladen und entpacken.', 'Download the <b>OBS profile</b> and unzip it.')}</li>
      <li>${L('In OBS: Menü <b>Profil → Importieren</b> → Ordner „Norynex“ wählen, dann <b>Profil → Norynex</b>.', 'In OBS: <b>Profile → Import</b> → choose “Norynex”, then <b>Profile → Norynex</b>.')}</li>
      <li>${L('<b>Stream starten</b> – nach wenigen Sekunden bist du auf Norynex live.', 'Click <b>Start streaming</b> – you are live within seconds.')}</li></ol>
      <p class="lt-hint">${L('Andere Programme: „Benutzerdefiniert“ als Dienst wählen und Server + Schlüssel aus „Zugangsdaten“ einfügen. Empfohlen: 720p/30 FPS, 3500 kbit/s, Keyframe-Intervall 2 s, x264 „veryfast“ oder NVENC.', 'Other apps: choose “Custom” and paste server + key from “Credentials”. Recommended: 720p/30, 3500 kbps, keyframe 2 s.')}</p>
      <p class="lt-hint"><i class="fas fa-circle-question"></i> ${L('Warum kein „Konto verbinden“-Knopf direkt in OBS? Diesen Knopf schaltet das OBS-Projekt nur für einzelne große Plattformen frei. Das Profil + Dock oben ist der gleichwertige Weg.', 'Why no “Connect account” button inside OBS? The OBS project only enables it for selected platforms. Profile + dock is the equivalent.')}</p>
    </div>
    <div class="lt-card"><h4><i class="fas fa-table-columns"></i> ${L('Norynex-Dock in OBS', 'Norynex dock in OBS')}</h4>
      <p class="lt-hint">${L('Chat lesen & schreiben, Titel ändern, Werbepause, Abstimmungen, Vorhersagen, Raids und Einlösungen – alles direkt in OBS. In OBS: <b>Docks → Benutzerdefinierte Browser-Docks</b> → Name „Norynex“, URL einfügen.', 'Chat, title, ad breaks, polls, predictions, raids and redemptions – right inside OBS. In OBS: <b>Docks → Custom Browser Docks</b>, name “Norynex”, paste the URL.')}</p>
      ${c.dockUrl ? `<div class="lt-url"><input readonly value="${esc(c.dockUrl)}" data-h-click="h_live_select_1451"><button class="co-btn co-btn--primary co-btn--sm" data-h-click="h_live_ltCopy_1451" data-hv-click="${nxHv(String(esc(c.dockUrl)))}"><i class="fas fa-copy"></i> ${L('Kopieren', 'Copy')}</button></div>
        <div class="lt-btnrow"><a class="co-btn co-btn--sec co-btn--sm" href="${esc(c.dockUrl)}" target="_blank" rel="noopener"><i class="fas fa-up-right-from-square"></i> ${L('Vorschau', 'Preview')}</a><button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltDock_1452"><i class="fas fa-rotate"></i> ${L('Neuen Link erzeugen', 'New link')}</button><button class="co-btn co-btn--sec co-btn--sm lt-danger" data-h-click="h_live_ltDock_1452_2"><i class="fas fa-power-off"></i> ${L('Dock deaktivieren', 'Disable dock')}</button></div>
        <p class="lt-hint"><i class="fas fa-lock"></i> ${L('Wer diesen Link hat, kann in deinem Namen chatten und moderieren – niemals im Stream zeigen.', 'Anyone with this link can chat and moderate as you – never show it on stream.')}</p>`
      : `<button class="co-btn co-btn--primary" data-h-click="h_live_ltDock_1454"><i class="fas fa-plus"></i> ${L('Dock-Link erstellen', 'Create dock link')}</button>`}
    </div>
    <div class="lt-card"><h4><i class="fas fa-server"></i> ${L('Server-Adresse', 'Server URL')}</h4>
      <div class="lt-url"><input readonly value="${esc(c.rtmpUrl || '–')}" data-h-click="h_live_select_1457"><button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltCopy_1457" data-hv-click="${nxHv(String(esc(c.rtmpUrl || '')))}" aria-label="Kopieren"><i class="fas fa-copy"></i></button></div>
      <p class="lt-hint">${L('Dein Haupt-Stream-Schlüssel (für Browser/Handy-Streaming) liegt unter „Live gehen“. Verbindungen hier funktionieren zusätzlich.', 'Your main stream key is under “Go live”. Connections here work in addition.')}</p></div>`;
}
window.ltConnAdd = async function () {
  try {
    const r = await apiPost('/api/lv/studio/connect/apps', { app: $('lc-app').value, name: $('lc-name').value });
    const k = r.created; await ltDrawConnect($('lt-body'));
    const box = $('lc-created'); if (box) box.innerHTML = `<div class="lt-ok"><b><i class="fas fa-circle-check"></i> ${esc(k.name)} ${L('verbunden', 'connected')}</b>
      ${k.app === 'obs' || k.app === 'streamlabs' ? `<p>${L('Lade jetzt das fertige OBS-Profil herunter – Server und Schlüssel sind schon eingetragen.', 'Download the ready OBS profile – server and key are already set.')}</p><button class="co-btn co-btn--primary co-btn--sm" data-h-click="h_live_ltObsProfile_1465" data-hv-click="${nxHv(String(k.id))}"><i class="fas fa-file-zipper"></i> ${L('OBS-Profil herunterladen', 'Download OBS profile')}</button>` : ''}
      <div class="lt-cred"><span>Server</span><code>${esc(_lc.rtmpUrl || '')}</code><button data-h-click="h_live_ltCopy_1466" data-hv-click="${nxHv(String(esc(_lc.rtmpUrl || '')))}" aria-label="Kopieren"><i class="fas fa-copy"></i></button></div>
      <div class="lt-cred"><span>${L('Schlüssel', 'Key')}</span><code class="lt-blur" data-h-click="h_live_toggle_1467">${esc(k.key)}</code><button data-h-click="h_live_ltCopy_1467" data-hv-click="${nxHv(String(esc(k.key)))}" aria-label="Kopieren"><i class="fas fa-copy"></i></button></div></div>`;
  } catch (e) { showToast(e.message, 'error'); }
};
window.ltConnShow = async function (id) {
  try { const r = await apiGet('/api/lv/studio/connect/apps/' + id + '/key');
    lvPanel(`<i class="fas fa-key"></i> ${L('Zugangsdaten', 'Credentials')}`, `<div class="lt-cred"><span>Server</span><code>${esc(r.server || '')}</code><button data-h-click="h_live_ltCopy_1472" data-hv-click="${nxHv(String(esc(r.server || '')))}" aria-label="Kopieren"><i class="fas fa-copy"></i></button></div>
      <div class="lt-cred"><span>${L('Schlüssel', 'Key')}</span><code class="lt-blur" data-h-click="h_live_toggle_1473">${esc(r.key)}</code><button data-h-click="h_live_ltCopy_1473" data-hv-click="${nxHv(String(esc(r.key)))}" aria-label="Kopieren"><i class="fas fa-copy"></i></button></div>
      <p class="lt-hint">${L('Zum Anzeigen auf den Schlüssel klicken. Niemals weitergeben.', 'Click the key to reveal. Never share it.')}</p>`);
  } catch (e) { showToast(e.message, 'error'); }
};
window.ltConnDel = async function (id) {
  if (!confirm(L('Verbindung trennen? Das Programm kann danach nicht mehr auf Norynex streamen.', 'Disconnect? The app will no longer be able to stream to Norynex.'))) return;
  try { await apiDelete('/api/lv/studio/connect/apps/' + id); ltDrawConnect($('lt-body')); } catch (e) { showToast(e.message, 'error'); }
};
window.ltDock = async function (a) {
  if (a === 'new' && _lc && _lc.dockKey && !confirm(L('Neuen Link erzeugen? Der alte Link funktioniert dann nicht mehr.', 'Create a new link? The old one stops working.'))) return;
  try { await apiPost('/api/lv/studio/connect/dock', a === 'off' ? { action: 'off' } : {}); ltDrawConnect($('lt-body')); } catch (e) { showToast(e.message, 'error'); }
};
window.ltPluginZip = async function (btn) {
  if (btn) btn.disabled = true;
  try {
    const r = await fetch('/api/lv/studio/connect/obs-plugin.zip', { headers: { Authorization: 'Bearer ' + (localStorage.getItem('nxd_token') || '') } });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error || L('Download fehlgeschlagen', 'Download failed')); }
    const blob = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Norynex-OBS-Plugin.zip'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    showToast(L('Plugin heruntergeladen – entpacken und Installieren.bat starten.', 'Plugin downloaded – unzip and run Installieren.bat.'), 'success');
    ltDrawConnect($('lt-body'));
  } catch (e) { showToast(e.message, 'error'); }
  finally { if (btn) btn.disabled = false; }
};
window.ltPluginCode = async function (renew) {
  if (renew && !confirm(L('Neuen Plugin-Code erzeugen? Der alte Code (und damit das Plugin auf anderen PCs) funktioniert dann nicht mehr.', 'Create a new plugin code? The old code stops working.'))) return;
  try {
    const r = renew ? await apiPost('/api/lv/studio/connect/obs-plugin/renew', {}) : await apiGet('/api/lv/studio/connect/obs-plugin');
    lvPanel(`<i class="fas fa-key"></i> ${L('Plugin-Code', 'Plugin code')}`, `<p class="lt-hint">${L('Nur nötig, wenn du das Plugin ohne den Installer eingerichtet hast: Im OBS-Dock <b>Norynex Stream</b> unter „Norynex account“ einfügen und auf „Connect“ klicken.', 'Only needed if you set up the plugin without the installer: paste it in the OBS dock <b>Norynex Stream</b> under “Norynex account” and click “Connect”.')}</p>
      <div class="lt-cred"><span>Code</span><code class="lt-blur" style="word-break:break-all" data-h-click="h_live_toggle_1500">${esc(r.code)}</code><button data-h-click="h_live_ltCopy_1501" data-hv-click="${nxHv(String(esc(r.code)))}" aria-label="Kopieren"><i class="fas fa-copy"></i></button></div>
      <p class="lt-hint"><i class="fas fa-lock"></i> ${L('Wer diesen Code hat, kann auf deinem Kanal streamen und im Dock in deinem Namen chatten. Niemals im Stream zeigen.', 'Anyone with this code can stream to your channel and chat as you. Never show it on stream.')}</p>
      <button class="co-btn co-btn--sec co-btn--sm lt-danger" data-h-click="h_live_ltPluginCode_1502"><i class="fas fa-rotate"></i> ${L('Neuen Code erzeugen', 'Create new code')}</button>`);
    ltDrawConnect($('lt-body'));
  } catch (e) { showToast(e.message, 'error'); }
};
window.ltObsProfile = async function (id) {
  const q = prompt(L('Qualität: 480, 720 (empfohlen) oder 1080', 'Quality: 480, 720 (recommended) or 1080'), '720'); if (q === null) return;
  try {
    const r = await fetch(`/api/lv/studio/connect/apps/${id}/obs-profile.zip?quality=${encodeURIComponent(q)}`, { headers: { Authorization: 'Bearer ' + (localStorage.getItem('nxd_token') || '') } });
    if (!r.ok) throw new Error(L('Download fehlgeschlagen', 'Download failed'));
    const blob = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Norynex-OBS-Profil.zip'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  } catch (e) { showToast(e.message, 'error'); }
};

/* ---------- Funken (Kanalpunkte) & Interaktion ---------- */
function ltDrawPoints(b) {
  const m = _lm || {}; const p = m.points || {}; const icons = p.icons || Object.keys(PT_ICON);
  b.innerHTML = `
    <div class="lt-hero"><div><h4><i class="fas ${PT_ICON[p.icon] || 'fa-wand-magic-sparkles'}"></i> ${L('Kanalpunkte für deine Community', 'Channel points for your community')}</h4><p>${L('Zuschauer sammeln automatisch Punkte, während sie zuschauen, folgen und die Bonus-Truhe öffnen. Damit lösen sie deine Belohnungen ein oder setzen bei Vorhersagen. Punkte sind kostenlos, nicht käuflich und haben keinen Geldwert. Abonnenten sammeln schneller (×1,2 / ×1,4 / ×2).', 'Viewers earn points by watching, following and opening the bonus chest. They redeem your rewards or bet on predictions. Points are free, cannot be bought and have no cash value. Subs earn faster.')}</p></div></div>
    <div class="lt-card"><h4>${L('Grundeinstellungen', 'Basics')}</h4>
      ${tog('pt-on', p.enabled !== false, L('Kanalpunkte aktiviert', 'Channel points enabled'))}
      <div class="lt-grid3"><label class="lt-field"><span>${L('Name deiner Punkte', 'Name of your points')}</span><input id="pt-name" maxlength="20" value="${esc(p.name || 'Funken')}"></label>
      <label class="lt-field"><span>${L('Symbol', 'Icon')}</span><div class="lt-icons">${icons.map(i => `<label><input type="radio" name="pt-icon" value="${i}" ${p.icon === i ? 'checked' : ''}><i class="fas ${PT_ICON[i]}"></i></label>`).join('')}</div></label><span></span></div>
      <div class="lt-grid3"><label class="lt-field"><span>${L('Pro 5 Minuten Zuschauen', 'Per 5 minutes watched')}</span><input id="pt-per" type="number" min="1" max="1000" value="${p.perFiveMin}"></label>
      <label class="lt-field"><span>${L('Bonus-Truhe (alle 15 Min.)', 'Bonus chest (every 15 min)')}</span><input id="pt-bonus" type="number" min="0" max="10000" value="${p.bonus}"></label>
      <label class="lt-field"><span>${L('Einmalig fürs Folgen', 'One-time for following')}</span><input id="pt-fol" type="number" min="0" max="100000" value="${p.follow}"></label></div>
      <p class="lt-hint">${L('Ungefähr pro Stunde Zuschauen:', 'Roughly per hour watched:')} <b>${fmtNum(p.perFiveMin * 12 + p.bonus * 4)}</b> ${esc(p.name || '')}</p>
    </div>
    <div class="lt-card"><h4>${L('Belohnungen', 'Rewards')}</h4><p class="lt-hint">${L('„Nachricht hervorheben“ wird automatisch im Chat markiert. Alle anderen Belohnungen landen in der Warteschlange (Übersicht & OBS-Dock), wo du sie als erledigt markierst oder die Punkte zurückgibst.', '“Highlight message” is applied automatically. Others land in the queue (overview & OBS dock).')}</p>
      <div id="pt-rewards">${(p.rewards || []).map(ltRewardRow).join('')}</div>
      <div class="lt-btnrow"><button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_ltEl_1531"><i class="fas fa-plus"></i> ${L('Belohnung hinzufügen', 'Add reward')}</button></div>
    </div>
    <div class="lt-card"><h4>${L('Aufzeichnungen speichern', 'Save recordings')}</h4>
      ${tog('vod-on', m.vod && m.vod.enabled, L('Streams automatisch aufzeichnen', 'Record streams automatically'), L(`Aufzeichnungen bleiben ${m.vodHours || 48} Stunden verfügbar und werden danach vollständig vom Server gelöscht.`, `Recordings stay available for ${m.vodHours || 48} hours and are then fully deleted.`))}
      ${tog('vod-pub', m.vod && m.vod.public, L('Aufzeichnungen auf meinem Kanal zeigen', 'Show recordings on my channel'), L('Zuschauer können sie bis zur Löschung ansehen. Herunterladen kannst nur du.', 'Viewers can watch until deletion. Only you can download.'))}
    </div>
    <button class="co-btn co-btn--primary" data-h-click="h_live_ltSavePoints_1536"><i class="fas fa-floppy-disk"></i> ${L('Alles speichern', 'Save all')}</button>
    <div class="lt-card" style="margin-top:16px"><h4>${L('Abstimmungen & Vorhersagen', 'Polls & predictions')}</h4>
      <p class="lt-hint">${L('Für alle Streamer verfügbar – ohne Affiliate. Vorhersagen laufen ausschließlich mit Kanalpunkten, niemals mit echtem Geld.', 'Available to every streamer – no affiliate needed. Predictions use channel points only, never real money.')}</p>
      <div class="lt-btnrow"><button class="co-btn co-btn--sec" data-h-click="h_live_ltQuick_1540"><i class="fas fa-square-poll-vertical"></i> ${m.poll && m.poll.status === 'open' ? L('Abstimmung beenden', 'End poll') : L('Abstimmung starten', 'Start poll')}</button><button class="co-btn co-btn--sec" data-h-click="h_live_ltQuick_1541"><i class="fas fa-dice"></i> ${m.prediction && ['open', 'locked'].includes(m.prediction.status) ? L('Vorhersage verwalten', 'Manage prediction') : L('Vorhersage starten', 'Start prediction')}</button></div>
    </div>
    ${(m.topPoints || []).length ? `<div class="lt-card"><h4>${L('Top-Sammler', 'Top collectors')}</h4><ol class="lt-top">${m.topPoints.map(t => `<li><b>${esc(t.name)}</b><span>${fmtNum(t.points)}</span></li>`).join('')}</ol></div>` : ''}`;
}
window.ltRewardRow = function (r) {
  return `<div class="lt-rw" data-id="${esc(r.id || '')}" data-kind="${r.kind === 'highlight' ? 'highlight' : 'custom'}">
    <input type="color" class="rw-color" value="${esc(r.color || '#a855f7')}" title="${L('Farbe', 'Color')}">
    <div class="lt-rw-main"><input class="rw-title" maxlength="50" value="${esc(r.title || '')}" placeholder="${L('Titel', 'Title')}"><input class="rw-desc" maxlength="140" value="${esc(r.desc || '')}" placeholder="${L('Beschreibung (optional)', 'Description (optional)')}">
    <div class="lt-rw-opts"><label>${L('Kosten', 'Cost')} <input class="rw-cost" type="number" min="1" value="${r.cost || 500}"></label><label>${L('Abklingzeit s', 'Cooldown s')} <input class="rw-cd" type="number" min="0" max="86400" value="${r.cooldown || 0}"></label><label>${L('Max./Stream', 'Max/stream')} <input class="rw-mps" type="number" min="0" value="${r.maxPerStream || 0}"></label><label>${L('Max./Person', 'Max/user')} <input class="rw-mpu" type="number" min="0" value="${r.maxPerUser || 0}"></label>
    ${r.kind === 'highlight' ? `<small>${L('Hebt die Nachricht hervor', 'Highlights the message')}</small>` : `<label><input class="rw-input" type="checkbox" ${r.needsInput ? 'checked' : ''}> ${L('Text abfragen', 'Ask for text')}</label>`}<label><input class="rw-on" type="checkbox" ${r.enabled !== false ? 'checked' : ''}> ${L('Aktiv', 'Active')}</label></div></div>
    ${r.kind === 'highlight' ? '' : `<button data-h-click="h_live_closest_1551" aria-label="X"><i class="fas fa-trash"></i></button>`}</div>`;
};
window.ltSavePoints = async function () {
  const rewards = [...document.querySelectorAll('#pt-rewards .lt-rw')].map(el => ({ id: el.dataset.id || undefined, kind: el.dataset.kind, color: el.querySelector('.rw-color').value, title: el.querySelector('.rw-title').value, desc: el.querySelector('.rw-desc').value, cost: +el.querySelector('.rw-cost').value, cooldown: +el.querySelector('.rw-cd').value, maxPerStream: +el.querySelector('.rw-mps').value, maxPerUser: +el.querySelector('.rw-mpu').value, needsInput: !!(el.querySelector('.rw-input') || {}).checked, enabled: el.querySelector('.rw-on').checked })).filter(r => r.title.trim());
  const icon = (document.querySelector('input[name="pt-icon"]:checked') || {}).value;
  try {
    const r = await apiPatch('/api/lv/studio/more', { points: { enabled: ltEl('pt-on').checked, name: ltEl('pt-name').value, icon, perFiveMin: +ltEl('pt-per').value, bonus: +ltEl('pt-bonus').value, follow: +ltEl('pt-fol').value, rewards }, vod: { enabled: ltEl('vod-on').checked, public: ltEl('vod-pub').checked } });
    _lm.points = r.points; _lm.vod = r.vod; showToast(L('Gespeichert', 'Saved'), 'success'); ltDraw();
  } catch (e) { showToast(e.message, 'error'); }
};

/* ---------- Monetarisierung: Affiliate, Partner, Abos, Werbung ---------- */
async function ltDrawMoney(b) {
  const m = _lm || {}; const pg = { ...(m.program || {}) }; const ad = m.ads || {}; const c = _lt.cfg;
  if (!pg.program) pg.program = 'none'; // ältere Server schicken null statt 'none'
  const prog = pg.progress || { items: [] };
  const badge = pg.program === 'partner' ? `<span class="lt-prog lt-prog--partner"><i class="fas fa-gem"></i> Norynex Partner</span>` : pg.program === 'affiliate' ? `<span class="lt-prog lt-prog--aff"><i class="fas fa-star"></i> Affiliate</span>` : pg.program === 'staff' ? `<span class="lt-prog lt-prog--partner"><i class="fas fa-shield-halved"></i> ${L('Norynex-Team · alle Rechte', 'Norynex staff · full access')}</span>` : pg.affiliate === 'pending' ? `<span class="lt-prog">${L('Antrag in Prüfung', 'Application pending')}</span>` : `<span class="lt-prog">${L('Noch nicht freigeschaltet', 'Not unlocked yet')}</span>`;
  b.innerHTML = `
    <div class="lt-kpis">${[[L('Status', 'Status'), badge], [L('Dein Anteil', 'Your share'), (pg.share || 50) + ' %'], [L('Auszahlungskonto', 'Payout account'), pg.payoutConnected ? '<i class="fas fa-circle-check" style="color:#22c55e"></i> ' + L('verbunden', 'connected') : '— ' + L('fehlt', 'missing')], [L('Guthaben aus Einnahmen', 'Earnings balance'), eur(pg.earnings)]].map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
    <div class="lt-card"><h4><i class="fas fa-route"></i> ${L('So verdienst du mit Livestreams', 'How you earn with live streams')}</h4>
      <div class="lt-ladder">
        <div class="${pg.program === 'none' ? 'is-cur' : 'is-done'}"><b>1 · ${L('Streamer', 'Streamer')}</b><small>${L('Live gehen, Chat, Bots, Overlays, Kanalpunkte, Abstimmungen und Vorhersagen – für alle kostenlos.', 'Go live, chat, bots, overlays, points, polls, predictions – free for everyone.')}</small></div>
        <div class="${pg.program === 'affiliate' ? 'is-cur' : pg.program === 'partner' ? 'is-done' : ''}"><b>2 · Affiliate</b><small>${L('Live-Abos, Geschenk-Abos, Live-Geschenke und Werbeeinnahmen im Stream. Voraussetzung: 50 Abonnenten und ein paar Stunden Watchtime – danach nur noch Auszahlungskonto verbinden, fertig.', 'Live subs, gift subs, live gifts and stream ad revenue. Requirements: 50 subscribers and a few hours of watch time – then just connect a payout account.')}</small></div>
        <div class="${pg.program === 'partner' ? 'is-cur' : ''}"><b>3 · Norynex Partner</b><small>${L('Die allgemeine Norynex-Monetarisierung (Videos, Shorts & Live). Wird im Bereich „Monetarisierung“ beantragt und schließt alle Affiliate-Funktionen ein.', 'General Norynex monetization (videos, shorts & live). Applied for under “Monetization”, includes everything from Affiliate.')}</small></div>
      </div>
    </div>
    ${pg.program === 'none' ? `<div class="lt-card"><h4><i class="fas fa-star"></i> ${L('Affiliate werden', 'Become an affiliate')}</h4>
      <p class="lt-hint">${L('Deine Werte der letzten 30 Tage:', 'Your last 30 days:')}</p>
      <div class="lt-reqs">${prog.items.map(i => `<div class="${i.done ? 'is-done' : ''}"><div class="lt-req-t"><span>${i.done ? '<i class="fas fa-circle-check" style="color:#22c55e"></i>' : '<i class="far fa-circle" style="opacity:.5"></i>'} ${esc(i.label)}</span><b>${fmtNum(i.have)} / ${fmtNum(i.need)}</b></div><div class="lt-req-bar"><i style="width:${Math.min(100, i.have / Math.max(1, i.need) * 100)}%"></i></div></div>`).join('')}
        <div class="${prog.adult ? 'is-done' : ''}"><div class="lt-req-t"><span>${prog.adult ? '<i class="fas fa-circle-check" style="color:#22c55e"></i>' : '<i class="far fa-circle" style="opacity:.5"></i>'} ${L('Mindestens 18 Jahre (wegen Auszahlungen)', 'At least 18 (for payouts)')}</span></div></div></div>
      ${pg.affiliate === 'pending' ? `<p class="lt-ok">${L('Dein Antrag ist eingegangen und wird geprüft.', 'Your application is being reviewed.')}</p>` : `
      <label class="lt-accept"><input type="checkbox" id="aff-accept"> ${L('Ich akzeptiere die <a href="#agb" target="_blank">Affiliate-Bedingungen (AGB § Live)</a>: Norynex behält 50 % der Umsätze aus Live-Abos, Geschenken und Stream-Werbung ein; Auszahlung ab 100 € auf mein verifiziertes Konto; ich versteuere meine Einnahmen selbst.', 'I accept the <a href="#agb" target="_blank">affiliate terms</a>: Norynex keeps 50% of revenue from live subs, gifts and stream ads; payout from €100; I am responsible for my taxes.')}</label>
      <button class="co-btn co-btn--primary" ${prog.met && prog.adult ? '' : 'disabled'} data-h-click="h_live_ltApplyAff_1583"><i class="fas fa-paper-plane"></i> ${L('Affiliate werden', 'Become an affiliate')}</button>`}
    </div>` : ''}
    ${pg.program === 'staff' ? `<div class="lt-card"><p class="lt-ok"><i class="fas fa-shield-halved"></i> ${L('Als Admin hast du alle Live-Funktionen – Abos, Geschenk-Abos, Live-Geschenke und Werbeeinnahmen – auch ohne Affiliate und ohne Auszahlungskonto.', 'As an admin you have every live feature – subs, gift subs, live gifts and ad revenue – without affiliate or payout account.')}</p></div>` : ''}
    ${(pg.program === 'affiliate' || pg.program === 'partner') && !pg.payoutConnected ? `<div class="lt-warn"><i class="fas fa-building-columns"></i> ${L('Fast geschafft: Verbinde dein Auszahlungskonto, damit Zuschauer dich abonnieren und beschenken können.', 'Almost there: connect your payout account so viewers can subscribe and gift.')} <button class="co-btn co-btn--primary co-btn--sm" data-h-click="h_live_switchStudio_1586">${L('Konto verbinden', 'Connect account')}</button></div>` : ''}
    ${pg.monetized ? ltSubsHtml(c, tog) : `<div class="lt-card lt-locked"><h4><i class="fas fa-lock"></i> ${L('Live-Abos & Geschenke', 'Live subs & gifts')}</h4><p class="lt-hint">${esc(pg.block || L('Erst als Affiliate oder Partner mit verbundenem Auszahlungskonto verfügbar.', 'Available as affiliate or partner with a connected payout account.'))}</p></div>`}
    <div class="lt-card"><h4><i class="fas fa-rectangle-ad"></i> ${L('Werbepausen', 'Ad breaks')}</h4>
      <div class="lt-kpis lt-kpis--sm">${[[L('Status', 'Status'), ad.enabled ? L('aktiv', 'active') : L('aus', 'off')], [L('Automatisch alle', 'Automatic every'), (ad.interval || 60) + ' Min.'], [L('Länge', 'Length'), Math.round((ad.duration || 150) / 30) / 2 + ' Min.'], [L('Einnahmen für dich', 'Earnings for you'), ad.earnsMoney ? (pg.share || 50) + ' %' : '—']].map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
      <p class="lt-hint">${L('Während deines Streams läuft automatisch einmal pro Stunde eine Werbepause (nie in den ersten 10 Minuten). Zuschauer mit Live-Abo bei dir oder Norynex Premium sehen keine Werbung. Du kannst eine Pause auch selbst früher starten – z. B. wenn du kurz weg bist –, dann verschiebt sich die nächste automatische Pause.', 'An ad break runs automatically once per hour (never in the first 10 minutes). Viewers with a live sub or Premium see no ads. You can start a break earlier yourself.')}</p>
      ${_lt.isLive ? `<button class="co-btn co-btn--sec" data-h-click="h_live_lvRunAdStudio_1591"><i class="fas fa-play"></i> ${L('Werbepause jetzt starten', 'Start ad break now')}</button>` : ''}
    </div>`;
}
window.ltApplyAff = async function () {
  if (!ltEl('aff-accept').checked) return showToast(L('Bitte die Bedingungen bestätigen.', 'Please accept the terms.'), 'error');
  try { const r = await apiPost('/api/lv/studio/program/apply', { accept: true }); _lm.program = r; showToast(r.program === 'affiliate' ? L('Willkommen im Affiliate-Programm!', 'Welcome to the affiliate program!') : L('Antrag gesendet', 'Application sent'), 'success'); ltRefreshLight(); } catch (e) { showToast(e.message, 'error'); }
};

/* ---------- Aufzeichnungen ---------- */
function ltDrawVods(b) {
  const m = _lm || {}; const vs = m.vods || [];
  const left = (t) => { const h = Math.max(0, (new Date(t) - Date.now()) / 3600000); return h >= 1 ? Math.floor(h) + ' Std.' : Math.max(1, Math.round(h * 60)) + ' Min.'; };
  b.innerHTML = `
    <div class="lt-hero"><div><h4><i class="fas fa-film"></i> ${L('Aufzeichnungen deiner Streams', 'Recordings of your streams')}</h4><p>${L(`Jeder Stream wird automatisch aufgezeichnet${m.vod && !m.vod.enabled ? ' (gerade ausgeschaltet)' : ''}. Aufzeichnungen bleiben <b>${m.vodHours || 48} Stunden</b> verfügbar – lade sie in dieser Zeit herunter, wenn du sie behalten willst. Danach werden sie <b>vollständig vom Server gelöscht</b>.`, `Every stream is recorded automatically. Recordings stay for <b>${m.vodHours || 48} hours</b> – download them if you want to keep them. Afterwards they are <b>fully deleted from the server</b>.`)}</p></div><button class="co-btn co-btn--sec" data-h-click="h_live_ltTab_1604"><i class="fas fa-gear"></i> ${L('Einstellungen', 'Settings')}</button></div>
    ${m.recording ? `<div class="lt-ok"><i class="fas fa-circle" style="color:#ef4444"></i> ${L('Dein aktueller Stream wird gerade aufgezeichnet.', 'Your current stream is being recorded.')}</div>` : ''}
    ${vs.length ? `<div class="lt-vods">${vs.map(v => `<div class="lt-vod"><a class="lt-vod-th" href="/vod/${esc(v.id)}"><img src="/api/lv/vod/${esc(v.id)}/thumb.jpg" alt="" loading="lazy" data-h-error="h_live_h_1606"><span>${Math.floor(v.durationSec / 3600)}:${String(Math.floor(v.durationSec / 60) % 60).padStart(2, '0')}:${String(v.durationSec % 60).padStart(2, '0')}</span></a>
      <div class="lt-vod-t"><b>${esc(v.title || 'Livestream')}</b><small>${new Date(v.startedAt).toLocaleString(L('de-DE', 'en-GB'), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · ${fmtNum(v.views)} ${L('Aufrufe', 'views')}${v.size ? ` · ${(v.size / 1048576).toFixed(0)} MB` : ''}</small>
      <small class="lt-vod-exp"><i class="fas fa-hourglass-half"></i> ${L('Wird gelöscht in', 'Deleted in')} ${left(v.expiresAt)}</small></div>
      <div class="lt-vod-a"><button class="co-btn co-btn--primary co-btn--sm" data-h-click="h_live_ltVodDl_1608" data-hv-click="${nxHv(String(esc(v.id)))}"><i class="fas fa-download"></i> ${L('Herunterladen', 'Download')}</button><button class="co-btn co-btn--sec co-btn--sm lt-danger" data-h-click="h_live_ltDelVod_1609" data-hv-click="${nxHv(String(esc(v.id)))}" aria-label="Löschen"><i class="fas fa-trash"></i></button></div></div>`).join('')}</div>`
      : `<div class="lvd-empty"><div class="lvd-empty-ico"><i class="fas fa-film"></i></div><h3>${L('Keine Aufzeichnungen', 'No recordings')}</h3><p>${L('Nach deinem nächsten Stream findest du die Aufzeichnung hier.', 'After your next stream, the recording appears here.')}</p></div>`}`;
}
async function apiDelete(url) {
  const t = localStorage.getItem('nxd_token');
  const r = await fetch(url, { method: 'DELETE', headers: t ? { Authorization: 'Bearer ' + t } : {} });
  let d = {}; try { d = await r.json(); } catch {}
  if (!r.ok) throw new Error(d.error || 'Fehler'); return d;
}
window.ltVodDl = async function (id, btn) {
  const old = btn ? btn.innerHTML : ''; if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
  try {
    const r = await fetch(`/api/lv/vod/${encodeURIComponent(id)}/download`, { headers: { Authorization: 'Bearer ' + (localStorage.getItem('nxd_token') || '') } });
    if (!r.ok) { let d = {}; try { d = await r.json(); } catch {} throw new Error(d.error || L('Download fehlgeschlagen', 'Download failed')); }
    const cd = r.headers.get('Content-Disposition') || ''; const m = cd.match(/filename\*=UTF-8''([^;]+)/);
    const name = m ? decodeURIComponent(m[1]) : 'Livestream.mp4';
    const blob = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  } catch (e) { showToast(e.message, 'error'); } finally { if (btn) { btn.disabled = false; btn.innerHTML = old; } }
};
window.ltDelVod = async function (id) {
  if (!confirm(L('Aufzeichnung jetzt endgültig löschen?', 'Delete recording permanently now?'))) return;
  try { await apiDelete('/api/lv/vod/' + id); _lm.vods = (_lm.vods || []).filter(v => v.id !== id); ltDraw(); } catch (e) { showToast(e.message, 'error'); }
};

/* ---------- Einstellungen → Abos & Verträge (Premium + Live-Abos, § 312k BGB) ---------- */
let _mySubs = [];
window.nxLoadMySubs = async function () {
  const box = $('st-subs-body'); if (!box) return;
  try { _mySubs = await apiGet('/api/lv/me/subscriptions'); } catch { _mySubs = []; }
  const u = currentUser || {};
  const d = (x) => new Date(x).toLocaleDateString(L('de-DE', 'en-GB'));
  const pm = { balance: L('Guthaben', 'Balance'), card: L('Kreditkarte', 'Card'), applepay: 'Apple Pay', googlepay: 'Google Pay', sepa: 'SEPA', paysafecard: 'paysafecard' };
  const active = _mySubs.filter(x => x.active), old = _mySubs.filter(x => !x.active);
  box.innerHTML = `
    <div class="st-group"><h3 class="st-group-title">Norynex Premium</h3><div class="st-card"><div class="st-row"><div class="st-row-icon"><i class="fas fa-crown"></i></div><div class="st-row-text"><div class="st-row-title">${u.isPremium ? (u.premiumCancelled ? L('Gekündigt – endet am ', 'Cancelled – ends on ') + (u.premiumExpiresAt ? d(u.premiumExpiresAt) : '') : L('Aktiv', 'Active') + (u.premiumExpiresAt ? ' · ' + L('bis ', 'until ') + d(u.premiumExpiresAt) : '')) : L('Nicht aktiv', 'Not active')}</div><div class="st-row-desc">${L('Keine Werbung (auch in Livestreams), Downloads, bis 4× Tempo und mehr.', 'No ads (also in live streams), downloads, up to 4× speed and more.')}</div></div>
      <div class="st-row-control">${u.isPremium && !u.premiumCancelled ? `<button class="st-btn" data-h-click="h_live_cancelSubscription_1644">${L('Kündigen', 'Cancel')}</button>` : `<button class="st-btn" data-h-click="h_live_navigateTo_1644">${u.isPremium ? L('Ansehen', 'View') : L('Holen', 'Get')}</button>`}</div></div></div></div>
    <div class="st-group"><h3 class="st-group-title">${L('Live-Abos', 'Live subscriptions')}</h3>
      ${active.length ? `<div class="st-card">${active.map(x => `<div class="st-row"><div class="st-row-icon">${x.avatar ? `<img src="${esc(x.avatar)}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : '<i class="fas fa-star"></i>'}</div>
        <div class="st-row-text"><div class="st-row-title">${esc(x.channelName)} · ${esc(x.tierName || (L('Stufe ', 'Tier ') + x.tier))}${x.gifted ? ' <i class="fas fa-gift" style="color:#fb923c"></i>' : ''}</div>
        <div class="st-row-desc">${x.autoRenew ? `${L('Verlängert sich am', 'Renews on')} <b>${d(x.expiresAt)}</b> ${L('für', 'for')} <b>${eur(x.renewPrice)}</b> (${x.renewMonths} ${x.renewMonths > 1 ? L('Monate', 'months') : L('Monat', 'month')}${x.payMethod ? ', ' + (pm[x.payMethod] || x.payMethod) : ''})` : x.cancelledAt ? `${L('Gekündigt am', 'Cancelled on')} ${d(x.cancelledAt)} · ${L('läuft bis', 'runs until')} <b>${d(x.expiresAt)}</b>` : `${L('Läuft bis', 'Runs until')} <b>${d(x.expiresAt)}</b> · ${x.gifted ? L('Geschenk-Abo, verlängert sich nicht', 'gifted, does not renew') : L('verlängert sich nicht automatisch', 'does not renew')}`}</div></div>
        <div class="st-row-control">${x.autoRenew ? `<button class="st-btn st-btn-danger" data-h-click="h_live_nxCancelLiveSub_1649" data-hv-click="${nxHv(String(esc(x.channelId)))}">${L('Kündigen', 'Cancel')}</button>` : x.canResume ? `<button class="st-btn" data-h-click="h_live_nxResumeLiveSub_1649" data-hv-click="${nxHv(String(esc(x.channelId)))}">${L('Wieder verlängern', 'Resume')}</button>` : ''}</div></div>`).join('')}</div>`
      : `<p class="st-note">${L('Du hast gerade keine Live-Abos.', 'You have no live subscriptions.')}</p>`}
      <p class="st-note">${L('Live-Abos mit automatischer Verlängerung kannst du jederzeit zum Ende des laufenden Zeitraums kündigen. Du erhältst jede Kündigung sofort per E-Mail bestätigt. Vor längeren Verlängerungen (ab 3 Monaten) erinnern wir dich 3 Tage vorher.', 'Auto-renewing live subs can be cancelled any time, effective at the end of the current period. You get an email confirmation. Before longer renewals (3+ months) we remind you 3 days in advance.')}</p>
    </div>
    ${old.length ? `<div class="st-group"><h3 class="st-group-title">${L('Abgelaufen', 'Expired')}</h3><div class="st-card">${old.slice(0, 20).map(x => `<div class="st-row"><div class="st-row-icon"><i class="fas fa-clock-rotate-left"></i></div><div class="st-row-text"><div class="st-row-title">${esc(x.channelName)}</div><div class="st-row-desc">${L('Abgelaufen am', 'Expired on')} ${d(x.expiresAt)}</div></div><div class="st-row-control"><button class="st-btn" data-h-click="h_live_navigateTo_1653" data-hv-click="${nxHv(String(esc(x.channelId)))}">${L('Kanal', 'Channel')}</button></div></div>`).join('')}</div></div>` : ''}`;
};
window.nxCancelLiveSub = function (cid) {
  const x = _mySubs.find(s => s.channelId === cid); if (!x) return;
  _nxModal('nx-cancel-live', `<div class="nxm-head"><div class="nxm-head-ico"><i class="fas fa-file-signature"></i></div><div class="nxm-head-text"><h3>${L('Verträge hier kündigen', 'Cancel contracts here')}</h3><p>${L('Live-Abo', 'Live subscription')}</p></div><button class="nxm-x" data-h-click="h_live__nxCloseModal_1657" aria-label="Schließen"><i class="fas fa-xmark"></i></button></div>
    <div class="nxm-body"><div class="nx-cancel-kv">
      <div><span>${L('Konto', 'Account')}</span><b>@${esc((currentUser || {}).username || '')}</b></div>
      <div><span>${L('Vertrag', 'Contract')}</span><b>${L('Live-Abo bei', 'Live sub at')} ${esc(x.channelName)} (${esc(x.tierName || '')})</b></div>
      <div><span>${L('Art der Kündigung', 'Type of cancellation')}</span><b>${L('Ordentlich, zum Ende der bezahlten Laufzeit', 'Ordinary, at the end of the paid period')}</b></div>
      <div><span>${L('Endet am', 'Ends on')}</span><b>${new Date(x.expiresAt).toLocaleDateString(L('de-DE', 'en-GB'))}</b></div></div>
      <p style="font-size:13.5px;color:var(--text-secondary);line-height:1.55">${L('Dein Abo bleibt bis zum Ende des bezahlten Zeitraums aktiv. Danach wird nichts mehr abgebucht. Du bekommst eine Bestätigung per E-Mail.', 'Your sub stays active until the end of the paid period. No further charges. You will get an email confirmation.')}</p>
      <button class="co-btn co-btn--primary co-btn--block" style="background:#dc2626" id="nx-cl-go">${L('Jetzt kündigen', 'Cancel now')}</button></div>`);
  $('nx-cl-go').onclick = async () => {
    $('nx-cl-go').disabled = true;
    try { await apiPost(`/api/lv/me/subscriptions/${encodeURIComponent(cid)}/cancel`, {});
      document.querySelector('#nx-cancel-live .nxm-body').innerHTML = `<div class="nx-acct-status is-ok"><i class="fas fa-circle-check"></i><div><b>${L('Kündigung eingegangen', 'Cancellation received')}</b><small>${L('Eingegangen am ', 'Received on ')}${new Date().toLocaleString(L('de-DE', 'en-GB'))}</small></div></div><p style="font-size:13px;color:var(--text-secondary)">${L('Wir haben dir eine Bestätigung per E-Mail geschickt.', 'We have sent you a confirmation by email.')}</p><button class="co-btn co-btn--sec co-btn--block" data-h-click="h_live__nxCloseModal_1668">OK</button>`;
      nxLoadMySubs();
    } catch (e) { showToast(e.message, 'error'); $('nx-cl-go').disabled = false; }
  };
};
window.nxResumeLiveSub = async function (cid) {
  try { await apiPost(`/api/lv/me/subscriptions/${encodeURIComponent(cid)}/resume`, {}); showToast(L('Abo verlängert sich wieder automatisch', 'Sub renews automatically again'), 'success'); nxLoadMySubs(); } catch (e) { showToast(e.message, 'error'); }
};
// Alte Guthaben-Seite → Wallet im Shop
window.renderBalancePage = function () { navigateTo('shop', 'wallet'); };
})();

/* ---------------------------------------------------------------
   Nexa AI als eigene Seite (Eintrag in der Seitenleiste)
   --------------------------------------------------------------- */
window.renderNexaPage = function renderNexaPage() {
  const el = document.getElementById('page-nexa'); if (!el) return;
  const L2 = (de, en) => (typeof cl === 'function' && cl() === 'en') ? en : de;
  if (!currentUser) {
    el.innerHTML = `<div class="lvd-empty" style="margin-top:60px"><div class="lvd-empty-ico"><i class="fas fa-wand-magic-sparkles"></i></div><h3>Nexa AI</h3><p>${L2('Melde dich an, um mit Nexa zu chatten – deiner KI-Hilfe für Kanal, Videos und Livestreams.', 'Log in to chat with Nexa – your AI helper for channel, videos and streams.')}</p><button class="btn-primary" data-h-click="h_live_openAuthModal_1687">${t('login_btn')}</button></div>`;
    return;
  }
  el.innerHTML = `<div class="nx-nexa-page"><div class="page-header" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><h2 style="margin:0"><i class="fas fa-wand-magic-sparkles" style="color:var(--purple-light)"></i> Nexa AI</h2><button class="co-btn co-btn--sec co-btn--sm" data-h-click="h_live_navigateTo_1690"><i class="fas fa-gear"></i> ${L2('Nexa-Einstellungen', 'Nexa settings')}</button></div><div id="nexa-page-host"></div></div>`;
  if (typeof renderNexaHelpPanel === 'function') renderNexaHelpPanel(document.getElementById('nexa-page-host'));
};

/* ---------------------------------------------------------------
   Admin: Meldungen zu Livestreams und Live-Chat-Nachrichten
   --------------------------------------------------------------- */
window.nxAdminLiveReportCard = function (r, countByTarget) {
  const e = (s) => (typeof escHtml === 'function' ? escHtml(s) : s);
  const snap = r.liveSnapshot || {};
  const stream = r.type === 'stream' ? snap : (snap.stream || {});
  const u = r.targetUser || {};
  const chId = r.type === 'stream' ? r.targetId : snap.channelId;
  const cnt = countByTarget[r.type + ':' + r.targetId] || 1;
  return `<div class="admin-report-card" style="display:flex;gap:14px;padding:14px;background:var(--bg-card);border:1px solid var(--border-light);border-radius:14px;margin-bottom:12px;flex-wrap:wrap">
    <div style="width:160px;min-width:160px;aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:linear-gradient(135deg,#7f1d1d,#4c1d95);display:grid;place-items:center;color:#fff;font-weight:900;flex-shrink:0">${r.type === 'stream' ? '<span><i class="fas fa-tower-broadcast"></i> LIVE</span>' : '<span><i class="fas fa-comment"></i> CHAT</span>'}</div>
    <div style="flex:1;min-width:220px;display:flex;flex-direction:column;gap:6px;font-size:12.5px">
      <div style="font-weight:800;font-size:14px">${r.type === 'stream' ? 'Livestream: ' + e(stream.title || '—') : 'Chat-Nachricht von ' + e(snap.name || '?')}</div>
      <div><i class="fas fa-flag" style="color:#ef4444;width:16px"></i> <strong>Grund:</strong> ${e(r.reason)}${r.details ? ' – ' + e(r.details) : ''}</div>
      ${r.type === 'livechat' ? `<div style="background:var(--bg-secondary);border-radius:8px;padding:8px 10px">„${e(snap.text || '')}“</div>` : ''}
      <div style="color:var(--text-muted)"><i class="fas fa-user" style="width:16px"></i> ${r.type === 'stream' ? 'Streamer' : 'Verfasser'}: @${e(u.username || '?')} · Kategorie: ${e(stream.category || '—')} · ${stream.isLive ? `<span style="color:#ef4444">live (${stream.viewers || 0} Zuschauer)</span>` : 'nicht (mehr) live'} · ${cnt} Meldung(en)</div>
      ${(stream.recentChat || []).length ? `<details><summary style="cursor:pointer">Chat zum Zeitpunkt der Meldung (${stream.recentChat.length})</summary><div style="max-height:160px;overflow:auto;margin-top:6px">${stream.recentChat.map(m => `<div><b>${e(m.name)}:</b> ${e(m.text)}</div>`).join('')}</div></details>` : ''}
      <div style="font-size:11px;color:var(--text-muted)">Gemeldet von ${e(r.reporter?.username || '?')} · ${new Date(r.createdAt).toLocaleString('de-DE')}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;justify-content:center">
      ${chId ? `<button class="admin-action-btn" data-h-click="h_live_navigateTo_1715" data-hv-click="${nxHv(String(e(chId)))}"><i class="fas fa-eye"></i> Ansehen</button>` : ''}
      ${r.type === 'stream' ? `<button class="admin-action-btn" style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.25);color:#ef4444" data-h-click="h_live_nxAdminEndStream_1716" data-hv-click="${nxHv(String(e(r.targetId)), String(e(r.id)))}"><i class="fas fa-power-off"></i> Stream beenden</button>` : ''}
      <button data-h-click="h_live_adminResolveReport_1716" data-hv-click="${nxHv(String(e(r.id)))}" class="admin-action-btn" style="background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.25);color:#22c55e"><i class="fas fa-check"></i> Erledigt</button>
    </div></div>`;
};
window.nxAdminEndStream = async function (uid, reportId) {
  const reason = prompt('Grund (wird dem Streamer angezeigt):', 'Verstoß gegen die Community-Richtlinien'); if (reason === null) return;
  const strike = confirm('Zusätzlich eine Verwarnung (Strike) vergeben?');
  const days = parseInt(prompt('Live-Sperre in Tagen (0 = keine):', '0'), 10) || 0;
  try {
    await apiPost(`/api/admin/live/${encodeURIComponent(uid)}/end`, { reason, strike, liveBanDays: days });
    showToast('Stream beendet', 'success');
    if (reportId && typeof adminResolveReport === 'function') adminResolveReport(reportId);
  } catch (e) { showToast(e.message, 'error'); }
};

/* ---------------------------------------------------------------
   CHROMECAST: verständliche Fehler + Selbsttest + automatisches Weiterschalten
   --------------------------------------------------------------- */
(function () {
  const L3 = (de, en) => (typeof cl === 'function' && cl() === 'en') ? en : de;
  window.nxCastFailed = function (err) {
    const code = (err && (err.code || err.name)) || String(err || '');
    let msg;
    if (/cancel/i.test(code)) return;
    if (/load_media|LOAD_FAILED|media/i.test(code)) msg = L3('Der Fernseher konnte das Video nicht laden. Er muss deine Domain direkt erreichen können (öffentliche https-Adresse, keine Cloudflare-Bot-Sperre für /api/stream und /api/live).', 'The TV could not load the video. It must reach your domain directly (public https address, no Cloudflare bot blocking for /api/stream and /api/live).');
    else if (/timeout/i.test(code)) msg = L3('Der Fernseher hat nicht rechtzeitig geantwortet. Bitte erneut versuchen.', 'The TV did not respond in time. Please try again.');
    else if (/receiver_unavailable|session_error/i.test(code)) msg = L3('Verbindung zum Gerät fehlgeschlagen. Ist es eingeschaltet und im gleichen WLAN?', 'Could not connect to the device. Is it on and in the same Wi-Fi?');
    else msg = L3('Casten fehlgeschlagen', 'Casting failed') + (code ? ` (${code})` : '');
    showToast(msg, 'error');
    console.warn('[Cast]', err);
  };
  window.nxCastDiagnose = async function () {
    const rows = [];
    const ok = (good, label, tip) => rows.push(`<div class="lv-set-row" style="cursor:default;align-items:flex-start"><span>${good === true ? '<i class="fas fa-circle-check" style="color:#22c55e"></i>' : good === false ? '<i class="fas fa-circle-xmark" style="color:#ef4444"></i>' : '<i class="fas fa-triangle-exclamation" style="color:#f59e0b"></i>'} ${label}${tip && good !== true ? `<br><small style="color:var(--text-muted);font-weight:500">${tip}</small>` : ''}</span></div>`);
    ok(window.isSecureContext && !/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname), L3('Seite läuft über die öffentliche https-Adresse', 'Page runs on the public https address'), L3('Öffne Norynex über deine Domain mit https://. Ein Fernseher kann localhost oder eine IP im Heimnetz nicht erreichen.', 'Open Norynex via your https domain.'));
    const hasChrome = typeof chrome !== 'undefined' && !!chrome.cast;
    ok(hasChrome, L3('Browser unterstützt Google Cast (Chrome oder Edge)', 'Browser supports Google Cast (Chrome or Edge)'), L3('Firefox, Safari und viele Handy-Browser können nicht direkt casten. Auf dem iPhone: AirPlay im Player nutzen.', 'Firefox/Safari cannot cast. On iPhone use AirPlay.'));
    ok(typeof _castApiReady !== 'undefined' && _castApiReady, L3('Cast-Funktion von Google geladen', 'Google Cast loaded'), L3('Werbeblocker oder Datenschutz-Erweiterungen blockieren oft gstatic.com – für Norynex erlauben.', 'Ad blockers often block gstatic.com – allow it for Norynex.'));
    let state = null;
    try { state = cast.framework.CastContext.getInstance().getCastState(); } catch {}
    ok(state && state !== 'NO_DEVICES_AVAILABLE' ? true : (state ? false : null), L3('Fernseher/Chromecast gefunden', 'TV/Chromecast found'), L3('Gerät einschalten, gleiches WLAN wie der PC, VPN aus. Unter Windows Chrome in der Firewall für „Private Netzwerke“ erlauben. Gast-WLANs blockieren Geräte oft.', 'Turn the device on, same Wi-Fi, VPN off, allow Chrome in the firewall for private networks.'));
    let reach = null;
    const v = document.getElementById('main-video');
    const vid = v && (v.dataset.videoId || window._currentVideoId);
    if (vid && window.nxCast) {
      let cs = null;
      try { cs = await window.nxCast.source('video', vid); } catch (e) { ok(false, L3('Cast-Quelle vom Server', 'Cast source from server'), e.message); }
      if (cs) {
        ok(!cs.local, L3('Server gibt dem Fernseher eine öffentliche https-Adresse', 'Server gives the TV a public https address') + ` <small>(${esc(cs.base || '')})</small>`, L3('Trage in der .env BASE_URL=https://deine-domain ein (oder CAST_BASE_URL) und starte den Server neu.', 'Set BASE_URL=https://your-domain in .env (or CAST_BASE_URL) and restart.'));
        const u = cs.mp4 || cs.hls;
        try { const r = await fetch(u, { headers: { Range: 'bytes=0-1' }, cache: 'no-store' }); reach = (r.ok || r.status === 206) && r.headers.get('access-control-allow-origin') === '*'; } catch { reach = false; }
        ok(reach, L3('Video-Adresse ist für den Fernseher freigegeben', 'Video URL is available for the TV'), L3('Server antwortet nicht korrekt. Ist die neueste Norynex-Version auf dem Server aktiv (Neustart)? Bei Cloudflare: für /api/cast/* „Bot Fight Mode“/Challenges ausschalten.', 'Server does not answer correctly. Is the latest version running? With Cloudflare, disable bot challenges for /api/cast/*.'));
      }
    }
    _nxModal('nx-cast-diag', `<div class="nxm-head"><div class="nxm-head-ico"><i class="fab fa-chromecast"></i></div><div class="nxm-head-text"><h3>${L3('Chromecast-Selbsttest', 'Chromecast self-test')}</h3><p>${L3('Hier siehst du, woran es gerade hängt', 'See what is blocking casting')}</p></div><button class="nxm-x" data-h-click="h_live__nxCloseModal_1770" aria-label="X"><i class="fas fa-xmark"></i></button></div>
      <div class="nxm-body">${rows.join('')}<p class="lv-set-hint">${L3('Tipp: Wenn alles grün ist, klicke im Player auf das Cast-Symbol oder in Chrome oben rechts auf das Medien-Symbol → „Auf Gerät streamen“.', 'Tip: if everything is green, click the cast icon in the player or Chrome’s media control → “Cast”.')}</p>
      <button class="co-btn co-btn--primary co-btn--block" data-h-click="h_live__nxCloseModal_1771">${L3('Gerät auswählen', 'Choose device')}</button></div>`);
  };
  // Läuft schon eine Cast-Sitzung, wird ein neu geöffnetes Video/Livestream direkt auf dem Fernseher gestartet (wie bei YouTube)
  const orig = window.navigateTo;
  if (typeof orig === 'function' && !orig._cast173) {
    const w = function (page, param, ...rest) {
      const r = orig.call(this, page, param, ...rest);
      try {
        const sess = (typeof _castApiReady !== 'undefined' && _castApiReady) ? cast.framework.CastContext.getInstance().getCurrentSession() : null;
        if (sess && (page === 'watch' || page === 'stream') && param) {
          let tries = 0;
          const go = () => {
            if (page === 'watch') { const el = document.getElementById('main-video'); if (el && el.dataset.castSrc) _castCurrentVideoViaSDK(el).catch(nxCastFailed); else if (++tries < 20) setTimeout(go, 300); }
            else { if (window._currentStreamUserId === param && document.getElementById('stream-video')) nxCastLive(param); else if (++tries < 20) setTimeout(go, 300); }
          };
          setTimeout(go, 600);
        }
      } catch {}
      return r;
    };
    w._cast173 = true; Object.keys(orig).forEach(k => { w[k] = orig[k]; }); window.navigateTo = w;
  }
})();

window.NX_VERSION = '1.75';
// ─── Teil: client/live/995-ereignis-handler.js ───
// ── Ereignis-Handler (v1.82: statt Inline-Handlern im HTML – CSP ohne 'unsafe-inline'; Verteiler: public/js/nx-events.js) ──
(window.NX_H = window.NX_H || {}).h_live_renderLivePage_48 = function (event, v) { renderLivePage() };
(window.NX_H = window.NX_H || {}).h_live_remove_60 = function (event, v) { this.remove() };
(window.NX_H = window.NX_H || {}).h_live_preventDefault_62 = function (event, v) { event.preventDefault();navigateTo('stream','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_replaceState_85 = function (event, v) { history.replaceState(null,'','#studio/stream');navigateTo('studio') };
(window.NX_H = window.NX_H || {}).h_live_lvDirCat_93 = function (event, v) { lvDirCat('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvDirSort_90 = function (event, v) { lvDirSort(this.value) };
(window.NX_H = window.NX_H || {}).h_live_lvDirCat_93_2 = function (event, v) { lvDirCat('all') };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_111 = function (event, v) { navigateTo('live') };
(window.NX_H = window.NX_H || {}).h_live_nxTogglePlay_182 = function (event, v) { nxTogglePlay() };
(window.NX_H = window.NX_H || {}).h_live_nxToggleMute_182 = function (event, v) { nxToggleMute() };
(window.NX_H = window.NX_H || {}).h_live_nxSetVolume_188 = function (event, v) { nxSetVolume(this.value) };
(window.NX_H = window.NX_H || {}).h_live_lvJumpLive_189 = function (event, v) { lvJumpLive() };
(window.NX_H = window.NX_H || {}).h_live_nxCastLive_191 = function (event, v) { nxCastLive('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvTheater_193 = function (event, v) { lvTheater() };
(window.NX_H = window.NX_H || {}).h_live_nxTogglePip_194 = function (event, v) { nxTogglePip() };
(window.NX_H = window.NX_H || {}).h_live_nxToggleFullscreen_194 = function (event, v) { nxToggleFullscreen() };
(window.NX_H = window.NX_H || {}).h_live_lvEditInfo_218 = function (event, v) { lvEditInfo() };
(window.NX_H = window.NX_H || {}).h_live_replaceState_224 = function (event, v) { history.replaceState(null,'','#studio/stream/dash');navigateTo('studio') };
(window.NX_H = window.NX_H || {}).h_live_replaceState_225 = function (event, v) { history.replaceState(null,'','#studio/stream');navigateTo('studio') };
(window.NX_H = window.NX_H || {}).h_live_lvBell_227 = function (event, v) { lvBell() };
(window.NX_H = window.NX_H || {}).h_live_lvOpenSub_228 = function (event, v) { lvOpenSub() };
(window.NX_H = window.NX_H || {}).h_live_lvFollow_226 = function (event, v) { lvFollow() };
(window.NX_H = window.NX_H || {}).h_live_lvOpenGift_229 = function (event, v) { lvOpenGift() };
(window.NX_H = window.NX_H || {}).h_live_lvOpenModPanel_250 = function (event, v) { lvOpenModPanel() };
(window.NX_H = window.NX_H || {}).h_live_openAuthModal_263 = function (event, v) { openAuthModal('login') };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_215 = function (event, v) { navigateTo('channel','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_215_2 = function (event, v) { navigateTo('channel','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvShare_229 = function (event, v) { lvShare() };
(window.NX_H = window.NX_H || {}).h_live_lvMoreMenu_230 = function (event, v) { lvMoreMenu(event) };
(window.NX_H = window.NX_H || {}).h_live_lvMobileTab_231 = function (event, v) { lvMobileTab('chat') };
(window.NX_H = window.NX_H || {}).h_live_lvMobileTab_235 = function (event, v) { lvMobileTab('info') };
(window.NX_H = window.NX_H || {}).h_live_lvOpenChatters_248 = function (event, v) { lvOpenChatters() };
(window.NX_H = window.NX_H || {}).h_live_lvOpenChatSettings_250 = function (event, v) { lvOpenChatSettings() };
(window.NX_H = window.NX_H || {}).h_live_lvToggleChat_251 = function (event, v) { lvToggleChat() };
(window.NX_H = window.NX_H || {}).h_live_lvScrollBottom_252 = function (event, v) { lvScrollBottom(true) };
(window.NX_H = window.NX_H || {}).h_live_lvInputKey_263 = function (event, v) { lvInputKey(event) };
(window.NX_H = window.NX_H || {}).h_live_lvInputGrow_263 = function (event, v) { lvInputGrow(this) };
(window.NX_H = window.NX_H || {}).h_live_lvToggleEmoji_263 = function (event, v) { lvToggleEmoji(event) };
(window.NX_H = window.NX_H || {}).h_live_lvSend_263 = function (event, v) { lvSend() };
(window.NX_H = window.NX_H || {}).h_live_lvOpenPoints_266 = function (event, v) { lvOpenPoints(event) };
(window.NX_H = window.NX_H || {}).h_live_lvSend_270 = function (event, v) { lvSend() };
(window.NX_H = window.NX_H || {}).h_live_lvDirCat_279 = function (event, v) { lvDirCat('' + NX_H.$s(v[0]) + '');navigateTo('live') };
(window.NX_H = window.NX_H || {}).h_live_lvUserCard_312 = function (event, v) { lvUserCard('' + NX_H.$s(v[0]) + '',event) };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_317 = function (event, v) { lvModAction('timeout',{target:'' + NX_H.$s(v[0]) + '',duration:600}) };
(window.NX_H = window.NX_H || {}).h_live_lvConfirmBan_317 = function (event, v) { lvConfirmBan('' + NX_H.$s(v[0]) + '','' + NX_H.$s(v[1]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvPin_315 = function (event, v) { lvPin('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_315 = function (event, v) { lvModAction('delete',{msgId:'' + NX_H.$s(v[0]) + ''}) };
(window.NX_H = window.NX_H || {}).h_live_lvReportMsg_319 = function (event, v) { lvReportMsg('' + NX_H.$s(v[0]) + '','' + NX_H.$s(v[1]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvReply_313 = function (event, v) { lvReply('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_343 = function (event, v) { lvModAction('unpin',{}) };
(window.NX_H = window.NX_H || {}).h_live_lvCancelReply_391 = function (event, v) { lvCancelReply() };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_415 = function (event, v) { navigateTo('shop') };
(window.NX_H = window.NX_H || {}).h_live_lvClosePanel_458 = function (event, v) { lvClosePanel() };
(window.NX_H = window.NX_H || {}).h_live_lvSet_474 = function (event, v) { lvSet('size','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvPickBadge_478 = function (event, v) { lvPickBadge('' + NX_H.$s(v[0]) + '',this) };
(window.NX_H = window.NX_H || {}).h_live_lvSetColor_479 = function (event, v) { lvSetColor('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvSet_475 = function (event, v) { lvSet('time',this.checked) };
(window.NX_H = window.NX_H || {}).h_live_lvSet_476 = function (event, v) { lvSet('hideBots',this.checked) };
(window.NX_H = window.NX_H || {}).h_live_lvSet_477 = function (event, v) { lvSet('anim',this.checked) };
(window.NX_H = window.NX_H || {}).h_live_lvDrawChatters_506 = function (event, v) { lvDrawChatters(this.value) };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_519 = function (event, v) { lvModAction('shoutout',{target:'' + NX_H.$s(v[0]) + ''}) };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_519_2 = function (event, v) { lvModAction('timeout',{target:'' + NX_H.$s(v[0]) + '',duration:600}) };
(window.NX_H = window.NX_H || {}).h_live_lvConfirmBan_519 = function (event, v) { lvConfirmBan('' + NX_H.$s(v[0]) + '','' + NX_H.$s(v[1]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvUserCard_517 = function (event, v) { lvUserCard('' + NX_H.$s(v[0]) + '',event) };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_527 = function (event, v) { lvModAction(this.checked?'' + NX_H.$s(v[0]) + '':'' + NX_H.$s(v[1]) + '',{}) };
(window.NX_H = window.NX_H || {}).h_live_lvRaidPrompt_538 = function (event, v) { lvRaidPrompt() };
(window.NX_H = window.NX_H || {}).h_live_lvRunAd_542 = function (event, v) { lvRunAd() };
(window.NX_H = window.NX_H || {}).h_live_replaceState_545 = function (event, v) { history.replaceState(null,'','#studio/stream/mod');navigateTo('studio') };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_530 = function (event, v) { this.value==='0'?lvModAction('slowoff',{}):lvModAction('slow',{seconds:+this.value}) };
(window.NX_H = window.NX_H || {}).h_live_lvAnnounce_534 = function (event, v) { lvAnnounce() };
(window.NX_H = window.NX_H || {}).h_live_if_536 = function (event, v) { if(confirm('' + NX_H.$s(v[0]) + ''))lvModAction('clear',{}) };
(window.NX_H = window.NX_H || {}).h_live_lvShoutoutPrompt_538 = function (event, v) { lvShoutoutPrompt() };
(window.NX_H = window.NX_H || {}).h_live_lvNewPoll_538 = function (event, v) { lvNewPoll() };
(window.NX_H = window.NX_H || {}).h_live_lvNewPrediction_540 = function (event, v) { lvNewPrediction() };
(window.NX_H = window.NX_H || {}).h_live_lvMention_594 = function (event, v) { lvMention('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvGiftTo_595 = function (event, v) { lvGiftTo('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_596 = function (event, v) { lvModAction('shoutout',{target:'' + NX_H.$s(v[0]) + ''});this.closest('.lv-ucard').remove() };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_600 = function (event, v) { lvModAction('timeout',{target:'' + NX_H.$s(v[0]) + '',duration:NX_H.$l(v[1])});this.closest('.lv-ucard').remove() };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_601 = function (event, v) { lvModAction('untimeout',{target:'' + NX_H.$s(v[0]) + ''});this.closest('.lv-ucard').remove() };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_602 = function (event, v) { lvModAction('unban',{target:'' + NX_H.$s(v[0]) + ''});this.closest('.lv-ucard').remove() };
(window.NX_H = window.NX_H || {}).h_live_lvConfirmBan_602 = function (event, v) { lvConfirmBan('' + NX_H.$s(v[0]) + '','' + NX_H.$s(v[1]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_603 = function (event, v) { lvModAction('' + NX_H.$s(v[0]) + '',{target:'' + NX_H.$s(v[1]) + ''});this.closest('.lv-ucard').remove() };
(window.NX_H = window.NX_H || {}).h_live_lvModAction_603_2 = function (event, v) { lvModAction('' + NX_H.$s(v[0]) + '',{target:'' + NX_H.$s(v[1]) + ''});this.closest('.lv-ucard').remove() };
(window.NX_H = window.NX_H || {}).h_live_openReportModal_607 = function (event, v) { openReportModal('user','' + NX_H.$s(v[0]) + '','' + NX_H.$s(v[1]) + '') };
(window.NX_H = window.NX_H || {}).h_live_closest_582 = function (event, v) { this.closest('.lv-ucard').remove() };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_590 = function (event, v) { navigateTo('channel','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvBell_623 = function (event, v) { lvBell() };
(window.NX_H = window.NX_H || {}).h_live_preventDefault_683 = function (event, v) { event.preventDefault();navigateTo('watch','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_690 = function (event, v) { navigateTo('watch','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvRaidGo_725 = function (event, v) { lvRaidGo('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvRaidStay_725 = function (event, v) { lvRaidStay() };
(window.NX_H = window.NX_H || {}).h_live_lvRedeem_790 = function (event, v) { lvRedeem('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_lvPollEnd_810 = function (event, v) { lvPollEnd() };
(window.NX_H = window.NX_H || {}).h_live_lvVote_812 = function (event, v) { lvVote(NX_H.$l(v[0])) };
(window.NX_H = window.NX_H || {}).h_live_lvVoteExtra_813 = function (event, v) { lvVoteExtra() };
(window.NX_H = window.NX_H || {}).h_live_lvEngMin_810 = function (event, v) { lvEngMin('poll') };
(window.NX_H = window.NX_H || {}).h_live_lvBet_822 = function (event, v) { lvBet(NX_H.$l(v[0])) };
(window.NX_H = window.NX_H || {}).h_live_lvEngMin_819 = function (event, v) { lvEngMin('pred') };
(window.NX_H = window.NX_H || {}).h_live_lvStartPoll_847 = function (event, v) { lvStartPoll() };
(window.NX_H = window.NX_H || {}).h_live_lvPredAct_858 = function (event, v) { lvPredAct({action:'lock'}) };
(window.NX_H = window.NX_H || {}).h_live_lvPredAct_859 = function (event, v) { lvPredAct({action:'resolve',winner:NX_H.$l(v[0])}) };
(window.NX_H = window.NX_H || {}).h_live_lvPredAct_859_2 = function (event, v) { lvPredAct({action:'cancel'}) };
(window.NX_H = window.NX_H || {}).h_live_lvStartPred_866 = function (event, v) { lvStartPred() };
(window.NX_H = window.NX_H || {}).h_live_fetch_917 = function (event, v) { fetch('/api/ads/' + NX_H.$s(v[0]) + '/click',{method:'POST'}) };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_942 = function (event, v) { navigateTo('vod','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltVodDl_954 = function (event, v) { ltVodDl('' + NX_H.$s(v[0]) + '', this) };
(window.NX_H = window.NX_H || {}).h_live_lvDeleteVod_954 = function (event, v) { lvDeleteVod('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_953 = function (event, v) { navigateTo('stream','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live__nxCloseModal_979 = function (event, v) { _nxCloseModal('lv-edit-info') };
(window.NX_H = window.NX_H || {}).h_live_lvSaveInfo_982 = function (event, v) { lvSaveInfo() };
(window.NX_H = window.NX_H || {}).h_live__nxCloseModal_999 = function (event, v) { _nxCloseModal('lv-sub-modal') };
(window.NX_H = window.NX_H || {}).h_live__nxCloseModal_1011 = function (event, v) { _nxCloseModal('lv-sub-modal') };
(window.NX_H = window.NX_H || {}).h_live__subSelSet_1012 = function (event, v) { _subSelSet('tier',NX_H.$l(v[0])) };
(window.NX_H = window.NX_H || {}).h_live__subSelSet_1014 = function (event, v) { _subSelSet('months',NX_H.$l(v[0])) };
(window.NX_H = window.NX_H || {}).h_live_lvDrawSub_1015 = function (event, v) { _subSel.autoRenew=this.checked;lvDrawSub() };
(window.NX_H = window.NX_H || {}).h_live_lvContinueSub_1018 = function (event, v) { lvContinueSub() };
(window.NX_H = window.NX_H || {}).h_live__nxCloseModal_1041 = function (event, v) { _nxCloseModal('lv-gift-modal') };
(window.NX_H = window.NX_H || {}).h_live__giftSet_1058 = function (event, v) { _giftSet('tier',NX_H.$l(v[0])) };
(window.NX_H = window.NX_H || {}).h_live__giftSet_1066 = function (event, v) { _giftSet('count',NX_H.$l(v[0])) };
(window.NX_H = window.NX_H || {}).h_live__giftSet_1062 = function (event, v) { _giftSet('to','') };
(window.NX_H = window.NX_H || {}).h_live__giftSet_1062_2 = function (event, v) { _giftSet('to',prompt('' + NX_H.$s(v[0]) + '')||'') };
(window.NX_H = window.NX_H || {}).h_live__giftSet_1075 = function (event, v) { _giftSet('gift','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live__giftSet_1077 = function (event, v) { _giftSet('qty',Math.max(1,NX_H.$l(v[0])-1)) };
(window.NX_H = window.NX_H || {}).h_live__giftSet_1077_2 = function (event, v) { _giftSet('qty',Math.min(10,NX_H.$l(v[0])+1)) };
(window.NX_H = window.NX_H || {}).h_live_h_1079 = function (event, v) { _giftSel.msg=this.value };
(window.NX_H = window.NX_H || {}).h_live__giftSet_1083 = function (event, v) { _giftSet('tab','subs') };
(window.NX_H = window.NX_H || {}).h_live__giftSet_1083_2 = function (event, v) { _giftSet('tab','gifts') };
(window.NX_H = window.NX_H || {}).h_live_lvContinueGift_1086 = function (event, v) { lvContinueGift() };
(window.NX_H = window.NX_H || {}).h_live_ltTab_1113 = function (event, v) { ltTab('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltTab_1130 = function (event, v) { ltTab('golive') };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_1130 = function (event, v) { navigateTo('stream','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltTab_1163 = function (event, v) { ltTab('golive') };
(window.NX_H = window.NX_H || {}).h_live_lvRunAdStudio_1165 = function (event, v) { lvRunAdStudio() };
(window.NX_H = window.NX_H || {}).h_live_ltQuick_1166 = function (event, v) { ltQuick('poll') };
(window.NX_H = window.NX_H || {}).h_live_ltQuick_1167 = function (event, v) { ltQuick('pred') };
(window.NX_H = window.NX_H || {}).h_live_ltQuick_1168 = function (event, v) { ltQuick('announce') };
(window.NX_H = window.NX_H || {}).h_live_ltQuick_1169 = function (event, v) { ltQuick('raid') };
(window.NX_H = window.NX_H || {}).h_live_ltQuick_1170 = function (event, v) { ltQuick('shoutout') };
(window.NX_H = window.NX_H || {}).h_live_ltRedeem_1173 = function (event, v) { ltRedeem('' + NX_H.$s(v[0]) + '','done') };
(window.NX_H = window.NX_H || {}).h_live_ltRedeem_1173_2 = function (event, v) { ltRedeem('' + NX_H.$s(v[0]) + '','refund') };
(window.NX_H = window.NX_H || {}).h_live_ltSaveInfo_1181 = function (event, v) { ltSaveInfo() };
(window.NX_H = window.NX_H || {}).h_live_ltSave_1189 = function (event, v) { ltSave({goal:{enabled:ltEl('lt-goal-on').checked,type:ltEl('lt-goal-type').value,target:+ltEl('lt-goal-target').value,title:ltEl('lt-goal-title').value}}) };
(window.NX_H = window.NX_H || {}).h_live_ltMod_1195 = function (event, v) { ltMod('' + NX_H.$s(v[0]) + '','' + NX_H.$s(v[1]) + '') };
(window.NX_H = window.NX_H || {}).h_live_querySelectorAll_1206 = function (event, v) { this.parentNode.querySelectorAll('button').forEach(x=>x.classList.remove('is-on'));this.classList.add('is-on');this.parentNode.dataset.v='' + NX_H.$s(v[0]) + '' };
(window.NX_H = window.NX_H || {}).h_live_ltSaveChat_1207 = function (event, v) { ltSaveChat() };
(window.NX_H = window.NX_H || {}).h_live_ltMod_1212 = function (event, v) { ltMod('mod',ltEl('lt-add-mod').value) };
(window.NX_H = window.NX_H || {}).h_live_ltMod_1215 = function (event, v) { ltMod('vip',ltEl('lt-add-vip').value) };
(window.NX_H = window.NX_H || {}).h_live_ltMod_1219 = function (event, v) { ltMod('ban',ltEl('lt-add-ban').value) };
(window.NX_H = window.NX_H || {}).h_live_select_1247 = function (event, v) { this.select() };
(window.NX_H = window.NX_H || {}).h_live_ltCopy_1247 = function (event, v) { ltCopy('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltRotate_1252 = function (event, v) { ltRotate('bot') };
(window.NX_H = window.NX_H || {}).h_live_ltRotate_1253 = function (event, v) { ltRotate('bot-off') };
(window.NX_H = window.NX_H || {}).h_live_ltRotate_1254 = function (event, v) { ltRotate('bot') };
(window.NX_H = window.NX_H || {}).h_live_ltEl_1236 = function (event, v) { ltEl('lt-cmds').insertAdjacentHTML('beforeend',ltCmdRow({id:'',name:'',response:'',cooldown:10,perm:'all',enabled:true,uses:0})) };
(window.NX_H = window.NX_H || {}).h_live_ltEl_1241 = function (event, v) { ltEl('lt-timers').insertAdjacentHTML('beforeend',ltTimerRow({id:'',message:'',interval:15,minLines:5,enabled:true})) };
(window.NX_H = window.NX_H || {}).h_live_ltSaveBot_1242 = function (event, v) { ltSaveBot() };
(window.NX_H = window.NX_H || {}).h_live_ltTestAlert_1286 = function (event, v) { ltTestAlert('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltRotate_1263 = function (event, v) { ltRotate('overlay') };
(window.NX_H = window.NX_H || {}).h_live_ltOvl_1267 = function (event, v) { ltOvl() };
(window.NX_H = window.NX_H || {}).h_live_ltOvl_1268 = function (event, v) { ltOvl() };
(window.NX_H = window.NX_H || {}).h_live_ltOvl_1269 = function (event, v) { ltOvl() };
(window.NX_H = window.NX_H || {}).h_live_ltOvl_1269_2 = function (event, v) { ltOvl() };
(window.NX_H = window.NX_H || {}).h_live_ltOvl_1271 = function (event, v) { ltOvl() };
(window.NX_H = window.NX_H || {}).h_live_ltOvl_1271_2 = function (event, v) { ltOvl() };
(window.NX_H = window.NX_H || {}).h_live_ltOvl_1271_3 = function (event, v) { ltOvl() };
(window.NX_H = window.NX_H || {}).h_live_select_1271 = function (event, v) { this.select() };
(window.NX_H = window.NX_H || {}).h_live_ltCopy_1271 = function (event, v) { ltCopy(ltEl('lo-chat-url').value) };
(window.NX_H = window.NX_H || {}).h_live_select_1277 = function (event, v) { this.select() };
(window.NX_H = window.NX_H || {}).h_live_ltCopy_1277 = function (event, v) { ltCopy('' + NX_H.$s(v[0]) + 'alerts.html?key=' + NX_H.$s(v[1]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltSaveAlerts_1286 = function (event, v) { ltSaveAlerts() };
(window.NX_H = window.NX_H || {}).h_live_select_1291 = function (event, v) { this.select() };
(window.NX_H = window.NX_H || {}).h_live_ltCopy_1291 = function (event, v) { ltCopy('' + NX_H.$s(v[0]) + 'goal.html?key=' + NX_H.$s(v[1]) + '') };
(window.NX_H = window.NX_H || {}).h_live_select_1295 = function (event, v) { this.select() };
(window.NX_H = window.NX_H || {}).h_live_ltCopy_1295 = function (event, v) { ltCopy('' + NX_H.$s(v[0]) + 'poll.html?key=' + NX_H.$s(v[1]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltSave_1316 = function (event, v) { ltSave({subs:{enabled:ltEl('ls-on').checked,perks:ltEl('ls-perks').value}}) };
(window.NX_H = window.NX_H || {}).h_live_closest_1328 = function (event, v) { this.closest('.lt-cmd').remove() };
(window.NX_H = window.NX_H || {}).h_live_closest_1331 = function (event, v) { this.closest('.lt-cmd').remove() };
(window.NX_H = window.NX_H || {}).h_live_ltQuickGo_1404 = function (event, v) { ltQuickGo('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltObsProfile_1439 = function (event, v) { ltObsProfile('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltConnShow_1439 = function (event, v) { ltConnShow('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltConnDel_1439 = function (event, v) { ltConnDel('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_select_1451 = function (event, v) { this.select() };
(window.NX_H = window.NX_H || {}).h_live_ltCopy_1451 = function (event, v) { ltCopy('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltDock_1452 = function (event, v) { ltDock('new') };
(window.NX_H = window.NX_H || {}).h_live_ltDock_1452_2 = function (event, v) { ltDock('off') };
(window.NX_H = window.NX_H || {}).h_live_ltDock_1454 = function (event, v) { ltDock('new') };
(window.NX_H = window.NX_H || {}).h_live_ltPluginZip_1425 = function (event, v) { ltPluginZip(this) };
(window.NX_H = window.NX_H || {}).h_live_ltPluginCode_1426 = function (event, v) { ltPluginCode() };
(window.NX_H = window.NX_H || {}).h_live_ltConnAdd_1432 = function (event, v) { ltConnAdd() };
(window.NX_H = window.NX_H || {}).h_live_select_1457 = function (event, v) { this.select() };
(window.NX_H = window.NX_H || {}).h_live_ltCopy_1457 = function (event, v) { ltCopy('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltObsProfile_1465 = function (event, v) { ltObsProfile('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltCopy_1466 = function (event, v) { ltCopy('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_toggle_1467 = function (event, v) { this.classList.toggle('lt-blur') };
(window.NX_H = window.NX_H || {}).h_live_ltCopy_1467 = function (event, v) { ltCopy('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltCopy_1472 = function (event, v) { ltCopy('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_toggle_1473 = function (event, v) { this.classList.toggle('lt-blur') };
(window.NX_H = window.NX_H || {}).h_live_ltCopy_1473 = function (event, v) { ltCopy('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_toggle_1500 = function (event, v) { this.classList.toggle('lt-blur') };
(window.NX_H = window.NX_H || {}).h_live_ltCopy_1501 = function (event, v) { ltCopy('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltPluginCode_1502 = function (event, v) { ltPluginCode(true) };
(window.NX_H = window.NX_H || {}).h_live_ltEl_1531 = function (event, v) { ltEl('pt-rewards').insertAdjacentHTML('beforeend', ltRewardRow({kind:'custom',title:'',cost:1000,enabled:true,color:'#a855f7'})) };
(window.NX_H = window.NX_H || {}).h_live_ltSavePoints_1536 = function (event, v) { ltSavePoints() };
(window.NX_H = window.NX_H || {}).h_live_ltQuick_1540 = function (event, v) { ltQuick('poll') };
(window.NX_H = window.NX_H || {}).h_live_ltQuick_1541 = function (event, v) { ltQuick('pred') };
(window.NX_H = window.NX_H || {}).h_live_closest_1551 = function (event, v) { this.closest('.lt-rw').remove() };
(window.NX_H = window.NX_H || {}).h_live_ltApplyAff_1583 = function (event, v) { ltApplyAff() };
(window.NX_H = window.NX_H || {}).h_live_switchStudio_1586 = function (event, v) { switchStudio('monetize', document.querySelector('[data-studio=monetize]')) };
(window.NX_H = window.NX_H || {}).h_live_lvRunAdStudio_1591 = function (event, v) { lvRunAdStudio() };
(window.NX_H = window.NX_H || {}).h_live_h_1606 = function (event, v) { this.style.visibility='hidden' };
(window.NX_H = window.NX_H || {}).h_live_ltVodDl_1608 = function (event, v) { ltVodDl('' + NX_H.$s(v[0]) + '', this) };
(window.NX_H = window.NX_H || {}).h_live_ltDelVod_1609 = function (event, v) { ltDelVod('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_ltTab_1604 = function (event, v) { ltTab('points') };
(window.NX_H = window.NX_H || {}).h_live_cancelSubscription_1644 = function (event, v) { cancelSubscription() };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_1644 = function (event, v) { navigateTo('premium') };
(window.NX_H = window.NX_H || {}).h_live_nxCancelLiveSub_1649 = function (event, v) { nxCancelLiveSub('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_nxResumeLiveSub_1649 = function (event, v) { nxResumeLiveSub('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_1653 = function (event, v) { navigateTo('stream','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live__nxCloseModal_1657 = function (event, v) { _nxCloseModal('nx-cancel-live') };
(window.NX_H = window.NX_H || {}).h_live__nxCloseModal_1668 = function (event, v) { _nxCloseModal('nx-cancel-live') };
(window.NX_H = window.NX_H || {}).h_live_openAuthModal_1687 = function (event, v) { openAuthModal('login') };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_1690 = function (event, v) { navigateTo('settings','nexa') };
(window.NX_H = window.NX_H || {}).h_live_navigateTo_1715 = function (event, v) { navigateTo('stream','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live_nxAdminEndStream_1716 = function (event, v) { nxAdminEndStream('' + NX_H.$s(v[0]) + '','' + NX_H.$s(v[1]) + '') };
(window.NX_H = window.NX_H || {}).h_live_adminResolveReport_1716 = function (event, v) { adminResolveReport('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_live__nxCloseModal_1770 = function (event, v) { _nxCloseModal('nx-cast-diag') };
(window.NX_H = window.NX_H || {}).h_live__nxCloseModal_1771 = function (event, v) { _nxCloseModal('nx-cast-diag');try{cast.framework.CastContext.getInstance().requestSession().then(()=>{},()=>{})}catch(e){} };
