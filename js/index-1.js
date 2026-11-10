// Ausgelagert aus public/index.html (v1.79, damit die CSP ohne 'unsafe-inline' für <script> auskommt)
// OAuth-Popup-Callback-Erkennung: Läuft als Erstes, noch vor jedem anderen Skript.
// Prüft NUR den URL-Hash (unabhängig von window.opener!), weil ein
// Cross-Origin-Opener-Policy-Header (z.B. durch Helmet, ein CDN oder einen
// Reverse-Proxy) window.opener bereits auf null gesetzt haben kann, sobald dieses
// Fenster von accounts.google.com zurück auf die eigene Origin navigiert.
// Meldung ans Elternfenster läuft daher über ZWEI unabhängige Kanäle:
//   1) postMessage über window.opener, falls vorhanden (schnellster Weg)
//   2) localStorage-Eintrag, den JEDES andere Fenster derselben Origin per
//      "storage"-Event mitbekommt — funktioniert auch wenn opener bereits null ist,
//      da es sich um plattform-internes Storage-Messaging und keinen direkten
//      Cross-Window-JS-Zugriff handelt und somit von COOP nicht betroffen ist.
// So schließt sich das Popup zuverlässig, egal ob/wo ein COOP-Header aktiv ist.
(function() {
  try {
    if (window.opener === window) return; // kein Popup, normale Seite
    var hash = window.location.hash ? window.location.hash.slice(1) : '';
    if (!hash) return;
    var params = new URLSearchParams(hash);
    var id_token = params.get('id_token');
    var error = params.get('error');
    if (!id_token && !error) return; // kein OAuth-Redirect, normale Nutzung
    var payload = { __norynexGoogleAuth: true, id_token: id_token, error: error, state: params.get('state'), ts: Date.now() };
    // Kanal 1: postMessage (funktioniert nur wenn opener noch erreichbar ist)
    try { if (window.opener) window.opener.postMessage(payload, window.location.origin); } catch (e) {}
    // Kanal 2: localStorage-Broadcast (funktioniert unabhängig von COOP/opener)
    try { localStorage.setItem('__norynexGoogleAuthResult', JSON.stringify(payload)); } catch (e) {}
    document.title = 'Anmeldung abgeschlossen…';
    // Kurze Verzögerung, damit das storage-Event im Elternfenster sicher ankommt,
    // bevor sich dieses Fenster schließt.
    setTimeout(function() { try { window.close(); } catch (e) {} }, 150);
  } catch (e) { /* still weitermachen, falls irgendwas hier unerwartet fehlschlägt */ }
})();

// Splash-Logo lädt nicht → Ersatz anzeigen (vorher als Inline-onerror direkt im HTML)
document.addEventListener('error', function (e) {
  var t = e.target;
  if (t && t.hasAttribute && t.hasAttribute('data-splash-logo')) { t.style.display = 'none'; var f = document.getElementById('nxd-splash-fallback'); if (f) f.style.display = 'flex'; }
}, true);
