/* =====================================================================
   Norynex · Player v2
   Eigene Steuerleiste für Videos (statt Browser-Standard-Controls):
   Play/Pause, ±10 s, Lautstärke, Zeit, Fortschritt (Maus + Touch, Vorschau-Zeit),
   Untertitel, Geschwindigkeit, Chromecast (direkt neben der Lautstärke),
   Bild-im-Bild, Vollbild. Tastatur: Leertaste/K, J/L, ←/→, ↑/↓, M, F, C.
   Mobil: Tippen blendet Steuerung ein/aus, Doppeltipp links/rechts spult ±10 s.
   ===================================================================== */

function _fmtTime(s) {
  if (!isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = Math.floor(s % 60);
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

const NXP_CAST_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm18-7H5v1.63c3.96 1.28 7.09 4.41 8.37 8.37H19V7zM1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.92-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>';

function nxEnhancePlayer(vid) {
  if (!vid || vid._nxp) return;
  const wrap = vid.parentElement;
  if (!wrap) return;
  vid._nxp = true;
  vid.removeAttribute('controls');
  vid.controls = false;
  wrap.classList.add('nxp');
  document.getElementById('nxd-cast-btn')?.remove(); // alter schwebender Cast-Button

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4]; // >2x = Premium (bis 4x)
  const isPrem = () => typeof currentUser !== 'undefined' && !!currentUser && !!(currentUser.isPremium || currentUser.isAdmin);
  const ui = document.createElement('div');
  ui.className = 'nxp-ui';
  ui.innerHTML = `
    <div class="nxp-center"><button class="nxp-big" data-a="play" aria-label="Play"><i class="fas fa-play"></i></button></div>
    <div class="nxp-seekhint nxp-seekhint--l"><i class="fas fa-rotate-left"></i><span>10 s</span></div>
    <div class="nxp-seekhint nxp-seekhint--r"><i class="fas fa-rotate-right"></i><span>10 s</span></div>
    <div class="nxp-spinner"><i class="fas fa-circle-notch fa-spin"></i></div>
    <div class="nxp-bar">
      <div class="nxp-progress" role="slider" aria-label="Fortschritt" tabindex="0">
        <div class="nxp-track"><div class="nxp-buf"></div><div class="nxp-fill"></div></div>
        <div class="nxp-thumb"></div>
        <div class="nxp-tip">0:00</div>
      </div>
      <div class="nxp-row">
        <button class="nxp-btn" data-a="play" title="Play (K)"><i class="fas fa-play"></i></button>
        <button class="nxp-btn nxp-hide-xs" data-a="back" title="-10 s (J)"><i class="fas fa-rotate-left"></i></button>
        <button class="nxp-btn nxp-hide-xs" data-a="fwd" title="+10 s (L)"><i class="fas fa-rotate-right"></i></button>
        <div class="nxp-vol">
          <button class="nxp-btn" data-a="mute" title="Ton (M)"><i class="fas fa-volume-high"></i></button>
          <input class="nxp-vol-range" type="range" min="0" max="1" step="0.05" value="1" aria-label="Lautstärke">
        </div>
        <button class="nxp-btn nxp-cast" id="nxd-cast-btn" data-a="cast" title="Auf Fernseher streamen">${NXP_CAST_SVG}</button>
        <span class="nxp-time"><span class="nxp-cur">0:00</span> / <span class="nxp-dur">0:00</span></span>
        <span class="nxp-spacer"></span>
        <button class="nxp-btn nxp-cc" data-a="cc" title="Untertitel (C)" hidden><i class="fas fa-closed-captioning"></i></button>
        <div class="nxp-menu-wrap">
          <button class="nxp-btn nxp-speed-btn" data-a="speed" title="Geschwindigkeit"><span>1x</span></button>
          <div class="nxp-menu" hidden>${speeds.map(s => `<button data-speed="${s}" class="${s === 1 ? 'is-on' : ''}${s > 2 ? ' is-prem' : ''}">${s === 1 ? 'Normal' : s + 'x'}${s > 2 ? ' <i class="fas fa-crown"></i>' : ''}</button>`).join('')}</div>
        </div>
        <button class="nxp-btn nxp-hide-xs" data-a="pip" title="Bild im Bild"><i class="fas fa-clone"></i></button>
        <button class="nxp-btn" data-a="fs" title="Vollbild (F)"><i class="fas fa-expand"></i></button>
      </div>
    </div>`;
  wrap.appendChild(ui);
  const $ = s => ui.querySelector(s);
  const playIcons = () => ui.querySelectorAll('[data-a="play"] i');
  const prog = $('.nxp-progress'), fill = $('.nxp-fill'), buf = $('.nxp-buf'), thumb = $('.nxp-thumb'), tip = $('.nxp-tip');
  const cur = $('.nxp-cur'), dur = $('.nxp-dur'), volR = $('.nxp-vol-range'), muteI = $('[data-a="mute"] i');
  if (!document.pictureInPictureEnabled) $('[data-a="pip"]')?.remove();

  // ── Zustand anzeigen ──
  const syncPlay = () => {
    playIcons().forEach(i => i.className = 'fas ' + (vid.paused ? 'fa-play' : 'fa-pause'));
    wrap.classList.toggle('is-paused', vid.paused);
    if (vid.paused) showUi(true); else hideSoon();
  };
  const syncTime = () => {
    const d = vid.duration || 0;
    const p = d ? vid.currentTime / d : 0;
    fill.style.width = (p * 100) + '%'; thumb.style.left = (p * 100) + '%';
    cur.textContent = _fmtTime(vid.currentTime); dur.textContent = _fmtTime(d);
    prog.setAttribute('aria-valuenow', Math.round(p * 100));
  };
  const syncBuf = () => { try { const d = vid.duration; if (d && vid.buffered.length) buf.style.width = (vid.buffered.end(vid.buffered.length - 1) / d * 100) + '%'; } catch {} };
  const syncVol = () => {
    volR.value = vid.muted ? 0 : vid.volume;
    muteI.className = 'fas ' + (vid.muted || vid.volume === 0 ? 'fa-volume-xmark' : vid.volume < 0.5 ? 'fa-volume-low' : 'fa-volume-high');
    volR.style.setProperty('--v', (vid.muted ? 0 : vid.volume) * 100 + '%');
  };
  const syncCC = () => {
    const tracks = Array.from(vid.textTracks || []).filter(t => t.kind === 'subtitles' || t.kind === 'captions');
    const btn = $('.nxp-cc');
    btn.hidden = !tracks.length;
    btn.classList.toggle('is-on', tracks.some(t => t.mode === 'showing'));
  };
  ['play', 'pause', 'ended'].forEach(e => vid.addEventListener(e, syncPlay));
  vid.addEventListener('timeupdate', syncTime);
  vid.addEventListener('durationchange', syncTime);
  vid.addEventListener('loadedmetadata', () => { syncTime(); syncCC(); });
  vid.addEventListener('progress', syncBuf);
  vid.addEventListener('volumechange', syncVol);
  vid.addEventListener('waiting', () => wrap.classList.add('is-buffering'));
  ['playing', 'canplay', 'seeked'].forEach(e => vid.addEventListener(e, () => wrap.classList.remove('is-buffering')));
  vid.addEventListener('ratechange', () => {
    $('.nxp-speed-btn span').textContent = vid.playbackRate + 'x';
    ui.querySelectorAll('.nxp-menu button').forEach(b => b.classList.toggle('is-on', +b.dataset.speed === vid.playbackRate));
  });
  if (vid.textTracks) vid.textTracks.addEventListener?.('addtrack', syncCC);

  // ── Einblenden / Ausblenden ──
  let hideT = null;
  function showUi(keep) { wrap.classList.add('nxp-show'); clearTimeout(hideT); if (!keep && !vid.paused) hideSoon(); }
  function hideSoon() { clearTimeout(hideT); hideT = setTimeout(() => { if (!vid.paused && !ui.querySelector('.nxp-menu:not([hidden])') && !dragging) wrap.classList.remove('nxp-show'); }, 2600); }
  wrap.addEventListener('mousemove', () => showUi());
  wrap.addEventListener('mouseleave', () => { if (!vid.paused) wrap.classList.remove('nxp-show'); });

  // ── Aktionen ──
  const act = {
    play: () => { if (vid.paused) vid.play().catch(() => {}); else vid.pause(); },
    back: () => { vid.currentTime = Math.max(0, vid.currentTime - 10); flash('l'); },
    fwd: () => { vid.currentTime = Math.min(vid.duration || 0, vid.currentTime + 10); flash('r'); },
    mute: () => { vid.muted = !vid.muted; if (!vid.muted && vid.volume === 0) vid.volume = 0.5; },
    cc: () => { if (typeof toggleSubtitles === 'function') toggleSubtitles(); else { const t = Array.from(vid.textTracks || [])[0]; if (t) t.mode = t.mode === 'showing' ? 'hidden' : 'showing'; } setTimeout(syncCC, 50); },
    speed: () => { const m = $('.nxp-menu'); m.hidden = !m.hidden; },
    pip: async () => { try { if (document.pictureInPictureElement) await document.exitPictureInPicture(); else await vid.requestPictureInPicture(); } catch {} },
    fs: () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (fsEl) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      if (wrap.requestFullscreen) wrap.requestFullscreen().catch(() => {});
      else if (wrap.webkitRequestFullscreen) wrap.webkitRequestFullscreen();
      else if (vid.webkitEnterFullscreen) vid.webkitEnterFullscreen(); // iPhone
    },
    cast: () => {}, // wird von _setupCastButtonFor belegt
  };
  ui.addEventListener('click', e => {
    const b = e.target.closest('[data-a]');
    if (b && b.dataset.a !== 'cast') { e.stopPropagation(); act[b.dataset.a]?.(); showUi(); return; }
    const sp = e.target.closest('[data-speed]');
    if (sp) { e.stopPropagation(); if (+sp.dataset.speed > 2 && !isPrem()) { showToast(tr({ en: 'Speeds above 2x are a Premium feature.', de: 'Geschwindigkeiten über 2x sind ein Premium-Feature.' }), 'info'); return; } vid.playbackRate = +sp.dataset.speed; if (typeof setVideoSpeed === 'function') { try { setVideoSpeed(+sp.dataset.speed); } catch {} } $('.nxp-menu').hidden = true; return; }
  });
  document.addEventListener('fullscreenchange', () => {
    const on = document.fullscreenElement === wrap;
    wrap.classList.toggle('is-fs', on);
    const i = $('[data-a="fs"] i'); if (i) i.className = 'fas ' + (on ? 'fa-compress' : 'fa-expand');
  });
  volR.addEventListener('input', () => { vid.volume = +volR.value; vid.muted = +volR.value === 0; });

  // ── Klick/Tippen auf das Video ──
  let lastTap = 0, tapT = null;
  const surface = ui;
  surface.addEventListener('pointerup', e => {
    if (e.target.closest('.nxp-bar') || e.target.closest('.nxp-big')) return;
    const touch = e.pointerType === 'touch';
    const now = Date.now();
    const rect = wrap.getBoundingClientRect();
    const side = (e.clientX - rect.left) / rect.width;
    if (now - lastTap < 300) {
      clearTimeout(tapT); lastTap = 0;
      if (touch && side < 0.35) act.back();
      else if (touch && side > 0.65) act.fwd();
      else act.fs();
      return;
    }
    lastTap = now;
    tapT = setTimeout(() => {
      if (touch) { if (wrap.classList.contains('nxp-show') && !vid.paused) wrap.classList.remove('nxp-show'); else showUi(); }
      else act.play();
    }, touch ? 260 : 200);
  });
  function flash(side) {
    const h = $(`.nxp-seekhint--${side}`);
    h.classList.remove('is-on'); void h.offsetWidth; h.classList.add('is-on');
  }

  // ── Fortschrittsleiste (Maus + Touch) ──
  let dragging = false;
  const posAt = x => { const r = prog.getBoundingClientRect(); return Math.min(1, Math.max(0, (x - r.left) / r.width)); };
  const preview = x => { const p = posAt(x); tip.textContent = _fmtTime(p * (vid.duration || 0)); tip.style.left = (p * 100) + '%'; };
  prog.addEventListener('pointerdown', e => {
    dragging = true; prog.setPointerCapture(e.pointerId); wrap.classList.add('is-seeking');
    const p = posAt(e.clientX); fill.style.width = thumb.style.left = (p * 100) + '%'; preview(e.clientX);
  });
  prog.addEventListener('pointermove', e => {
    preview(e.clientX);
    if (dragging) { const p = posAt(e.clientX); fill.style.width = thumb.style.left = (p * 100) + '%'; cur.textContent = _fmtTime(p * (vid.duration || 0)); }
  });
  const endDrag = e => {
    if (!dragging) return;
    dragging = false; wrap.classList.remove('is-seeking');
    if (vid.duration) vid.currentTime = posAt(e.clientX) * vid.duration;
    hideSoon();
  };
  prog.addEventListener('pointerup', endDrag);
  prog.addEventListener('pointercancel', () => { dragging = false; wrap.classList.remove('is-seeking'); });
  prog.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') act.back(); if (e.key === 'ArrowRight') act.fwd(); });

  // ── Tastatur (nur wenn kein Eingabefeld fokussiert ist) ──
  const onKey = e => {
    if (!document.body.contains(vid)) { document.removeEventListener('keydown', onKey); return; }
    const tag = (document.activeElement?.tagName || '').toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag) || document.activeElement?.isContentEditable) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    const map = { ' ': 'play', k: 'play', j: 'back', l: 'fwd', arrowleft: 'back', arrowright: 'fwd', m: 'mute', f: 'fs', c: 'cc' };
    if (map[k]) { e.preventDefault(); act[map[k]](); showUi(); }
    else if (k === 'arrowup') { e.preventDefault(); vid.volume = Math.min(1, vid.volume + 0.1); vid.muted = false; showUi(); }
    else if (k === 'arrowdown') { e.preventDefault(); vid.volume = Math.max(0, vid.volume - 0.1); showUi(); }
  };
  document.addEventListener('keydown', onKey);
  document.addEventListener('click', e => { if (!ui.contains(e.target)) { const m = ui.querySelector('.nxp-menu'); if (m) m.hidden = true; } });

  // ── Nutzer-Voreinstellungen aus den Einstellungen (Wiedergabe) ──
  try {
    const prefSpeed = parseFloat(localStorage.getItem('nxd_default_speed') || '1');
    if (prefSpeed && prefSpeed !== 1 && (prefSpeed <= 2 || isPrem())) {
      vid.playbackRate = prefSpeed;
      vid.addEventListener('loadedmetadata', () => { vid.playbackRate = prefSpeed; }, { once: true });
    }
    const prefVol = localStorage.getItem('nxd_default_volume');
    if (prefVol !== null && !isNaN(+prefVol)) vid.volume = Math.min(1, Math.max(0, +prefVol));
    if (localStorage.getItem('nxd_remember_volume') !== 'false') {
      vid.addEventListener('volumechange', () => { try { if (!vid.muted) localStorage.setItem('nxd_default_volume', String(vid.volume)); } catch {} });
    }
    if (localStorage.getItem('nxd_auto_captions') === 'true') {
      const turnOn = () => { const t = Array.from(vid.textTracks || []).find(t => t.kind === 'subtitles' || t.kind === 'captions'); if (t && t.mode !== 'showing') { t.mode = 'showing'; syncCC(); } };
      vid.textTracks?.addEventListener?.('addtrack', () => setTimeout(turnOn, 50));
      vid.addEventListener('loadedmetadata', () => setTimeout(turnOn, 300), { once: true });
    }
  } catch {}

  syncPlay(); syncTime(); syncVol(); syncCC();
  showUi(true);
}

// Livestream auf den Fernseher streamen (nutzt die HLS-Version des Streams)
function _nxCastHint() {
  if (!window.isSecureContext) return tr({ en: 'Casting needs HTTPS.', de: 'Casten funktioniert nur über HTTPS.' });
  if (/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname)) return tr({ en: 'Your TV cannot reach a local address. Use the public domain.', de: 'Dein Fernseher kann keine lokale Adresse erreichen. Nutze die öffentliche Domain.' });
  return tr({ en: 'Casting works in Chrome and Edge. On other browsers use the browser menu → "Cast".', de: 'Casten funktioniert in Chrome und Edge. In anderen Browsern über das Browser-Menü → „Streamen“.' });
}
async function nxCastLive(userId) {
  if (typeof _castApiReady === 'undefined' || !_castApiReady || typeof cast === 'undefined') { showToast(_nxCastHint(), 'info'); return; }
  const url = new URL(`/api/live/${encodeURIComponent(userId)}/index.m3u8`, location.href).href;
  try { const r = await fetch(url, { method: 'HEAD', cache: 'no-store' }); if (!r.ok) throw 0; }
  catch { showToast(tr({ en: 'The TV version of this stream is being prepared – try again in a few seconds.', de: 'Die TV-Version des Streams wird vorbereitet – versuch es in ein paar Sekunden erneut.' }), 'info'); return; }
  try {
    const context = cast.framework.CastContext.getInstance();
    if (!context.getCurrentSession()) await context.requestSession();
    const session = context.getCurrentSession();
    if (!session) return;
    const info = new chrome.cast.media.MediaInfo(url, 'application/vnd.apple.mpegurl');
    info.streamType = chrome.cast.media.StreamType.LIVE;
    if (chrome.cast.media.HlsSegmentFormat) info.hlsSegmentFormat = chrome.cast.media.HlsSegmentFormat.TS;
    info.metadata = new chrome.cast.media.GenericMediaMetadata();
    info.metadata.title = document.querySelector('.stream-title, #stream-title')?.textContent || 'Norynex Live';
    const req = new chrome.cast.media.LoadRequest(info);
    req.autoplay = true;
    await session.loadMedia(req);
    document.getElementById('stream-video')?.pause();
    showToast(tr({ en: 'Playing on ', de: 'Läuft auf ' }) + (session.getCastDevice()?.friendlyName || 'TV'), 'success');
  } catch (e) {
    if (e && (e === 'cancel' || e.code === 'cancel')) return;
    if (typeof nxCastFailed === 'function') nxCastFailed(e); else showToast(tr({ en: 'Casting failed', de: 'Casten fehlgeschlagen' }), 'error');
  }
}
