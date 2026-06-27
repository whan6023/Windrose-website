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

  document.addEventListener('DOMContentLoaded', function () {
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

      // If page loaded with a hash, expand the group and chapter containing that anchor
      if (location.hash) {
        var target = document.querySelector('.sidebar a[href="' + location.hash + '"]');
        if (target) {
          // Expand nav-sections if this is a subsection link
          var ns = target.closest('ul.nav-sections');
          if (ns) ns.classList.add('expanded');
          // Expand the parent group
          var li = target.closest('li.nav-chapter');
          if (li) {
            li.classList.remove('grp-hidden');
            var grp = li.previousElementSibling;
            while (grp && !grp.classList.contains('nav-group-header')) {
              grp = grp.previousElementSibling;
            }
            if (grp) {
              grp.classList.remove('collapsed');
              var sib2 = grp.nextElementSibling;
              while (sib2 && !sib2.classList.contains('nav-group-header')) {
                sib2.classList.remove('grp-hidden');
                sib2 = sib2.nextElementSibling;
              }
            }
          }
        }
      }
    }
  });
})();
