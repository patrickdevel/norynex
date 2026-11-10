/* =====================================================================
   Norynex · Aufgaben & Ränge v2
   – XP werden serverseitig geprüft (pro Video/Kanal/Kommentar nur einmal)
   – Tägliche & wöchentliche Aufgaben rotieren automatisch
   – Ausgebbare XP für den Shop
   ===================================================================== */

let _xpBusy = new Set();

// Meldet eine Aktion an den Server. ref = betroffenes Video/Kanal/Kommentar …
async function xpTrack(action, ref) {
  if (!currentUser) return;
  const key = action + ':' + (ref || '');
  if (_xpBusy.has(key)) return;
  _xpBusy.add(key);
  try {
    const res = await apiPost('/api/xp/track', { action, ref: ref == null ? undefined : String(ref) });
    if (res && res.ok) {
      showXpPopup('+' + res.xpGained + ' XP');
      currentUser.xp = res.xp;
      if (res.rankUp) setTimeout(() => showToast(tr({ en: 'New rank: ', de: 'Neuer Rang: ' }) + res.rankUp.name, 'success'), 700);
      if (currentPage === 'tasks') renderAufgabenPage(true);
    }
  } catch {}
  finally { setTimeout(() => _xpBusy.delete(key), 1500); }
}
// Kompatibilität für ältere Aufrufe
function aufgabenTrack() {}

function showXpPopup(text) {
  const el = document.createElement('div');
  el.className = 'tk-xp-pop';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1700);
}

function _tkCountdown(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return tr({ en: 'now', de: 'jetzt' });
  const d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000), m = Math.floor(ms % 3600000 / 60000);
  return d > 0 ? `${d} ${tr({ en: 'd', de: 'T' })} ${h} h` : h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function _tkQuestHtml(q) {
  const pct = Math.round(q.progress / q.target * 100);
  const state = q.claimed ? 'is-claimed' : q.done ? 'is-done' : '';
  return `<div class="tk-quest ${state}">
    <div class="tk-quest-ico"><i class="fas ${q.claimed ? 'fa-check' : q.icon}"></i></div>
    <div class="tk-quest-main">
      <div class="tk-quest-top"><b>${escHtml(q.title)}</b><span class="tk-quest-xp">+${q.xp} XP</span></div>
      <div class="tk-quest-desc">${escHtml(q.desc)}</div>
      <div class="tk-bar"><i style="width:${pct}%"></i></div>
      <div class="tk-quest-foot">
        <span>${q.progress} / ${q.target}</span>
        ${q.claimed ? `<span class="tk-muted">${tr({ en: 'Collected', de: 'Abgeholt' })}</span>`
          : q.done ? `<button class="tk-claim" data-h-click="h_tasks_pro_claimQuest_57" data-hv-click="${nxHv(String(q.id))}">${tr({ en: 'Collect', de: 'Abholen' })}</button>`
          : `<span class="tk-muted">${pct}%</span>`}
      </div>
    </div>
  </div>`;
}

async function claimQuest(id, btn) {
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    const r = await apiPost(`/api/xp/quests/${id}/claim`);
    showXpPopup('+' + r.xpGained + ' XP');
    if (r.rankUp) showToast(tr({ en: 'New rank: ', de: 'Neuer Rang: ' }) + r.rankUp.name, 'success');
    renderAufgabenPage(true);
  } catch (e) { showToast(e.message, 'error'); if (btn) { btn.disabled = false; btn.textContent = tr({ en: 'Collect', de: 'Abholen' }); } }
}

const TK_ACTION_LABEL = {
  login: ['fa-right-to-bracket', { de: 'Täglich einloggen', en: 'Daily login' }, { de: '+3 XP je Tag Serie', en: '+3 XP per streak day' }],
  like: ['fa-thumbs-up', { de: 'Video liken', en: 'Like a video' }, { de: 'einmal pro Video', en: 'once per video' }],
  comment: ['fa-comment', { de: 'Kommentieren', en: 'Comment' }, { de: 'min. 3 Zeichen', en: 'min. 3 characters' }],
  watch: ['fa-play', { de: '10 Minuten schauen', en: 'Watch 10 minutes' }, { de: 'echte Wiedergabe', en: 'real playback' }],
  share: ['fa-share-nodes', { de: 'Video teilen', en: 'Share a video' }, { de: 'einmal pro Video/Tag', en: 'once per video/day' }],
  subscribe: ['fa-user-plus', { de: 'Kanal abonnieren', en: 'Subscribe' }, { de: 'einmal pro Kanal', en: 'once per channel' }],
  upload: ['fa-cloud-arrow-up', { de: 'Video hochladen', en: 'Upload a video' }, { de: 'eigene Videos', en: 'own videos' }],
  post: ['fa-pen', { de: 'Beitrag schreiben', en: 'Write a post' }, { de: 'Community-Tab', en: 'community tab' }],
  live: ['fa-tower-broadcast', { de: 'Livestream schauen', en: 'Watch a livestream' }, { de: 'einmal pro Stream/Tag', en: 'once per stream/day' }],
  party: ['fa-users', { de: 'Watch Party starten', en: 'Start a watch party' }, { de: '', en: '' }],
  short: ['fa-mobile-screen', { de: 'Short ansehen', en: 'Watch a short' }, { de: 'einmal pro Short', en: 'once per short' }],
};

async function renderAufgabenPage(silent) {
  const el = document.getElementById('page-tasks');
  if (!el) return;
  if (!currentUser) {
    el.innerHTML = emptyState('fa-lock', t('login_required'), t('login_required_tasks')) + `<div style="text-align:center;margin-top:-20px"><button class="btn-primary" data-h-click="h_tasks_pro_openAuthModal_92">${t('login_btn')}</button></div>`;
    return;
  }
  if (!silent) el.innerHTML = '<div class="tk"><div class="ax-skel" style="height:150px;margin-bottom:14px"></div><div class="ax-skel" style="height:320px"></div></div>';
  let d, board = [], inv = null;
  try {
    [d, board, inv] = await Promise.all([apiGet('/api/xp/me'), apiGet('/api/xp/leaderboard').catch(() => []), apiGet('/api/invite/stats').catch(() => null)]);
  } catch (e) {
    el.innerHTML = `<div class="tk"><div class="ax-card ax-empty"><i class="fas fa-triangle-exclamation"></i>${escHtml(e.message)}<div style="margin-top:12px"><button class="ax-btn" data-h-click="h_tasks_pro_renderAufgabenPage_100">${tr({ en: 'Retry', de: 'Erneut versuchen' })}</button></div></div></div>`;
    return;
  }
  const tab = window._tkTab || 'quests';
  const r = d.rank, n = d.nextRank;
  const pct = n ? Math.round((d.xp - r.minXP) / (n.minXP - r.minXP) * 100) : 100;
  const openClaims = [...d.daily.quests, ...d.weekly.quests].filter(q => q.done && !q.claimed).length;
  const invUrl = inv ? (inv.inviteUrl || `${location.origin}/?ref=${inv.inviteCode}`) : '';

  el.innerHTML = `
  <div class="tk">
    <div class="tk-head">
      <div class="tk-rank">
        <div class="tk-rank-ico" style="--c:${r.color}"><i class="fas ${r.icon}"></i></div>
        <div class="tk-rank-main">
          <small>${tr({ en: 'Your rank', de: 'Dein Rang' })}</small>
          <h2 style="color:${r.color}">${escHtml(r.name)}</h2>
          <div class="tk-bar tk-bar--lg"><i style="width:${pct}%;background:${r.color}"></i></div>
          <div class="tk-rank-sub">${n ? `${d.xp.toLocaleString('de-DE')} XP · ${tr({ en: 'next', de: 'noch' })} <b>${(n.minXP - d.xp).toLocaleString('de-DE')} XP</b> ${tr({ en: 'to', de: 'bis' })} ${escHtml(n.name)}` : tr({ en: 'Highest rank reached', de: 'Höchster Rang erreicht' })}</div>
        </div>
      </div>
      <div class="tk-stats">
        <div><b>${d.xp.toLocaleString('de-DE')}</b><span>${tr({ en: 'Total XP', de: 'Gesamt-XP' })}</span></div>
        <div><b>${d.xpAvailable.toLocaleString('de-DE')}</b><span>${tr({ en: 'Spendable', de: 'Ausgebbar' })}</span></div>
        <div><b>${d.loginStreak + 1}</b><span>${tr({ en: 'Day streak', de: 'Tage in Folge' })}</span></div>
      </div>
      <button class="tk-shop-btn" data-h-click="h_tasks_pro_navigateTo_124"><i class="fas fa-store"></i> ${tr({ en: 'Spend XP in the shop', de: 'XP im Shop ausgeben' })}</button>
    </div>

    <div class="tk-tabs" role="tablist">
      ${[['quests', 'fa-list-check', tr({ en: 'Quests', de: 'Aufgaben' }), openClaims], ['earn', 'fa-bolt', tr({ en: 'Earn XP', de: 'XP verdienen' })], ['ranks', 'fa-layer-group', tr({ en: 'Ranks', de: 'Ränge' })], ['board', 'fa-ranking-star', tr({ en: 'Leaderboard', de: 'Bestenliste' })], ['invite', 'fa-user-plus', tr({ en: 'Invite', de: 'Einladen' })]]
        .map(([k, i, l, c]) => `<button class="${tab === k ? 'is-active' : ''}" data-h-click="h_tasks_pro_s_131" data-hv-click="${nxHv(String(k))}"><i class="fas ${i}"></i><span>${l}</span>${c ? `<em>${c}</em>` : ''}</button>`).join('')}
    </div>

    ${tab === 'quests' ? `
      <div class="tk-grid2">
        <section class="tk-card">
          <div class="tk-card-head"><h3>${tr({ en: 'Daily', de: 'Täglich' })}</h3><span class="tk-timer"><i class="far fa-clock"></i> ${tr({ en: 'new in', de: 'neu in' })} ${_tkCountdown(d.daily.endsAt)}</span></div>
          ${d.daily.quests.map(_tkQuestHtml).join('')}
        </section>
        <section class="tk-card">
          <div class="tk-card-head"><h3>${tr({ en: 'Weekly', de: 'Wöchentlich' })}</h3><span class="tk-timer"><i class="far fa-clock"></i> ${tr({ en: 'new in', de: 'neu in' })} ${_tkCountdown(d.weekly.endsAt)}</span></div>
          ${d.weekly.quests.map(_tkQuestHtml).join('')}
        </section>
      </div>` : ''}

    ${tab === 'earn' ? `
      <section class="tk-card">
        <div class="tk-card-head"><h3>${tr({ en: 'Ways to earn XP', de: 'So verdienst du XP' })}</h3><span class="tk-timer">${tr({ en: 'limits reset daily', de: 'Limits gelten pro Tag' })}</span></div>
        <div class="tk-actions">
          ${d.actions.map(a => { const L = TK_ACTION_LABEL[a.id] || ['fa-star', { de: a.id, en: a.id }, { de: '', en: '' }]; const full = a.today >= a.perDay; return `
            <div class="tk-action ${full ? 'is-full' : ''}">
              <i class="fas ${L[0]}"></i>
              <div class="tk-action-main"><b>${escHtml(tr(L[1]))}</b><span>${escHtml(tr(L[2]))}</span></div>
              <div class="tk-action-right"><b>+${a.xp}</b><span>${a.today}/${a.perDay}</span></div>
            </div>`; }).join('')}
        </div>
      </section>` : ''}

    ${tab === 'ranks' ? `
      <section class="tk-ranks">
        ${d.ranks.map(x => { const cur = x.id === r.id, un = d.xp >= x.minXP; return `
          <div class="tk-rank-item ${cur ? 'is-current' : ''} ${un ? '' : 'is-locked'}" style="--c:${x.color}">
            <div class="tk-rank-ico"><i class="fas ${un ? x.icon : 'fa-lock'}"></i></div>
            <div><b>${escHtml(x.name)}</b><span>${x.minXP.toLocaleString('de-DE')} XP</span></div>
            ${cur ? `<em>${tr({ en: 'Current', de: 'Aktuell' })}</em>` : ''}
          </div>`; }).join('')}
      </section>` : ''}

    ${tab === 'board' ? `
      <section class="tk-card">
        <div class="tk-card-head"><h3>${tr({ en: 'Top 10', de: 'Top 10' })}</h3></div>
        ${board.length ? board.map(u => `
          <div class="tk-board-row ${currentUser && u.id === currentUser.id ? 'is-me' : ''}" data-h-click="h_tasks_pro_navigateTo_173" data-hv-click="${nxHv(String(u.id))}">
            <span class="tk-pos">${u.rank}</span>
            ${buildAvatarHtml({ displayName: u.displayName, avatar: u.avatar }, 34, { noVideo: true })}
            <div class="tk-board-main"><b>${escHtml(u.displayName)}</b><span style="color:${u.tier?.color || 'inherit'}">${escHtml(u.tier?.name || '')}</span></div>
            <span class="tk-board-xp">${u.xp.toLocaleString('de-DE')} XP</span>
          </div>`).join('') : `<div class="ax-empty"><i class="fas fa-ranking-star"></i>${tr({ en: 'No entries yet', de: 'Noch keine Einträge' })}</div>`}
      </section>` : ''}

    ${tab === 'invite' ? `
      <section class="tk-card">
        <div class="tk-card-head"><h3>${tr({ en: 'Invite friends', de: 'Freunde einladen' })}</h3><span class="tk-timer">+200 XP ${tr({ en: 'per sign-up', de: 'pro Anmeldung' })}</span></div>
        ${inv ? `
        <div class="tk-invite">
          <input readonly value="${escHtml(invUrl)}" data-h-click="h_tasks_pro_select_186">
          <button class="ax-btn ax-btn--primary" data-h-click="h_tasks_pro_writeText_186" data-hv-click="${nxHv(String(escJs(invUrl)), String(escJs(tr({ en: 'Link copied', de: 'Link kopiert' }))))}"><i class="fas fa-copy"></i> ${tr({ en: 'Copy', de: 'Kopieren' })}</button>
        </div>
        <div class="tk-share">
          <a href="https://wa.me/?text=${encodeURIComponent(invUrl)}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a>
          <a href="https://t.me/share/url?url=${encodeURIComponent(invUrl)}" target="_blank" rel="noopener"><i class="fab fa-telegram"></i> Telegram</a>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(invUrl)}" target="_blank" rel="noopener"><i class="fab fa-x-twitter"></i> X</a>
        </div>
        <div class="tk-invite-stats"><div><b>${inv.totalInvites}</b><span>${tr({ en: 'Invited', de: 'Eingeladen' })}</span></div><div><b>${(inv.totalInvites * 200).toLocaleString('de-DE')}</b><span>XP</span></div></div>
        ${(inv.invites || []).map(u => `<div class="tk-board-row">${buildAvatarHtml(u, 30, { noVideo: true })}<div class="tk-board-main"><b>${escHtml(u.displayName || '')}</b><span>${timeAgo(u.createdAt)}</span></div><span class="tk-board-xp">+200 XP</span></div>`).join('')}` : `<div class="ax-empty">${t('loading_error')}</div>`}
      </section>` : ''}
  </div>`;
}

// Wird nach dem Login aufgerufen (Tages-Login-XP)
function xpTrackLogin() { xpTrack('login'); }

// ── Ereignis-Handler (v1.82: statt Inline-Handlern im HTML – CSP ohne 'unsafe-inline'; Verteiler: public/js/nx-events.js) ──
(window.NX_H = window.NX_H || {}).h_tasks_pro_claimQuest_57 = function (event, v) { claimQuest('' + NX_H.$s(v[0]) + '', this) };
(window.NX_H = window.NX_H || {}).h_tasks_pro_openAuthModal_92 = function (event, v) { openAuthModal('login') };
(window.NX_H = window.NX_H || {}).h_tasks_pro_renderAufgabenPage_100 = function (event, v) { renderAufgabenPage() };
(window.NX_H = window.NX_H || {}).h_tasks_pro_s_131 = function (event, v) { window._tkTab='' + NX_H.$s(v[0]) + '';renderAufgabenPage(true) };
(window.NX_H = window.NX_H || {}).h_tasks_pro_navigateTo_173 = function (event, v) { navigateTo('channel','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_tasks_pro_select_186 = function (event, v) { this.select() };
(window.NX_H = window.NX_H || {}).h_tasks_pro_writeText_186 = function (event, v) { navigator.clipboard.writeText('' + NX_H.$s(v[0]) + '').then(()=>showToast('' + NX_H.$s(v[1]) + '','success')) };
(window.NX_H = window.NX_H || {}).h_tasks_pro_navigateTo_124 = function (event, v) { navigateTo('shop') };
