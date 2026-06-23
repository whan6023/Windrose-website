/**
 * Windrose Share Buttons
 * Appends a small share strip to every <section id="..."> on the page.
 * Shares the page URL with the section anchor so links deep-link directly.
 */
(function () {
  'use strict';

  var style = document.createElement('style');
  style.textContent = [
    '.wr-share-strip {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0.5rem;',
    '  padding: 0.75rem clamp(1.5rem, 5vw, 4rem) 1rem;',
    '  border-top: 1px solid rgba(74,158,255,0.1);',
    '  margin-top: 1.5rem;',
    '}',
    '.wr-share-label {',
    '  font-family: "Barlow Condensed", sans-serif;',
    '  font-size: 0.85rem;',
    '  letter-spacing: 0.18em;',
    '  text-transform: uppercase;',
    '  color: rgba(122,154,191,0.45);',
    '  margin-right: 0.25rem;',
    '  white-space: nowrap;',
    '}',
    '.wr-share-btn {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 0.35rem;',
    '  padding: 0.3rem 0.65rem;',
    '  border-radius: 4px;',
    '  border: 1px solid rgba(74,158,255,0.18);',
    '  background: rgba(74,158,255,0.04);',
    '  color: rgba(122,154,191,0.7);',
    '  font-family: "Barlow Condensed", sans-serif;',
    '  font-size: 0.85rem;',
    '  letter-spacing: 0.12em;',
    '  text-transform: uppercase;',
    '  text-decoration: none;',
    '  cursor: pointer;',
    '  transition: background 0.15s, border-color 0.15s, color 0.15s;',
    '  white-space: nowrap;',
    '}',
    '.wr-share-btn:hover {',
    '  background: rgba(74,158,255,0.1);',
    '  border-color: rgba(74,158,255,0.4);',
    '  color: rgba(74,158,255,0.9);',
    '}',
    '.wr-share-btn svg {',
    '  width: 13px;',
    '  height: 13px;',
    '  flex-shrink: 0;',
    '  fill: currentColor;',
    '}',
    '@media (max-width: 480px) {',
    '  .wr-share-label { display: none; }',
    '  .wr-share-btn span { display: none; }',
    '  .wr-share-btn { padding: 0.35rem 0.5rem; }',
    '  .wr-share-btn svg { width: 16px; height: 16px; }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  var ICONS = {
    facebook: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>'
  };

  function buildStrip(url) {
    var encUrl = encodeURIComponent(url);
    var encTitle = encodeURIComponent(document.title);

    var fbUrl  = 'https://www.facebook.com/sharer/sharer.php?u=' + encUrl;
    var liUrl  = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encUrl;
    var waUrl  = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(document.title + ' ' + url);

    var strip = document.createElement('div');
    strip.className = 'wr-share-strip';
    strip.setAttribute('aria-label', 'Share this section');

    var label = document.createElement('span');
    label.className = 'wr-share-label';
    label.textContent = 'Share';
    strip.appendChild(label);

    var buttons = [
      { href: fbUrl,  icon: 'facebook', text: 'Facebook'  },
      { href: liUrl,  icon: 'linkedin', text: 'LinkedIn'  },
      { href: waUrl,  icon: 'whatsapp', text: 'WhatsApp'  }
    ];

    buttons.forEach(function(b) {
      var a = document.createElement('a');
      a.className = 'wr-share-btn';
      a.href = b.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', 'Share on ' + b.text);
      a.innerHTML = ICONS[b.icon] + '<span>' + b.text + '</span>';
      strip.appendChild(a);
    });

    return strip;
  }

  function init() {
    var origin = window.location.origin || 'https://windrose.ai';
    var pathname = window.location.pathname;

    var sections = document.querySelectorAll('section[id]');
    sections.forEach(function(sec) {
      var url = origin + pathname + '#' + sec.id;
      sec.appendChild(buildStrip(url));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
