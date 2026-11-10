// Norynex – Ereignis-Verteiler ohne Inline-JavaScript (v1.82)
//
// Früher stand der Code direkt im HTML (Inline-Handler wie onclick / onerror mit lvGift('abc', this)).
// Das zwingt die CSP zu script-src-attr 'unsafe-inline' – dann führt JEDES eingeschleuste
// onerror-Attribut Code aus. Jetzt:
//   <button data-h-click="h_name" data-hv-click='["abc"]'>
// h_name ist eine Funktion in einer Skriptdatei (window.NX_H.h_name), die genau den alten Code enthält:
//   function (event, v) { lvGift(NX_H.$s(v[0]), this); }
// this = das Element, event = das Ereignis, return false = preventDefault – wie beim Inline-Handler.
// Werte aus der Vorlage (${…}) stehen in data-hv-<ereignis> (JSON):
//   NX_H.$s(raw) → als Text (stand im alten Code in Anführungszeichen; HTML-/JS-Maskierung zurück)
//   NX_H.$l(raw) → als Literal (Zahl, true/false, null …; stand ohne Anführungszeichen)
// Reihenfolge und stopPropagation() wirken wie früher: der Handler läuft in der Bubble-Phase am Element selbst.
// Für Code, der beim Rendern als Funktion vorliegt: ${nxOn('click', () => …)} (Funktionsregister).
// Nur Funktionen aus window.NX_H werden aufgerufen – keine beliebigen globalen Funktionen.
(function () {
  'use strict';
  if (window._nxEvents) return;
  window._nxEvents = true;
  const H = window.NX_H = window.NX_H || {};
  const HELPERS = new Set(['$s', '$l']);

  function htmlDecode(s) {
    return String(s).replace(/&(#x[0-9a-f]+|#\d+|quot|amp|lt|gt|apos);/gi, (m, e) => {
      const k = e.toLowerCase();
      if (k === 'quot') return '"'; if (k === 'amp') return '&'; if (k === 'lt') return '<'; if (k === 'gt') return '>'; if (k === 'apos') return "'";
      try { return String.fromCodePoint(k[1] === 'x' ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10)); } catch (_) { return m; }
    });
  }
  function jsUnescape(s) {
    return s.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, (m, e) => {
      if (e[0] === 'u') return String.fromCodePoint(parseInt(e[1] === '{' ? e.slice(2, -1) : e.slice(1), 16));
      if (e[0] === 'x') return String.fromCharCode(parseInt(e.slice(1), 16));
      return ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', 0: '\0', '\n': '' })[e] ?? e;
    });
  }
  /** Wert, der im alten Inline-Code innerhalb eines String-Literals stand */
  H.$s = (raw) => jsUnescape(htmlDecode(raw == null ? '' : raw));
  /** Wert, der im alten Inline-Code ohne Anführungszeichen stand (Zahl, true/false …) */
  H.$l = (raw) => {
    const t = htmlDecode(raw == null ? '' : raw).trim();
    if (/^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) return Number(t);
    if (t === 'true') return true; if (t === 'false') return false; if (t === 'null') return null;
    if (t === 'undefined' || t === '') return undefined; if (t === 'NaN') return NaN;
    if (/^(['"]).*\1$/s.test(t)) return jsUnescape(t.slice(1, -1));
    try { return JSON.parse(t); } catch (_) { return t; }
  };

  /** data-hv-…="${nxHv(a, b)}" – Werte sicher für ein HTML-Attribut maskiert */
  window.nxHv = function () {
    return JSON.stringify(Array.prototype.slice.call(arguments), (k, v) => (v === undefined ? null : v))
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  // Funktionen beim Rendern registrieren: `<div ${nxOn('click', () => navigateTo('channel', id))}>`
  let seq = 0;
  const FN_MAX = 20000; // ältere Einträge werden freigegeben (Speicher), sichtbar ist davon nichts mehr
  window.nxOn = function (type, fn) {
    if (typeof fn !== 'function' || !/^[a-z]+$/.test(type)) return '';
    const id = '_f' + (++seq);
    H[id] = function (event) { return fn.call(this, event); };
    if (seq > FN_MAX) delete H['_f' + (seq - FN_MAX)];
    return `data-h-${type}="${id}"`;
  };

  function handlerOf(el, type) {
    const name = el.getAttribute('data-h-' + type);
    if (!name || HELPERS.has(name) || !Object.prototype.hasOwnProperty.call(H, name) || typeof H[name] !== 'function') {
      if (name) console.warn('[nx-events] unbekannter Handler:', name);
      return null;
    }
    return H[name];
  }
  function run(el, e, type) {
    const fn = handlerOf(el, type);
    if (!fn) return;
    let v = [];
    const hv = el.getAttribute('data-hv-' + type);
    if (hv) { try { v = JSON.parse(hv); } catch (_) { v = []; } }
    let r;
    try { r = fn.call(el, e, v); }
    catch (err) { console.error('[nx-events] Fehler in ' + el.getAttribute('data-h-' + type) + ':', err); }
    // return false = preventDefault; <a href="#"> als Knopf springt nicht und ändert nicht die Adresse (#…-Routen)
    if (r === false || (type === 'click' && el.tagName === 'A' && el.getAttribute('href') === '#')) e.preventDefault();
  }
  const chain = (start, type) => {
    const out = [];
    const sel = '[data-h-' + type + ']';
    let el = start && start.closest ? start.closest(sel) : null;
    while (el) { out.push(el); el = el.parentElement ? el.parentElement.closest(sel) : null; }
    return out;
  };
  const BUBBLING = ['click', 'dblclick', 'contextmenu', 'change', 'input', 'submit', 'keydown', 'keyup', 'keypress', 'paste',
    'mousedown', 'mouseup', 'mouseover', 'mouseout', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'wheel', 'drop', 'dragover'];
  // Damit stopPropagation(), Reihenfolge und eigene addEventListener-Listener genau wie bei
  // Inline-Handlern wirken, hängt sich der Verteiler in der Capture-Phase für dieses eine Ereignis
  // an jedes betroffene Element. Der Handler läuft dann in der Bubble-Phase am Element selbst.
  const pending = new Set();
  function cleanup() { for (const [el, type, fn] of pending) el.removeEventListener(type, fn); pending.clear(); }
  for (const type of BUBBLING) {
    document.addEventListener(type, (e) => {
      for (const el of chain(e.target, type)) {
        const fn = (ev) => {
          if (ev !== e) return;
          el.removeEventListener(type, fn);
          pending.delete(entry);
          run(el, ev, type);
        };
        const entry = [el, type, fn];
        pending.add(entry);
        el.addEventListener(type, fn);
      }
      if (pending.size) setTimeout(cleanup, 0); // bei abgebrochener Ausbreitung übrig gebliebene lösen
    }, true);
  }
  // Ereignisse ohne Bubbling (Bild-Fehler, Fokus …): nur am Element selbst, über die Capture-Phase
  for (const type of ['error', 'load', 'focus', 'blur', 'ended', 'play', 'pause', 'timeupdate', 'loadedmetadata', 'scroll', 'toggle']) {
    document.addEventListener(type, (e) => {
      const el = e.target;
      if (!el || !el.hasAttribute || !el.hasAttribute('data-h-' + type)) return;
      run(el, e, type);
      if (type === 'error') el.removeAttribute('data-h-error'); // wie "this.onerror=null": nur einmal
    }, true);
  }
  // Bilder, deren Laden schon VOR dem Einhängen ins Dokument scheiterte (innerHTML in ein noch nicht
  // eingehängtes Element), lösen ihr error-Ereignis nie am document aus – ein Inline-onerror lief da
  // trotzdem. Deshalb beim Einhängen nachholen: decode() scheitert nur bei wirklich kaputten Bildern.
  function catchUpErrors(root) {
    const imgs = root.tagName === 'IMG' ? [root] : (root.querySelectorAll ? root.querySelectorAll('img[data-h-error]') : []);
    for (const img of imgs) {
      if (!img.hasAttribute('data-h-error') || !img.complete || img.naturalWidth || !img.getAttribute('src')) continue;
      Promise.resolve().then(() => img.decode()).catch(() => {
        if (!img.isConnected || !img.hasAttribute('data-h-error') || img.naturalWidth) return;
        run(img, new Event('error'), 'error');
        img.removeAttribute('data-h-error');
      });
    }
  }
  if (typeof MutationObserver === 'function') {
    const start = () => {
      new MutationObserver((list) => { for (const m of list) for (const n of m.addedNodes) if (n.nodeType === 1) catchUpErrors(n); })
        .observe(document.documentElement, { childList: true, subtree: true });
      catchUpErrors(document.documentElement);
    };
    if (document.documentElement) start(); else document.addEventListener('DOMContentLoaded', start);
  }
})();
