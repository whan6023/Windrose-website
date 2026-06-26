const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function extractFileId(url) {
  return url.match(/\/d\/([^/?#]+)/)?.[1]
    || url.match(/[?&]id=([^&]+)/)?.[1]
    || url.match(/\/folders\/([^/?#]+)/)?.[1]
    || null;
}

function extractDocId(url, type) {
  return url.match(new RegExp(`/${type}/d/([^/?#]+)`))?.[1] ?? null;
}

function parseGoogleDriveUrl(url) {
  if (url.includes('docs.google.com/document'))
    return { type: 'Google Doc', icon: '📝', fileId: extractDocId(url, 'document') };
  if (url.includes('docs.google.com/spreadsheets'))
    return { type: 'Google Sheet', icon: '📊', fileId: extractDocId(url, 'spreadsheets') };
  if (url.includes('docs.google.com/presentation'))
    return { type: 'Google Slides', icon: '📽️', fileId: extractDocId(url, 'presentation') };
  if (url.includes('docs.google.com/forms'))
    return { type: 'Google Form', icon: '📋', fileId: extractDocId(url, 'forms') };
  if (url.includes('drive.google.com/drive/folders'))
    return { type: 'Google Drive Folder', icon: '📂', fileId: url.match(/\/folders\/([^/?#]+)/)?.[1] };
  if (url.includes('drive.google.com/file') || url.includes('drive.google.com/open'))
    return { type: 'Google Drive File', icon: '📄', fileId: extractFileId(url) };
  return { type: 'Google Drive', icon: '🗂️', fileId: null };
}

async function fetchGoogleTitle(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<title>([^<]+)<\/title>/);
    if (match) {
      const name = match[1].replace(/\s*-\s*Google\s.+$/, '').trim();
      if (name) return name;
    }
  } catch (_) {}
  return null;
}

async function fetchAirtableName(url) {
  try {
    const baseId = url.match(/airtable\.com\/(app[^/?#/]+)/)?.[1];
    const tableId = url.match(/\/(tbl[^/?#/]+)/)?.[1];
    if (!baseId) return null;
    const headers = { Authorization: `Bearer ${AIRTABLE_TOKEN}` };
    const [baseRes, tablesRes] = await Promise.all([
      fetch(`https://api.airtable.com/v0/meta/bases/${baseId}`, { headers }),
      tableId ? fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, { headers }) : Promise.resolve(null),
    ]);
    let name = null;
    if (baseRes.ok) {
      const base = await baseRes.json();
      name = base.name || null;
    }
    if (tablesRes?.ok) {
      const { tables } = await tablesRes.json();
      const table = tables?.find(t => t.id === tableId);
      if (table?.name) name = name ? `${name} · ${table.name}` : table.name;
    }
    return name;
  } catch (_) {}
  return null;
}

export async function handler(event) {
  const rawUrl = event.queryStringParameters?.url || '';
  if (!rawUrl) {
    return { statusCode: 302, headers: { Location: 'https://windrose.ai' } };
  }

  let title = 'Windrose Link';
  let image = null;
  let description = 'Open link';

  if (rawUrl.includes('airtable.com')) {
    if (rawUrl.includes('/invite/')) {
      title = '📋 Airtable Invite';
    } else if (rawUrl.match(/airtable\.com\/shr/)) {
      title = '📋 Airtable Shared View';
    } else {
      const name = await fetchAirtableName(rawUrl);
      title = name ? `📋 ${name}` : '📋 Airtable';
    }
    description = 'Open in Airtable';
  } else if (
    rawUrl.includes('drive.google.com') ||
    rawUrl.includes('docs.google.com')
  ) {
    const info = parseGoogleDriveUrl(rawUrl);
    const name = info.fileId ? await fetchGoogleTitle(rawUrl) : null;
    title = name ? `${info.icon} ${name}` : `${info.icon} ${info.type}`;
    description = `Open in ${info.type.replace(/Google /, 'Google ')}`;
    if (info.fileId) {
      image = `https://drive.google.com/thumbnail?id=${info.fileId}&sz=w800-h600`;
    }
  }

  const safeUrl = esc(rawUrl);
  const safeTitle = esc(title);
  const safeDesc = esc(description);
  const safeImage = image ? esc(image) : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${safeTitle}</title>
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${safeUrl}" />
  ${safeImage ? `<meta property="og:image" content="${safeImage}" />` : ''}
  <meta name="twitter:card" content="${safeImage ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${safeTitle}" />
  ${safeImage ? `<meta name="twitter:image" content="${safeImage}" />` : ''}
  <meta http-equiv="refresh" content="0;url=${safeUrl}" />
  <script>window.location.replace(${JSON.stringify(rawUrl)})</script>
</head>
<body>
  <p>Redirecting to <a href="${safeUrl}">${safeTitle}</a>…</p>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html,
  };
}
