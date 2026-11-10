// ⚠️  AUTOMATISCH ERZEUGT aus client/werksreset/*.js — bitte NICHT hier bearbeiten, sondern dort; danach "npm run build".
// ─── Teil: client/werksreset/010-start.js ───
/* =====================================================================
   Norynex v1.71 · Werksreset auf Client-Seite
   Nach einem Werksreset im Admin-Panel löscht jedes Gerät seine lokalen Daten:
   Nexa-Chats, Suchverlauf, gespeicherte Accounts — und meldet gelöschte Accounts ab.
   ===================================================================== */
(function () {
  const KEY = 'nx_reset_epoch';
  function wipeLocal(keepUserId) {
    try {
      const drop = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (k.startsWith('nx_convs_') || k === 'nx_search_history' || k === 'nxd_accounts' || k === 'nx_banner_dismissed') drop.push(k);
      }
      drop.forEach(k => localStorage.removeItem(k));
      const me = (() => { try { return JSON.parse(localStorage.getItem('nxd_user') || 'null'); } catch { return null; } })();
      if (!me || me.id !== keepUserId) { localStorage.removeItem('nxd_token'); localStorage.removeItem('nxd_user'); return true; }
    } catch {}
    return false;
  }
  function apply(epoch, keepUserId) {
    let known = null; try { known = localStorage.getItem(KEY); } catch {}
    if (!epoch || known === epoch) return;
    const hadStore = known !== null;
    try { localStorage.setItem(KEY, epoch); } catch {}
    // Erstes Laden auf diesem Gerät nach dem Update: nur merken, nichts löschen,
    // außer der Reset ist gerade erst passiert (dann gehören die lokalen Daten zu gelöschten Accounts).
    const recent = Date.now() - new Date(epoch).getTime() < 30 * 86400000;
    if (!hadStore && !recent) return;
    // Gerät kennt den Reset noch nicht → lokale Daten weg, gelöschte Accounts abmelden
    try { if (typeof NX !== 'undefined' && NX) { NX.convs = []; NX.activeId = null; } } catch {}
    const loggedOut = wipeLocal(keepUserId);
    if (loggedOut && typeof currentUser !== 'undefined' && currentUser) setTimeout(() => location.reload(), 300);
  }
  // Beim Start prüfen
  fetch('/api/reset-epoch').then(r => r.json()).then(d => {
    if (!d || !d.resetEpoch) return;
    let me = null; try { me = JSON.parse(localStorage.getItem('nxd_user') || 'null'); } catch {}
    // keepUserId unbekannt → über /api/auth/me prüfen, ob der Account noch existiert
    const tk = localStorage.getItem('nxd_token');
    if (!tk) return apply(d.resetEpoch, null);
    fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + tk } }).then(r => apply(d.resetEpoch, r.ok ? (me && me.id) : null)).catch(() => {});
  }).catch(() => {});
  // Live: Reset passiert, während die Seite offen ist
  const hook = setInterval(() => {
    if (typeof socket === 'undefined' || !socket) return;
    clearInterval(hook);
    socket.on('factory_reset', d => {
      apply(d && d.resetEpoch, d && d.keepUserId);
      if (typeof showToast === 'function') showToast(typeof tr === 'function' ? tr({ en: 'Norynex was reset.', de: 'Norynex wurde zurückgesetzt.' }) : 'Norynex wurde zurückgesetzt.', 'info');
      setTimeout(() => location.reload(), 1500);
    });
  }, 500);
})();
