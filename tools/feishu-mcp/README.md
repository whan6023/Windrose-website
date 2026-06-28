# Feishu MCP Server

Gives Claude read access to your Feishu (Lark) messages and group chats.

## Setup

### 1. Create a Feishu custom app

1. Go to https://open.feishu.cn/app and log in with your Windrose account
2. Click **Create Custom App** → Enterprise Self-Built App
3. Name it "Claude Assistant"
4. Under **Permissions & Scopes**, add:
   - `im:message:readonly` — read messages
   - `im:chat:readonly` — list chats
   - `search:message` — search messages (if available for your tenant)
   - `contact:user.base:readonly` — resolve user names
5. Under **Bot** tab, enable the bot feature
6. **Publish** the app (Submit for release → Company internal use)
7. Copy your **App ID** (cli_xxx) and **App Secret** from Credentials & Basic Info

### 2. Install dependencies

No external dependencies — uses only Node.js built-ins.

### 3. Register in Claude Code

Edit `~/.claude/settings.json` (or `~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

```json
{
  "mcpServers": {
    "feishu": {
      "command": "node",
      "args": ["/home/user/Windrose-website/tools/feishu-mcp/server.js"],
      "env": {
        "FEISHU_APP_ID": "cli_your_app_id_here",
        "FEISHU_APP_SECRET": "your_app_secret_here"
      }
    }
  }
}
```

### 4. Restart Claude Code

After saving the config, restart Claude Code. The tools `feishu_list_chats`, `feishu_get_messages`, and `feishu_search_messages` will appear.

## Tools available

| Tool | Description |
|---|---|
| `feishu_list_chats` | List all group chats and DMs the bot can see |
| `feishu_get_messages` | Get recent messages from a specific chat |
| `feishu_search_messages` | Search messages by keyword |

## Notes

- The bot must be **added to group chats** manually before it can read them
- For DMs with colleagues, the colleague must initiate a conversation with the bot first, or you add the bot to a group with them
- The proxy on this server blocks api.feishu.cn — run Claude Code **locally on your Mac** for this to work
