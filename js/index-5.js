// Ausgelagert aus public/index.html (v1.79, damit die CSP ohne 'unsafe-inline' für <script> auskommt)
/* ── Ripple Effect ──────────────────────────────────────── */
(function() {
  const RIPPLE_SELECTORS = [
    '.btn-primary', '.btn-secondary', '.btn-register', '.btn-login',
    '.subscribe-btn', '.cat-pill', '.action-btn', '.icon-btn',
    '.nav-item', '.share-btn-item', '#pwa-install-btn', '#pc-pwa-btn'
  ];
  function addRipple(e) {
    const el = e.currentTarget;
    el.classList.add('ripple-host');
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top  - size / 2;
    const circle = document.createElement('span');
    circle.className = 'ripple-circle';
    circle.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    el.appendChild(circle);
    circle.addEventListener('animationend', () => circle.remove());
  }
  function attachRipples() {
    RIPPLE_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.dataset.ripple) {
          el.dataset.ripple = '1';
          el.addEventListener('click', addRipple);
        }
      });
    });
  }
  attachRipples();
  new MutationObserver(attachRipples).observe(document.body, { childList: true, subtree: true });
})();

/* ── Header scroll shadow ───────────────────────────────── */
(function() {
  const header = document.getElementById('main-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
})();

/* ── Mobile bottom nav pop on activate ─────────────────── */
(function() {
  document.addEventListener('click', e => {
    const a = e.target.closest('#mobile-bottom-nav a');
    if (!a) return;
    document.querySelectorAll('#mobile-bottom-nav a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
  });
})();

// Ausgelagert aus public/index.html (v1.79, damit die CSP ohne 'unsafe-inline' für <script> auskommt)
// Custom select dropdowns
const _nxdSelectState = {};

function toggleNxdSelect(id) {
  const menu = document.getElementById(id + '-select-menu');
  const btn  = document.getElementById(id + '-select-btn');
  const isOpen = menu.style.display !== 'none';

  // Close all open menus first
  document.querySelectorAll('.nxd-select-menu').forEach(m => m.style.display = 'none');
  document.querySelectorAll('.nxd-select-btn').forEach(b => b.classList.remove('open'));

  if (!isOpen) {
    menu.style.display = 'block';
    btn.classList.add('open');
  }
}

// Bugfix: Vorher standen Icon/Label als String im onclick-Attribut – mit einem Syntaxfehler
// (t(\'vis_public\')), wodurch KEINE Option anklickbar war. Jetzt werden Icon und Text
// direkt aus der angeklickten Option gelesen.
function setNxdSelect(id, value, iconHtml, label) {
  const opt = document.getElementById(id + '-opt-' + value);
  if (opt && iconHtml === undefined) {
    const ic = opt.querySelector('i');
    iconHtml = ic ? `<i class="${ic.className}"></i>` : '';
    label = opt.querySelector('[data-i18n]')?.textContent || opt.textContent.trim();
  }
  document.querySelectorAll(`#${id}-select-menu .nxd-select-option`).forEach(o => o.classList.toggle('is-selected', o === opt));
  document.getElementById(id + '-select-icon').innerHTML = iconHtml || '';
  document.getElementById(id + '-select-label').textContent = label || '';
  document.getElementById(id + '-select-menu').style.display = 'none';
  document.getElementById(id + '-select-btn').classList.remove('open');

  if (id === 'vis') {
    document.getElementById('vid-visibility').value = value;
    document.getElementById('vid-private').value = String(value === 'private');
  } else if (id === 'aud') {
    document.getElementById('vid-kids').value = String(value === 'kids');
  }
}

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nxd-select-wrap')) {
    document.querySelectorAll('.nxd-select-menu').forEach(m => m.style.display = 'none');
    document.querySelectorAll('.nxd-select-btn').forEach(b => b.classList.remove('open'));
  }
});
