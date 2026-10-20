<p align="center">
  <img src="desktop-extension/icon.png" alt="SPHERE" width="96" height="96">
</p>

<h1 align="center">SPHERE extension for Claude Desktop</h1>

<p align="center">
  Manage <a href="https://sphere.score.us.es">SPHERE</a> organizations, members, permissions, pricings and collections from Claude chat and Cowork.
</p>

---

This extension connects Claude Desktop to SPHERE's MCP server. Claude works with **your own SPHERE account and API key**, on **your own Claude subscription**: SPHERE runs no language model for it.

- **Read** your organizations, hierarchies, members, invitations, permissions, pricings, pricing versions and analytics, collections, notifications and profile.
- **Propose changes**: create organization trees, add or invite members, change roles and permissions, publish pricing versions from YAML, change visibility, fork pricings, manage collections, and more.
- **Stay in control**: every change is a plan that waits in SPHERE until you review and confirm it there. Claude cannot confirm plans.

## Install

You need [Claude Desktop](https://claude.ai/download) and a SPHERE account.

### 1. Create an API key

1. Sign in to SPHERE and open **API keys**.
2. Create a key **only for this use**, with:
   - the **narrowest scope** that works: `VIEW` to read, `MANAGEMENT` to propose changes, `ALL` only to transfer ownership, move or delete organizations;
   - access **only to the organizations** it needs;
   - an **expiry date**.
3. Copy it. It is shown only once.

Never paste the key into a conversation with Claude. See [SECURITY.md](SECURITY.md).

### 2. Get the extension

Either download `sphere.mcpb` from the [latest release](https://github.com/SCORELabUS/sphere-orbit-plugin/releases/latest), or build it locally. Building needs [Node.js](https://nodejs.org) 18 or later:

```bash
git clone https://github.com/SCORELabUS/sphere-orbit-plugin.git
```

```bash
cd sphere-orbit-plugin
```

```bash
./scripts/build-extension.sh
```

The file is created at `dist/sphere.mcpb`.

### 3. Install it in Claude Desktop

1. Open Claude Desktop and go to **Settings > Extensions**.
2. Drag `sphere.mcpb` into the window (or double-click the file) and confirm the installation.
3. Fill in the form:
   - **SPHERE URL**: `https://sphere.score.us.es` by default. For a local SPHERE started with `pnpm run dev`, use `http://localhost:5173`.
   - **SPHERE API key**: the key you created. It is stored in your system's secure credential store.
4. Enable the extension and start a **new conversation**.

To change the URL or the key later, open the extension's settings in **Settings > Extensions**.

> The extension works in **Chat** and **Cowork**. The **Code** tab of Claude Desktop does not load extensions, so the tools will not be there.

## Try it

- "Show my SPHERE organizations and my role in each."
- "Who can edit the pricings of the Research organization?"
- "Compare the last two versions of the Clockify pricing."
- "Create a Marketing organization with three teams under Acme and add ana@example.com as admin."
- "Publish `pricing.yml` as a new version of our pricing."

For changes, Claude replies with a link. Open it, review the plan and confirm it in SPHERE. Deletions and ownership transfers also ask you to type a confirmation phrase.

## How it works

Claude Desktop talks to local extensions over stdio and cannot send a custom header to a remote MCP server, and its **Connect** button for remote servers only supports OAuth. The extension is therefore a small local bridge ([`desktop-extension/server/index.js`](desktop-extension/server/index.js), no dependencies): it forwards each message to SPHERE's stateless Streamable HTTP endpoint (`<SPHERE URL>/api/v1/orbit/mcp`) with your key in the `x-api-key` header.

1. Claude calls read tools (`list_my_organizations`, `search_pricings`, `get_pricing`...) with your key. SPHERE answers with what your account and the key's scopes allow.
2. For a change, Claude calls `propose_plan`. SPHERE validates it with the same rules as its web app and saves it as a plan in a conversation titled "Plans from assistants (MCP)", labelled with the key's name.
3. You open the link, review the plan and confirm it. SPHERE applies it with your own permissions, checked again step by step.
4. Claude can check the outcome with `get_plan` or withdraw a pending plan with `cancel_plan`.

Limits: 120 tool calls per minute per user, and the same plan size limits as SPHERE's web app.

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| The `sphere` tools do not appear | You are in the Code tab (use Chat or Cowork), the extension is disabled, or the conversation started before you enabled it. Start a new one |
| "SPHERE rejected the API key (401)" | The key is wrong, expired or revoked. Create a new one and update it in the extension settings |
| "has no access to organization ..." | The organization is not in the key's scopes. Edit the key or use another one |
| "only has VIEW scopes" | The key cannot propose changes. Use a `MANAGEMENT` or `ALL` key |
| "takes an API key with the ALL scope" | Ownership transfers, moves and organization deletions need `ALL` on that organization |
| "Could not reach SPHERE" | The URL is wrong, or a local SPHERE is not running |
| "allows 120 tool calls a minute" | Wait a minute and try again |

The extension's log is in `~/Library/Logs/Claude/mcp-server-SPHERE.log` on macOS. It never contains the key.

Check a key and a SPHERE instance from a terminal:

```bash
SPHERE_API_KEY="..." ./scripts/smoke-test.sh http://localhost:5173
```

## Using SPHERE from other agents

This repository only provides the Claude Desktop extension. Any MCP client that can send headers can use SPHERE's server directly, with the same API key:

| Setting | Value |
|---|---|
| Transport | Streamable HTTP (stateless) |
| URL | `https://sphere.score.us.es/api/v1/orbit/mcp` |
| Header | `x-api-key: <your API key>` |

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © SCORE Lab
