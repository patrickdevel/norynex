// Ausgelagert aus public/index.html (v1.79, damit die CSP ohne 'unsafe-inline' für <script> auskommt)
// Muss VOR dem Cast-SDK definiert sein, sonst verpasst app.js den einmaligen Callback (Race-Condition).
// Die Cast-Sitzung wird SOFORT beim Laden konfiguriert (nicht erst, wenn app.js so weit ist).
// Dadurch kennt Chrome die Seite als "castbar": In der Medien-Steuerung oben rechts
// (Noten-Symbol) und im Chrome-Menü → "Streamen…" erscheinen die Geräte direkt — wie bei YouTube.
window.__onGCastApiAvailable = function (ok) {
  window.__nxCastAvailable = !!ok;
  if (ok) {
    try {
      cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        resumeSavedSession: true
      });
      window.__nxCastConfigured = true;
    } catch (e) { console.warn('[Cast] Init fehlgeschlagen', e); }
  }
  if (typeof window.__nxCastInit === 'function') window.__nxCastInit(ok);
};
