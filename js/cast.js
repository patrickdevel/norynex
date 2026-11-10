/* =====================================================================
   Norynex Cast (v1.75) – neues System für Chromecast / Google TV / AirPlay
   ---------------------------------------------------------------------
   Ablauf beim Klick auf das Cast-Symbol:
     1. Google Cast (Chrome, Edge, Android): Geräteauswahl SOFORT im Klick öffnen
        (sonst blockiert der Browser das Fenster), parallel die Cast-Quelle vom Server holen.
        Der Server liefert absolute https-URLs der öffentlichen Domain mit eigenem Cast-Token
        (server/cast.js). Erst MP4 (spielt auf jedem Gerät), sonst HLS.
     2. Safari / iPhone / iPad: AirPlay-Auswahl.
     3. Andere Browser: Remote-Playback-API mit der MP4-Quelle.
     4. Klappt nichts: Selbsttest mit dem konkreten Grund.
   Ersetzt die alten Funktionen _castCurrentVideoViaSDK, nxCastLive und _setupCastButtonFor.
   ===================================================================== */
(function () {
  const L = (de, en) => (typeof cl === 'function' && cl() === 'en') ? en : de;
  const toast = (m, t) => { try { showToast(m, t || 'info'); } catch { console.log('[Cast]', m); } };
  const cache = new Map(); // key → { at, src }
  const TTL = 60 * 60 * 1000;
  let busy = false;

  const sdkReady = () => typeof cast !== 'undefined' && !!cast.framework && typeof chrome !== 'undefined' && !!chrome.cast && !!chrome.cast.media;
  const ctx = () => { try { return cast.framework.CastContext.getInstance(); } catch { return null; } };
  // v1.79: Das Google-Cast-SDK wird erst beim ersten Klick auf „Cast“ von gstatic.com geladen
  // (Datenschutz: kein Kontakt zu Google beim normalen Seitenaufruf).
  let sdkPromise = null;
  function loadSdk() {
    if (sdkReady()) return Promise.resolve(true);
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise((resolve) => {
      const done = (ok) => { clearTimeout(t); resolve(!!ok && sdkReady()); };
      const t = setTimeout(() => done(false), 8000);
      const prev = window.__onGCastApiAvailable;
      window.__onGCastApiAvailable = function (ok) { try { prev && prev(ok); } catch {} done(ok); };
      const sc = document.createElement('script');
      sc.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
      sc.async = true;
      sc.onerror = () => { sdkPromise = null; done(false); };
      document.head.appendChild(sc);
    });
    return sdkPromise;
  }
  window.nxLoadCastSdk = loadSdk;
  const isApple = () => /iPhone|iPad|Macintosh/.test(navigator.userAgent) && !/Chrome|CriOS|Edg|Android/.test(navigator.userAgent);

  async function getJson(url) {
    const token = localStorage.getItem('nxd_token');
    const r = await fetch(url, { headers: token ? { Authorization: 'Bearer ' + token } : {}, cache: 'no-store' });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(d.error || 'Fehler'); e.status = r.status; e.retry = !!d.retry; throw e; }
    return d;
  }
  async function source(kind, id) {
    const key = kind + ':' + id;
    const c = cache.get(key);
    if (c && Date.now() - c.at < TTL && kind === 'video') return c.src;
    const src = await getJson(kind === 'video' ? `/api/cast/source/${encodeURIComponent(id)}` : `/api/cast/live-source/${encodeURIComponent(id)}`);
    cache.set(key, { at: Date.now(), src });
    return src;
  }
  // Im Hintergrund vorladen, damit der Klick sofort reagiert (wichtig für Remote Playback / AirPlay)
  function prefetch(videoId) { if (videoId) source('video', videoId).catch(() => {}); }

  function setButtons(state) {
    document.querySelectorAll('#nxd-cast-btn, .nxp-cast, #nx-cast-live-btn').forEach(b => {
      b.classList.toggle('is-casting', state === 'on');
      b.classList.toggle('is-busy', state === 'busy');
    });
  }

  /* ---------- Google Cast ---------- */
  function mediaInfo(url, type, src, live) {
    const mi = new chrome.cast.media.MediaInfo(url, type);
    mi.contentUrl = url; // neuere Empfänger (CAF) lesen contentUrl
    mi.streamType = live ? chrome.cast.media.StreamType.LIVE : chrome.cast.media.StreamType.BUFFERED;
    if (type === 'application/x-mpegurl' || type === 'application/vnd.apple.mpegurl') {
      if (chrome.cast.media.HlsSegmentFormat) mi.hlsSegmentFormat = chrome.cast.media.HlsSegmentFormat.TS;
      if (chrome.cast.media.HlsVideoSegmentFormat) mi.hlsVideoSegmentFormat = chrome.cast.media.HlsVideoSegmentFormat.MPEG2_TS;
    }
    const md = new chrome.cast.media.GenericMediaMetadata();
    md.title = src.title || 'Norynex'; md.subtitle = src.author || 'Norynex';
    if (src.poster) md.images = [new chrome.cast.Image(src.poster)];
    mi.metadata = md;
    if (src.duration && !live) mi.duration = Number(src.duration) || undefined;
    return mi;
  }
  async function loadOn(session, src, startAt, live) {
    const tries = [];
    if (!live && src.mp4) tries.push([src.mp4, 'video/mp4']);
    if (src.hls) tries.push([src.hls, 'application/x-mpegurl']);
    let lastErr = null;
    for (const [url, type] of tries) {
      const req = new chrome.cast.media.LoadRequest(mediaInfo(url, type, src, live));
      req.autoplay = true;
      if (!live && startAt > 1) req.currentTime = startAt;
      try { await session.loadMedia(req); return; } catch (e) { lastErr = e; console.warn('[Cast] Laden fehlgeschlagen', type, e); }
    }
    throw lastErr || new Error('load_media_failed');
  }
  async function viaSdk(kind, id, videoEl) {
    const c = ctx(); if (!c) throw new Error('no_sdk');
    // Geräteauswahl MUSS synchron im Klick starten – deshalb vor jedem await
    const sessionP = c.getCurrentSession() ? Promise.resolve() : c.requestSession();
    const srcP = source(kind, id);
    srcP.catch(() => {}); // Fehler wird unten beim await behandelt
    window._nxCastLoading = true;
    try { await sessionP; } finally { setTimeout(() => { window._nxCastLoading = false; }, 800); }
    const session = c.getCurrentSession(); if (!session) throw new Error('cancel');
    setButtons('busy');
    const src = await srcP;
    await loadOn(session, src, videoEl ? videoEl.currentTime || 0 : 0, kind === 'live');
    try { videoEl && videoEl.pause(); } catch {}
    setButtons('on');
    showBar(session.getCastDevice()?.friendlyName || 'TV', src.title);
    toast(L('Läuft auf ', 'Playing on ') + (session.getCastDevice()?.friendlyName || 'TV'), 'success');
  }

  /* ---------- AirPlay / Remote Playback ---------- */
  function viaNative(kind, id, videoEl) {
    if (!videoEl) return false;
    // Safari: AirPlay-Auswahl (spielt natives HLS direkt)
    if (typeof videoEl.webkitShowPlaybackTargetPicker === 'function') { videoEl.webkitShowPlaybackTargetPicker(); return true; }
    if (!videoEl.remote || typeof videoEl.remote.prompt !== 'function') return false;
    // hls.js/MSE kann der Browser nicht weiterreichen → synchron auf die MP4-Cast-Quelle umschalten
    const c = cache.get(kind + ':' + id);
    const mp4 = c && c.src && (c.src.mp4 || (kind === 'live' ? c.src.hls : null));
    if (String(videoEl.currentSrc || '').startsWith('blob:') && mp4) {
      const t = videoEl.currentTime || 0;
      try { videoEl._hls && videoEl._hls.destroy(); videoEl._hls = null; } catch {}
      videoEl.src = mp4;
      videoEl.addEventListener('loadedmetadata', () => { try { videoEl.currentTime = t; } catch {} }, { once: true });
    }
    videoEl.remote.prompt().then(() => setButtons('on')).catch(err => {
      if (err && err.name === 'AbortError') return; // Auswahl abgebrochen
      diagnose(err);
    });
    return true;
  }

  /* ---------- Steuerleiste während des Castens ---------- */
  function showBar(device, title) {
    document.getElementById('nx-cast-bar')?.remove();
    const bar = document.createElement('div');
    bar.id = 'nx-cast-bar'; bar.className = 'nx-cast-bar';
    bar.innerHTML = `<i class="fas fa-tv"></i><span>${L('Auf', 'On')} <b>${escHtml(device)}</b>${title ? ` · ${escHtml(String(title).slice(0, 60))}` : ''}</span>
      <button type="button" data-a="pp" title="${L('Pause/Weiter', 'Pause/Play')}"><i class="fas fa-pause"></i></button>
      <button type="button" data-a="stop">${L('Beenden', 'Stop')}</button>`;
    bar.addEventListener('click', e => {
      const a = e.target.closest('button')?.dataset.a; if (!a) return;
      const c = ctx(); const s = c && c.getCurrentSession();
      if (a === 'stop') { try { s && s.endSession(true); } catch {} bar.remove(); setButtons('off'); }
      if (a === 'pp') { try { const m = s && s.getMediaSession(); if (!m) return; const paused = m.playerState === chrome.cast.media.PlayerState.PAUSED; paused ? m.play(new chrome.cast.media.PlayRequest()) : m.pause(new chrome.cast.media.PauseRequest()); e.target.closest('button').innerHTML = `<i class="fas ${paused ? 'fa-pause' : 'fa-play'}"></i>`; } catch {} }
    });
    document.body.appendChild(bar);
  }

  /* ---------- Fehler → verständlicher Grund ---------- */
  function diagnose(err) {
    const code = err && (typeof err === 'string' ? err : (err.code || err.message || ''));
    if (/^cancel$/i.test(String(code))) return; // Nutzer hat die Geräteauswahl geschlossen
    if (err && err.status === 409) { toast(err.message, 'info'); return; }
    if (err && err.status === 403) { toast(err.message || L('Kein Zugriff auf dieses Video.', 'No access to this video.'), 'error'); return; }
    if (typeof window.nxCastFailed === 'function' && err && code !== 'no_sdk') window.nxCastFailed(err);
    if (typeof window.nxCastDiagnose === 'function') setTimeout(() => window.nxCastDiagnose(), 400);
  }

  /* ---------- Öffentliche API ---------- */
  async function start(kind, id, videoEl) {
    if (busy) return; busy = true;
    try {
      if (!window.isSecureContext) { toast(L('Casten funktioniert nur über https://.', 'Casting needs https://.'), 'error'); return; }
      if (sdkReady()) { await viaSdk(kind, id, videoEl); return; }
      // Chrome/Edge/Android: SDK jetzt nachladen. Die Klick-Berechtigung des Browsers hält einige
      // Sekunden – meist öffnet sich die Geräteauswahl direkt, sonst genügt ein zweiter Klick.
      if (!isApple() && !/Firefox/.test(navigator.userAgent) && typeof chrome !== 'undefined') {
        setButtons('busy');
        const ok = await loadSdk();
        if (ok) {
          try { await viaSdk(kind, id, videoEl); }
          catch (e) { if (!navigator.userActivation || navigator.userActivation.isActive) throw e; toast(L('Cast ist bereit – bitte noch einmal auf das Cast-Symbol tippen.', 'Cast is ready – please tap the cast icon again.'), 'info'); }
          return;
        }
      }
      if (viaNative(kind, id, videoEl)) return;
      if (/Firefox/.test(navigator.userAgent)) toast(L('Firefox kann nicht auf Fernseher streamen. Bitte Chrome oder Edge nutzen.', 'Firefox cannot cast. Please use Chrome or Edge.'), 'error');
      else diagnose(new Error('no_sdk'));
    } catch (e) { setButtons(ctx()?.getCurrentSession() ? 'on' : 'off'); diagnose(e); }
    finally { busy = false; if (!ctx()?.getCurrentSession()) setButtons('off'); }
  }
  const idOf = (el) => el && (el.dataset.videoId || el.closest('.short-card')?.dataset.videoId || window._currentVideoId);

  window.nxCast = { start, prefetch, video: (id, el) => start('video', id, el), live: (uid) => start('live', uid, document.getElementById('stream-video')), source };

  // Alte Einstiegspunkte auf das neue System umleiten
  window._castCurrentVideoViaSDK = async function (videoEl) { const id = idOf(videoEl); if (!id) throw new Error('Keine Video-ID'); return start('video', id, videoEl); };
  window.nxCastLive = function (userId) { return start('live', userId, document.getElementById('stream-video')); };
  window._setupCastButtonFor = function (vid, attempt) {
    attempt = attempt || 0;
    const btn = document.getElementById('nxd-cast-btn');
    if (!btn || !vid || !document.body.contains(vid)) { if (attempt < 30) setTimeout(() => window._setupCastButtonFor(vid, attempt + 1), 150); return; }
    btn.style.display = 'flex';
    const id = idOf(vid); prefetch(id);
    btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); const v = document.getElementById('main-video') || vid; start('video', idOf(v) || id, v); };
    try { if (ctx()?.getCurrentSession()) btn.classList.add('is-casting'); } catch {}
  };

  // Sitzung beendet → Leiste weg, Knöpfe zurücksetzen
  function hookSdk() {
    const c = ctx(); if (!c || hookSdk.done) return; hookSdk.done = true;
    c.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (e) => {
      if (e.sessionState === cast.framework.SessionState.SESSION_ENDED) { document.getElementById('nx-cast-bar')?.remove(); setButtons('off'); }
    });
  }
  if (sdkReady()) hookSdk();
  const prevInit = window.__nxCastInit;
  window.__nxCastInit = function (ok) { try { prevInit && prevInit(ok); } catch {} if (ok) hookSdk(); };
})();
