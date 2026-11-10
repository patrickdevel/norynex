// Ausgelagert aus public/index.html (v1.79, damit die CSP ohne 'unsafe-inline' für <script> auskommt)
// ── Device detection ──────────────────────────────────────
const _ua = navigator.userAgent;
const _isIOS     = /iPad|iPhone|iPod/.test(_ua) && !window.MSStream;
const _isPC      = !_isIOS;
const _isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

// ── Service Worker ────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      // Sobald ein neuer Service Worker (neues Deploy) bereitsteht, sofort aktivieren
      // lassen statt zu warten, bis alle Tabs geschlossen sind — sonst bleiben
      // Nutzer, die die Seite offen hatten, auf altem JS-Code hängen.
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }).catch(() => {});
    // Wenn der aktive Service Worker wechselt (neue Version übernimmt), einmalig
    // neu laden, damit wirklich der neue app.js/CSS-Stand verwendet wird.
    let _swRefreshed = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (_swRefreshed) return;
      _swRefreshed = true;
      window.location.reload();
    });
  });
}

// ── Install Banner logic ──────────────────────────────────
let deferredPrompt = null;

function _showBanner() {
  if (_isStandalone) return;
  if (localStorage.getItem('pwa_dismissed')) return;
  const banner = document.getElementById('pwa-install-banner');
  if (!banner) return;

  if (_isPC) {
    // PC: PWA installieren (Chrome/Edge)
    document.getElementById('pwa-banner-title').textContent = 'Norynex als App installieren';
    document.getElementById('pwa-banner-sub').textContent = 'Direkt auf dem Desktop – kein Browser nötig';
    // btn shown only when beforeinstallprompt fires
  }
}

// PC only: native install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (_isPC && !localStorage.getItem('pwa_dismissed') && !_isStandalone) {
    setTimeout(() => {
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.style.display = 'flex';
    }, 8000);
  }
});

document.getElementById('pwa-install-btn').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById('pwa-install-banner').style.display = 'none';
  if (outcome === 'accepted') localStorage.setItem('pwa_installed', '1');
});

window.addEventListener('appinstalled', () => {
  document.getElementById('pwa-install-banner').style.display = 'none';
  localStorage.setItem('pwa_installed', '1');
});

// iOS: kein Install-Banner

// PC: show banner (install btn hidden until prompt fires)
if (_isPC && !_isStandalone && !localStorage.getItem('pwa_dismissed')) {
  // btn will appear when beforeinstallprompt fires
}

// ── iOS Guide Modal ───────────────────────────────────────
function _showIOSGuide() {
  document.getElementById('pwa-install-banner').style.display = 'none';
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.88);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center';
  overlay.innerHTML = `
    <div style="background:var(--bg-card);border-radius:20px 20px 0 0;padding:28px 24px 40px;width:100%;max-width:480px;border:1px solid rgba(168,59,255,0.3)">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:26px;margin-bottom:8px;color:var(--purple-light)"><i class="fas fa-mobile-screen-button"></i></div>
        <h3 style="margin:0;color:white;font-size:18px;font-weight:800">Norynex auf iPhone installieren</h3>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.05);border-radius:12px;padding:14px">
          <div style="width:36px;height:36px;background:rgba(168,59,255,0.3);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">1</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.85)">Tippe auf das <strong style="color:white">Teilen-Symbol</strong> <span style="font-size:15px;color:#60a5fa"><i class="fas fa-arrow-up-from-bracket"></i></span> unten in Safari</div>
        </div>
        <div style="display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.05);border-radius:12px;padding:14px">
          <div style="width:36px;height:36px;background:rgba(168,59,255,0.3);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">2</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.85)">Scrolle runter und tippe auf <strong style="color:white">„Zum Home-Bildschirm"</strong> <span style="font-size:14px;color:#fff"><i class="fas fa-square-plus"></i></span></div>
        </div>
        <div style="display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.05);border-radius:12px;padding:14px">
          <div style="width:36px;height:36px;background:rgba(168,59,255,0.3);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">3</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.85)">Tippe oben rechts auf <strong style="color:white">„Hinzufügen"</strong> — fertig!</div>
        </div>
      </div>
      <button data-h-click="h_index_4_closest_91" style="width:100%;margin-top:20px;padding:14px;border-radius:12px;border:none;background:linear-gradient(var(--accent),var(--accent));color:white;font-size:15px;font-weight:700;cursor:pointer">Verstanden</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ── Global function for settings page ────────────────────
window.showDownloadPage = function() {
  const overlay = document.createElement('div');
  overlay.id = 'nxd-download-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:20px';
  const lang = typeof cl === 'function' ? cl() : 'de';
  const de = lang !== 'en';

  overlay.innerHTML = `
    <div style="position:relative;padding:8px">
      <button data-h-click="h_index_4_getElementById_125" style="position:absolute;top:-8px;right:-8px;background:rgba(255,255,255,0.15);border:none;color:white;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;z-index:1">&times;</button>
      <button id="pc-pwa-btn" data-h-click="h_index_4__triggerPCInstall_125" style="padding:18px 48px;border-radius:16px;background:linear-gradient(var(--accent),var(--accent));border:none;color:white;font-size:20px;font-weight:800;cursor:pointer;box-shadow:0 8px 32px rgba(0,0,0,0.25);min-width:220px">${de?'Installieren':'Install'}</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

};

function _triggerPCInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(({ outcome }) => {
      deferredPrompt = null;
      document.getElementById('nxd-download-overlay')?.remove();
      if (outcome === 'accepted') localStorage.setItem('pwa_installed', '1');
    });
  } else {
    // PWA already installed or browser doesn't support — close overlay
    const btn = document.getElementById('pc-pwa-btn');
    if (btn) {
      const de = (typeof cl === 'function' ? cl() : 'de') !== 'en';
      btn.textContent = de ? 'Bereits installiert' : 'Already installed';
      btn.style.opacity = '0.6';
      btn.style.cursor = 'default';
    }
  }
}

// ── Ereignis-Handler (v1.82: statt Inline-Handlern im HTML – CSP ohne 'unsafe-inline'; Verteiler: public/js/nx-events.js) ──
(window.NX_H = window.NX_H || {}).h_index_4_closest_91 = function (event, v) { this.closest('div[style*=fixed]').remove() };
(window.NX_H = window.NX_H || {}).h_index_4_getElementById_125 = function (event, v) { document.getElementById('nxd-download-overlay').remove() };
(window.NX_H = window.NX_H || {}).h_index_4__triggerPCInstall_125 = function (event, v) { _triggerPCInstall() };
