#!/usr/bin/env node
/**
 * Feishu (Lark) MCP Server
 * Gives Claude read access to Feishu messages and chats.
 *
 * Setup:
 *   export FEISHU_APP_ID=cli_xxxx
 *   export FEISHU_APP_SECRET=xxxx
 *   node server.js
 */

const readline = require("readline");
const https = require("https");

const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;
const BASE = "open.feishu.cn";

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function httpsPost(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(data) };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const req = https.request({ hostname: BASE, path, method: "POST", headers }, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => { try { resolve(JSON.parse(raw)); } catch { resolve(raw); } });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function httpsGet(path, token, params = {}) {
  return new Promise((resolve, reject) => {
    const qs = Object.keys(params).length ? "?" + new URLSearchParams(params).toString() : "";
    const headers = { "Authorization": `Bearer ${token}` };
    const req = https.request({ hostname: BASE, path: path + qs, method: "GET", headers }, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => { try { resolve(JSON.parse(raw)); } catch { resolve(raw); } });
    });
    req.on("error", reject);
    req.end();
  });
}

// ── Token cache ───────────────────────────────────────────────────────────────

let _token = null;
let _tokenExpiry = 0;

async function getTenantToken() {
  if (_token && Date.now() < _tokenExpiry) return _token;
  const res = await httpsPost("/open-apis/auth/v3/tenant_access_token/internal", {
    app_id: APP_ID,
    app_secret: APP_SECRET,
  });
  if (!res.tenant_access_token) throw new Error("Auth failed: " + JSON.stringify(res));
  _token = res.tenant_access_token;
  _tokenExpiry = Date.now() + (res.expire - 60) * 1000;
  return _token;
}

// ── Feishu API calls ──────────────────────────────────────────────────────────

async function listChats(pageSize = 20) {
  const token = await getTenantToken();
  const res = await httpsGet("/open-apis/im/v1/chats", token, { page_size: pageSize });
  return res;
}

async function getChatMessages(chatId, pageSize = 50) {
  const token = await getTenantToken();
  const res = await httpsGet(`/open-apis/im/v1/messages`, token, {
    container_id_type: "chat",
    container_id: chatId,
    page_size: pageSize,
    sort_type: "ByCreateTimeDesc",
  });
  return res;
}

async function searchMessages(query, chatId = null) {
  const token = await getTenantToken();
  const body = { query, page_size: 20 };
  if (chatId) body.chat_id = chatId;
  // Feishu search API (requires search:message scope for some tenants)
  const res = await httpsPost("/open-apis/search/v2/message", body, token);
  return res;
}

async function getUserInfo(userId) {
  const token = await getTenantToken();
  const res = await httpsGet(`/open-apis/contact/v3/users/${userId}`, token, { user_id_type: "open_id" });
  return res;
}

// ── MCP JSON-RPC protocol ─────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "feishu_list_chats",
    description: "List all Feishu group chats and direct message conversations the bot has access to.",
    inputSchema: {
      type: "object",
      properties: {
        page_size: { type: "number", description: "Number of chats to return (default 20, max 100)" },
      },
    },
  },
  {
    name: "feishu_get_messages",
    description: "Get recent messages from a specific Feishu chat by chat ID.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: { type: "string", description: "The Feishu chat ID (from feishu_list_chats)" },
        page_size: { type: "number", description: "Number of messages to return (default 50)" },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "feishu_search_messages",
    description: "Search Feishu messages by keyword across all accessible chats.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query string" },
        chat_id: { type: "string", description: "Optional: restrict search to a specific chat" },
      },
      required: ["query"],
    },
  },
];

async function handleTool(name, args) {
  switch (name) {
    case "feishu_list_chats":
      return await listChats(args.page_size || 20);
    case "feishu_get_messages":
      return await getChatMessages(args.chat_id, args.page_size || 50);
    case "feishu_search_messages":
      return await searchMessages(args.query, args.chat_id);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function err(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

async function handleRequest(req) {
  const { id, method, params } = req;

  if (method === "initialize") {
    return send({
      jsonrpc: "2.0", id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "feishu-mcp", version: "1.0.0" },
      },
    });
  }

  if (method === "tools/list") {
    return send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
  }

  if (method === "tools/call") {
    const { name, arguments: args } = params;
    try {
      const result = await handleTool(name, args || {});
      return send({
        jsonrpc: "2.0", id,
        result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
      });
    } catch (e) {
      return err(id, -32000, e.message);
    }
  }

  err(id, -32601, `Method not found: ${method}`);
}

// ── Main loop ─────────────────────────────────────────────────────────────────

if (!APP_ID || !APP_SECRET) {
  process.stderr.write("Error: FEISHU_APP_ID and FEISHU_APP_SECRET must be set.\n");
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", async (line) => {
  line = line.trim();
  if (!line) return;
  try {
    const req = JSON.parse(line);
    await handleRequest(req);
  } catch (e) {
    process.stderr.write("Parse error: " + e.message + "\n");
  }
});

process.stderr.write("Feishu MCP server started. Waiting for requests...\n");
