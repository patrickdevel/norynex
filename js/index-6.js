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
