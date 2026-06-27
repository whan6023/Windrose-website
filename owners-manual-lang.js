(function () {
  var style = document.createElement('style');
  style.textContent = [
    /* Language selector in header */
    '.header-lang{display:flex;align-items:center;}',
    '.lang-select{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);',
    'color:#f0f4f8;font-size:13px;padding:5px 10px;border-radius:4px;cursor:pointer;',
    'max-width:220px;}',
    '.lang-select:hover{background:rgba(255,255,255,.18);}',
    '.lang-select:focus{outline:none;}',
    '.lang-select option{background:#1a2332;color:#f0f4f8;}',
    /* Collapsible group headers */
    'li.nav-group-header{pointer-events:auto!important;cursor:pointer;user-select:none;}',
    'li.nav-group-header span::before{content:"▾ ";font-size:9px;opacity:.7;}',
    'li.nav-group-header.collapsed span::before{content:"▸ ";}',
    'li.nav-chapter.grp-hidden{display:none!important;}',
    /* Chapter numbering via CSS counters */
    '.nav-chapters{counter-reset:grp-ctr;}',
    'li.nav-group-header{counter-increment:grp-ctr;counter-reset:chap-ctr;}',
    'li.nav-chapter{counter-increment:chap-ctr;}',
    '.nav-chapter-title::before{content:counter(grp-ctr) "." counter(chap-ctr) " ▸"!important;font-size:11px;}',
    '.nav-chapter-title:has(+.nav-sections.expanded)::before{content:counter(grp-ctr) "." counter(chap-ctr) " ▾"!important;transform:none!important;}',
    /* Collapsible body sections */
    'h1.sec-toggle,h2.sec-toggle{cursor:pointer;user-select:none;}',
    'h1.sec-toggle:hover,h2.sec-toggle:hover{color:var(--accent);}',
    'h1.sec-toggle::after,h2.sec-toggle::after{content:" ▸";font-size:11px;opacity:.5;font-weight:400;}',
    'h1.sec-toggle.is-open::after,h2.sec-toggle.is-open::after{content:" ▾";}',
  ].join('');
  document.head.appendChild(style);

  var EDITIONS = [
    { path: '/owners-manual-eu/',                  flag: '🇪🇺', label: 'European Union (EN)' },
    { path: '/owners-manual-uk/',                  flag: '🇬🇧', label: 'United Kingdom (EN)' },
    { path: '/owners-manual-us/',                  flag: '🇺🇸', label: 'United States (EN)' },
    { path: '/owners-manual-au/',                  flag: '🇦🇺', label: 'Australia — ADR Edition (EN)' },
    { path: '/owners-manual-australia/',           flag: '🇦🇺', label: 'Australia (EN)' },
    { path: '/owners-manual-german/',              flag: '🇩🇪', label: 'Deutschland (DE)' },
    { path: '/owners-manual-french/',              flag: '🇫🇷', label: 'France (FR)' },
    { path: '/owners-manual-spanish/',             flag: '🇪🇸', label: 'España (ES)' },
    { path: '/owners-manual-italian/',             flag: '🇮🇹', label: 'Italia (IT)' },
    { path: '/owners-manual-portuguese/',          flag: '🇵🇹', label: 'Portugal (PT)' },
    { path: '/owners-manual-dutch/',               flag: '🇳🇱', label: 'Nederland (NL)' },
    { path: '/owners-manual-swedish/',             flag: '🇸🇪', label: 'Sverige (SV)' },
    { path: '/owners-manual-norsk/',               flag: '🇳🇴', label: 'Norge (NO)' },
    { path: '/owners-manual-danish/',              flag: '🇩🇰', label: 'Danmark (DA)' },
    { path: '/owners-manual-finnish/',             flag: '🇫🇮', label: 'Suomi (FI)' },
    { path: '/owners-manual-polish/',              flag: '🇵🇱', label: 'Polska (PL)' },
    { path: '/owners-manual-icelandic/',           flag: '🇮🇸', label: 'Ísland (IS)' },
    { path: '/owners-manual-chinese-traditional/', flag: '🇭🇰', label: '繁體中文' },
    { path: '/owners-manual-japanese/',            flag: '🇯🇵', label: '日本 (JA)' },
    { path: '/owners-manual-korean/',              flag: '🇰🇷', label: '한국 (KO)' },
    { path: '/owners-manual-arabic/',              flag: '🇦🇪', label: 'العربية (AR)' },
    { path: '/owners-manual-hebrew/',              flag: '🇮🇱', label: 'עברית (HE)' },
    { path: '/owners-manual-turkish/',             flag: '🇹🇷', label: 'Türkiye (TR)' },
  ];

  var currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
  if (!currentPath.endsWith('/')) currentPath += '/';

  var sel = document.createElement('select');
  sel.className = 'lang-select';
  sel.setAttribute('aria-label', 'Select language edition');

  EDITIONS.forEach(function (ed) {
    var opt = document.createElement('option');
    opt.value = ed.path;
    opt.textContent = ed.flag + ' ' + ed.label;
    if (currentPath === ed.path) opt.selected = true;
    sel.appendChild(opt);
  });

  sel.addEventListener('change', function () {
    window.location.href = sel.value;
  });

  var wrapper = document.createElement('div');
  wrapper.className = 'header-lang';
  wrapper.appendChild(sel);

  function initSections() {
    document.querySelectorAll('.manual-section.level-1, .manual-section.level-2').forEach(function (sec) {
      var hd = sec.querySelector('h1, h2');
      if (!hd) return;
      var others = Array.from(sec.children).filter(function (el) { return el !== hd; });
      if (!others.length) return;
      var body = document.createElement('div');
      body.className = 'sec-body';
      body.hidden = true;
      others.forEach(function (el) { body.appendChild(el); });
      sec.appendChild(body);
      hd.classList.add('sec-toggle');
      hd.addEventListener('click', function () {
        body.hidden = !body.hidden;
        hd.classList.toggle('is-open', !body.hidden);
      });
    });
  }

  function expandForHash(hash) {
    if (!hash) return;
    var el = document.getElementById(hash.slice(1));
    if (!el) return;
    var sec = el.closest('.manual-section') || (el.classList.contains('manual-section') ? el : null);
    if (!sec) return;
    var body = sec.querySelector('.sec-body');
    if (body) {
      body.hidden = false;
      var hd = sec.querySelector('.sec-toggle');
      if (hd) hd.classList.add('is-open');
    }
    // Also expand parent level-1 section if this is a level-2
    var parent = sec.parentElement && sec.parentElement.closest('.manual-section.level-1');
    if (parent) {
      var pbody = parent.querySelector(':scope > .sec-body');
      if (pbody) {
        pbody.hidden = false;
        var phd = parent.querySelector('.sec-toggle');
        if (phd) phd.classList.add('is-open');
      }
    }
  }

  window.addEventListener('hashchange', function () { expandForHash(location.hash); });

  // Auto-expand the target section when any anchor link is clicked
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href && href.length > 1) expandForHash(href);
  });

  document.addEventListener('DOMContentLoaded', function () {
    initSections();

    // Inject language selector into header
    var header = document.querySelector('.site-header');
    var searchDiv = document.querySelector('.header-search');
    if (header && searchDiv) {
      header.insertBefore(wrapper, searchDiv);
    } else if (header) {
      header.appendChild(wrapper);
    }

    // Make nav-group-headers collapsible and collapse all by default
    var chapList = document.querySelector('.nav-chapters');
    if (chapList) {
      var headers = chapList.querySelectorAll('li.nav-group-header');
      headers.forEach(function (hdr) {
        hdr.addEventListener('click', function () {
          var collapsed = hdr.classList.toggle('collapsed');
          var sib = hdr.nextElementSibling;
          while (sib && !sib.classList.contains('nav-group-header')) {
            sib.classList.toggle('grp-hidden', collapsed);
            sib = sib.nextElementSibling;
          }
        });
        // Collapse this group immediately
        hdr.classList.add('collapsed');
        var sib = hdr.nextElementSibling;
        while (sib && !sib.classList.contains('nav-group-header')) {
          sib.classList.add('grp-hidden');
          sib = sib.nextElementSibling;
        }
      });
    }
  });
})();
