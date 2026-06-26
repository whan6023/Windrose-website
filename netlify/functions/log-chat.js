// ── Windrose Chatbot → HubSpot CRM Logger ────────────────────────────────────
// Netlify function: receives a chat event from the website and creates/updates
// a HubSpot contact + logs the question as a note on that contact.
//
// Required env var:  HUBSPOT_TOKEN  (your HubSpot Private App access token)
// Optional env var:  HUBSPOT_OWNER_ID  (assign leads to a specific sales rep)
// ──────────────────────────────────────────────────────────────────────────────

const HUBSPOT_API = 'https://api.hubapi.com';

exports.handler = async function (event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors() };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors(), body: 'Method Not Allowed' };
  }

  const token = process.env.HUBSPOT_TOKEN;
  if (!token) {
    console.error('[log-chat] HUBSPOT_TOKEN env var not set');
    return { statusCode: 500, headers: cors(), body: 'Server configuration error' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: cors(), body: 'Invalid JSON' };
  }

  const {
    question,       // the user's message text
    answer,         // the bot's response (optional)
    page,           // e.g. "how-to-buy.html"
    lang,           // e.g. "en", "fr"
    sessionId,      // UUID generated once per browser session
    visitorEmail,   // only present if user typed their email
    timestamp,      // ISO string
  } = payload;

  if (!question || !sessionId) {
    return { statusCode: 400, headers: cors(), body: 'Missing required fields' };
  }

  try {
    // ── 1. Find or create a HubSpot contact ──────────────────────────────────
    const email = visitorEmail || `chatbot-session-${sessionId}@windrose-visitor.com`;
    let contactId = await findContactByEmail(token, email);

    if (!contactId) {
      contactId = await createContact(token, {
        email,
        firstname: visitorEmail ? '' : 'Website',
        lastname:  visitorEmail ? '' : `Visitor`,
        website:   `https://windrose.ai/${page || ''}`,
        hs_lead_status:     'NEW',
        lifecyclestage:     'lead',
        lead_source:        'Chatbot',
        hs_language:        lang || 'en',
      });
    }

    // ── 2. Log the question as a Note on the contact ─────────────────────────
    const noteBody = [
      `💬 CHATBOT QUESTION`,
      `──────────────────────────────`,
      `Page:      ${page || 'unknown'}`,
      `Language:  ${lang || 'en'}`,
      `Time:      ${timestamp || new Date().toISOString()}`,
      ``,
      `Question:`,
      question,
      answer ? `\nBot Answer:\n${answer}` : '',
    ].filter(l => l !== undefined).join('\n');

    await createNote(token, contactId, noteBody, timestamp);

    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({ ok: true, contactId }),
    };

  } catch (err) {
    console.error('[log-chat] HubSpot error:', err.message);
    // Don't expose errors to the browser — fail silently so chatbot still works
    return { statusCode: 200, headers: cors(), body: JSON.stringify({ ok: false }) };
  }
};

// ── HubSpot API helpers ───────────────────────────────────────────────────────

async function hs(token, method, path, body) {
  const res = await fetch(`${HUBSPOT_API}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function findContactByEmail(token, email) {
  try {
    const data = await hs(token, 'POST', '/crm/v3/objects/contacts/search', {
      filterGroups: [{
        filters: [{ propertyName: 'email', operator: 'EQ', value: email }]
      }],
      properties: ['email'],
      limit: 1,
    });
    return data.results?.[0]?.id || null;
  } catch {
    return null;
  }
}

async function createContact(token, props) {
  const data = await hs(token, 'POST', '/crm/v3/objects/contacts', {
    properties: Object.fromEntries(
      Object.entries(props).filter(([, v]) => v !== undefined && v !== '')
    ),
  });
  return data.id;
}

async function createNote(token, contactId, body, timestamp) {
  // Create note
  const note = await hs(token, 'POST', '/crm/v3/objects/notes', {
    properties: {
      hs_note_body:      body,
      hs_timestamp:      timestamp ? new Date(timestamp).getTime().toString() : Date.now().toString(),
    },
  });
  // Associate with contact
  await hs(token, 'PUT',
    `/crm/v3/objects/notes/${note.id}/associations/contacts/${contactId}/note_to_contact`,
    {}
  );
}

function cors() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}
