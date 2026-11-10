// Ausgelagert aus public/index.html (v1.79, damit die CSP ohne 'unsafe-inline' für <script> auskommt)
(function(){
  // Consent-gated external script loader
  var _loadedScripts = {};
  function loadScript(src, id) {
    if (_loadedScripts[id]) return;
    _loadedScripts[id] = true;
    var s = document.createElement('script');
    s.src = src; s.async = true; s.defer = true;
    if (id) s.id = id;
    document.head.appendChild(s);
  }
  function loadLink(href, id) {
    if (_loadedScripts[id]) return;
    _loadedScripts[id] = true;
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
  }

  // Load external scripts based on consent
  window._loadConsentScripts = function(consent) {
    if (consent.functional) {
      // Google Sign-In (die Client-ID kommt seit v1.80 vom Server: /api/auth/providers)
      loadScript('https://accounts.google.com/gsi/client', 'gsi-script');
    }
  };

  function hideBanner() {
    var b = document.getElementById('cookie-banner');
    if (b) b.classList.remove('show');
    document.getElementById('cookie-modal').style.display = 'none';
  }

  function checkCookieConsent(){
    var raw = localStorage.getItem('nxd_cookie_consent');
    if (!raw) {
      setTimeout(function(){ var b=document.getElementById('cookie-banner'); if(b) b.classList.add('show'); }, 800);
    } else {
      try { window._loadConsentScripts(JSON.parse(raw)); } catch(e) {}
    }
  }

  window.acceptAllCookies = function(){
    var consent = {necessary:true,analytics:true,marketing:true,functional:true,date:new Date().toISOString()};
    localStorage.setItem('nxd_cookie_consent', JSON.stringify(consent));
    hideBanner();
    window._loadConsentScripts(consent);
  };

  window.rejectAllCookies = function(){
    var consent = {necessary:true,analytics:false,marketing:false,functional:false,date:new Date().toISOString()};
    localStorage.setItem('nxd_cookie_consent', JSON.stringify(consent));
    hideBanner();
    // No external scripts loaded
  };

  window.openCookieSettings = function(){
    var consent = JSON.parse(localStorage.getItem('nxd_cookie_consent') || '{}');
    var a = document.getElementById('cookie-analytics');
    var m = document.getElementById('cookie-marketing');
    var f = document.getElementById('cookie-functional');
    // Default: alle optional DEAKTIVIERT (DSGVO-konform: opt-in, nicht opt-out)
    if (a) a.checked = !!consent.analytics;
    if (m) m.checked = !!consent.marketing;
    if (f) f.checked = !!consent.functional;
    document.getElementById('cookie-modal').style.display = 'flex';
  };

  window.saveCookieSettings = function(){
    var analytics  = document.getElementById('cookie-analytics')?.checked  || false;
    var marketing  = document.getElementById('cookie-marketing')?.checked  || false;
    var functional = document.getElementById('cookie-functional')?.checked || false;
    var consent = {necessary:true,analytics,marketing,functional,date:new Date().toISOString()};
    localStorage.setItem('nxd_cookie_consent', JSON.stringify(consent));
    hideBanner();
    window._loadConsentScripts(consent);
    if (typeof showToast === 'function') showToast('Cookie-Einstellungen gespeichert', 'success');
  };

  document.addEventListener('DOMContentLoaded', checkCookieConsent);
})();
