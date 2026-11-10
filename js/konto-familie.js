// ⚠️  AUTOMATISCH ERZEUGT aus client/konto-familie/*.js — bitte NICHT hier bearbeiten, sondern dort; danach "npm run build".
// ─── Teil: client/konto-familie/010-start.js ───
/* =====================================================================
   Norynex v1.69
   - Nutzer blockieren (Kanal, Nachrichten, Einstellungen)
   - Echte Playlists (anlegen, Videos hinzufügen, Playlist-Seite, Kanal-Tab)
   - Altersabfrage nach der Registrierung, Kinderkonto, Kindersicherung mit Eltern-Code
   ===================================================================== */

/* ---------- kleine Helfer ---------- */
function nxL(o) { return tr(o); }
async function nxRefreshMe() {
  try {
    const me = await apiGet('/api/auth/me');
    currentUser = me;
    localStorage.setItem('nxd_user', JSON.stringify(me));
    return me;
  } catch { return currentUser; }
}
function nxModal({ id, title, sub, body, foot, wide, onClose, closable = true }) {
  document.getElementById(id)?.remove();
  const ov = document.createElement('div');
  ov.id = id;
  ov.className = 'nxv-overlay';
  ov.innerHTML = `
    <div class="nx-modal${wide ? ' nx-modal-wide' : ''}" role="dialog" aria-modal="true">
      <div class="nx-modal-head">
        <div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>
        ${closable ? `<button class="nx-modal-x" data-x aria-label="${escHtml(nxL({ en: 'Close', de: 'Schließen' }))}"><i class="fas fa-xmark"></i></button>` : ''}
      </div>
      <div class="nx-modal-body">${body}</div>
      ${foot ? `<div class="nx-modal-foot">${foot}</div>` : ''}
    </div>`;
  document.body.appendChild(ov);
  const close = () => { ov.remove(); document.removeEventListener('keydown', esc); onClose?.(); };
  const esc = e => { if (e.key === 'Escape' && closable) close(); };
  if (closable) {
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    ov.querySelector('[data-x]')?.addEventListener('click', close);
    document.addEventListener('keydown', esc);
  }
  ov._close = close;
  return ov;
}
// Kleines Aufklapp-Menü an einem Knopf
function nxPopover(anchor, items) {
  document.getElementById('nx-pop')?.remove();
  const pop = document.createElement('div');
  pop.id = 'nx-pop';
  pop.className = 'nx-pop';
  pop.innerHTML = items.filter(Boolean).map((it, i) => `<button data-i="${i}" class="${it.danger ? 'is-danger' : ''}"><i class="fas ${it.icon}"></i><span>${it.label}</span></button>`).join('');
  document.body.appendChild(pop);
  const r = anchor.getBoundingClientRect();
  const w = pop.offsetWidth, h = pop.offsetHeight;
  let left = Math.min(window.innerWidth - w - 8, Math.max(8, r.right - w));
  let top = r.bottom + 6;
  if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
  pop.style.left = left + 'px'; pop.style.top = top + 'px';
  const list = items.filter(Boolean);
  pop.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (!b) return; pop.remove(); list[+b.dataset.i].run(); });
  setTimeout(() => document.addEventListener('pointerdown', function h(e) { if (!pop.contains(e.target)) { pop.remove(); document.removeEventListener('pointerdown', h); } }), 0);
}

/* =====================================================================
   BLOCKIEREN
   ===================================================================== */
function nxIsBlocked(userId) { return !!(currentUser && Array.isArray(currentUser.blockedUsers) && currentUser.blockedUsers.includes(userId)); }
async function nxAfterBlockChange() { await nxRefreshMe(); }
async function nxToggleBlock(userId, block, name) {
  if (!currentUser) { openAuthModal('login'); return; }
  if (block && !confirm(nxL({ en: `Block ${name || 'this person'}? They can’t message you or comment on your content, and you won’t see their videos.`, de: `${name || 'Diese Person'} blockieren? Sie kann dir nicht mehr schreiben und nicht bei dir kommentieren, und du siehst ihre Videos nicht mehr.` }))) return;
  try {
    await apiPost(`/api/users/${encodeURIComponent(userId)}/block`, { blocked: !!block });
    await nxRefreshMe();
    showToast(block ? nxL({ en: 'Blocked', de: 'Blockiert' }) : nxL({ en: 'Unblocked', de: 'Blockierung aufgehoben' }), 'success');
    if (currentPage === 'channel' || currentPage === 'messages') refreshCurrentPage();
  } catch (e) { showToast(e.message, 'error'); }
}
function nxChannelMenu(btn, userId, name) {
  const blocked = nxIsBlocked(userId);
  nxPopover(btn, [
    { icon: 'fa-link', label: nxL({ en: 'Copy channel link', de: 'Kanal-Link kopieren' }), run: () => { navigator.clipboard?.writeText(location.origin + '/channel/' + userId); showToast(nxL({ en: 'Link copied', de: 'Link kopiert' }), 'success'); } },
    { icon: 'fa-flag', label: nxL({ en: 'Report channel', de: 'Kanal melden' }), run: () => openReportModal('user', userId, name) },
    { icon: blocked ? 'fa-lock-open' : 'fa-ban', label: blocked ? nxL({ en: 'Unblock', de: 'Blockierung aufheben' }) : nxL({ en: 'Block', de: 'Blockieren' }), danger: !blocked, run: () => nxToggleBlock(userId, !blocked, name) },
  ]);
}
function nxDmMenu(btn, userId, name) {
  const blocked = nxIsBlocked(userId);
  nxPopover(btn, [
    { icon: 'fa-user', label: nxL({ en: 'View channel', de: 'Kanal ansehen' }), run: () => navigateTo('channel', userId) },
    { icon: blocked ? 'fa-lock-open' : 'fa-ban', label: blocked ? nxL({ en: 'Unblock', de: 'Blockierung aufheben' }) : nxL({ en: 'Block', de: 'Blockieren' }), danger: !blocked, run: () => nxToggleBlock(userId, !blocked, name) },
    { icon: 'fa-trash-can', label: nxL({ en: 'Delete conversation', de: 'Unterhaltung löschen' }), danger: true, run: () => _dmDeleteConv(userId) },
  ]);
}
async function nxOpenBlockedList() {
  const ov = nxModal({ id: 'nx-blocked-modal', title: nxL({ en: 'Blocked users', de: 'Blockierte Nutzer' }), sub: nxL({ en: 'Blocked people can’t message you, comment on your content or subscribe to you.', de: 'Blockierte Personen können dir nicht schreiben, nicht bei dir kommentieren und dich nicht abonnieren.' }), body: `<div class="nx-list" id="nx-blocked-list"><div class="dm-loading"><i class="fas fa-circle-notch fa-spin"></i></div></div>` });
  const draw = async () => {
    const box = ov.querySelector('#nx-blocked-list');
    let list = [];
    try { list = await apiGet('/api/users/me/blocked'); } catch (e) { box.innerHTML = `<p class="nx-muted">${escHtml(e.message)}</p>`; return; }
    if (!list.length) { box.innerHTML = `<div class="wh-empty"><div class="wh-empty-icon"><i class="fas fa-user-check"></i></div><strong>${nxL({ en: 'Nobody blocked', de: 'Niemand blockiert' })}</strong><p>${nxL({ en: 'You can block people from their channel or a conversation.', de: 'Du kannst Personen über ihren Kanal oder eine Unterhaltung blockieren.' })}</p></div>`; return; }
    box.innerHTML = list.map(u => `<div class="nx-list-row">${buildAvatarHtml(u, 38, { noVideo: true })}<div class="nx-list-main"><strong>${escHtml(u.displayName || u.username)}</strong><span>@${escHtml(u.username)}</span></div><button class="st-btn" data-unblock="${u.id}">${nxL({ en: 'Unblock', de: 'Aufheben' })}</button></div>`).join('');
    box.querySelectorAll('[data-unblock]').forEach(b => b.addEventListener('click', async () => {
      b.disabled = true;
      try { await apiPost(`/api/users/${b.dataset.unblock}/block`, { blocked: false }); await nxRefreshMe(); draw(); } catch (e) { showToast(e.message, 'error'); b.disabled = false; }
    }));
  };
  draw();
}

/* =====================================================================
   PLAYLISTS
   ===================================================================== */
const NX_VIS = {
  public: { icon: 'fa-globe', en: 'Public', de: 'Öffentlich' },
  unlisted: { icon: 'fa-link', en: 'Unlisted', de: 'Nicht gelistet' },
  private: { icon: 'fa-lock', en: 'Private', de: 'Privat' },
};
function nxVisSelect(id, value = 'public') {
  return `<select class="st-select" id="${id}" style="width:100%">${Object.entries(NX_VIS).map(([k, v]) => `<option value="${k}" ${k === value ? 'selected' : ''}>${nxL(v)}</option>`).join('')}</select>`;
}
async function nxOpenAddToPlaylist(videoId) {
  if (!currentUser) { openAuthModal('login'); return; }
  const ov = nxModal({
    id: 'nx-pl-add', title: nxL({ en: 'Save to playlist', de: 'Zu Playlist hinzufügen' }),
    body: `<div class="nx-list" id="nx-pl-list"><div class="dm-loading"><i class="fas fa-circle-notch fa-spin"></i></div></div>
      <div class="nx-pl-new" id="nx-pl-new">
        <button class="st-btn" id="nx-pl-new-btn" style="width:100%"><i class="fas fa-plus"></i> ${nxL({ en: 'New playlist', de: 'Neue Playlist' })}</button>
      </div>`,
  });
  const draw = async () => {
    const box = ov.querySelector('#nx-pl-list');
    let list = [];
    try { list = await apiGet('/api/playlists/mine?videoId=' + encodeURIComponent(videoId)); } catch (e) { box.innerHTML = `<p class="nx-muted">${escHtml(e.message)}</p>`; return; }
    if (!list.length) { box.innerHTML = `<p class="nx-muted" style="padding:6px 2px 12px">${nxL({ en: 'You have no playlists yet.', de: 'Du hast noch keine Playlists.' })}</p>`; return; }
    box.innerHTML = list.map(p => `<label class="nx-check-row"><input type="checkbox" data-pl="${p.id}" ${p.containsVideo ? 'checked' : ''}><span class="nx-check-main"><strong>${escHtml(p.title)}</strong><span>${p.count} Videos</span></span><i class="fas ${NX_VIS[p.visibility]?.icon || 'fa-globe'} nx-check-vis" title="${escHtml(nxL(NX_VIS[p.visibility] || NX_VIS.public))}"></i></label>`).join('');
    box.querySelectorAll('input[data-pl]').forEach(cb => cb.addEventListener('change', async () => {
      cb.disabled = true;
      try {
        const r = await apiPost(`/api/playlists/${cb.dataset.pl}/videos`, { videoId, add: cb.checked });
        showToast(r.added ? nxL({ en: 'Added to playlist', de: 'Zur Playlist hinzugefügt' }) : nxL({ en: 'Removed from playlist', de: 'Aus Playlist entfernt' }), 'success');
      } catch (e) { cb.checked = !cb.checked; showToast(e.message, 'error'); }
      cb.disabled = false;
    }));
  };
  ov.querySelector('#nx-pl-new-btn').addEventListener('click', () => {
    ov.querySelector('#nx-pl-new').innerHTML = `
      <div class="gs-field"><span>${nxL({ en: 'Name', de: 'Name' })}</span><input type="text" id="nx-pl-title" maxlength="100" placeholder="${escHtml(nxL({ en: 'e.g. Favourites', de: 'z. B. Lieblingsvideos' }))}"></div>
      <div class="gs-field" style="margin-top:10px"><span>${nxL({ en: 'Visibility', de: 'Sichtbarkeit' })}</span>${nxVisSelect('nx-pl-vis')}</div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px"><button class="st-btn st-btn-primary" id="nx-pl-create">${nxL({ en: 'Create', de: 'Erstellen' })}</button></div>`;
    const inp = ov.querySelector('#nx-pl-title'); inp.focus();
    const create = async () => {
      const title = inp.value.trim();
      if (!title) { inp.focus(); return; }
      try {
        await apiPost('/api/playlists', { title, visibility: ov.querySelector('#nx-pl-vis').value, videoId });
        showToast(nxL({ en: 'Playlist created', de: 'Playlist erstellt' }), 'success');
        ov.querySelector('#nx-pl-new').innerHTML = `<button class="st-btn" id="nx-pl-new-btn2" style="width:100%"><i class="fas fa-plus"></i> ${nxL({ en: 'New playlist', de: 'Neue Playlist' })}</button>`;
        ov.querySelector('#nx-pl-new-btn2').addEventListener('click', () => { ov._close(); nxOpenAddToPlaylist(videoId); });
        draw();
      } catch (e) { showToast(e.message, 'error'); }
    };
    ov.querySelector('#nx-pl-create').addEventListener('click', create);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') create(); });
  });
  draw();
}

function nxPlaylistCard(p) {
  return `<div class="nx-pl-card" data-h-click="h_konto_familie_navigateTo_168" data-hv-click="${nxHv(String(p.id))}">
    <div class="nx-pl-thumb">
      ${p.thumbnailPath ? `<img src="${escHtml(p.thumbnailPath)}" alt="" loading="lazy" data-h-error="h_konto_familie_remove_170">` : '<i class="fas fa-list-ul"></i>'}
      <span class="nx-pl-count"><i class="fas fa-list-ul"></i> ${p.count}</span>
    </div>
    <div class="nx-pl-info">
      <strong>${escHtml(p.title)}</strong>
      <span><i class="fas ${NX_VIS[p.visibility]?.icon || 'fa-globe'}"></i> ${escHtml(nxL(NX_VIS[p.visibility] || NX_VIS.public))} · ${nxL({ en: 'updated', de: 'aktualisiert' })} ${timeAgo(p.updatedAt)}</span>
    </div>
  </div>`;
}
async function nxRenderChannelPlaylists(content, user) {
  content.innerHTML = `<div class="dm-loading"><i class="fas fa-circle-notch fa-spin"></i></div>`;
  try {
    const list = await apiGet(`/api/users/${encodeURIComponent(user.id)}/playlists`);
    if (!list.length) { content.innerHTML = emptyState('fa-list-ul', nxL({ en: 'No playlists', de: 'Keine Playlists' }), ''); return; }
    content.innerHTML = `<div class="nx-pl-grid">${list.map(nxPlaylistCard).join('')}</div>`;
  } catch (e) { content.innerHTML = feedErrorHtml(e); }
}
async function nxRenderMyPlaylistsPage() {
  const el = document.getElementById('page-playlists');
  if (!el) return;
  if (!currentUser) { el.innerHTML = `<div class="page-header"><h2>Playlists</h2></div>` + emptyState('fa-list-ul', t('login_required'), '') + `<div style="text-align:center;margin-top:-20px"><button class="btn-primary" data-h-click="h_konto_familie_openAuthModal_190">${t('btn_login')}</button></div>`; return; }
  el.innerHTML = `<div class="page-header" style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h2>${nxL({ en: 'Your playlists', de: 'Deine Playlists' })}</h2><button class="st-btn st-btn-primary" data-h-click="h_konto_familie_nxCreatePlaylistDialog_191"><i class="fas fa-plus"></i> ${nxL({ en: 'New playlist', de: 'Neue Playlist' })}</button></div><div id="nx-mypl"><div class="dm-loading"><i class="fas fa-circle-notch fa-spin"></i></div></div>`;
  try {
    const list = await apiGet('/api/playlists/mine');
    const box = document.getElementById('nx-mypl');
    box.innerHTML = list.length ? `<div class="nx-pl-grid">${list.map(nxPlaylistCard).join('')}</div>` : emptyState('fa-list-ul', nxL({ en: 'No playlists yet', de: 'Noch keine Playlists' }), nxL({ en: 'Under a video: “More” → “Save to playlist”.', de: 'Unter einem Video: „Mehr“ → „Zu Playlist hinzufügen“.' }));
  } catch (e) { document.getElementById('nx-mypl').innerHTML = feedErrorHtml(e); }
}
function nxCreatePlaylistDialog() {
  const ov = nxModal({
    id: 'nx-pl-create-modal', title: nxL({ en: 'New playlist', de: 'Neue Playlist' }),
    body: `<div class="gs-field"><span>${nxL({ en: 'Name', de: 'Name' })}</span><input type="text" id="nx-plc-title" maxlength="100"></div>
      <div class="gs-field" style="margin-top:12px"><span>${nxL({ en: 'Description (optional)', de: 'Beschreibung (optional)' })}</span><input type="text" id="nx-plc-desc" maxlength="1000"></div>
      <div class="gs-field" style="margin-top:12px"><span>${nxL({ en: 'Visibility', de: 'Sichtbarkeit' })}</span>${nxVisSelect('nx-plc-vis')}</div>`,
    foot: `<button class="st-btn" data-cancel>${t('btn_cancel')}</button><button class="st-btn st-btn-primary" data-ok>${nxL({ en: 'Create', de: 'Erstellen' })}</button>`,
  });
  ov.querySelector('#nx-plc-title').focus();
  ov.querySelector('[data-cancel]').onclick = () => ov._close();
  ov.querySelector('[data-ok]').onclick = async () => {
    const title = ov.querySelector('#nx-plc-title').value.trim();
    if (!title) return;
    try { const p = await apiPost('/api/playlists', { title, description: ov.querySelector('#nx-plc-desc').value, visibility: ov.querySelector('#nx-plc-vis').value }); ov._close(); navigateTo('playlist', p.id); }
    catch (e) { showToast(e.message, 'error'); }
  };
}
async function nxRenderPlaylistPage(id) {
  const el = document.getElementById('page-playlist');
  if (!el || !id) return;
  el.innerHTML = `<div class="dm-loading" style="padding:80px"><i class="fas fa-circle-notch fa-spin"></i></div>`;
  let pl;
  try { pl = await apiGet('/api/playlists/' + encodeURIComponent(id)); }
  catch (e) { el.innerHTML = emptyState('fa-list-ul', nxL({ en: 'Playlist not found', de: 'Playlist nicht gefunden' }), nxL({ en: 'It may be private or deleted.', de: 'Sie ist privat oder wurde gelöscht.' })); return; }
  window._nxPlaylist = pl;
  const vis = NX_VIS[pl.visibility] || NX_VIS.public;
  el.innerHTML = `
    <div class="nx-pl-page">
      <aside class="nx-pl-hero">
        <div class="nx-pl-hero-thumb">${pl.thumbnailPath ? `<img src="${escHtml(pl.thumbnailPath)}" alt="">` : '<i class="fas fa-list-ul"></i>'}</div>
        <h2>${escHtml(pl.title)}</h2>
        ${pl.owner ? `<a class="nx-pl-owner" data-h-click="h_konto_familie_navigateTo_229" data-hv-click="${nxHv(String(pl.owner.id))}">${escHtml(pl.owner.displayName || pl.owner.username)}</a>` : ''}
        <div class="nx-pl-meta"><i class="fas ${vis.icon}"></i> ${escHtml(nxL(vis))} · ${pl.count} Videos · ${nxL({ en: 'updated', de: 'aktualisiert' })} ${timeAgo(pl.updatedAt)}</div>
        ${pl.description ? `<p class="nx-pl-desc">${linkifyText(pl.description)}</p>` : ''}
        <div class="nx-pl-actions">
          <button class="st-btn st-btn-primary" ${pl.videos.length ? '' : 'disabled'} data-h-click="h_konto_familie_nxPlayPlaylist_233"><i class="fas fa-play"></i> ${nxL({ en: 'Play all', de: 'Alle abspielen' })}</button>
          <button class="st-btn" ${pl.videos.length > 1 ? '' : 'disabled'} data-h-click="h_konto_familie_nxPlayPlaylist_234"><i class="fas fa-shuffle"></i> ${nxL({ en: 'Shuffle', de: 'Zufällig' })}</button>
          <button class="nx-modal-x" title="${escHtml(nxL({ en: 'More', de: 'Mehr' }))}" data-h-click="h_konto_familie_nxPlaylistMenu_235" aria-label="${escHtml(nxL({ en: 'More', de: 'Mehr' }))}"><i class="fas fa-ellipsis"></i></button>
        </div>
      </aside>
      <section class="nx-pl-list" id="nx-pl-items"></section>
    </div>`;
  nxDrawPlaylistItems();
}
function nxDrawPlaylistItems() {
  const pl = window._nxPlaylist, box = document.getElementById('nx-pl-items');
  if (!pl || !box) return;
  if (!pl.videos.length) { box.innerHTML = emptyState('fa-film', nxL({ en: 'This playlist is empty', de: 'Diese Playlist ist leer' }), pl.isOwner ? nxL({ en: 'Under a video: “More” → “Save to playlist”.', de: 'Unter einem Video: „Mehr“ → „Zu Playlist hinzufügen“.' }) : ''); return; }
  box.innerHTML = pl.videos.map((v, i) => `
    <div class="nx-pl-item" data-h-click="h_konto_familie_navigateTo_246" data-hv-click="${nxHv(String(v.id))}">
      <span class="nx-pl-idx">${i + 1}</span>
      <div class="nx-pl-item-thumb">${v.thumbnailPath ? `<img src="${escHtml(v.thumbnailPath)}" alt="" loading="lazy" data-h-error="h_konto_familie_remove_249">` : '<i class="fas fa-film"></i>'}${!v.isShort && v.duration ? `<span>${formatDuration(v.duration)}</span>` : ''}</div>
      <div class="nx-pl-item-info"><strong>${escHtml(v.title)}</strong><span>${escHtml(v.author?.displayName || '')} · ${formatViews(v.views)} ${t('views')}</span></div>
      ${pl.isOwner ? `<div class="nx-pl-item-ctl" data-h-click="h_konto_familie_stopPropagation_251">
        <button title="${escHtml(nxL({ en: 'Move up', de: 'Nach oben' }))}" ${i === 0 ? 'disabled' : ''} data-h-click="h_konto_familie_nxMovePlaylistItem_252" data-hv-click="${nxHv(String(i))}" aria-label="${escHtml(nxL({ en: 'Move up', de: 'Nach oben' }))}"><i class="fas fa-chevron-up"></i></button>
        <button title="${escHtml(nxL({ en: 'Move down', de: 'Nach unten' }))}" ${i === pl.videos.length - 1 ? 'disabled' : ''} data-h-click="h_konto_familie_nxMovePlaylistItem_253" data-hv-click="${nxHv(String(i))}" aria-label="${escHtml(nxL({ en: 'Move down', de: 'Nach unten' }))}"><i class="fas fa-chevron-down"></i></button>
        <button title="${escHtml(nxL({ en: 'Remove', de: 'Entfernen' }))}" data-h-click="h_konto_familie_nxRemovePlaylistItem_254" data-hv-click="${nxHv(String(v.id))}" aria-label="${escHtml(nxL({ en: 'Remove', de: 'Entfernen' }))}"><i class="fas fa-xmark"></i></button>
      </div>` : ''}
    </div>`).join('');
}
function nxPlayPlaylist(shuffle) {
  const pl = window._nxPlaylist;
  if (!pl?.videos.length) return;
  const list = pl.videos.map(v => ({ id: v.id, title: v.title, thumbnailPath: v.thumbnailPath, author: { displayName: v.author?.displayName || '' } }));
  if (shuffle) for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  const [first, ...rest] = list;
  _queue = rest;
  try { sessionStorage.setItem('nxd_queue', JSON.stringify(_queue)); } catch {}
  try { localStorage.setItem('nxd_autoplay', 'true'); } catch {}
  if (typeof updateQueueBadge === 'function') updateQueueBadge();
  navigateTo('watch', first.id);
}
async function nxMovePlaylistItem(i, dir) {
  const pl = window._nxPlaylist; const j = i + dir;
  if (!pl || j < 0 || j >= pl.videos.length) return;
  [pl.videos[i], pl.videos[j]] = [pl.videos[j], pl.videos[i]];
  nxDrawPlaylistItems();
  try { await apiPatch('/api/playlists/' + pl.id, { videoIds: pl.videos.map(v => v.id) }); } catch (e) { showToast(e.message, 'error'); }
}
async function nxRemovePlaylistItem(videoId) {
  const pl = window._nxPlaylist; if (!pl) return;
  try {
    await apiPost(`/api/playlists/${pl.id}/videos`, { videoId, add: false });
    pl.videos = pl.videos.filter(v => v.id !== videoId); pl.count = pl.videos.length;
    nxDrawPlaylistItems();
  } catch (e) { showToast(e.message, 'error'); }
}
function nxPlaylistMenu(btn) {
  const pl = window._nxPlaylist; if (!pl) return;
  nxPopover(btn, [
    pl.visibility !== 'private' && { icon: 'fa-link', label: nxL({ en: 'Copy link', de: 'Link kopieren' }), run: () => { navigator.clipboard?.writeText(location.origin + '/playlist/' + pl.id); showToast(nxL({ en: 'Link copied', de: 'Link kopiert' }), 'success'); } },
    pl.isOwner && { icon: 'fa-pen', label: nxL({ en: 'Edit', de: 'Bearbeiten' }), run: () => nxEditPlaylist() },
    pl.isOwner && { icon: 'fa-trash-can', label: nxL({ en: 'Delete playlist', de: 'Playlist löschen' }), danger: true, run: async () => {
      if (!confirm(nxL({ en: 'Delete this playlist? The videos themselves are not deleted.', de: 'Playlist löschen? Die Videos selbst bleiben erhalten.' }))) return;
      try { await apiDel('/api/playlists/' + pl.id); showToast(nxL({ en: 'Playlist deleted', de: 'Playlist gelöscht' }), 'success'); navigateTo('playlists'); } catch (e) { showToast(e.message, 'error'); }
    } },
  ]);
}
function nxEditPlaylist() {
  const pl = window._nxPlaylist;
  const ov = nxModal({
    id: 'nx-pl-edit', title: nxL({ en: 'Edit playlist', de: 'Playlist bearbeiten' }),
    body: `<div class="gs-field"><span>${nxL({ en: 'Name', de: 'Name' })}</span><input type="text" id="nx-ple-title" maxlength="100" value="${escHtml(pl.title)}"></div>
      <div class="gs-field" style="margin-top:12px"><span>${nxL({ en: 'Description', de: 'Beschreibung' })}</span><input type="text" id="nx-ple-desc" maxlength="1000" value="${escHtml(pl.description || '')}"></div>
      <div class="gs-field" style="margin-top:12px"><span>${nxL({ en: 'Visibility', de: 'Sichtbarkeit' })}</span>${nxVisSelect('nx-ple-vis', pl.visibility)}</div>`,
    foot: `<button class="st-btn" data-cancel>${t('btn_cancel')}</button><button class="st-btn st-btn-primary" data-ok>${t('btn_save')}</button>`,
  });
  ov.querySelector('[data-cancel]').onclick = () => ov._close();
  ov.querySelector('[data-ok]').onclick = async () => {
    try {
      await apiPatch('/api/playlists/' + pl.id, { title: ov.querySelector('#nx-ple-title').value, description: ov.querySelector('#nx-ple-desc').value, visibility: ov.querySelector('#nx-ple-vis').value });
      ov._close(); nxRenderPlaylistPage(pl.id);
    } catch (e) { showToast(e.message, 'error'); }
  };
}
// Upload-Formular: vorhandene Playlists als Vorschläge im Playlist-Feld
document.addEventListener('focusin', async e => {
  if (e.target?.id !== 'vid-playlist' || !currentUser) return;
  const inp = e.target;
  if (!document.getElementById('vid-playlist-list')) {
    const dl = document.createElement('datalist'); dl.id = 'vid-playlist-list'; document.body.appendChild(dl);
    inp.setAttribute('list', 'vid-playlist-list');
  }
  try { const list = await apiGet('/api/playlists/mine'); document.getElementById('vid-playlist-list').innerHTML = list.map(p => `<option value="${escHtml(p.title)}"></option>`).join(''); } catch {}
});

/* =====================================================================
   ALTER, KINDERKONTO & KINDERSICHERUNG
   ===================================================================== */
const NX_AGE_TIERS = [
  { icon: 'fa-child-reaching', range: { en: 'Under 13', de: 'Unter 13' }, text: { en: 'Only with a kids account – a parent confirms by e-mail', de: 'Nur mit Kinderkonto – ein Elternteil bestätigt per E-Mail' } },
  { icon: 'fa-user-shield', range: { en: '13 – 15', de: '13 – 15' }, text: { en: 'Parents confirm by e-mail. Private account, no direct messages, no live', de: 'Eltern bestätigen per E-Mail. Privates Konto, keine Direktnachrichten, kein Live' } },
  { icon: 'fa-user-check', range: { en: '16 +', de: 'Ab 16' }, text: { en: 'All regular features (livestreaming from 18)', de: 'Alle normalen Funktionen (Livestreamen ab 18)' } },
  { icon: 'fa-sack-dollar', range: { en: '18 +', de: 'Ab 18' }, text: { en: 'Plus livestreaming, monetization, Creator Code and payouts', de: 'Zusätzlich Livestreamen, Monetarisierung, Creator-Code und Auszahlungen' } },
];
function nxAgeFromDate(str) {
  const b = new Date(str + 'T00:00:00'); if (isNaN(b)) return null;
  const n = new Date(); let a = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth(); if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
  return a;
}
function nxAgeBadgeHtml(u) {
  if (!u || !u.birthDate) return '';
  if (u.accountType === 'child') return `<span class="st-badge st-badge-kids"><i class="fas fa-child-reaching"></i> ${nxL({ en: 'Kids account', de: 'Kinderkonto' })}</span>`;
  const g = u.ageGroup;
  const label = g === '18+' ? '18+' : g === '16-17' ? '16+' : g === '13-15' ? '13+' : '';
  return label ? `<span class="st-badge">${label}</span>` : '';
}
function nxDateFields(prefix) {
  const now = new Date().getFullYear();
  const months = cl() === 'de' ? ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'] : ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `<div class="ag-date">
    <select id="${prefix}-d" class="ag-sel" aria-label="${escHtml(nxL({ en: 'Day', de: 'Tag' }))}"><option value="">${nxL({ en: 'Day', de: 'Tag' })}</option>${Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}</select>
    <select id="${prefix}-m" class="ag-sel" aria-label="${escHtml(nxL({ en: 'Month', de: 'Monat' }))}"><option value="">${nxL({ en: 'Month', de: 'Monat' })}</option>${months.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('')}</select>
    <select id="${prefix}-y" class="ag-sel" aria-label="${escHtml(nxL({ en: 'Year', de: 'Jahr' }))}"><option value="">${nxL({ en: 'Year', de: 'Jahr' })}</option>${Array.from({ length: 101 }, (_, i) => `<option value="${now - i}">${now - i}</option>`).join('')}</select>
  </div>`;
}
function nxReadDate(root, prefix) {
  const d = +root.querySelector(`#${prefix}-d`).value, m = +root.querySelector(`#${prefix}-m`).value, y = +root.querySelector(`#${prefix}-y`).value;
  if (!d || !m || !y) return null;
  const str = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const dt = new Date(str + 'T00:00:00');
  if (isNaN(dt) || dt.getDate() !== d || dt > new Date()) return 'invalid';
  return str;
}
function nxPinInputs(id) {
  return `<div class="ag-pin" id="${id}">${Array.from({ length: 6 }, (_, i) => `<input type="password" inputmode="numeric" maxlength="1" autocomplete="off" data-i="${i}" aria-label="${i + 1}">`).join('')}</div>`;
}
function nxWirePin(root, id) {
  const inputs = [...root.querySelectorAll(`#${id} input`)];
  inputs.forEach((inp, i) => {
    inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(-1); if (inp.value && inputs[i + 1]) inputs[i + 1].focus(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && inputs[i - 1]) inputs[i - 1].focus(); });
    inp.addEventListener('paste', e => { const txt = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (!txt) return; e.preventDefault(); txt.split('').forEach((c, k) => { if (inputs[k]) inputs[k].value = c; }); inputs[Math.min(txt.length, 5)].focus(); });
  });
  return () => inputs.map(x => x.value).join('');
}
// Eltern-Code abfragen -> Promise<string|null>
function nxPinPrompt(title, sub) {
  return new Promise(resolve => {
    let done = false;
    const ov = nxModal({
      id: 'nx-pin-modal', title: title || nxL({ en: 'Enter parent code', de: 'Eltern-Code eingeben' }), sub: sub || nxL({ en: 'Enter the 4–6 digit code.', de: 'Gib den 4- bis 6-stelligen Code ein.' }),
      body: nxPinInputs('nx-pin-in') + `<div class="gs-error" id="nx-pin-err" style="text-align:center;margin-top:10px"></div>`,
      foot: `<button class="st-btn" data-cancel>${t('btn_cancel')}</button><button class="st-btn st-btn-primary" data-ok>${nxL({ en: 'Confirm', de: 'Bestätigen' })}</button>`,
      onClose: () => { if (!done) resolve(null); },
    });
    const read = nxWirePin(ov, 'nx-pin-in');
    ov.querySelector('#nx-pin-in input').focus();
    const ok = () => { const pin = read(); if (pin.length < 4) { ov.querySelector('#nx-pin-err').textContent = nxL({ en: 'At least 4 digits', de: 'Mindestens 4 Ziffern' }); return; } done = true; ov._close(); resolve(pin); };
    ov.querySelector('[data-ok]').onclick = ok;
    ov.querySelector('[data-cancel]').onclick = () => ov._close();
    ov.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); });
  });
}

// Wendet Konto-Zustand auf die Oberfläche an (Kindermodus, Altersabfrage)
function nxApplyAccountState() {
  const u = currentUser;
  const root = document.documentElement;
  root.classList.toggle('nx-kids', !!u?.kidsMode);
  root.classList.toggle('nx-kids-nosearch', !!u?.kidsMode && u?.parental?.allowSearch === false);
  root.classList.toggle('nx-kids-nocomments', !!u?.kidsMode && !u?.parental?.allowComments);
  root.classList.toggle('nx-kids-nomessages', !!u?.kidsMode && !u?.parental?.allowMessages);
  let badge = document.getElementById('nx-kids-badge');
  if (u?.kidsMode) {
    if (!badge) {
      badge = document.createElement('button');
      badge.id = 'nx-kids-badge'; badge.className = 'nx-kids-badge';
      badge.onclick = () => navigateTo('settings', 'parental');
      const right = document.querySelector('.header-right') || document.getElementById('main-header');
      right?.prepend(badge);
    }
    badge.innerHTML = `<i class="fas fa-child-reaching"></i><span>${nxL({ en: 'Kids mode', de: 'Kindermodus' })}</span>`;
  } else badge?.remove();
  // Playlists-Link in der Seitenleiste
  if (!document.getElementById('playlists-link')) {
    const saved = document.querySelector('.nav-item[data-page="saved"]');
    if (saved) {
      const a = document.createElement('a');
      a.href = '#'; a.className = 'nav-item'; a.dataset.page = 'playlists'; a.id = 'playlists-link';
      a.innerHTML = `<i class="fas fa-list-ul"></i><span>Playlists</span>`;
      a.addEventListener('click', e => { e.preventDefault(); navigateTo('playlists'); });
      saved.after(a);
    }
  }
  const pl = document.getElementById('playlists-link'); if (pl) pl.style.display = u ? '' : 'none';
  if (u && !u.isAdmin && (!u.birthDate || u.ageBlocked)) setTimeout(() => nxShowAgeGate(), 50);
  else if (u && !u.isAdmin && u.parentalConsentPending && !sessionStorage.getItem('nx_consent_later')) setTimeout(() => nxShowAgeGate('consent'), 50);
  else if (!u) document.getElementById('nx-age-gate')?.remove();
}
// ─── Teil: client/konto-familie/020-altersabfrage-kindersicherung.js ───

function nxShowAgeGate(startStep) {
  const u = currentUser;
  if (!u || u.isAdmin) return;
  if (u.birthDate && !u.ageBlocked && startStep !== 'done' && startStep !== 'consent' && startStep !== 'child') return;
  if (startStep === 'consent' && !u.parentalConsentPending) return;
  if (document.getElementById('nx-age-gate') && !startStep) return;
  document.getElementById('nx-age-gate')?.remove();
  const gate = document.createElement('div');
  gate.id = 'nx-age-gate';
  gate.className = 'ag-gate';
  document.body.appendChild(gate);
  const state = { step: startStep || (u.ageBlocked ? 'blocked' : (u.parentalConsentPending ? 'consent' : 'who')) };
  const emailMode = (u.consentMode || 'email') === 'email';
  const minAge = u.minSelfAge || 13;
  const lockNote = `<div class="ag-note is-warn" style="margin-top:12px"><i class="fas fa-lock"></i><div><b>${nxL({ en: 'Please check carefully', de: 'Bitte genau prüfen' })}</b><span>${nxL({ en: 'The date of birth cannot be changed later (only via support).', de: 'Das Geburtsdatum kann später nicht mehr geändert werden (nur über den Support).' })}</span></div></div>`;
  const parentEmailField = (id, label) => `<div class="ag-label">${label}</div><input type="email" id="${id}" class="gs-input" autocomplete="off" inputmode="email" maxlength="200" placeholder="${nxL({ en: 'parent@example.com', de: 'eltern@beispiel.de' })}" style="width:100%">`;
  const tiers = `<div class="ag-tiers">${NX_AGE_TIERS.map(tq => `<div class="ag-tier"><i class="fas ${tq.icon}"></i><div><b>${nxL(tq.range)}</b><span>${nxL(tq.text)}</span></div></div>`).join('')}</div>`;
  const shell = (inner, stepNo) => `
    <div class="ag-card" role="dialog" aria-modal="true" aria-labelledby="ag-title">
      <div class="ag-top">
        <img src="/assets/icon-72.png" alt="" class="ag-logo">
        ${stepNo ? `<div class="ag-steps">${[1, 2, 3].map(n => `<span class="${n <= stepNo ? 'is-on' : ''}"></span>`).join('')}</div>` : '<span></span>'}
        <button class="ag-logout" data-h-click="h_konto_familie_logout_452">${nxL({ en: 'Sign out', de: 'Abmelden' })}</button>
      </div>
      ${inner}
    </div>`;
  const render = () => {
    if (state.step === 'who') {
      gate.innerHTML = shell(`
        <h2 id="ag-title">${nxL({ en: 'Who is this account for?', de: 'Für wen ist dieses Konto?' })}</h2>
        <p class="ag-lead">${emailMode ? nxL({ en: 'Norynex is for people aged 13 and over. Under 16, a parent has to confirm by e-mail. Children under 13 can use Norynex with a kids account set up by a parent.', de: 'Norynex ist ab 13 Jahren. Unter 16 muss ein Elternteil per E-Mail zustimmen. Kinder unter 13 können Norynex mit einem Kinderkonto nutzen, das ein Elternteil einrichtet.' }) : nxL({ en: 'Norynex is for people aged 16 and over.', de: 'Norynex ist ab 16 Jahren.' })}</p>
        <div class="ag-choices">
          <button class="ag-choice" data-go="self"><span class="ag-choice-icon"><i class="fas fa-user"></i></span><span><b>${nxL({ en: 'This account is for me', de: 'Dieses Konto ist für mich' })}</b><small>${nxL({ en: 'I use Norynex myself', de: 'Ich nutze Norynex selbst' })}</small></span><i class="fas fa-chevron-right"></i></button>
          ${emailMode ? '' : '<!--'}<button class="ag-choice" data-go="child"><span class="ag-choice-icon is-kids"><i class="fas fa-child-reaching"></i></span><span><b>${nxL({ en: 'This account is for my child', de: 'Dieses Konto ist für mein Kind' })}</b><small>${nxL({ en: 'Kids videos only, protected with a parent code', de: 'Nur Kindervideos, geschützt mit Eltern-Code' })}</small></span><i class="fas fa-chevron-right"></i></button>${emailMode ? '' : '-->'}
        </div>
        <details class="ag-more"><summary>${nxL({ en: 'What applies at which age?', de: 'Was gilt ab welchem Alter?' })}</summary>${tiers}</details>`, 1);
      gate.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { state.step = b.dataset.go; render(); });
    }
    else if (state.step === 'self') {
      gate.innerHTML = shell(`
        <button class="ag-back" data-back><i class="fas fa-arrow-left"></i> ${nxL({ en: 'Back', de: 'Zurück' })}</button>
        <h2 id="ag-title">${nxL({ en: 'When were you born?', de: 'Wann bist du geboren?' })}</h2>
        <p class="ag-lead">${nxL({ en: 'We need your date of birth to protect younger users. It is not shown publicly.', de: 'Wir brauchen dein Geburtsdatum, um jüngere Nutzer zu schützen. Es wird nicht öffentlich angezeigt.' })}</p>
        ${nxDateFields('ag-s')}
        <div class="ag-result" id="ag-result" hidden></div>
        ${lockNote}
        <div class="gs-error" id="ag-err"></div>
        <button class="ag-primary" id="ag-submit" disabled>${nxL({ en: 'Continue', de: 'Weiter' })}</button>`, 2);
      const upd = () => {
        const d = nxReadDate(gate, 'ag-s'), res = gate.querySelector('#ag-result'), btn = gate.querySelector('#ag-submit');
        if (!d || d === 'invalid') { res.hidden = true; btn.disabled = true; if (d === 'invalid') gate.querySelector('#ag-err').textContent = nxL({ en: 'This date does not exist.', de: 'Dieses Datum gibt es nicht.' }); else gate.querySelector('#ag-err').textContent = ''; return; }
        gate.querySelector('#ag-err').textContent = '';
        const age = nxAgeFromDate(d); res.hidden = false; btn.disabled = false;
        state.age = age; state.date = d;
        if (age < minAge) res.innerHTML = `<div class="ag-note is-bad"><i class="fas fa-circle-exclamation"></i><div><b>${minAge === 16 ? nxL({ en: 'Norynex is for ages 16+', de: 'Norynex ist ab 16 Jahren' }) : nxL({ en: 'Norynex is for ages 13+', de: 'Norynex ist ab 13 Jahren' })}</b><span>${emailMode ? nxL({ en: 'Ask a parent to set up a kids account for you.', de: 'Bitte ein Elternteil, ein Kinderkonto für dich einzurichten.' }) : ''}</span></div></div>`;
        else if (age < 16) res.innerHTML = `<div class="ag-note is-warn"><i class="fas fa-user-shield"></i><div><b>${nxL({ en: `You are ${age}`, de: `Du bist ${age}` })}</b><span>${nxL({ en: 'Under 16 a parent has to confirm by e-mail. Until then you can only watch. Your account is private, direct messages and live are off.', de: 'Unter 16 muss ein Elternteil per E-Mail zustimmen. Bis dahin kannst du nur zuschauen. Dein Konto ist privat, Direktnachrichten und Live sind aus.' })}</span></div></div>
          ${parentEmailField('ag-parent-email', nxL({ en: 'Your parent’s e-mail address', de: 'E-Mail-Adresse eines Elternteils' }))}`;
        else if (age < 18) res.innerHTML = `<div class="ag-note"><i class="fas fa-user-check"></i><div><b>${nxL({ en: `You are ${age}`, de: `Du bist ${age}` })}</b><span>${nxL({ en: 'All regular features. Livestreaming, monetization and Creator Code unlock at 18.', de: 'Alle normalen Funktionen. Livestreamen, Monetarisierung und Creator-Code gibt es ab 18.' })}</span></div></div>`;
        else res.innerHTML = `<div class="ag-note is-ok"><i class="fas fa-circle-check"></i><div><b>${nxL({ en: `You are ${age}`, de: `Du bist ${age}` })}</b><span>${nxL({ en: 'Full access, including livestreaming, monetization and Creator Code.', de: 'Voller Zugriff – inklusive Livestreamen, Monetarisierung und Creator-Code.' })}</span></div></div>`;
      };
      ['d', 'm', 'y'].forEach(k => gate.querySelector(`#ag-s-${k}`).addEventListener('change', upd));
      gate.querySelector('[data-back]').onclick = () => { state.step = 'who'; render(); };
      gate.querySelector('#ag-submit').onclick = async () => {
        const pe = (gate.querySelector('#ag-parent-email')?.value || '').trim();
        if (state.age >= minAge && state.age < 16 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pe)) { gate.querySelector('#ag-err').textContent = nxL({ en: 'Please enter your parent’s e-mail address.', de: 'Bitte gib die E-Mail-Adresse eines Elternteils ein.' }); return; }
        if (state.age < minAge && !confirm(nxL({ en: 'This account will be locked. The date of birth cannot be changed afterwards. Continue?', de: 'Dieses Konto wird gesperrt. Das Geburtsdatum kann danach nicht mehr geändert werden. Fortfahren?' }))) return;
        await nxSubmitAge({ accountType: 'self', birthDate: state.date, parentEmail: pe || undefined }, gate);
      };
    }
    else if (state.step === 'child') {
      gate.innerHTML = shell(`
        <button class="ag-back" data-back><i class="fas fa-arrow-left"></i> ${nxL({ en: 'Back', de: 'Zurück' })}</button>
        <h2 id="ag-title">${nxL({ en: 'Set up a kids account', de: 'Kinderkonto einrichten' })}</h2>
        <p class="ag-lead">${nxL({ en: 'Your child only sees videos made for kids. Messages, comments, uploads and livestreams are off. You can change options later with your parent code.', de: 'Dein Kind sieht nur Videos, die für Kinder gemacht sind. Nachrichten, Kommentare, Hochladen und Livestreams sind aus. Mit deinem Eltern-Code kannst du das später anpassen.' })}</p>
        <div class="ag-label">${nxL({ en: 'Your child’s date of birth', de: 'Geburtsdatum deines Kindes' })}</div>
        ${nxDateFields('ag-c')}
        <div class="ag-label">${nxL({ en: 'Parent code (4–6 digits)', de: 'Eltern-Code (4–6 Ziffern)' })}</div>
        ${nxPinInputs('ag-pin1')}
        <div class="ag-label">${nxL({ en: 'Repeat code', de: 'Code wiederholen' })}</div>
        ${nxPinInputs('ag-pin2')}
        ${parentEmailField('ag-child-parent-email', nxL({ en: 'Your e-mail address (parent) – you will get a confirmation link', de: 'Deine E-Mail-Adresse (Elternteil) – du bekommst einen Bestätigungslink' }))}
        ${u.ageBlocked ? '' : lockNote}
        <div class="gs-error" id="ag-err"></div>
        <button class="ag-primary" id="ag-submit">${nxL({ en: 'Create kids account', de: 'Kinderkonto erstellen' })}</button>`, 2);
      const p1 = nxWirePin(gate, 'ag-pin1'), p2 = nxWirePin(gate, 'ag-pin2');
      gate.querySelector('[data-back]').onclick = () => { state.step = u.ageBlocked ? 'blocked' : 'who'; render(); };
      gate.querySelector('#ag-submit').onclick = async () => {
        const err = gate.querySelector('#ag-err'); err.textContent = '';
        const d = nxReadDate(gate, 'ag-c');
        if (!d || d === 'invalid') { err.textContent = nxL({ en: 'Please enter a valid date of birth.', de: 'Bitte gib ein gültiges Geburtsdatum ein.' }); return; }
        if (nxAgeFromDate(d) >= 16) { err.textContent = nxL({ en: 'A kids account is only for children under 16.', de: 'Ein Kinderkonto ist nur für Kinder unter 16.' }); return; }
        const a = p1(), b = p2();
        if (a.length < 4) { err.textContent = nxL({ en: 'The code needs at least 4 digits.', de: 'Der Code braucht mindestens 4 Ziffern.' }); return; }
        if (a !== b) { err.textContent = nxL({ en: 'The codes don’t match.', de: 'Die Codes stimmen nicht überein.' }); return; }
        const pe = (gate.querySelector('#ag-child-parent-email')?.value || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pe)) { err.textContent = nxL({ en: 'Please enter your e-mail address.', de: 'Bitte gib deine E-Mail-Adresse ein.' }); return; }
        await nxSubmitAge({ accountType: 'child', birthDate: d, pin: a, parentEmail: pe }, gate);
      };
    }
    else if (state.step === 'blocked') {
      gate.innerHTML = shell(`
        <div class="ag-hero-icon is-bad"><i class="fas fa-hand"></i></div>
        <h2 id="ag-title">${nxL({ en: 'Norynex is for ages 13+', de: 'Norynex ist erst ab 13' })}</h2>
        <p class="ag-lead">${emailMode ? nxL({ en: 'This account is locked. A parent can turn it into a kids account – with kids videos only, a parent code and confirmation by e-mail.', de: 'Dieses Konto ist gesperrt. Ein Elternteil kann daraus ein Kinderkonto machen – nur mit Kindervideos, Eltern-Code und Bestätigung per E-Mail.' }) : nxL({ en: 'This account is locked.', de: 'Dieses Konto ist gesperrt.' })} ${nxL({ en: 'The date of birth can only be changed via support.', de: 'Das Geburtsdatum kann nur über den Support geändert werden.' })}</p>
        ${emailMode ? `<button class="ag-primary" data-go="child"><i class="fas fa-child-reaching"></i> ${nxL({ en: 'Parent: set up kids account', de: 'Eltern: Kinderkonto einrichten' })}</button>` : ''}
        <button class="ag-secondary" data-del>${nxL({ en: 'Delete account', de: 'Konto löschen' })}</button>`, 0);
      const goChild = gate.querySelector('[data-go]'); if (goChild) goChild.onclick = () => { state.step = 'child'; render(); };
      gate.querySelector('[data-del]').onclick = () => confirmDeleteAccount();
    }
    else if (state.step === 'consent') {
      const me = currentUser || u;
      const sentTo = me.parentalConsentSentTo;
      const denied = me.parentalConsentStatus === 'denied';
      gate.innerHTML = shell(`
        <div class="ag-hero-icon"><i class="fas ${denied ? 'fa-hand' : 'fa-envelope-circle-check'}"></i></div>
        <h2 id="ag-title">${denied ? nxL({ en: 'Your parents declined', de: 'Deine Eltern haben abgelehnt' }) : nxL({ en: 'Waiting for your parents', de: 'Warte auf deine Eltern' })}</h2>
        <p class="ag-lead">${denied ? nxL({ en: 'You can keep watching, but not comment, upload or post. Contact support if this is a mistake.', de: 'Du kannst weiter zuschauen, aber nicht kommentieren, hochladen oder posten. Wende dich an den Support, falls das ein Fehler ist.' })
          : sentTo ? nxL({ en: `We sent a confirmation link to ${sentTo}. As soon as a parent confirms, everything is unlocked. Until then you can watch.`, de: `Wir haben einen Bestätigungslink an ${sentTo} geschickt. Sobald ein Elternteil zustimmt, ist alles freigeschaltet. Bis dahin kannst du zuschauen.` })
          : nxL({ en: 'A parent has to confirm by e-mail. Until then you can watch.', de: 'Ein Elternteil muss per E-Mail zustimmen. Bis dahin kannst du zuschauen.' })}</p>
        ${denied ? '' : `${parentEmailField('ag-consent-email', sentTo ? nxL({ en: 'Send again / to another address', de: 'Erneut / an andere Adresse senden' }) : nxL({ en: 'Your parent’s e-mail address', de: 'E-Mail-Adresse eines Elternteils' }))}
        <div class="gs-error" id="ag-err"></div>
        <button class="ag-primary" id="ag-submit">${nxL({ en: 'Send confirmation link', de: 'Bestätigungslink senden' })}</button>`}
        <button class="ag-secondary" data-later>${nxL({ en: 'Just watch for now', de: 'Erst mal nur zuschauen' })}</button>`, 0);
      gate.querySelector('[data-later]').onclick = () => { try { sessionStorage.setItem('nx_consent_later', '1'); } catch {} gate.remove(); };
      const sb = gate.querySelector('#ag-submit');
      if (sb) sb.onclick = async () => {
        const err = gate.querySelector('#ag-err'); err.textContent = '';
        const pe = (gate.querySelector('#ag-consent-email')?.value || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pe)) { err.textContent = nxL({ en: 'Please enter a valid e-mail address.', de: 'Bitte gib eine gültige E-Mail-Adresse ein.' }); return; }
        sb.disabled = true;
        try {
          const r = await apiPost('/api/users/me/parental-consent', { parentEmail: pe });
          currentUser = { ...currentUser, parentalConsentSentTo: r.sentTo, parentalConsentStatus: 'pending' };
          try { localStorage.setItem('nxd_user', JSON.stringify(currentUser)); } catch {}
          showToast(nxL({ en: 'Link sent. Ask your parent to check their inbox (and spam folder).', de: 'Link gesendet. Bitte deine Eltern, im Posteingang (und Spam-Ordner) nachzusehen.' }), 'success');
          render();
        } catch (e) { err.textContent = e.message; sb.disabled = false; }
      };
    }
    else if (state.step === 'done') {
      const me = currentUser;
      const kids = me?.accountType === 'child';
      gate.innerHTML = shell(`
        <div class="ag-hero-icon is-ok"><i class="fas ${kids ? 'fa-child-reaching' : 'fa-circle-check'}"></i></div>
        <h2 id="ag-title">${kids ? nxL({ en: 'Kids account is ready', de: 'Kinderkonto ist bereit' }) : nxL({ en: 'All set', de: 'Alles fertig' })}</h2>
        <p class="ag-lead">${kids
          ? nxL({ en: 'Only videos made for kids are shown. Change the options any time under Settings → Parental controls with your code.', de: 'Es werden nur Videos für Kinder angezeigt. Unter Einstellungen → Kindersicherung kannst du die Optionen jederzeit mit deinem Code ändern.' })
          : me?.ageGroup === '18+' ? nxL({ en: 'You have full access, including monetization and Creator Code.', de: 'Du hast vollen Zugriff – inklusive Monetarisierung und Creator-Code.' })
          : nxL({ en: 'Have fun on Norynex! Monetization and Creator Code unlock at 18.', de: 'Viel Spaß auf Norynex! Monetarisierung und Creator-Code gibt es ab 18.' })}</p>
        <button class="ag-primary" data-close>${nxL({ en: 'Let’s go', de: 'Los geht’s' })}</button>`, 3);
      gate.querySelector('[data-close]').onclick = () => { gate.remove(); refreshCurrentPage(); };
    }
  };
  render();
}
async function nxSubmitAge(body, gate) {
  const btn = gate.querySelector('#ag-submit'); const err = gate.querySelector('#ag-err');
  if (btn) { btn.disabled = true; btn.dataset.label = btn.innerHTML; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>'; }
  try {
    const r = await apiPost('/api/users/me/age', body);
    currentUser = r.user; localStorage.setItem('nxd_user', JSON.stringify(r.user));
    try { saveAccountToList(localStorage.getItem('nxd_token'), r.user); } catch {}
    gate.remove();
    renderAuthSection();
    if (r.user.ageBlocked) { nxShowAgeGate('blocked'); return; }
    if (r.user.parentalConsentPending) { nxShowAgeGate('consent'); if (r.consentError) showToast(r.consentError, 'error'); return; }
    nxShowAgeGate('done');
  } catch (e) {
    if (err) err.textContent = e.message;
    if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.label; }
  }
}

/* ---------- Kindersicherung in den Einstellungen ---------- */
let _nxParentalPin = null, _nxParentalPinAt = 0;
function _nxPinFresh() { return _nxParentalPin && Date.now() - _nxParentalPinAt < 5 * 60 * 1000; }
function nxParentalSectionHtml() {
  const u = currentUser; if (!u) return '';
  const p = u.parental || {};
  const on = !!u.kidsMode;
  const child = u.accountType === 'child';
  const lockedFilter = child && (u.age ?? 0) < 13;
  const unlocked = _nxPinFresh();
  const opt = (key, icon, title, desc) => _stRow({ icon, title, desc, control: _stToggle('pc-' + key, !!p[key], function (event) { nxParentalSet(key, this); }, !on || !unlocked) });
  return `
    <div class="pc-status ${on ? 'is-on' : ''}">
      <div class="pc-status-icon"><i class="fas ${on ? 'fa-shield-halved' : 'fa-shield'}"></i></div>
      <div class="pc-status-text">
        <strong>${on ? nxL({ en: 'Parental controls are on', de: 'Kindersicherung ist an' }) : nxL({ en: 'Parental controls are off', de: 'Kindersicherung ist aus' })}</strong>
        <span>${on ? (child ? nxL({ en: 'Kids account · only videos made for kids', de: 'Kinderkonto · nur Videos für Kinder' }) : nxL({ en: 'Only videos made for kids are shown on this account', de: 'Auf diesem Konto werden nur Videos für Kinder angezeigt' })) : nxL({ en: 'Turn on to limit this account to kids videos – protected by a code, like in games.', de: 'Einschalten, um dieses Konto auf Kindervideos zu beschränken – geschützt mit einem Code, wie in Spielen.' })}</span>
      </div>
      ${on
        ? (unlocked ? `<span class="pc-unlocked"><i class="fas fa-lock-open"></i> ${nxL({ en: 'Unlocked', de: 'Entsperrt' })}</span>` : `<button class="st-btn" data-h-click="h_konto_familie_nxParentalUnlock_623"><i class="fas fa-lock"></i> ${nxL({ en: 'Unlock', de: 'Entsperren' })}</button>`)
        : `<button class="st-btn st-btn-primary" data-h-click="h_konto_familie_nxParentalEnable_624">${p.hasPin ? nxL({ en: 'Turn on', de: 'Einschalten' }) : nxL({ en: 'Set up', de: 'Einrichten' })}</button>`}
    </div>
    ${on ? _stGroup(nxL({ en: 'What is allowed', de: 'Was ist erlaubt' }), [
      _stRow({ icon: 'fa-child-reaching', title: nxL({ en: 'Kids videos only', de: 'Nur Kindervideos' }), desc: lockedFilter ? nxL({ en: 'Always on for kids accounts under 13', de: 'Bei Kinderkonten unter 13 immer an' }) : nxL({ en: 'Only videos marked “Made for kids”', de: 'Nur Videos mit „Für Kinder“-Kennzeichnung' }), control: _stToggle('pc-kidsonly', true, null, true) }),
      opt('allowSearch', 'fa-magnifying-glass', nxL({ en: 'Search', de: 'Suche' }), nxL({ en: 'Results still only show kids videos', de: 'Ergebnisse zeigen trotzdem nur Kindervideos' })),
      opt('allowComments', 'fa-comment', nxL({ en: 'Read & write comments', de: 'Kommentare lesen & schreiben' }), ''),
      opt('allowMessages', 'fa-envelope', nxL({ en: 'Direct messages', de: 'Direktnachrichten' }), ''),
      opt('allowLive', 'fa-tower-broadcast', nxL({ en: 'Livestreams', de: 'Livestreams' }), ''),
    ], unlocked ? '' : nxL({ en: 'Unlock with the parent code to change these options.', de: 'Mit dem Eltern-Code entsperren, um das zu ändern.' })) : ''}
    ${on ? _stGroup(nxL({ en: 'Screen time', de: 'Bildschirmzeit' }), [
      _stRow({ icon: 'fa-hourglass-half', title: nxL({ en: 'Daily limit', de: 'Tageslimit' }), desc: nxL({ en: 'After this time Norynex locks until tomorrow. With the parent code you can add more time.', de: 'Danach ist Norynex bis morgen gesperrt. Mit dem Eltern-Code kannst du Zeit dazugeben.' }),
        control: `<select class="st-select" id="pc-limit" ${unlocked ? '' : 'disabled'} data-h-change="h_konto_familie_nxParentalScreen_635">${[0, 30, 45, 60, 90, 120, 180, 240].map(m => `<option value="${m}" ${(p.dailyLimitMin || 0) === m ? 'selected' : ''}>${m ? (m >= 60 ? (m / 60).toString().replace('.', ',') + ' ' + nxL({ en: 'h', de: 'Std.' }) : m + ' Min.') : nxL({ en: 'No limit', de: 'Kein Limit' })}</option>`).join('')}</select>` }),
      _stRow({ icon: 'fa-moon', title: nxL({ en: 'Bedtime', de: 'Schlafenszeit' }), desc: nxL({ en: 'Norynex is locked during this time (German time).', de: 'In dieser Zeit ist Norynex gesperrt (deutsche Zeit).' }),
        control: `<select class="st-select" id="pc-bed" ${unlocked ? '' : 'disabled'} data-h-change="h_konto_familie_nxParentalScreen_637">${[['', nxL({ en: 'Off', de: 'Aus' })], ['19:00-07:00', '19:00 – 7:00'], ['20:00-07:00', '20:00 – 7:00'], ['21:00-07:00', '21:00 – 7:00'], ['22:00-07:00', '22:00 – 7:00'], ['23:00-07:00', '23:00 – 7:00']].map(([v, l]) => `<option value="${v}" ${(p.bedtime ? p.bedtime.from + '-' + p.bedtime.to : '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select>` }),
      _stRow({ icon: 'fa-chart-simple', title: nxL({ en: 'Used today', de: 'Heute genutzt' }), desc: '<span id="pc-st-used">…</span>' }),
    ], unlocked ? '' : nxL({ en: 'Unlock with the parent code to change these options.', de: 'Mit dem Eltern-Code entsperren, um das zu ändern.' })) : ''}
    ${p.hasPin ? _stGroup(nxL({ en: 'Code', de: 'Code' }), [
      _stRow({ icon: 'fa-key', title: nxL({ en: 'Change parent code', de: 'Eltern-Code ändern' }), onclick: function (event) { nxParentalChangePin(); } }),
      on && !lockedFilter ? _stRow({ icon: 'fa-power-off', title: nxL({ en: 'Turn off parental controls', de: 'Kindersicherung ausschalten' }), desc: child ? nxL({ en: 'Turns the kids account into a normal account', de: 'Macht aus dem Kinderkonto ein normales Konto' }) : '', danger: true, onclick: function (event) { nxParentalDisable(); } }) : '',
    ]) : ''}`;
}
async function nxParentalScreen() {
  if (!_nxPinFresh()) return nxParentalUnlock();
  const lim = +(document.getElementById('pc-limit') || {}).value || 0;
  const bv = (document.getElementById('pc-bed') || {}).value || '';
  const bedtime = bv ? { from: bv.split('-')[0], to: bv.split('-')[1] } : null;
  try { await nxParentalCall({ action: 'settings', pin: _nxParentalPin, settings: { dailyLimitMin: lim, bedtime } }); _nxParentalPinAt = Date.now(); showToast(nxL({ en: 'Saved', de: 'Gespeichert' }), 'success'); nxScreenTimeTick(true); }
  catch (e) { showToast(e.message, 'error'); }
}
/* Bildschirmzeit: zählt jede Minute, in der Norynex sichtbar offen ist, und sperrt bei Limit/Schlafenszeit */
let _nxStTimer = null, _nxStLast = null;
async function nxScreenTimeTick(noCount) {
  const u = typeof currentUser !== 'undefined' ? currentUser : null;
  if (!u || !u.kidsMode || !u.parental || !(u.parental.dailyLimitMin || u.parental.bedtime)) { nxScreenLock(null); return; }
  if (!noCount && document.visibilityState !== 'visible') return;
  try { _nxStLast = await (noCount ? apiGet('/api/users/me/screentime') : apiPost('/api/users/me/screentime/ping', {})); } catch { return; }
  const el = document.getElementById('pc-st-used');
  if (el) el.textContent = `${_nxStLast.used} Min.${_nxStLast.limit ? ' / ' + (_nxStLast.limit + _nxStLast.extra) + ' Min.' : ''}`;
  nxScreenLock(_nxStLast.blocked ? _nxStLast : null);
  if (_nxStLast.remaining === 5 && !noCount) showToast(nxL({ en: '5 minutes of screen time left today.', de: 'Noch 5 Minuten Bildschirmzeit für heute.' }), 'info');
}
function nxScreenLock(st) {
  let ov = document.getElementById('nx-st-lock');
  if (!st) { if (ov) ov.remove(); return; }
  if (ov) return;
  document.querySelectorAll('video').forEach(v => { try { v.pause(); } catch {} });
  ov = document.createElement('div'); ov.id = 'nx-st-lock'; ov.className = 'nx-st-lock';
  ov.innerHTML = `<div class="nx-st-box"><div class="nx-st-ico"><i class="fas ${st.reason === 'bedtime' ? 'fa-moon' : 'fa-hourglass-end'}"></i></div>
    <h2>${st.reason === 'bedtime' ? '<i class="fas fa-moon"></i> ' + nxL({ en: 'Bedtime', de: 'Schlafenszeit' }) : nxL({ en: 'Screen time is up', de: 'Bildschirmzeit ist vorbei' })}</h2>
    <p>${st.reason === 'bedtime' ? nxL({ en: 'Norynex is paused until morning. Sleep well!', de: 'Norynex macht Pause bis morgen früh. Schlaf gut!' }) : nxL({ en: `You used your ${st.limit + st.extra} minutes for today. See you tomorrow!`, de: `Du hast deine ${st.limit + st.extra} Minuten für heute genutzt. Bis morgen!` })}</p>
    <div class="nx-st-parent"><b>${nxL({ en: 'Parents: add more time', de: 'Eltern: mehr Zeit geben' })}</b><div>${[15, 30, 60, 120].map(m => `<button data-h-click="h_konto_familie_nxScreenExtend_674" data-hv-click="${nxHv(String(m))}">+${m >= 60 ? m / 60 + ' Std.' : m + ' Min.'}</button>`).join('')}</div></div></div>`;
  document.body.appendChild(ov);
}
async function nxScreenExtend(min) {
  const pin = await nxPinPrompt(nxL({ en: 'Parent code', de: 'Eltern-Code' })); if (!pin) return;
  try { _nxStLast = await apiPost('/api/users/me/screentime/extend', { pin, minutes: min }); nxScreenLock(null); showToast(nxL({ en: 'Time added', de: 'Zeit hinzugefügt' }) + ` (+${min} Min.)`, 'success'); }
  catch (e) { showToast(e.message, 'error'); }
}
if (!_nxStTimer) { _nxStTimer = setInterval(() => nxScreenTimeTick(false), 60000); setTimeout(() => nxScreenTimeTick(true), 2500); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') nxScreenTimeTick(true); }); }
window.nxParentalScreen = nxParentalScreen; window.nxScreenExtend = nxScreenExtend;
async function nxParentalCall(body) {
  const r = await apiPost('/api/users/me/parental', body);
  currentUser = r.user; localStorage.setItem('nxd_user', JSON.stringify(r.user));
  renderAuthSection();
  renderSettingsPage('parental');
  setTimeout(() => nxScreenTimeTick(true), 50);
  return r;
}
async function nxParentalUnlock() {
  const pin = await nxPinPrompt(); if (!pin) return;
  try { await nxParentalCall({ action: 'verify', pin }); _nxParentalPin = pin; _nxParentalPinAt = Date.now(); renderSettingsPage('parental'); }
  catch (e) { showToast(e.message, 'error'); }
}
async function nxParentalSet(key, input) {
  if (!_nxPinFresh()) { input.checked = !input.checked; return nxParentalUnlock(); }
  try { await nxParentalCall({ action: 'settings', pin: _nxParentalPin, settings: { [key]: input.checked } }); _nxParentalPinAt = Date.now(); showToast(nxL({ en: 'Saved', de: 'Gespeichert' }), 'success'); }
  catch (e) { input.checked = !input.checked; showToast(e.message, 'error'); }
}
async function nxParentalEnable() {
  if (currentUser?.parental?.hasPin) {
    const pin = await nxPinPrompt(nxL({ en: 'Turn on parental controls', de: 'Kindersicherung einschalten' })); if (!pin) return;
    try { await nxParentalCall({ action: 'enable', pin }); showToast(nxL({ en: 'Parental controls on', de: 'Kindersicherung an' }), 'success'); } catch (e) { showToast(e.message, 'error'); }
    return;
  }
  const a = await nxPinPrompt(nxL({ en: 'Choose a parent code', de: 'Eltern-Code festlegen' }), nxL({ en: '4–6 digits. Keep it secret from your child.', de: '4–6 Ziffern. Nicht dem Kind verraten.' })); if (!a) return;
  const b = await nxPinPrompt(nxL({ en: 'Repeat code', de: 'Code wiederholen' })); if (!b) return;
  if (a !== b) { showToast(nxL({ en: 'The codes don’t match.', de: 'Die Codes stimmen nicht überein.' }), 'error'); return; }
  try { await nxParentalCall({ action: 'setup', newPin: a }); _nxParentalPin = a; _nxParentalPinAt = Date.now(); renderSettingsPage('parental'); showToast(nxL({ en: 'Parental controls on', de: 'Kindersicherung an' }), 'success'); }
  catch (e) { showToast(e.message, 'error'); }
}
async function nxParentalDisable() {
  const pin = await nxPinPrompt(nxL({ en: 'Turn off parental controls', de: 'Kindersicherung ausschalten' })); if (!pin) return;
  try { await nxParentalCall({ action: 'disable', pin }); _nxParentalPin = null; showToast(nxL({ en: 'Parental controls off', de: 'Kindersicherung aus' }), 'success'); refreshCurrentPage(); }
  catch (e) { showToast(e.message, 'error'); }
}
async function nxParentalChangePin() {
  const old = await nxPinPrompt(nxL({ en: 'Current code', de: 'Aktueller Code' })); if (!old) return;
  const a = await nxPinPrompt(nxL({ en: 'New code', de: 'Neuer Code' })); if (!a) return;
  const b = await nxPinPrompt(nxL({ en: 'Repeat new code', de: 'Neuen Code wiederholen' })); if (!b) return;
  if (a !== b) { showToast(nxL({ en: 'The codes don’t match.', de: 'Die Codes stimmen nicht überein.' }), 'error'); return; }
  try { await nxParentalCall({ action: 'changePin', pin: old, newPin: a }); _nxParentalPin = a; _nxParentalPinAt = Date.now(); showToast(nxL({ en: 'Code changed', de: 'Code geändert' }), 'success'); }
  catch (e) { showToast(e.message, 'error'); }
}
// ─── Teil: client/konto-familie/995-ereignis-handler.js ───
// ── Ereignis-Handler (v1.82: statt Inline-Handlern im HTML – CSP ohne 'unsafe-inline'; Verteiler: public/js/nx-events.js) ──
(window.NX_H = window.NX_H || {}).h_konto_familie_remove_170 = function (event, v) { this.remove() };
(window.NX_H = window.NX_H || {}).h_konto_familie_navigateTo_168 = function (event, v) { navigateTo('playlist','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_konto_familie_openAuthModal_190 = function (event, v) { openAuthModal('login') };
(window.NX_H = window.NX_H || {}).h_konto_familie_nxCreatePlaylistDialog_191 = function (event, v) { nxCreatePlaylistDialog() };
(window.NX_H = window.NX_H || {}).h_konto_familie_navigateTo_229 = function (event, v) { navigateTo('channel','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_konto_familie_nxPlayPlaylist_233 = function (event, v) { nxPlayPlaylist(false) };
(window.NX_H = window.NX_H || {}).h_konto_familie_nxPlayPlaylist_234 = function (event, v) { nxPlayPlaylist(true) };
(window.NX_H = window.NX_H || {}).h_konto_familie_nxPlaylistMenu_235 = function (event, v) { nxPlaylistMenu(this) };
(window.NX_H = window.NX_H || {}).h_konto_familie_remove_249 = function (event, v) { this.remove() };
(window.NX_H = window.NX_H || {}).h_konto_familie_stopPropagation_251 = function (event, v) { event.stopPropagation() };
(window.NX_H = window.NX_H || {}).h_konto_familie_nxMovePlaylistItem_252 = function (event, v) { nxMovePlaylistItem(NX_H.$l(v[0]),-1) };
(window.NX_H = window.NX_H || {}).h_konto_familie_nxMovePlaylistItem_253 = function (event, v) { nxMovePlaylistItem(NX_H.$l(v[0]),1) };
(window.NX_H = window.NX_H || {}).h_konto_familie_nxRemovePlaylistItem_254 = function (event, v) { nxRemovePlaylistItem('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_konto_familie_navigateTo_246 = function (event, v) { navigateTo('watch','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_konto_familie_logout_452 = function (event, v) { logout();document.getElementById('nx-age-gate')?.remove() };
(window.NX_H = window.NX_H || {}).h_konto_familie_nxParentalUnlock_623 = function (event, v) { nxParentalUnlock() };
(window.NX_H = window.NX_H || {}).h_konto_familie_nxParentalEnable_624 = function (event, v) { nxParentalEnable() };
(window.NX_H = window.NX_H || {}).h_konto_familie_nxParentalScreen_635 = function (event, v) { nxParentalScreen() };
(window.NX_H = window.NX_H || {}).h_konto_familie_nxParentalScreen_637 = function (event, v) { nxParentalScreen() };
(window.NX_H = window.NX_H || {}).h_konto_familie_nxScreenExtend_674 = function (event, v) { nxScreenExtend(NX_H.$l(v[0])) };
