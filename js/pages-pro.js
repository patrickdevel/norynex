/* =====================================================================
   Norynex · Pro-Seiten v2
   Ersetzt: renderPremiumPage() und das Creator-Studio-Dashboard
   (renderRealtimeDashboard / updateDashboardUI) aus app.js.
   Nutzt Helfer aus admin-pro.js (axLineChart, axSpark, axNum).
   ===================================================================== */

/* ---------------------------------------------------------------------
   PREMIUM
   --------------------------------------------------------------------- */
const PM_BENEFITS = [
  { icon: 'fa-ban', color: '#ef4444', de: ['Keine Werbung', 'Keine Pre-Rolls, keine Short-Anzeigen – einfach direkt schauen.'], en: ['No ads', 'No pre-rolls, no short ads – just watch.'] },
  { icon: 'fa-tv', color: '#a83bff', de: ['Bis zu 4x Tempo', 'Videos mit bis zu 4-facher Geschwindigkeit abspielen.'], en: ['Up to 4x speed', 'Play videos at up to 4x speed.'] },
  { icon: 'fa-download', color: '#22c55e', de: ['Downloads', 'Videos speichern und offline ansehen.'], en: ['Downloads', 'Save videos and watch offline.'] },
  { icon: 'fa-headphones', color: '#06b6d4', de: ['Hintergrund-Wiedergabe', 'Weiterhören bei gesperrtem Bildschirm.'], en: ['Background play', 'Keep listening with the screen locked.'] },
  { icon: 'fa-users', color: '#a83bff', de: ['Unbegrenzte Watch Partys', 'Gemeinsam schauen, so oft du willst.'], en: ['Unlimited watch parties', 'Watch together as often as you like.'] },
  { icon: 'fa-dharmachakra', color: '#f59e0b', de: ['Glücksrad Pro', 'Eigene Videos wählen & Empfehlungen drehen.'], en: ['Wheel Pro', 'Pick your own videos & spin recommendations.'] },
  { icon: 'fa-circle-user', color: '#c77dff', de: ['Animiertes Profil', 'Video- oder GIF-Profilbild für deinen Kanal.'], en: ['Animated profile', 'Video or GIF profile picture for your channel.'] },
  { icon: 'fa-panorama', color: '#3b82f6', de: ['Animiertes Banner', 'Bewegter Kanal-Header, der auffällt.'], en: ['Animated banner', 'A moving channel header that stands out.'] },
];
const PM_COMPARE = [
  [{ de: 'Videos, Shorts & Livestreams', en: 'Videos, shorts & livestreams' }, true, true],
  [{ de: 'Kommentieren & abonnieren', en: 'Comment & subscribe' }, true, true],
  [{ de: 'Eigene Videos hochladen', en: 'Upload your own videos' }, true, true],
  [{ de: 'Werbefrei', en: 'Ad-free' }, false, true],
  [{ de: 'Wiedergabe bis 4x Tempo', en: 'Playback up to 4x speed' }, { de: 'bis 2x', en: 'up to 2x' }, { de: 'bis 4x', en: 'up to 4x' }],
  [{ de: 'Downloads & Offline', en: 'Downloads & offline' }, false, true],
  [{ de: 'Hintergrund-Wiedergabe', en: 'Background playback' }, false, true],
  [{ de: 'Watch Partys', en: 'Watch parties' }, { de: '3 / Monat', en: '3 / month' }, { de: 'Unbegrenzt', en: 'Unlimited' }],
  [{ de: 'Animiertes Profilbild & Banner', en: 'Animated avatar & banner' }, false, true],
  [{ de: 'Premium-Badge', en: 'Premium badge' }, false, true],
];
const PM_FAQ = [
  { de: ['Kann ich jederzeit kündigen?', 'Ja. Du kündigst mit einem Klick hier auf der Seite oder in den Einstellungen. Premium bleibt bis zum Ende des bezahlten Zeitraums aktiv.'], en: ['Can I cancel anytime?', 'Yes. Cancel with one click on this page or in settings. Premium stays active until the end of the paid period.'] },
  { de: ['Wie wird abgerechnet?', 'Einmalig im Voraus für den gewählten Zeitraum. Premium endet danach automatisch – es gibt keine automatische Verlängerung und keine weiteren Abbuchungen.'], en: ['How am I billed?', 'Once in advance for the chosen term. Premium then ends automatically – there is no automatic renewal and no further charges.'] },
  { de: ['Welche Zahlungsarten gibt es?', 'Kreditkarte, Apple Pay, Google Pay, SEPA-Überweisung, paysafecard und dein Norynex-Guthaben. Premium läuft für den gewählten Zeitraum und endet danach automatisch – keine versteckte Verlängerung.'], en: ['Which payment methods?', 'Credit card, Apple Pay, Google Pay, SEPA transfer, paysafecard and your Norynex balance. Premium runs for the chosen period and then ends automatically – no hidden renewal.'] },
  { de: ['Kann ich einen Creator-Code nutzen?', 'Ja! Beim Bezahlen kannst du den Code deines Lieblings-Creators eingeben – du sparst und unterstützt ihn direkt.'], en: ['Can I use a creator code?', 'Yes! Enter your favourite creator\'s code at checkout – you save and support them directly.'] },
];

function _pmL(o) { return typeof o === 'object' && o ? (cl() === 'de' ? o.de : o.en) : o; }
function _pmEur(n) { return '€' + (Number(n) || 0).toFixed(2).replace('.', ','); }

function renderPremiumPage() {
  const el = document.getElementById('page-premium');
  if (!el) return;
  if (!window._premiumPlansLoaded) {
    window._premiumPlansLoaded = true;
    _loadPremiumPlans().then(() => { if (currentPage === 'premium') renderPremiumPage(); });
  }
  const plans = window._premiumPlans || [];
  const selected = plans.find(p => p.key === window._selectedPremiumPlan) || plans[0] || { key: 'monthly', months: 1, price: 3.99, pricePerMonth: 3.99, savingsPercent: 0 };
  const isPrem = !!currentUser?.isPremium;
  const de = cl() === 'de';

  const statusCard = (() => {
    if (!isPrem) return '';
    const cancelled = currentUser.premiumCancelled;
    const exp = currentUser.premiumExpiresAt ? new Date(currentUser.premiumExpiresAt) : null;
    const days = exp ? Math.max(0, Math.ceil((exp - Date.now()) / 86400000)) : null;
    const since = currentUser.premiumSince ? new Date(currentUser.premiumSince) : null;
    return `<div class="pm-status ${cancelled ? 'is-cancelled' : ''}">
      <div class="pm-status-ico"><i class="fas ${cancelled ? 'fa-hourglass-half' : 'fa-crown'}"></i></div>
      <div class="pm-status-main">
        <b>${cancelled ? tr({ en: 'Subscription cancelled', de: 'Abo gekündigt' }) : tr({ en: 'Premium is active', de: 'Premium ist aktiv' })}</b>
        <span>${exp ? (cancelled
          ? tr({ en: `Still active for ${days} day(s) – until ${exp.toLocaleDateString('en-GB')}`, de: `Noch ${days} Tag${days !== 1 ? 'e' : ''} aktiv – bis ${exp.toLocaleDateString('de-DE')}` })
          : tr({ en: `Active until ${exp.toLocaleDateString('en-GB')} – no automatic renewal`, de: `Aktiv bis ${exp.toLocaleDateString('de-DE')} – keine automatische Verlängerung` }))
          : tr({ en: 'Thanks for supporting Norynex!', de: 'Danke, dass du Norynex unterstützt!' })}${since ? ' · ' + tr({ en: 'member since ', de: 'Mitglied seit ' }) + since.toLocaleDateString(de ? 'de-DE' : 'en-GB') : ''}</span>
        ${exp && !cancelled ? `<div class="pm-progress"><i style="width:${Math.max(4, Math.min(100, 100 - days / ((currentUser.premiumPlanMonths || 1) * 30) * 100))}%"></i></div>` : ''}
      </div>
      ${cancelled ? '' : `<button class="pm-btn pm-btn--danger" data-h-click="h_pages_pro_cancelSubscription_71">${t('prem_cancel')}</button>`}
    </div>`;
  })();

  const minMonthly = Math.min(...plans.map(p => p.pricePerMonth));
  el.innerHTML = `
  <div class="pm">
    <section class="pm-hero">
      <div>
        <span class="pm-eyebrow"><i class="fas fa-crown"></i> Norynex Premium</span>
        <h1>${tr({ en: 'No ads. No limits.<br><span>Downloads included.</span>', de: 'Ohne Werbung. Ohne Limits.<br><span>Downloads inklusive.</span>' })}</h1>
        <p>${tr({ en: 'Premium removes every ad, adds downloads, background play and a set of extras for your channel. Cancel anytime.', de: 'Premium entfernt jede Werbung, bringt Downloads, Hintergrund-Wiedergabe und Extras für deinen Kanal. Jederzeit kündbar.' })}</p>
        ${isPrem ? statusCard : `
          <div class="pm-hero-cta">
            <button class="pm-btn pm-btn--primary" data-h-click="h_pages_pro_getElementById_83">${tr({ en: 'Choose a plan', de: 'Plan auswählen' })}</button>
            <span class="pm-hero-note">${tr({ en: `from ${_pmEur(minMonthly)} / month`, de: `ab ${_pmEur(minMonthly)} / Monat` })}</span>
          </div>`}
      </div>
      <div class="pm-panel">
        ${PM_BENEFITS.slice(0, 4).map(b => `<div class="pm-panel-row"><i class="fas ${b.icon}"></i><div><b>${escHtml(_pmL({ de: b.de[0], en: b.en[0] }))}</b><span>${escHtml(_pmL({ de: b.de[1], en: b.en[1] }))}</span></div></div>`).join('')}
      </div>
    </section>

    ${!isPrem ? `
    <section class="pm-section" id="pm-plans">
      <div class="pm-section-head"><h2>${tr({ en: 'Plans', de: 'Laufzeit wählen' })}</h2><p>${tr({ en: 'Same benefits in every plan. Longer plans cost less per month.', de: 'Alle Vorteile in jedem Plan. Längere Laufzeiten sind pro Monat günstiger.' })}</p></div>
      <div class="pm-plans">
        ${plans.map(p => `
          <button class="pm-plan ${p.key === selected.key ? 'is-selected' : ''}" data-h-click="h_pages_pro_selectPremiumPlan_99" data-hv-click="${nxHv(String(p.key))}" aria-pressed="${p.key === selected.key}">
            ${p.key === 'yearly' ? `<span class="pm-plan-badge">-${p.savingsPercent}%</span>` : p.savingsPercent > 0 ? `<span class="pm-plan-badge pm-plan-badge--soft">-${p.savingsPercent}%</span>` : ''}
            <span class="pm-plan-radio"></span>
            <span class="pm-plan-term">${_premiumPlanLabel(p.months)}</span>
            <span class="pm-plan-price">${_pmEur(p.pricePerMonth)}<small>/ ${t('per_month')}</small></span>
            <span class="pm-plan-total">${_pmEur(p.price)} ${tr({ en: 'total', de: 'gesamt' })}</span>
          </button>`).join('')}
      </div>
      <div class="pm-checkout">
        <div class="pm-checkout-info">
          <b>Premium · ${_premiumPlanLabel(selected.months)}</b>
          <span>${_pmEur(selected.price)} ${tr({ en: 'billed once', de: 'einmalig' })}${selected.savingsPercent ? ` · <em>${tr({ en: 'save', de: 'spare' })} ${selected.savingsPercent}%</em>` : ''}</span>
        </div>
        <div class="pm-pay-icons"><span><i class="fas fa-credit-card"></i> ${tr({ en: 'Card', de: 'Karte' })}</span><span><i class="fab fa-apple"></i> Pay</span><span><i class="fab fa-google"></i> Pay</span><span>SEPA</span><span>paysafecard</span><span>${tr({ en: 'Balance', de: 'Guthaben' })}</span></div>
        <button class="pm-btn pm-btn--primary" id="premium-activate-btn" data-h-click="h_pages_pro_activatePremium_112">${tr({ en: 'Continue', de: 'Weiter zur Zahlung' })} · ${_pmEur(selected.price)}</button>
      </div>
    </section>` : ''}

    <section class="pm-section">
      <div class="pm-section-head"><h2>${tr({ en: 'What you get', de: 'Das ist drin' })}</h2></div>
      <div class="pm-benefits">
        ${PM_BENEFITS.map(b => `<div class="pm-benefit"><div class="pm-benefit-ico"><i class="fas ${b.icon}"></i></div><b>${escHtml(_pmL({ de: b.de[0], en: b.en[0] }))}</b><span>${escHtml(_pmL({ de: b.de[1], en: b.en[1] }))}</span></div>`).join('')}
      </div>
    </section>

    <section class="pm-section">
      <div class="pm-section-head"><h2>${tr({ en: 'Free vs. Premium', de: 'Kostenlos vs. Premium' })}</h2></div>
      <div class="pm-compare">
        <div class="pm-compare-row pm-compare-head"><span></span><span>${t('premium_free_tier')}</span><span>Premium</span></div>
        ${PM_COMPARE.map(([label, a, b]) => {
          const cell = v => v === true ? '<i class="fas fa-check pm-yes"></i>' : v === false ? '<i class="fas fa-minus pm-no"></i>' : `<em>${escHtml(_pmL(v))}</em>`;
          return `<div class="pm-compare-row"><span>${escHtml(_pmL(label))}</span><span>${cell(a)}</span><span>${cell(b)}</span></div>`;
        }).join('')}
      </div>
    </section>

    <section class="pm-section pm-faq">
      <div class="pm-section-head"><h2>${tr({ en: 'Questions', de: 'Häufige Fragen' })}</h2></div>
      ${PM_FAQ.map((f, i) => `<details ${i === 0 ? 'open' : ''}><summary>${escHtml(_pmL({ de: f.de[0], en: f.en[0] }))}<i class="fas fa-chevron-down"></i></summary><p>${escHtml(_pmL({ de: f.de[1], en: f.en[1] }))}</p></details>`).join('')}
      <p class="pm-legal">${tr({ en: 'Premium is paid once in advance for the chosen term and ends automatically – no automatic renewal.', de: 'Premium wird einmalig im Voraus für die gewählte Laufzeit bezahlt und endet danach automatisch – keine automatische Verlängerung.' })}
        <a href="/agb#premium" target="_blank" rel="noopener">${tr({ en: 'Terms (§ 6)', de: 'AGB (§ 6)' })}</a></p>
    </section>
  </div>`;
}

/* ---------------------------------------------------------------------
   CREATOR STUDIO · DASHBOARD
   --------------------------------------------------------------------- */
async function renderRealtimeDashboard(content) {
  const u = currentUser || {};
  const h = new Date().getHours();
  const greet = h < 11 ? tr({ en: 'Good morning', de: 'Guten Morgen' }) : h < 18 ? tr({ en: 'Welcome back', de: 'Willkommen zurück' }) : tr({ en: 'Good evening', de: 'Guten Abend' });
  const avatar = u.avatar ? `<img src="${escHtml(u.avatar)}" alt="">` : `<span>${escHtml((u.displayName || u.username || '?')[0].toUpperCase())}</span>`;
  content.innerHTML = `
  <div class="cs">
    <div class="cs-hero">
      <div class="cs-avatar">${avatar}</div>
      <div class="cs-hero-text">
        <small>${greet}</small>
        <h2>${escHtml(u.displayName || u.username || '')} ${u.isVerified ? '<i class="fas fa-circle-check" style="color:#3b82f6;font-size:16px"></i>' : ''}</h2>
        <a href="#" data-h-click="h_pages_pro_navigateTo_158" data-hv-click="${nxHv(String(u.id))}">${tr({ en: 'View channel', de: 'Kanal ansehen' })} <i class="fas fa-arrow-right"></i></a>
      </div>
      <div class="cs-live"><span class="ax-dot"></span>${t('creator_dashboard_live')}<em id="dash-last-update"></em></div>
    </div>
    <div class="cs-actions">
      <button data-h-click="h_pages_pro_openModal_161"><i class="fas fa-cloud-arrow-up"></i><b>${tr({ en: 'Upload', de: 'Hochladen' })}</b><span>${tr({ en: 'Video or short', de: 'Video oder Short' })}</span></button>
      <button data-h-click="h_pages_pro_switchStudio_164"><i class="fas fa-tower-broadcast"></i><b>${tr({ en: 'Go live', de: 'Live gehen' })}</b><span>${tr({ en: 'Stream from browser', de: 'Direkt im Browser' })}</span></button>
      <button data-h-click="h_pages_pro_switchStudio_165"><i class="fas fa-pen-nib"></i><b>${tr({ en: 'New post', de: 'Neuer Beitrag' })}</b><span>${tr({ en: 'Talk to fans', de: 'Mit Fans reden' })}</span></button>
      <button data-h-click="h_pages_pro_switchStudio_166"><i class="fas fa-wand-magic-sparkles"></i><b>${tr({ en: 'Ask Nexa', de: 'Nexa fragen' })}</b><span>${tr({ en: 'AI tips for you', de: 'KI-Tipps für dich' })}</span></button>
    </div>
    <div class="cs-kpis" id="dash-stats-grid">${'<div class="ax-skel" style="height:118px"></div>'.repeat(4)}</div>
    <div class="cs-grid">
      <div class="ax-card">
        <div class="ax-card-head"><div><h3><i class="fas fa-chart-area"></i> ${tr({ en: 'Activity (30 days)', de: 'Aktivität (30 Tage)' })}</h3><p>${tr({ en: 'New comments and uploads per day', de: 'Neue Kommentare und Uploads pro Tag' })}</p></div><div class="ax-top-spacer"></div><div class="ax-legend" data-ax-legend></div></div>
        <div data-ax-chart id="cs-chart"><div class="ax-skel" style="height:220px"></div></div>
      </div>
      <div class="ax-card" id="cs-checklist"><div class="ax-skel" style="height:260px"></div></div>
    </div>
    <div class="cs-grid cs-grid--even">
      <div class="ax-card" id="dash-top-videos"><div class="ax-skel" style="height:220px"></div></div>
      <div class="ax-card" id="dash-recent-comments"><div class="ax-skel" style="height:220px"></div></div>
    </div>
  </div>`;

  if (_dashboardInterval) clearInterval(_dashboardInterval);
  const doUpdate = async () => {
    try { updateDashboardUI(await apiGet('/api/studio/realtime')); } catch {}
  };
  doUpdate();
  _dashboardInterval = setInterval(doUpdate, 15000);

  // Aktivitätskurve + Checkliste (einmalig)
  try {
    const a = await apiGet('/api/studio/analytics?range=30d');
    const days = [];
    for (let i = 29; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
    const host = document.getElementById('cs-chart');
    if (host && typeof axLineChart === 'function') {
      axLineChart(host, {
        labels: days,
        series: [
          { name: tr({ en: 'Comments', de: 'Kommentare' }), color: '#a83bff', data: days.map(d => a.commentsByDay?.[d] || 0) },
          { name: 'Uploads', color: '#a83bff', data: days.map(d => a.uploadsByDay?.[d] || 0) },
        ], height: 230,
      });
    }
    _csRenderChecklist(a);
  } catch {
    const host = document.getElementById('cs-chart'); if (host) host.innerHTML = `<div class="ax-empty">${t('loading_error')}</div>`;
    _csRenderChecklist(null);
  }
}

function _csRenderChecklist(a) {
  const box = document.getElementById('cs-checklist'); if (!box) return;
  const u = currentUser || {};
  const items = [
    [!!u.avatar, tr({ en: 'Profile picture', de: 'Profilbild hochladen' }), 'channel'],
    [!!u.banner, tr({ en: 'Channel banner', de: 'Kanalbanner hinzufügen' }), 'channel'],
    [!!(u.bio && u.bio.length > 20), tr({ en: 'Channel description', de: 'Kanalbeschreibung schreiben' }), 'channel'],
    [(a?.totals?.videos || 0) > 0, tr({ en: 'Publish first video', de: 'Erstes Video veröffentlichen' }), 'videos'],
    [(a?.totals?.videos || 0) >= 5, tr({ en: '5 videos uploaded', de: '5 Videos hochgeladen' }), 'videos'],
    [!!u.emailVerified, tr({ en: 'Verify e-mail', de: 'E-Mail bestätigen' }), null],
    [!!u.twoFactorEnabled, tr({ en: 'Enable 2FA', de: '2FA aktivieren' }), 'settings'],
  ];
  const done = items.filter(i => i[0]).length, pct = Math.round(done / items.length * 100);
  const r = 26, c = 2 * Math.PI * r;
  box.innerHTML = `
    <div class="ax-card-head"><h3><i class="fas fa-list-check"></i> ${tr({ en: 'Channel checklist', de: 'Kanal-Checkliste' })}</h3></div>
    <div class="cs-ring"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" class="t"/><circle cx="32" cy="32" r="${r}" class="v" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}"/></svg>
      <div><b>${pct}%</b><span>${done} / ${items.length} ${tr({ en: 'done', de: 'erledigt' })}</span></div></div>
    <div class="cs-check">${items.map(([ok, label, go]) => `
      <button class="${ok ? 'is-done' : ''}" ${ok || !go ? 'disabled' : ''} ${go ? nxOn('click', () => go === 'settings' ? navigateTo('settings') : switchStudio(go, document.querySelector(`.studio-nav a[data-studio="${CSS.escape(go)}"]`))) : ''}>
        <i class="fas ${ok ? 'fa-circle-check' : 'fa-circle'}"></i><span>${label}</span>${!ok && go ? '<i class="fas fa-chevron-right go"></i>' : ''}
      </button>`).join('')}</div>`;
}

function updateDashboardUI(stats) {
  const grid = document.getElementById('dash-stats-grid');
  const avgViews = stats.videoCount ? Math.round(stats.totalViews / stats.videoCount) : 0;
  const likeRate = stats.totalViews ? (stats.totalLikes / stats.totalViews * 100) : 0;
  if (grid) {
    grid.innerHTML = [
      ['fa-film', 'Videos', stats.videoCount, '#a83bff', tr({ en: 'published', de: 'veröffentlicht' })],
      ['fa-eye', t('creator_dashboard_total_views'), formatViews(stats.totalViews), '#06b6d4', `Ø ${formatViews(avgViews)} ${tr({ en: 'per video', de: 'pro Video' })}`],
      ['fa-heart', 'Likes', formatViews(stats.totalLikes), '#a83bff', `${likeRate.toFixed(1).replace('.', ',')} % ${tr({ en: 'like rate', de: 'Like-Rate' })}`],
      ['fa-user-group', t('creator_dashboard_subscribers'), formatViews(stats.totalSubs), '#22c55e', tr({ en: 'total', de: 'insgesamt' })],
    ].map(([icon, label, val, color, sub]) => `
      <div class="ax-card ax-kpi">
        <div class="ax-kpi-top"><div class="ax-kpi-ico" style="background:${color}22;color:${color}"><i class="fas ${icon}"></i></div><div class="ax-kpi-label">${label}</div></div>
        <div class="ax-kpi-val">${val}</div><div class="ax-kpi-foot">${sub}</div>
      </div>`).join('');
  }
  const topVid = document.getElementById('dash-top-videos');
  if (topVid) {
    topVid.innerHTML = `<div class="ax-card-head"><h3><i class="fas fa-trophy"></i> ${t('creator_dashboard_top_videos')}</h3><div class="ax-top-spacer"></div><button class="ax-btn ax-btn--ghost ax-btn--sm" data-h-click="h_pages_pro_switchStudio_254">${tr({ en: 'All', de: 'Alle' })}</button></div>` +
      (!stats.topVideos?.length ? `<div class="ax-empty"><i class="fas fa-film"></i>${tr({ en: 'No videos yet', de: 'Noch keine Videos' })}<div style="margin-top:12px"><button class="ax-btn ax-btn--primary ax-btn--sm" data-h-click="h_pages_pro_openModal_255"><i class="fas fa-plus"></i> ${tr({ en: 'Upload first video', de: 'Erstes Video hochladen' })}</button></div></div>` :
      `<div class="ax-list">${stats.topVideos.map((v, i) => `
        <div class="ax-list-item" style="cursor:pointer" data-h-click="h_pages_pro_navigateTo_256" data-hv-click="${nxHv(String(v.id))}">
          <span class="ax-rank" style="color:${['#f59e0b', '#d4d0db', '#d97706'][i] || ''}">${i + 1}</span>
          ${v.thumbnail ? `<img class="ax-thumb" src="${escHtml(v.thumbnail)}" alt="" loading="lazy">` : '<div class="ax-thumb"><i class="fas fa-film"></i></div>'}
          <div class="grow"><div class="t">${escHtml(v.title)}</div><div class="s">${formatViews(v.views)} ${tr({ en: 'views', de: 'Aufrufe' })} · ${v.likes} <i class="fas fa-heart" style="font-size:9px"></i></div></div>
        </div>`).join('')}</div>`);
  }
  const rc = document.getElementById('dash-recent-comments');
  if (rc) {
    rc.innerHTML = `<div class="ax-card-head"><h3><i class="fas fa-comments"></i> ${t('creator_dashboard_new_comments')}</h3><div class="ax-top-spacer"></div><button class="ax-btn ax-btn--ghost ax-btn--sm" data-h-click="h_pages_pro_switchStudio_265">${tr({ en: 'All', de: 'Alle' })}</button></div>` +
      (!stats.recentComments?.length ? `<div class="ax-empty"><i class="fas fa-comment-slash"></i>${t('creator_dashboard_no_comments')}</div>` :
      `<div class="ax-list">${stats.recentComments.map(c => `
        <div class="ax-list-item" style="cursor:pointer;align-items:flex-start" data-h-click="h_pages_pro_navigateTo_267" data-hv-click="${nxHv(String(c.videoId))}">
          <div class="ax-avatar" style="width:30px;height:30px;font-size:12px">${escHtml(((c.comment.authorName || c.comment.author?.displayName || c.comment.username || '?')[0] || '?').toUpperCase())}</div>
          <div class="grow"><div class="t" style="font-weight:600;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${escHtml(c.comment.text?.slice(0, 140) || '')}</div>
          <div class="s">${escHtml(c.videoTitle)} · ${timeAgo(c.comment.createdAt)}</div></div>
        </div>`).join('')}</div>`);
  }
  const lu = document.getElementById('dash-last-update');
  if (lu) lu.textContent = ' · ' + new Date().toLocaleTimeString(cl() === 'de' ? 'de-DE' : 'en-GB');
}

/* ---------------------------------------------------------------------
   CREATOR STUDIO · CREATOR-CODE
   --------------------------------------------------------------------- */
async function renderCreatorCodePanel(content) {
  content.innerHTML = '<div class="ax-skel" style="height:160px;margin-bottom:12px"></div><div class="ax-skel" style="height:260px"></div>';
  let data, requests = [];
  try {
    data = await apiGet('/api/creator-codes/mine');
  } catch (e) { content.innerHTML = `<div class="ax-empty">${escHtml(e.message)}</div>`; return; }
  const code = (data.codes || []).find(c => c.active) || (data.codes || [])[0] || null;
  const app = data.application;
  if (code) { try { requests = await apiGet('/api/creator-codes/payout-requests'); } catch {} }
  const eur = n => '€' + (Number(n) || 0).toFixed(2).replace('.', ',');
  const lang = cl();
  const steps = [
    ['fa-share-nodes', tr({ en: 'Share your code', de: 'Code teilen' }), tr({ en: 'Mention it in videos, posts and streams.', de: 'Nenn ihn in Videos, Beiträgen und Streams.' })],
    ['fa-heart', tr({ en: 'Fans enter it', de: 'Fans tragen ihn ein' }), tr({ en: 'In the shop or at checkout. It stays active for 14 days, then they can enter it again.', de: 'Im Shop oder beim Bezahlen. Er bleibt 14 Tage aktiv, danach einfach erneut eintragen.' })],
    ['fa-coins', tr({ en: 'You earn', de: 'Du verdienst' }), tr({ en: 'A share of every purchase: Premium (with discount for fans), Premium gifts, live subs, gift subs, live gifts, shop items and paid videos.', de: 'Ein Anteil an jedem Kauf: Premium (mit Rabatt für Fans), Premium-Geschenke, Live-Abos, Geschenk-Abos, Live-Geschenke, Shop-Artikel und Bezahlvideos.' })],
  ];
  const stepsHtml = `<div class="cc-steps">${steps.map(([i, t1, t2], n) => `<div class="cc-step"><span class="cc-step-n">${n + 1}</span><i class="fas ${i}"></i><b>${t1}</b><span>${t2}</span></div>`).join('')}</div>`;

  let main = '';
  if (code) {
    // v1.74: Codes laufen nicht mehr ab – nur die Unterstützung beim jeweiligen Fan endet nach 14 Tagen
    const expired = code.active === false;
    const days = null;
    const earned = (data.codes || []).reduce((s, c) => s + (c.totalEarned || 0), 0);
    const reqPaid = requests.filter(r => r.status !== 'rejected').reduce((s, r) => s + (r.amount || 0), 0);
    const avail = Math.max(0, earned - reqPaid);
    const can = avail >= 100;
    const shareText = tr({ en: `Support me on Norynex: enter my creator code ${code.code} in the shop – and save ${code.discountPercent}% on Premium!`, de: `Unterstütz mich auf Norynex: Trag im Shop meinen Creator-Code ${code.code} ein – und spar ${code.discountPercent} % bei Premium!` });
    const st = s => s === 'paid' ? ['cc-pill--ok', tr({ en: 'Paid', de: 'Ausgezahlt' })] : s === 'rejected' ? ['cc-pill--bad', tr({ en: 'Rejected', de: 'Abgelehnt' })] : ['cc-pill--wait', tr({ en: 'Pending', de: 'In Prüfung' })];
    main = `
      <section class="cc-code ${expired ? 'is-expired' : ''}">
        <div class="cc-code-main">
          <small>${tr({ en: 'Your creator code', de: 'Dein Creator-Code' })}</small>
          <div class="cc-code-value">${escHtml(code.code)}</div>
          <span class="cc-pill ${expired ? 'cc-pill--bad' : 'cc-pill--ok'}">${expired ? tr({ en: 'Paused', de: 'Pausiert' }) : tr({ en: 'Active · permanent', de: 'Aktiv · dauerhaft' })}</span>
        </div>
        <div class="cc-code-actions">
          <button class="co-btn co-btn--primary" data-h-click="h_pages_pro_writeText_315" data-hv-click="${nxHv(String(escJs(code.code)), String(escJs(tr({ en: 'Code copied', de: 'Code kopiert' }))))}"><i class="fas fa-copy"></i> ${tr({ en: 'Copy code', de: 'Code kopieren' })}</button>
          <button class="co-btn co-btn--sec" data-h-click="h_pages_pro_writeText_318" data-hv-click="${nxHv(String(escJs(shareText)), String(escJs(tr({ en: 'Text copied', de: 'Text kopiert' }))))}"><i class="fas fa-quote-right"></i> ${tr({ en: 'Copy share text', de: 'Werbetext kopieren' })}</button>
        </div>
      </section>
      ${expired ? `<div class="cc-alert"><i class="fas fa-circle-exclamation"></i> ${tr({ en: 'Your code is paused by the Norynex team. Contact support.', de: 'Dein Code wurde vom Norynex-Team pausiert. Melde dich beim Support.' })}</div>` : ''}
      <div class="cc-stats">
        <div><b>${code.discountPercent}%</b><span>${tr({ en: 'Buyer discount', de: 'Rabatt für Käufer' })}</span></div>
        <div><b>${code.creatorSharePercent}%</b><span>${tr({ en: 'Your share', de: 'Dein Anteil' })}</span></div>
        <div><b>${code.usageCount || 0}</b><span>${tr({ en: 'Uses', de: 'Nutzungen' })}</span></div>
        <div><b>${eur(earned)}</b><span>${tr({ en: 'Earned', de: 'Verdient' })}</span></div>
      </div>
      <section class="cc-card">
        <div class="cc-card-head"><h3>${tr({ en: 'Payout', de: 'Auszahlung' })}</h3><span>${tr({ en: 'Minimum', de: 'Mindestbetrag' })} €100</span></div>
        <div class="cc-payout-top">
          <div><small>${tr({ en: 'Available', de: 'Verfügbar' })}</small><b>${eur(avail)}</b></div>
          <div><small>${tr({ en: 'Requested / paid', de: 'Beantragt / ausgezahlt' })}</small><b>${eur(reqPaid)}</b></div>
        </div>
        <div class="tk-bar"><i style="width:${Math.min(100, avail)}%;${can ? 'background:#22c55e' : ''}"></i></div>
        <p class="cc-fine">${can ? tr({ en: 'You can request a payout.', de: 'Du kannst eine Auszahlung beantragen.' }) : tr({ en: `${eur(100 - avail)} more until you can request a payout.`, de: `Noch ${eur(100 - avail)} bis zur ersten Auszahlung.` })}</p>
        <div class="cc-form ${can ? '' : 'is-disabled'}">
          <input type="number" id="creator-payout-amount" min="100" max="${avail.toFixed(2)}" step="0.01" placeholder="${tr({ en: 'Amount (€)', de: 'Betrag (€)' })}" ${can ? '' : 'disabled'}>
          <select id="creator-payout-method" ${can ? '' : 'disabled'}>
            <option value="paypal">PayPal</option><option value="bank">${tr({ en: 'Bank transfer', de: 'Banküberweisung' })}</option>
          </select>
          <input type="text" id="creator-payout-account" class="cc-span2" placeholder="${tr({ en: 'PayPal e-mail or IBAN', de: 'PayPal-E-Mail oder IBAN' })}" ${can ? '' : 'disabled'}>
          <input type="text" id="creator-payout-note" class="cc-span2" placeholder="${tr({ en: 'Note (optional)', de: 'Notiz (optional)' })}" ${can ? '' : 'disabled'}>
          <button class="co-btn co-btn--primary cc-span2" data-h-click="h_pages_pro_requestCreatorPayout_343" ${can ? '' : 'disabled'}>${tr({ en: 'Request payout', de: 'Auszahlung beantragen' })}</button>
        </div>
        ${requests.length ? `<div class="cc-history">${requests.map(r => { const [cls, lbl] = st(r.status); return `<div class="cc-history-row"><div><b>${eur(r.amount)}</b><span>${new Date(r.createdAt).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB')} · ${escHtml(r.method || '')}</span></div><span class="cc-pill ${cls}">${lbl}</span></div>`; }).join('')}</div>` : ''}
      </section>`;
  } else if (app && app.status === 'pending') {
    main = `<section class="cc-card cc-state"><i class="fas fa-hourglass-half"></i><h3>${tr({ en: 'Application in review', de: 'Antrag wird geprüft' })}</h3><p>${tr({ en: 'We usually answer within a few days. You will get a notification.', de: 'Wir melden uns meist innerhalb weniger Tage. Du bekommst eine Benachrichtigung.' })}</p>${app.requestedCode ? `<span class="cc-pill cc-pill--wait">${escHtml(app.requestedCode)}</span>` : ''}</section>`;
  } else {
    main = `
      ${app && app.status === 'rejected' ? `<div class="cc-alert"><i class="fas fa-circle-info"></i> ${tr({ en: 'Your last application was declined. You can apply again.', de: 'Dein letzter Antrag wurde abgelehnt. Du kannst dich erneut bewerben.' })}</div>` : ''}
      <section class="cc-card">
        <div class="cc-card-head"><h3>${tr({ en: 'Apply for a creator code', de: 'Creator-Code beantragen' })}</h3></div>
        <div class="cc-form">
          <label class="cc-span2"><span>${tr({ en: 'Desired code (optional)', de: 'Wunsch-Code (optional)' })}</span><input type="text" id="cc-apply-code" maxlength="20" placeholder="${tr({ en: 'e.g. YOURNAME', de: 'z. B. DEINNAME' })}" data-h-input="h_pages_pro_toUpperCase_356"></label>
          <label class="cc-span2"><span>${tr({ en: 'About your channel (optional)', de: 'Über deinen Kanal (optional)' })}</span><textarea id="cc-apply-message" rows="3" maxlength="500" placeholder="${tr({ en: 'Audience, content, where you would promote the code …', de: 'Zielgruppe, Inhalte, wo du den Code bewerben würdest …' })}"></textarea></label>
          <button class="co-btn co-btn--primary cc-span2" data-h-click="h_pages_pro_submitCreatorCodeApplication_357">${tr({ en: 'Submit application', de: 'Antrag senden' })}</button>
        </div>
      </section>`;
  }
  content.innerHTML = `
    <div class="cc">
      <div class="cc-head"><h3>${tr({ en: 'Creator code', de: 'Creator-Code' })}</h3><p>${tr({ en: 'Your personal code – it never expires. Fans enter it in the shop and for 14 days you earn from everything they buy (Premium, Premium gifts, live subs, gifts, shop). After that they simply enter it again.', de: 'Dein persönlicher Code – er läuft nie ab. Fans tragen ihn im Shop ein und du verdienst 14 Tage lang an allem mit, was sie kaufen (Premium, Premium-Geschenke, Live-Abos, Geschenke, Shop). Danach tragen sie ihn einfach erneut ein.' })}</p></div>
      ${main}
      <section class="cc-card"><div class="cc-card-head"><h3>${tr({ en: 'How it works', de: 'So funktioniert es' })}</h3></div>${stepsHtml}</section>
    </div>`;
}

// ── Ereignis-Handler (v1.82: statt Inline-Handlern im HTML – CSP ohne 'unsafe-inline'; Verteiler: public/js/nx-events.js) ──
(window.NX_H = window.NX_H || {}).h_pages_pro_cancelSubscription_71 = function (event, v) { cancelSubscription() };
(window.NX_H = window.NX_H || {}).h_pages_pro_getElementById_83 = function (event, v) { document.getElementById('pm-plans').scrollIntoView({behavior:'smooth',block:'start'}) };
(window.NX_H = window.NX_H || {}).h_pages_pro_selectPremiumPlan_99 = function (event, v) { selectPremiumPlan('' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_pages_pro_activatePremium_112 = function (event, v) { activatePremium() };
(window.NX_H = window.NX_H || {}).h_pages_pro_navigateTo_158 = function (event, v) { navigateTo('channel','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_pages_pro_openModal_161 = function (event, v) { openModal('upload-modal') };
(window.NX_H = window.NX_H || {}).h_pages_pro_switchStudio_164 = function (event, v) { switchStudio('stream', document.querySelector('.studio-nav a[data-studio="stream"]')) };
(window.NX_H = window.NX_H || {}).h_pages_pro_switchStudio_165 = function (event, v) { switchStudio('community', document.querySelector('.studio-nav a[data-studio="community"]')) };
(window.NX_H = window.NX_H || {}).h_pages_pro_switchStudio_166 = function (event, v) { switchStudio('nexa-help', document.querySelector('.studio-nav a[data-studio="nexa-help"]')) };
(window.NX_H = window.NX_H || {}).h_pages_pro_switchStudio_254 = function (event, v) { switchStudio('videos', document.querySelector('.studio-nav a[data-studio="videos"]')) };
(window.NX_H = window.NX_H || {}).h_pages_pro_openModal_255 = function (event, v) { openModal('upload-modal') };
(window.NX_H = window.NX_H || {}).h_pages_pro_navigateTo_256 = function (event, v) { navigateTo('watch','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_pages_pro_switchStudio_265 = function (event, v) { switchStudio('comments', document.querySelector('.studio-nav a[data-studio="comments"]')) };
(window.NX_H = window.NX_H || {}).h_pages_pro_navigateTo_267 = function (event, v) { navigateTo('watch','' + NX_H.$s(v[0]) + '') };
(window.NX_H = window.NX_H || {}).h_pages_pro_writeText_315 = function (event, v) { navigator.clipboard.writeText('' + NX_H.$s(v[0]) + '').then(()=>showToast('' + NX_H.$s(v[1]) + '','success')) };
(window.NX_H = window.NX_H || {}).h_pages_pro_writeText_318 = function (event, v) { navigator.clipboard.writeText('' + NX_H.$s(v[0]) + '').then(()=>showToast('' + NX_H.$s(v[1]) + '','success')) };
(window.NX_H = window.NX_H || {}).h_pages_pro_requestCreatorPayout_343 = function (event, v) { requestCreatorPayout() };
(window.NX_H = window.NX_H || {}).h_pages_pro_toUpperCase_356 = function (event, v) { this.value=this.value.toUpperCase().replace(/[^A-Z0-9_-]/g,'') };
(window.NX_H = window.NX_H || {}).h_pages_pro_submitCreatorCodeApplication_357 = function (event, v) { submitCreatorCodeApplication() };
