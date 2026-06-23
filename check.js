#!/usr/bin/env node
/**
 * Windrose site health-check
 * Run: node check.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;

// ── helpers ──────────────────────────────────────────────────────────────────

const GREEN  = s => `\x1b[32m${s}\x1b[0m`;
const RED    = s => `\x1b[31m${s}\x1b[0m`;
const YELLOW = s => `\x1b[33m${s}\x1b[0m`;
const BOLD   = s => `\x1b[1m${s}\x1b[0m`;
const DIM    = s => `\x1b[2m${s}\x1b[0m`;

const PASS = GREEN('✓ PASS');
const FAIL = RED('✗ FAIL');
const WARN = YELLOW('⚠ WARN');

let totalPass = 0, totalFail = 0, totalWarn = 0;

function check(label, result, detail = '') {
  const icon = result === 'pass' ? PASS : result === 'warn' ? WARN : FAIL;
  if (result === 'pass') totalPass++;
  else if (result === 'warn') totalWarn++;
  else totalFail++;
  const detailStr = detail ? DIM(`  ${detail}`) : '';
  console.log(`  ${icon}  ${label}${detailStr ? '\n' + detailStr : ''}`);
}

function section(title) {
  console.log(`\n${BOLD('── ' + title + ' ' + '─'.repeat(Math.max(0, 60 - title.length - 4)))}`)
}

function read(file) {
  const full = path.join(ROOT, file);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

// Main HTML pages (non-stub, non-edit)
const MAIN_PAGES = [
  'index.html', 'about-us.html', 'how-to-buy.html',
  'how-to-use.html', 'how-to-build.html', 'how-to-service.html',
  'technology.html',
];

// ── 1. SECURITY ───────────────────────────────────────────────────────────────

section('1. Security');

// 1a. No Stripe secret keys in source files
{
  const badFiles = [];
  const allFiles = fs.readdirSync(ROOT).filter(f => /\.(html|js|json)$/.test(f));
  for (const f of allFiles) {
    const src = read(f) || '';
    if (/sk_(live|test)_[A-Za-z0-9]{20}/.test(src)) badFiles.push(f);
  }
  check('No Stripe secret keys in source files',
    badFiles.length === 0 ? 'pass' : 'fail',
    badFiles.length ? `Found in: ${badFiles.join(', ')}` : '');
}

// 1b. openStripeModal uses embedded modal, not external URL
{
  const externalModal = [];
  for (const page of MAIN_PAGES) {
    const src = read(page) || '';
    if (/openStripeModal\(\)\s*\{[^}]*buy\.stripe\.com/.test(src)) externalModal.push(page);
  }
  check('Stripe modal uses embedded checkout (no external redirect)',
    externalModal.length === 0 ? 'pass' : 'fail',
    externalModal.length ? `External redirect in: ${externalModal.join(', ')}` : '');
}

// 1c. No API keys hardcoded (generic patterns)
{
  const badFiles = [];
  const allFiles = fs.readdirSync(ROOT).filter(f => /\.(html|js)$/.test(f) && !f.includes('-edit'));
  const pattern = /['"](?:sk_live|sk_test|rk_live|rk_test)_[A-Za-z0-9]{20}/;
  for (const f of allFiles) {
    const src = read(f) || '';
    if (pattern.test(src)) badFiles.push(f);
  }
  check('No hardcoded API secret patterns in HTML/JS',
    badFiles.length === 0 ? 'pass' : 'fail',
    badFiles.length ? `Found in: ${badFiles.join(', ')}` : '');
}

// ── 2. TRANSLATIONS ───────────────────────────────────────────────────────────

section('2. Translations');

let TRANSLATIONS = null;
{
  const src = read('translations.js');
  if (src) {
    try {
      const window = {};
      eval(src); // eslint-disable-line no-eval
      TRANSLATIONS = window.TRANSLATIONS;
    } catch (e) { /* ignore extra window. calls */ }
  }
}

if (!TRANSLATIONS) {
  check('translations.js loads', 'fail', 'Could not parse TRANSLATIONS object');
} else {
  const langs = Object.keys(TRANSLATIONS);
  const enKeys = Object.keys(TRANSLATIONS.en);

  check('translations.js loads', 'pass', `${langs.length} languages, ${enKeys.length} keys`);

  // 2a. All languages have all keys
  const missingByLang = {};
  for (const lang of langs) {
    if (lang === 'en') continue;
    const missing = enKeys.filter(k => TRANSLATIONS[lang][k] === undefined);
    if (missing.length) missingByLang[lang] = missing;
  }
  const langsWithMissing = Object.keys(missingByLang);
  check(`All ${langs.length} languages have complete key coverage`,
    langsWithMissing.length === 0 ? 'pass' : 'fail',
    langsWithMissing.length
      ? langsWithMissing.map(l => `[${l}] missing: ${missingByLang[l].join(', ')}`).join('\n  ')
      : '');

  // 2b. All data-i18n keys in HTML files exist in translations.en
  {
    const missingKeys = {};
    for (const page of MAIN_PAGES) {
      const src = read(page) || '';
      const matches = [...src.matchAll(/data-i18n(>:-html)?="([^"]+)"/g)];
      const missing = matches
        .map(m => m[1])
        .filter(k => TRANSLATIONS.en[k] === undefined);
      if (missing.length) missingKeys[page] = [...new Set(missing)];
    }
    const pagesWithMissing = Object.keys(missingKeys);
    const cap = (arr, n) => arr.length > n ? [...arr.slice(0, n), `… ${arr.length - n} more`] : arr;
    check('All data-i18n keys in HTML exist in translations',
      pagesWithMissing.length === 0 ? 'pass' : 'fail',
      pagesWithMissing.length
        ? pagesWithMissing.map(p => `${p}: ${cap(missingKeys[p], 8).join(', ')}`).join('\n  ')
        : '');
  }
}

// ── 3. INTERNAL LINKS ─────────────────────────────────────────────────────────

section('3. Internal links & assets');

{
  const broken = [];
  for (const page of MAIN_PAGES) {
    const src = read(page) || '';
    // href links to .html files (skip external URLs)
    const hrefs = [...src.matchAll(/href="(\.\/)?([^"#?]+\.html)/g)].map(m => m[2]);
    for (const href of hrefs) {
      if (href.startsWith('http')) continue;
      if (!exists(href)) broken.push(`${page} → ${href}`);
    }
    // script src
    const scripts = [...src.matchAll(/src="(\.\/)?([^"]+\.js)"/g)].map(m => m[2]);
    for (const s of scripts) {
      if (!s.startsWith('http') && !exists(s)) broken.push(`${page} → ${s}`);
    }
  }
  const unique = [...new Set(broken)];
  check('All internal .html and .js references resolve',
    unique.length === 0 ? 'pass' : 'fail',
    unique.length ? unique.slice(0, 10).join('\n  ') : '');
}

// Image references
{
  const broken = [];
  for (const page of MAIN_PAGES) {
    const src = read(page) || '';
    const imgs = [...src.matchAll(/src="((?:\.\/)?(?:images|assets|og)\/[^"]+)"/g)]
      .map(m => m[1].replace(/^\.\//, ''))
      .filter(f => !/\.pdf/.test(f));
    for (const img of imgs) {
      if (!exists(img)) broken.push(`${page} → ${img}`);
    }
  }
  const unique = [...new Set(broken)];
  check('All local image references resolve',
    unique.length === 0 ? 'pass' : 'fail',
    unique.length ? unique.slice(0, 10).join('\n  ') : '');
}

// ── 4. SEO & META TAGS ────────────────────────────────────────────────────────

section('4. SEO & meta tags');

for (const page of MAIN_PAGES) {
  const src = read(page) || '';
  const issues = [];
  if (!/<title>[^<]+<\/title>/.test(src))          issues.push('missing <title>');
  if (!/<meta[^>]+name="description"/.test(src))   issues.push('missing meta description');
  if (!/<meta[^>]+og:title/.test(src))             issues.push('missing og:title');
  if (!/<meta[^>]+og:image/.test(src))             issues.push('missing og:image');
  if (!/<meta[^>]+og:description/.test(src))       issues.push('missing og:description');
  const canonical = /<link[^>]+rel="canonical"/.test(src);
  check(`${page} — meta tags`, issues.length === 0 ? 'pass' : 'fail',
    issues.length ? issues.join(', ') : '');
}

// OG images exist on disk
{
  const missingOg = [];
  for (const page of MAIN_PAGES) {
    const src = read(page) || '';
    const m = src.match(/og:image"[^>]*content="https?:\/\/[^/]+\/([^"]+)"/);
    if (m && !exists(m[1])) missingOg.push(`${page} references missing ${m[1]}`);
  }
  check('All og:image files exist on disk',
    missingOg.length === 0 ? 'pass' : 'fail',
    missingOg.length ? missingOg.join('\n  ') : '');
}

// ── 5. MOBILE CSS ─────────────────────────────────────────────────────────────

section('5. Mobile CSS');

const REQUIRED_MOBILE_RULES = [
  { pattern: /section\s*\{[^}]*padding-top[^}]*!important/, label: 'section padding-top override' },
  { pattern: /section\s*\{[^}]*padding-bottom[^}]*!important/, label: 'section padding-bottom override' },
  { pattern: /h2\s*\{[^}]*margin-bottom[^}]*!important/, label: 'h2 margin-bottom override' },
  { pattern: /grid-template-columns:\s*1fr\s*!important/, label: 'grid collapse to 1fr' },
  { pattern: /roadmap-page-wrap/, label: '.roadmap-page-wrap padding override' },
];

for (const page of MAIN_PAGES) {
  const src = read(page) || '';
  if (!/@media\s*\(max-width:\s*600px\)/.test(src)) {
    check(`${page} — mobile @media (max-width:600px) block`, 'fail', 'block not found');
    continue;
  }
  // Extract all 600px media blocks using brace-depth tracking
  let allBlocks = '';
  let searchFrom = 0;
  const re600 = /@media\s*\(max-width:\s*600px\)\s*\{/g;
  let m600;
  re600.lastIndex = 0;
  while ((m600 = re600.exec(src)) !== null) {
    let depth = 1, i = m600.index + m600[0].length, start = i;
    while (i < src.length && depth > 0) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
      i++;
    }
    allBlocks += src.slice(start, i - 1) + '\n';
    re600.lastIndex = i;
  }
  const missing = REQUIRED_MOBILE_RULES.filter(r => !r.pattern.test(allBlocks));
  check(`${page} — mobile CSS rules`,
    missing.length === 0 ? 'pass' : 'warn',
    missing.length ? `missing: ${missing.map(r => r.label).join(', ')}` : '');
}

// ── 6. NETLIFY FUNCTIONS ──────────────────────────────────────────────────────

section('6. Netlify functions');

const EXPECTED_FUNCTIONS = [
  'netlify/functions/create-payment-intent.js',
  'netlify/functions/chat.js',
  'netlify/functions/link.js',
];

for (const fn of EXPECTED_FUNCTIONS) {
  check(fn, exists(fn) ? 'pass' : 'fail');
}

// Check create-payment-intent uses env var, not hardcoded secret
{
  const src = read('netlify/functions/create-payment-intent.js') || '';
  const usesEnvVar  = /process\.env\.STRIPE_SECRET_KEY/.test(src);
  const hardcoded   = /sk_(live|test)_[A-Za-z0-9]{20}/.test(src);
  check('create-payment-intent uses env var for secret key',
    usesEnvVar && !hardcoded ? 'pass' : 'fail',
    hardcoded ? 'hardcoded key found!' : !usesEnvVar ? 'process.env.STRIPE_SECRET_KEY not found' : '');
}

// ── 7. CROSS-PAGE CONSISTENCY ─────────────────────────────────────────────────

section('7. Cross-page consistency');

// All pages have the reserve modal
{
  const missing = MAIN_PAGES.filter(p => !(read(p) || '').includes('wr-reserve-modal'));
  check('All pages have the Stripe reserve modal',
    missing.length === 0 ? 'pass' : 'fail',
    missing.length ? `Missing in: ${missing.join(', ')}` : '');
}

// All pages include translations.js
{
  const missing = MAIN_PAGES.filter(p => !(read(p) || '').includes('translations.js'));
  check('All pages include translations.js',
    missing.length === 0 ? 'pass' : 'fail',
    missing.length ? `Missing in: ${missing.join(', ')}` : '');
}

// All pages include unified-search.js
{
  const missing = MAIN_PAGES.filter(p => !(read(p) || '').includes('unified-search.js'));
  check('All pages include unified-search.js',
    missing.length === 0 ? 'pass' : 'fail',
    missing.length ? `Missing in: ${missing.join(', ')}` : '');
}

// All pages have a lang switcher
{
  const missing = MAIN_PAGES.filter(p => !(read(p) || '').includes('lang-switcher'));
  check('All pages have the language switcher',
    missing.length === 0 ? 'pass' : 'fail',
    missing.length ? `Missing in: ${missing.join(', ')}` : '');
}

// ── 8. CONTENT INTEGRITY ──────────────────────────────────────────────────────

section('8. Content integrity');

// No leftover TODO / PLACEHOLDER / FIXME in HTML
{
  const hits = [];
  for (const page of MAIN_PAGES) {
    const src = read(page) || '';
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      if (/\b(TODO|FIXME|PLACEHOLDER|REPLACE_ME|YOUR_KEY_HERE)\b/.test(line)) {
        hits.push(`${page}:${i + 1}: ${line.trim().slice(0, 80)}`);
      }
    });
  }
  check('No TODO/FIXME/PLACEHOLDER in page HTML',
    hits.length === 0 ? 'pass' : 'warn',
    hits.length ? hits.slice(0, 5).join('\n  ') : '');
}

// Stripe publishable key present in pages (not secret key)
{
  const missing = [];
  for (const page of MAIN_PAGES) {
    const src = read(page) || '';
    if (!src.includes('pk_live_') && !src.includes('WINDROSE_STRIPE_PK')) missing.push(page);
  }
  check('Stripe publishable key present in all pages',
    missing.length === 0 ? 'pass' : 'warn',
    missing.length ? `Not found in: ${missing.join(', ')}` : '');
}

// No console.log statements left in production functions
{
  const fnDir = path.join(ROOT, 'netlify/functions');
  const hits = [];
  if (fs.existsSync(fnDir)) {
    fs.readdirSync(fnDir).filter(f => f.endsWith('.js')).forEach(f => {
      const src = fs.readFileSync(path.join(fnDir, f), 'utf8');
      const count = (src.match(/console\.log/g) || []).length;
      if (count > 2) hits.push(`${f}: ${count} console.log calls`);
    });
  }
  check('Netlify functions have no excessive console.log',
    hits.length === 0 ? 'pass' : 'warn',
    hits.length ? hits.join(', ') : '');
}

// ── SUMMARY ───────────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(62)}`);
console.log(BOLD(`  SUMMARY`));
console.log(`${'═'.repeat(62)}`);
console.log(`  ${GREEN(`${totalPass} passed`)}   ${totalWarn > 0 ? YELLOW(`${totalWarn} warnings`) : `${totalWarn} warnings`}   ${totalFail > 0 ? RED(`${totalFail} failed`) : `${totalFail} failed`}`);
if (totalFail === 0 && totalWarn === 0) {
  console.log(`\n  ${GREEN('All checks passed. Site is healthy. ✓')}`);
} else if (totalFail === 0) {
  console.log(`\n  ${YELLOW('No failures, but review warnings above.')}`);
} else {
  console.log(`\n  ${RED(`${totalFail} check(s) failed — see details above.`)}`);
}
console.log('');
process.exit(totalFail > 0 ? 1 : 0);
