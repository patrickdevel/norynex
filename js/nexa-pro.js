/* =====================================================================
   Norynex · Nexa Studio v2  (Creator Studio → „Nexa Hilfe“)
   Ersetzt renderNexaHelpPanel()/sendNexaHelpMessage() aus app.js.
   Features: Chat-Verlauf (lokal gespeichert, anheften/umbenennen/löschen,
   Suche), Themen-Kategorien mit Prompt-Vorlagen, Kanal-Snapshot,
   Markdown-Antworten, Kopieren/Neu generieren/Feedback, Stopp-Taste,
   Antwortlänge (Kurz/Normal/Ausführlich), Folgefragen, Export als Markdown.
   ===================================================================== */

const NX = {
  convs: [], activeId: null, busy: false, ctrl: null, status: null, snapshot: null,
  detail: 'normal', cat: 'channel', search: '', thinkTimer: null,
};
const NX_MAX_CHARS = 1000;

const NX_CATS = [
  { id: 'channel', icon: 'fa-chart-line', color: '#a83bff', title: 'Kanal-Analyse', desc: 'Leistung, Trends & beste Videos verstehen', prompts: [
    'Fasse die Leistung meines Kanals zusammen', 'Welches meiner Videos läuft am besten – und warum?', 'Wo verliere ich gerade Potenzial?', 'Vergleiche meine Shorts mit meinen langen Videos'] },
  { id: 'ideas', icon: 'fa-lightbulb', color: '#f59e0b', title: 'Video-Ideen', desc: 'Neue Formate, Serien & Content-Plan', prompts: [
    'Mach mir 5 Vorschläge für mein nächstes Video', 'Erstelle mir einen Content-Plan für die nächsten 2 Wochen', 'Welche Serie könnte zu meinem Kanal passen?', 'Gib mir 3 Short-Ideen aus meinem besten Video'] },
  { id: 'packaging', icon: 'fa-wand-magic-sparkles', color: '#a83bff', title: 'Titel & Thumbnails', desc: 'Klickstarke Titel, Beschreibungen, Tags', prompts: [
    'Schreib mir 5 bessere Titel für mein letztes Video', 'Beschreibe ein Thumbnail-Konzept für mein Video im Langformat', 'Erstelle eine SEO-Beschreibung mit Hashtags', 'Welche Tags passen zu meinem Kanal?'] },
  { id: 'growth', icon: 'fa-rocket', color: '#06b6d4', title: 'Wachstum & Community', desc: 'Abonnenten, Kommentare, Upload-Zeiten', prompts: [
    'Wie gewinne ich mehr Abonnenten?', 'Wann sollte ich am besten hochladen?', 'Wie bekomme ich mehr Kommentare unter meine Videos?', 'Wie nutze ich Beiträge und Stories für mehr Reichweite?'] },
  { id: 'money', icon: 'fa-coins', color: '#22c55e', title: 'Monetarisierung', desc: 'Auszahlungen, Creator-Codes, Paid Videos', prompts: [
    'Wie funktionieren Auszahlungen auf Norynex?', 'Wie bekomme ich einen Creator-Code?', 'Lohnen sich kostenpflichtige Videos für mich?', 'Welche Voraussetzungen brauche ich für die Monetarisierung?'] },
  { id: 'account', icon: 'fa-user-gear', color: '#60a5fa', title: 'Konto & Hilfe', desc: 'Premium, Sicherheit, Einstellungen', prompts: [
    'Wie kündige ich Premium?', 'Wie aktiviere ich die Zwei-Faktor-Authentifizierung?', 'Wie lösche ich ein Video?', 'Wie stelle ich den Kommentar-Filter ein?'] },
];

const NX_TEMPLATES = [
  { icon: 'fa-heading', label: 'Titel-Ideen für …', text: 'Gib mir 5 klickstarke Titel für ein Video über: ' },
  { icon: 'fa-align-left', label: 'Beschreibung schreiben für …', text: 'Schreib mir eine Videobeschreibung (mit Hashtags) für ein Video über: ' },
  { icon: 'fa-image', label: 'Thumbnail-Konzept für …', text: 'Beschreibe ein Thumbnail-Konzept (Motiv, Text, Farben) für ein Video über: ' },
  { icon: 'fa-hashtag', label: 'Hashtags & Tags für …', text: 'Welche Hashtags und Tags passen zu einem Video über: ' },
  { icon: 'fa-list-check', label: 'Video-Skript gliedern …', text: 'Erstelle eine Gliederung (Hook, Hauptteil, Call-to-Action) für ein Video über: ' },
];

/* ---------- Storage ---------- */
function nxStoreKey() { return 'nx_convs_' + (currentUser?.id || 'anon'); }
function nxLoad() {
  try { NX.convs = JSON.parse(localStorage.getItem(nxStoreKey()) || '[]'); } catch { NX.convs = []; }
  try { NX.detail = localStorage.getItem('nx_detail') || 'normal'; } catch {}
}
function nxSave() {
  NX.convs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  if (NX.convs.length > 60) NX.convs.length = 60;
  try { localStorage.setItem(nxStoreKey(), JSON.stringify(NX.convs)); } catch {}
}
function nxActive() { return NX.convs.find(c => c.id === NX.activeId) || null; }
function nxId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

/* ---------- Markdown (sicher: erst escapen, dann formatieren) ---------- */
function nxMd(src) {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const codeBlocks = [];
  let text = String(src || '').replace(/\r/g, '').replace(/```(\w*)\n?([\s\S]*?)```/g, (_, l, c) => { codeBlocks.push(`<pre><code>${esc(c.replace(/\n$/, ''))}</code></pre>`); return `\u0000${codeBlocks.length - 1}\u0000`; });
  const inline = s => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  const lines = text.split('\n');
  let html = '', list = null, para = [], table = [];
  const flushPara = () => { if (para.length) { html += `<p>${para.map(inline).join('<br>')}</p>`; para = []; } };
  const flushList = () => { if (list) { html += `<${list.type}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.type}>`; list = null; } };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter(r => !/^\s*\|?\s*:?-{2,}/.test(r)).map(r => r.replace(/^\s*\||\|\s*$/g, '').split('|').map(c => c.trim()));
    html += `<table>${rows.map((r, i) => `<tr>${r.map(c => i === 0 ? `<th>${inline(c)}</th>` : `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</table>`;
    table = [];
  };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    let m;
    if (/^\u0000\d+\u0000$/.test(line.trim())) { flushPara(); flushList(); flushTable(); html += line.trim(); continue; }
    if (/^\s*\|.*\|\s*$/.test(line)) { flushPara(); flushList(); table.push(line); continue; } else flushTable();
    if (!line.trim()) { flushPara(); flushList(); continue; }
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) { flushPara(); flushList(); const lv = Math.min(3, m[1].length + 1); html += `<h${lv}>${inline(m[2])}</h${lv}>`; continue; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { flushPara(); flushList(); html += '<hr>'; continue; }
    if ((m = line.match(/^>\s?(.*)$/))) { flushPara(); flushList(); html += `<blockquote>${inline(m[1])}</blockquote>`; continue; }
    if ((m = line.match(/^\s*[-*•]\s+(.*)$/))) { flushPara(); if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) { flushPara(); if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] }; } list.items.push(m[1]); continue; }
    if (list && /^\s{2,}\S/.test(raw)) { list.items[list.items.length - 1] += ' ' + line.trim(); continue; }
    flushList(); para.push(line);
  }
  flushPara(); flushList(); flushTable();
  return html.replace(/\u0000(\d+)\u0000/g, (_, i) => codeBlocks[+i]);
}

/* ---------- Render ---------- */
function renderNexaHelpPanel(content) {
  nxLoad();
  NX.activeId = null;
  const host = content || document.getElementById('studio-panel');
  host.innerHTML = `
    <div class="nx-app" id="nx-app">
      <aside class="nx-side">
        <div class="nx-side-head">
          <button class="nx-new-btn" data-h-click="h_nexa_pro_nxNewChat_97"><i class="fas fa-pen-to-square"></i> Neuer Chat <kbd>Alt N</kbd></button>
          <div class="nx-side-search"><i class="fas fa-magnifying-glass"></i><input placeholder="Chats durchsuchen…" data-h-input="h_nexa_pro_nxDrawSide_97"></div>
        </div>
        <div class="nx-side-list" id="nx-side-list"></div>
        <div class="nx-side-foot"><div class="nx-snap" id="nx-snap"><div class="nx-snap-title"><i class="fas fa-chart-simple"></i> Dein Kanal</div><div class="ax-skel" style="height:64px"></div></div></div>
      </aside>
      <section class="nx-main">
        <div class="nx-top">
          <button class="ax-icon-btn" title="Verlauf ein-/ausblenden" data-h-click="h_nexa_pro_nxToggleSide_97"><i class="fas fa-bars-staggered"></i></button>
          <div class="nx-top-title">
            <div class="nx-logo is-sm"><img src="/assets/nexa-logo.svg" alt=""></div>
            <div style="min-width:0"><b>Nexa</b><small id="nx-status"><span class="ax-dot is-off" style="width:7px;height:7px"></span> Verbinde…</small></div>
          </div>
          <div class="nx-top-spacer"></div>
          <div class="nx-mode" title="Antwortlänge">
            ${[['short', 'Kurz'], ['normal', 'Normal'], ['detailed', 'Ausführlich']].map(([k, l]) => `<button data-d="${k}" class="${NX.detail === k ? 'is-active' : ''}" data-h-click="h_nexa_pro_nxSetDetail_116" data-hv-click="${nxHv(String(k))}">${l}</button>`).join('')}
          </div>
          <button class="ax-icon-btn" title="Chat als Markdown exportieren" data-h-click="h_nexa_pro_nxExport_116"><i class="fas fa-file-arrow-down"></i></button>
          <button class="ax-icon-btn" title="Schließen" data-h-click="h_nexa_pro_switchStudio_116"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="nx-scroll" id="nx-scroll"></div>
        <div class="nx-composer-wrap">
          <div id="nx-offline"></div>
          <div class="nx-composer" style="position:relative">
            <textarea id="nexa-help-input" rows="1" maxlength="${NX_MAX_CHARS}" placeholder="Frag Nexa etwas über deinen Kanal …" data-h-input="h_nexa_pro_nxAutosize_125" data-h-keydown="h_nexa_pro_nxKey_125"></textarea>
            <div class="nx-composer-bar">
              <button class="nx-chip" data-h-click="h_nexa_pro_nxToggleMenu_125"><i class="fas fa-plus"></i> Vorlagen</button>
              <button class="nx-chip" data-h-click="h_nexa_pro_nxInsertContext_125" title="Fügt deine wichtigsten Kanal-Zahlen in die Frage ein"><i class="fas fa-chart-simple"></i> Kanaldaten</button>
              <span class="nx-count" id="nx-count">0 / ${NX_MAX_CHARS}</span>
              <button class="nx-send" id="nx-send" data-h-click="h_nexa_pro_nxSendOrStop_129" disabled title="Senden (Enter)"><i class="fas fa-arrow-up"></i></button>
            </div>
          </div>
          <p class="nx-disclaimer">Nexa kann Fehler machen. Du bist für die Inhalte verantwortlich, die du veröffentlichst. · <kbd style="font-family:var(--ax-mono)">Enter</kbd> senden · <kbd style="font-family:var(--ax-mono)">Shift+Enter</kbd> neue Zeile</p>
        </div>
      </section>
    </div>`;
  nxDrawSide();
  nxDrawThread();
  nxLoadStatus();
  nxLoadSnapshot();
  if (!window._nxKeys) {
    window._nxKeys = true;
    document.addEventListener('keydown', e => { if (e.altKey && (e.key === 'n' || e.key === 'N') && document.getElementById('nx-app')) { e.preventDefault(); nxNewChat(); } });
    document.addEventListener('click', e => { if (!e.target.closest('.nx-menu') && !e.target.closest('.nx-chip')) document.querySelector('.nx-menu')?.remove(); });
  }
  setTimeout(() => document.getElementById('nexa-help-input')?.focus(), 50);
}

async function nxLoadStatus() {
  try { NX.status = await (await fetch('/api/nexa/status')).json(); } catch { NX.status = { enabled: false }; }
  const el = document.getElementById('nx-status');
  if (el) el.innerHTML = NX.status.enabled
    ? `<span class="ax-dot" style="width:7px;height:7px"></span> Online · kennt deinen Kanal`
    : `<span class="ax-dot is-bad" style="width:7px;height:7px;animation:none"></span> Nicht verfügbar`;
  const off = document.getElementById('nx-offline');
  if (off) off.innerHTML = NX.status.enabled ? '' : `<div class="nx-offline"><i class="fas fa-plug-circle-xmark"></i> Nexa ist gerade nicht verfügbar. Du kannst trotzdem den <a href="#" data-h-click="h_nexa_pro_openSupportChatWidget_156" style="color:inherit;text-decoration:underline">Support-Chat</a> nutzen.</div>`;
}

async function nxLoadSnapshot() {
  const box = document.getElementById('nx-snap');
  try {
    const a = await apiGet('/api/studio/analytics?range=30d');
    NX.snapshot = a;
    const n = v => (typeof formatViews === 'function' ? formatViews(v || 0) : (v || 0));
    if (box) box.innerHTML = `<div class="nx-snap-title"><i class="fas fa-chart-simple"></i> Dein Kanal · 30 T</div>
      <div class="nx-snap-grid">
        <div><b>${n(a.totals.views)}</b><span>Aufrufe</span></div><div><b>${n(a.currentSubscribers)}</b><span>Abonnenten</span></div>
        <div><b>${n(a.totals.videos)}</b><span>Videos</span></div><div><b>${n(a.commentsInRange || 0)}</b><span>Kommentare</span></div>
      </div>`;
  } catch {
    if (box) box.innerHTML = `<div class="nx-snap-title"><i class="fas fa-chart-simple"></i> Dein Kanal</div><div style="font-size:12px;color:var(--ax-text-dim)">Statistik gerade nicht verfügbar.</div>`;
  }
}

function nxToggleSide() {
  const app = document.getElementById('nx-app'); if (!app) return;
  if (window.innerWidth <= 820) app.classList.toggle('is-side-open'); else app.classList.toggle('is-collapsed');
}
function nxSetDetail(d) {
  NX.detail = d; try { localStorage.setItem('nx_detail', d); } catch {}
  document.querySelectorAll('.nx-mode button').forEach(b => b.classList.toggle('is-active', b.dataset.d === d));
}

function nxDrawSide() {
  const box = document.getElementById('nx-side-list'); if (!box) return;
  const q = NX.search.trim().toLowerCase();
  const list = NX.convs.filter(c => !q || c.title.toLowerCase().includes(q) || c.messages.some(m => m.text.toLowerCase().includes(q)));
  if (!list.length) { box.innerHTML = `<div style="padding:26px 10px;text-align:center;font-size:12.5px;color:var(--ax-text-dim)"><i class="fas fa-comments" style="font-size:22px;display:block;margin-bottom:8px;opacity:.5"></i>${q ? 'Keine Treffer' : 'Noch keine Chats.<br>Stell Nexa deine erste Frage!'}</div>`; return; }
  const now = Date.now(), day = 86400000;
  const groups = [['Angeheftet', c => c.pinned], ['Heute', c => now - c.updatedAt < day], ['Letzte 7 Tage', c => now - c.updatedAt < 7 * day], ['Älter', () => true]];
  const used = new Set();
  box.innerHTML = groups.map(([g, fn]) => {
    const items = list.filter(c => !used.has(c.id) && fn(c)); items.forEach(c => used.add(c.id));
    if (!items.length) return '';
    return `<div class="nx-side-group">${g}</div>` + items.map(c => `
      <div class="nx-conv ${c.id === NX.activeId ? 'is-active' : ''}" role="button" tabindex="0" data-h-click="h_nexa_pro_nxOpenChat_196" data-hv-click="${nxHv(String(c.id))}">
        ${c.pinned ? '<i class="fas fa-thumbtack pin"></i>' : '<i class="far fa-message" style="font-size:11px;opacity:.6"></i>'}
        <span class="ttl">${escHtml(c.title)}</span>
        <span class="act">
          <span title="${c.pinned ? 'Lösen' : 'Anheften'}" data-h-click="h_nexa_pro_stopPropagation_200" data-hv-click="${nxHv(String(c.id))}"><i class="fas fa-thumbtack"></i></span>
          <span title="Umbenennen" data-h-click="h_nexa_pro_stopPropagation_200_2" data-hv-click="${nxHv(String(c.id))}"><i class="fas fa-pen"></i></span>
          <span title="Löschen" data-h-click="h_nexa_pro_stopPropagation_201" data-hv-click="${nxHv(String(c.id))}"><i class="fas fa-trash"></i></span>
        </span>
      </div>`).join('');
  }).join('');
}

function nxNewChat() {
  if (NX.busy) nxStop();
  NX.activeId = null;
  nxDrawSide(); nxDrawThread();
  document.getElementById('nx-app')?.classList.remove('is-side-open');
  document.getElementById('nexa-help-input')?.focus();
}
function nxOpenChat(id) { if (NX.busy) nxStop(); NX.activeId = id; nxDrawSide(); nxDrawThread(); document.getElementById('nx-app')?.classList.remove('is-side-open'); }
function nxPin(id) { const c = NX.convs.find(x => x.id === id); if (!c) return; c.pinned = !c.pinned; nxSave(); nxDrawSide(); }
function nxRename(id) { const c = NX.convs.find(x => x.id === id); if (!c) return; const t = prompt('Neuer Name für den Chat:', c.title); if (t && t.trim()) { c.title = t.trim().slice(0, 80); nxSave(); nxDrawSide(); } }
function nxDelete(id) { if (!confirm('Diesen Chat löschen?')) return; NX.convs = NX.convs.filter(x => x.id !== id); if (NX.activeId === id) NX.activeId = null; nxSave(); nxDrawSide(); nxDrawThread(); }

function nxWelcomeHtml() {
  const name = escHtml(currentUser?.displayName || currentUser?.username || '');
  const h = new Date().getHours();
  const greet = h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend';
  const cat = NX_CATS.find(c => c.id === NX.cat) || NX_CATS[0];
  return `<div class="nx-welcome">
    <div class="nx-hello"><div class="nx-logo is-lg"><img src="/assets/nexa-logo.svg" alt="Nexa"></div>
      <div><h2>${greet} ${name},<br><span>was kann ich für dich tun?</span></h2><p>Ich kenne deine Videos und Kanal-Zahlen und helfe dir bei Strategie, Ideen und allen Fragen zu Norynex.</p></div></div>
    <div class="nx-cats">${NX_CATS.map(c => `
      <button class="nx-cat ${c.id === NX.cat ? 'is-active' : ''}" data-h-click="h_nexa_pro_s_229" data-hv-click="${nxHv(String(c.id))}">
        <div class="nx-cat-ico" style="background:${c.color}22;color:${c.color}"><i class="fas ${c.icon}"></i></div>
        <b>${c.title}</b><span>${c.desc}</span></button>`).join('')}</div>
    <div class="nx-side-group" style="padding-left:2px">Vorschläge · ${cat.title}</div>
    <div class="nx-prompts">${cat.prompts.map(p => `<button class="nx-prompt" data-h-click="h_nexa_pro_nxAsk_233" data-p="${escHtml(p)}"><i class="fas fa-arrow-right"></i><span>${escHtml(p)}</span></button>`).join('')}</div>
  </div>`;
}

function nxMsgHtml(m, isLast) {
  if (m.from === 'user') return `<div class="nx-msg nx-msg--user" data-mid="${m.id}"><div class="nx-bubble">${escHtml(m.text)}</div></div>`;
  if (m.error) return `<div class="nx-msg nx-msg--ai" data-mid="${m.id}"><div class="nx-logo is-sm"><img src="/assets/nexa-logo.svg" alt=""></div><div class="nx-body"><div class="nx-who">Nexa</div>
    <div class="nx-error"><i class="fas fa-circle-exclamation"></i><span style="flex:1">${escHtml(m.text)}</span><button class="ax-btn ax-btn--sm" data-h-click="h_nexa_pro_nxRegenerate_240" data-hv-click="${nxHv(String(m.id))}"><i class="fas fa-rotate-right"></i> Erneut</button></div></div></div>`;
  const time = m.ts ? new Date(m.ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '';
  return `<div class="nx-msg nx-msg--ai" data-mid="${m.id}"><div class="nx-logo is-sm"><img src="/assets/nexa-logo.svg" alt=""></div>
    <div class="nx-body"><div class="nx-who">Nexa <small>${time}${m.ms ? ' · ' + (m.ms / 1000).toFixed(1) + ' s' : ''}${m.detail && m.detail !== 'normal' ? ' · ' + (m.detail === 'short' ? 'kurz' : 'ausführlich') : ''}</small></div>
      <div class="nx-md">${nxMd(m.text)}</div>
      <div class="nx-tools">
        <button title="Kopieren" data-h-click="h_nexa_pro_nxCopy_244" data-hv-click="${nxHv(String(m.id))}"><i class="far fa-copy"></i></button>
        <button title="Neu generieren" data-h-click="h_nexa_pro_nxRegenerate_246" data-hv-click="${nxHv(String(m.id))}"><i class="fas fa-rotate-right"></i></button>
        <span class="sep"></span>
        <button title="Hilfreich" class="${m.rating === 'up' ? 'is-on' : ''}" data-h-click="h_nexa_pro_nxRate_249" data-hv-click="${nxHv(String(m.id))}"><i class="${m.rating === 'up' ? 'fas' : 'far'} fa-thumbs-up"></i></button>
        <button title="Nicht hilfreich" class="${m.rating === 'down' ? 'is-on' : ''}" data-h-click="h_nexa_pro_nxRate_250" data-hv-click="${nxHv(String(m.id))}"><i class="${m.rating === 'down' ? 'fas' : 'far'} fa-thumbs-down"></i></button>
        <span class="sep"></span>
        <button title="Kürzer" data-h-click="h_nexa_pro_nxRefine_250" data-hv-click="${nxHv(String(m.id))}"><i class="fas fa-compress"></i><span> Kürzer</span></button>
        <button title="Ausführlicher" data-h-click="h_nexa_pro_nxRefine_252" data-hv-click="${nxHv(String(m.id))}"><i class="fas fa-expand"></i><span> Mehr Details</span></button>
      </div>
      ${isLast ? nxFollowUps(m) : ''}
    </div></div>`;
}

function nxFollowUps(m) {
  const t = (m.text || '').toLowerCase();
  let f = [];
  if (/titel|thumbnail|beschreibung/.test(t)) f = ['Mach die Titel noch neugieriger', 'Schreib passende Hashtags dazu', 'Welches Thumbnail-Motiv passt?'];
  else if (/idee|vorschlag|serie|format/.test(t)) f = ['Schreib mir ein Skript zur ersten Idee', 'Welche Idee hat das größte Potenzial?', 'Mach daraus einen Wochenplan'];
  else if (/aufrufe|abonnent|leistung|performance|views/.test(t)) f = ['Was sollte ich als Nächstes konkret tun?', 'Wie verbessere ich meine schwächsten Videos?', 'Gib mir 3 Ideen basierend darauf'];
  else if (/premium|kündig|auszahl|konto|2fa|passwort/.test(t)) f = ['Wo finde ich das in den Einstellungen?', 'Kann ich das rückgängig machen?', 'Ich brauche einen Menschen vom Support'];
  else f = ['Erklär das Schritt für Schritt', 'Gib mir ein konkretes Beispiel', 'Was ist der wichtigste nächste Schritt?'];
  return `<div class="nx-follow">${f.map(x => `<button ${nxOn('click', x.includes('Menschen') ? () => openSupportChatWidget() : function () { nxAsk(this.dataset.q); })} data-q="${escHtml(x)}"><i class="fas fa-arrow-turn-down-right" style="font-size:10px;opacity:.6"></i>${escHtml(x)}</button>`).join('')}</div>`;
}

function nxDrawThread() {
  const sc = document.getElementById('nx-scroll'); if (!sc) return;
  const c = nxActive();
  if (!c || !c.messages.length) { sc.innerHTML = nxWelcomeHtml(); return; }
  const lastAi = [...c.messages].reverse().find(m => m.from === 'nexa' && !m.error);
  sc.innerHTML = `<div class="nx-thread" id="nexa-help-messages">${c.messages.map(m => nxMsgHtml(m, m === lastAi && c.messages[c.messages.length - 1] === m)).join('')}</div>`;
  sc.scrollTop = sc.scrollHeight;
}

/* ---------- Composer ---------- */
function nxAutosize(ta) {
  ta.style.height = 'auto'; ta.style.height = Math.min(200, ta.scrollHeight) + 'px';
  const n = ta.value.length, cnt = document.getElementById('nx-count');
  if (cnt) { cnt.textContent = `${n} / ${NX_MAX_CHARS}`; cnt.classList.toggle('is-warn', n > NX_MAX_CHARS * 0.9); }
  const send = document.getElementById('nx-send'); if (send && !NX.busy) send.disabled = !ta.value.trim();
}
function nxKey(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!NX.busy) sendNexaHelpMessage(); }
  if (e.key === 'Escape' && NX.busy) nxStop();
}
function nxToggleMenu(e) {
  e.stopPropagation();
  const ex = document.querySelector('.nx-menu'); if (ex) { ex.remove(); return; }
  const comp = document.querySelector('.nx-composer');
  comp.insertAdjacentHTML('beforeend', `<div class="nx-menu">${NX_TEMPLATES.map((t, i) => `<button data-h-click="h_nexa_pro_nxUseTemplate_294" data-hv-click="${nxHv(String(i))}"><i class="fas ${t.icon}"></i>${t.label}</button>`).join('')}</div>`);
}
function nxUseTemplate(i) {
  document.querySelector('.nx-menu')?.remove();
  const ta = document.getElementById('nexa-help-input'); ta.value = NX_TEMPLATES[i].text; nxAutosize(ta); ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);
}
function nxInsertContext() {
  const a = NX.snapshot, ta = document.getElementById('nexa-help-input');
  if (!a) { showToast('Kanaldaten noch nicht geladen', 'info'); return; }
  const ctx = `(Meine Zahlen: ${a.totals.videos} Videos, ${a.totals.views} Aufrufe, ${a.currentSubscribers} Abonnenten, ${a.commentsInRange || 0} Kommentare in 30 Tagen) `;
  ta.value = ctx + ta.value; nxAutosize(ta); ta.focus();
}
function nxAsk(q) { const ta = document.getElementById('nexa-help-input'); if (!ta || NX.busy) return; ta.value = q; nxAutosize(ta); sendNexaHelpMessage(); }
function nxSendOrStop() { if (NX.busy) nxStop(); else sendNexaHelpMessage(); }
function nxStop() { try { NX.ctrl?.abort(); } catch {} }

function nxSetBusy(b) {
  NX.busy = b;
  const s = document.getElementById('nx-send'), ta = document.getElementById('nexa-help-input');
  if (s) { s.classList.toggle('is-stop', b); s.innerHTML = b ? '<i class="fas fa-stop"></i>' : '<i class="fas fa-arrow-up"></i>'; s.title = b ? 'Stoppen (Esc)' : 'Senden (Enter)'; s.disabled = !b && !(ta?.value.trim()); }
}

async function sendNexaHelpMessage(opts = {}) {
  const ta = document.getElementById('nexa-help-input');
  const question = (opts.question ?? ta?.value ?? '').trim().slice(0, NX_MAX_CHARS);
  if (!question || NX.busy) return;
  let c = nxActive();
  if (!c) {
    c = { id: nxId(), title: question.length > 48 ? question.slice(0, 46) + '…' : question, pinned: false, createdAt: Date.now(), updatedAt: Date.now(), messages: [] };
    NX.convs.unshift(c); NX.activeId = c.id;
  }
  if (!opts.skipUser) c.messages.push({ id: nxId(), from: 'user', text: question, ts: Date.now() });
  c.updatedAt = Date.now(); nxSave(); nxDrawSide(); nxDrawThread();
  if (ta && !opts.question) { ta.value = ''; nxAutosize(ta); }

  const thread = document.getElementById('nexa-help-messages');
  const thinkId = 'nx-think-' + Date.now();
  thread.insertAdjacentHTML('beforeend', `<div class="nx-msg nx-msg--ai" id="${thinkId}"><div class="nx-logo is-sm"><img src="/assets/nexa-logo.svg" alt=""></div><div class="nx-body"><div class="nx-who">Nexa</div><div style="display:flex;align-items:center"><span class="nx-typing"><span></span><span></span><span></span></span><span class="nx-thinking-label" id="${thinkId}-l">denkt nach…</span></div></div></div>`);
  const sc = document.getElementById('nx-scroll'); sc.scrollTop = sc.scrollHeight;
  const t0 = Date.now();
  const phrases = ['denkt nach…', 'liest deine Kanaldaten…', 'formuliert die Antwort…'];
  NX.thinkTimer = setInterval(() => { const l = document.getElementById(thinkId + '-l'); if (l) { const s = Math.floor((Date.now() - t0) / 1000); l.textContent = `${phrases[Math.min(2, Math.floor(s / 3))]} ${s}s`; } }, 500);

  nxSetBusy(true);
  NX.ctrl = new AbortController();
  const timeout = setTimeout(() => NX.ctrl.abort('timeout'), 60000);
  let hist = c.messages.filter(m => !m.error);
  if (hist.length && hist[hist.length - 1].from === 'user' && hist[hist.length - 1].text === question) hist = hist.slice(0, -1);
  const history = hist.slice(-10).map(m => ({ from: m.from, text: m.text }));
  const detail = opts.detail || NX.detail;
  let answerMsg;
  try {
    const token = localStorage.getItem('nxd_token');
    const res = await fetch('/api/nexa/help', {
      method: 'POST', signal: NX.ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: JSON.stringify({ question, history, detail }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Nexa konnte gerade nicht antworten.');
    answerMsg = { id: nxId(), from: 'nexa', text: data.answer, ts: Date.now(), ms: data.ms || (Date.now() - t0), detail, q: question };
  } catch (e) {
    const aborted = e.name === 'AbortError' || NX.ctrl.signal.aborted;
    const reason = NX.ctrl.signal.reason;
    answerMsg = { id: nxId(), from: 'nexa', error: true, ts: Date.now(), q: question, text: aborted ? (reason === 'timeout' ? 'Nexa braucht zu lange für eine Antwort. Bitte versuch es erneut.' : 'Antwort abgebrochen.') : (e.message || 'Nexa konnte gerade nicht antworten.') };
  } finally {
    clearTimeout(timeout); clearInterval(NX.thinkTimer);
    document.getElementById(thinkId)?.remove();
    nxSetBusy(false);
  }
  c.messages.push(answerMsg); c.updatedAt = Date.now(); nxSave();
  if (NX.activeId !== c.id) return; // Nutzer hat inzwischen den Chat gewechselt
  nxDrawThread();
  if (!answerMsg.error) nxTypewriter(answerMsg.id);
}

// Sanftes Einblenden der Antwort (Wort für Wort), danach vollständiges Markdown
function nxTypewriter(mid) {
  const el = document.querySelector(`[data-mid="${mid}"] .nx-md`); if (!el) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const full = el.innerHTML, text = el.textContent;
  if (text.length > 1800) return;
  const words = text.split(/(\s+)/); let i = 0;
  el.textContent = ''; el.classList.add('nx-caret');
  const sc = document.getElementById('nx-scroll');
  const step = () => {
    if (!document.body.contains(el)) return;
    i += 3; el.textContent = words.slice(0, i).join('');
    if (sc && sc.scrollHeight - sc.scrollTop - sc.clientHeight < 120) sc.scrollTop = sc.scrollHeight;
    if (i < words.length) requestAnimationFrame(() => setTimeout(step, 12)); else { el.classList.remove('nx-caret'); el.innerHTML = full; }
  };
  step();
}

function nxFindMsg(mid) { const c = nxActive(); if (!c) return {}; const i = c.messages.findIndex(m => m.id === mid); return { c, i, m: c.messages[i] }; }
function nxRegenerate(mid) {
  const { c, i, m } = nxFindMsg(mid); if (!m || NX.busy) return;
  const q = m.q || [...c.messages.slice(0, i)].reverse().find(x => x.from === 'user')?.text; if (!q) return;
  c.messages.splice(i, 1); nxSave(); nxDrawThread();
  sendNexaHelpMessage({ question: q, skipUser: true });
}
function nxRefine(mid, detail) {
  const { c, i, m } = nxFindMsg(mid); if (!m || NX.busy) return;
  const q = m.q || [...c.messages.slice(0, i)].reverse().find(x => x.from === 'user')?.text; if (!q) return;
  c.messages.splice(i, 1); nxSave(); nxDrawThread();
  sendNexaHelpMessage({ question: q, skipUser: true, detail });
}
function nxCopy(mid, btn) {
  const { m } = nxFindMsg(mid); if (!m) return;
  navigator.clipboard?.writeText(m.text).then(() => { btn.innerHTML = '<i class="fas fa-check"></i>'; setTimeout(() => btn.innerHTML = '<i class="far fa-copy"></i>', 1400); }).catch(() => showToast('Kopieren nicht möglich', 'error'));
}
async function nxRate(mid, rating) {
  const { c, m } = nxFindMsg(mid); if (!m) return;
  if (m.rating === rating) { m.rating = null; nxSave(); nxDrawThread(); return; }
  m.rating = rating; nxSave(); nxDrawThread();
  let comment = '';
  if (rating === 'down') comment = prompt('Was war nicht hilfreich? (optional)') || '';
  try { await apiPost('/api/nexa/feedback', { rating, question: m.q || '', answer: m.text.slice(0, 300), comment }); showToast(rating === 'up' ? 'Danke für dein Feedback!' : 'Danke – wir verbessern Nexa damit.', 'success'); } catch {}
}
function nxExport() {
  const c = nxActive(); if (!c || !c.messages.length) { showToast('Kein Chat zum Exportieren', 'info'); return; }
  const md = `# ${c.title}\n\n_Exportiert aus Nexa (Norynex Creator Studio) am ${new Date().toLocaleString('de-DE')}_\n\n` +
    c.messages.map(m => m.from === 'user' ? `**Du:** ${m.text}` : `**Nexa:**\n\n${m.text}`).join('\n\n---\n\n');
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'nexa-' + c.title.replace(/[^\wäöüÄÖÜß-]+/g, '-').slice(0, 40) + '.md';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
}

// ── Ereignis-Handler (v1.82: statt Inline-Handlern im HTML – CSP ohne 'unsafe-inline'; Verteiler: public/js/nx-events.js) ──
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxSetDetail_116 = function (event, v) { nxSetDetail('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxNewChat_97 = function (event, v) { nxNewChat() };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxDrawSide_97 = function (event, v) { NX.search=this.value;nxDrawSide() };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxToggleSide_97 = function (event, v) { nxToggleSide() };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxExport_116 = function (event, v) { nxExport() };
(window.NX_H = window.NX_H || {}).h_nexa_pro_switchStudio_116 = function (event, v) { switchStudio('dashboard', document.querySelector('.studio-nav a[data-studio="dashboard"]')) };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxAutosize_125 = function (event, v) { nxAutosize(this) };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxKey_125 = function (event, v) { nxKey(event) };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxToggleMenu_125 = function (event, v) { nxToggleMenu(event) };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxInsertContext_125 = function (event, v) { nxInsertContext() };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxSendOrStop_129 = function (event, v) { nxSendOrStop() };
(window.NX_H = window.NX_H || {}).h_nexa_pro_openSupportChatWidget_156 = function (event, v) { openSupportChatWidget() };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxOpenChat_196 = function (event, v) { nxOpenChat('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_nexa_pro_stopPropagation_200 = function (event, v) { event.stopPropagation();nxPin('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_nexa_pro_stopPropagation_200_2 = function (event, v) { event.stopPropagation();nxRename('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_nexa_pro_stopPropagation_201 = function (event, v) { event.stopPropagation();nxDelete('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_nexa_pro_s_229 = function (event, v) { NX.cat='' + NX_H.$s(v[0]) + '';nxDrawThread() };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxAsk_233 = function (event, v) { nxAsk(this.dataset.p) };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxRegenerate_240 = function (event, v) { nxRegenerate('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxCopy_244 = function (event, v) { nxCopy('' + NX_H.$s(v[0]) + '',this) };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxRegenerate_246 = function (event, v) { nxRegenerate('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxRate_249 = function (event, v) { nxRate('' + NX_H.$s(v[0]) + '','up') };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxRate_250 = function (event, v) { nxRate('' + NX_H.$s(v[0]) + '','down') };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxRefine_250 = function (event, v) { nxRefine('' + NX_H.$s(v[0]) + '','short') };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxRefine_252 = function (event, v) { nxRefine('' + NX_H.$s(v[0]) + '','detailed') };
(window.NX_H = window.NX_H || {}).h_nexa_pro_nxUseTemplate_294 = function (event, v) { nxUseTemplate(NX_H.$l(v[0])) };
