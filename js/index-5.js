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
