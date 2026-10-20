<p align="center">
  <img src="desktop-extension/icon.png" alt="SPHERE" width="96" height="96">
</p>

<h1 align="center">SPHERE for Claude</h1>

<p align="center">
  Manage your <a href="https://sphere.score.us.es">SPHERE</a> organizations, members, permissions, pricings and collections from Claude Desktop or Claude Code.
</p>

<p align="center">
  <a href="https://github.com/SCORELabUS/sphere-orbit-plugin/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/SCORELabUS/sphere-orbit-plugin"></a>
  <a href="https://github.com/SCORELabUS/sphere-orbit-plugin/actions/workflows/validate.yml"><img alt="Validate" src="https://github.com/SCORELabUS/sphere-orbit-plugin/actions/workflows/validate.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/github/license/SCORELabUS/sphere-orbit-plugin"></a>
</p>

---

[SPHERE](https://sphere.score.us.es) (SaaS Pricing Holistic Evaluation and Regulation Environment) is a platform to model, analyze and manage SaaS pricings. Teams organize their work in organizations, with members, roles, pricings and collections. **ORBIT** is SPHERE's assistant: it reads that information and proposes changes as plans.

This repository gives Claude access to ORBIT's capabilities through SPHERE's MCP server, **with your own SPHERE account and API key, on your own Claude subscription**. SPHERE runs no language model for it.

- **Read** your organizations, hierarchies, members, invitations, permissions, pricings, pricing versions and analytics, collections, notifications and profile.
- **Propose changes**: create organization trees, add or invite members, change roles and permissions, publish pricing versions from YAML, change visibility, fork pricings, manage collections, and more.
- **Stay in control**: every change is a plan that waits in SPHERE until you review and confirm it there. Claude cannot confirm plans.

<!-- TODO: add two screenshots here: the extension's settings form, and a plan waiting for confirmation in SPHERE. -->

## Contents

- [Install](#install)
- [Try it](#try-it)
- [How it works](#how-it-works)
- [Troubleshooting](#troubleshooting)
- [Other MCP clients](#other-mcp-clients)
- [Contributing and security](#contributing-and-security)

## Install

**Requirements:** a SPHERE account, and either Claude Desktop (extension) or Claude Code 2.1.275 or later (plugin).

Pick the distribution for where you use Claude:

| You use Claude in | Install | Section |
|---|---|---|
| **Claude Desktop**: Chat and Cowork | The `sphere.mcpb` extension | [Option A](#option-a-claude-desktop-extension) |
| **Claude Code**: terminal, IDE, or the Code tab of Claude Desktop | The `sphere` plugin | [Option B](#option-b-claude-code-plugin) |

### Create an API key

Both options need one.

1. Sign in to SPHERE and open **API keys**.
2. Create a key **only for this use**, with:
   - the **narrowest scope** that works: `VIEW` to read, `MANAGEMENT` to propose changes, `ALL` only to transfer ownership, move or delete organizations;
   - access **only to the organizations** it needs;
   - an **expiry date**.
3. Copy it. It is shown only once.

Never paste the key into a conversation with Claude. See [SECURITY.md](SECURITY.md).

### Option A: Claude Desktop extension

1. Download `sphere.mcpb` from the [latest release](https://github.com/SCORELabUS/sphere-orbit-plugin/releases/latest).
2. Open Claude Desktop and go to **Settings > Extensions**.
3. Drag the downloaded `sphere.mcpb` into the window and confirm the installation.
4. Fill in the form:
   - **SPHERE URL**: `https://sphere.score.us.es` by default. For a local SPHERE started with `pnpm run dev`, use `http://localhost:5173`.
   - **SPHERE API key**: the key you created. It is stored in your system's secure credential store.
5. Enable the extension and start a **new conversation**.

To change the URL or the key later, open the extension's settings in **Settings > Extensions**.

> The extension works in **Chat** and **Cowork**. The **Code** tab of Claude Desktop does not load extensions: use Option B there.

### Option B: Claude Code plugin

Run the commands in **a terminal**, not inside a Claude conversation. The Code tab of Claude Desktop uses the plugin too.

#### For one project (recommended)

Go to the project's root folder and install the plugin there:

```bash
cd /path/to/your/project
```

```bash
claude plugin install sphere --marketplace SCORELabUS/sphere-orbit-plugin --scope project
```

This enables the plugin only in that project: it writes `enabledPlugins` to the project's `.claude/settings.json`, which holds no secrets and can be committed. Then set the key and the URL, once:

1. Start Claude Code in the project: `claude`.
2. Run `/plugin configure sphere@sphere-plugins` and fill in **SPHERE API key** and **SPHERE URL** (`https://sphere.score.us.es` by default, or for example `http://localhost:5173` for a local SPHERE).
3. Run `/reload-plugins`.

The key is stored in your system's secure credential store, per user, never in the project. Each person who uses the project configures their own key.

<details>
<summary>Make it available to the rest of the team</summary>

Declare the marketplace in the project, from its root folder, before the install command above. People who open the project can then install the plugin with the same command:

```bash
claude plugin marketplace add SCORELabUS/sphere-orbit-plugin --scope project
```

</details>

#### For all your projects

Run the same command with the `user` scope, from any folder:

```bash
claude plugin install sphere --marketplace SCORELabUS/sphere-orbit-plugin --scope user
```

Then run `claude`, `/plugin configure sphere@sphere-plugins` and `/reload-plugins`, as above.

<details>
<summary>Only for you, in one project</summary>

Use `--scope local` from the project's root folder. It enables the plugin in that project without committing anything (the setting goes to `.claude/settings.local.json`).

</details>

<details>
<summary>Update, change the key or remove it</summary>

| To... | Run |
|---|---|
| Change the key or the URL | `/plugin configure sphere@sphere-plugins` inside Claude Code |
| Update the plugin | `claude plugin update sphere@sphere-plugins` |
| Remove it | `claude plugin uninstall sphere@sphere-plugins` (add `--scope project` or `--scope local` to match how you installed it) |

</details>

## Try it

- "Show my SPHERE organizations and my role in each."
- "Who can edit the pricings of the Research organization?"
- "Compare the last two versions of the Clockify pricing."
- "Create a Marketing organization with three teams under Acme and add ana@example.com as admin."
- "Publish `pricing.yml` as a new version of our pricing."

For changes, Claude replies with a link. Open it, review the plan and confirm it in SPHERE. Deletions and ownership transfers also ask you to type a confirmation phrase.

In Claude Code, `/sphere:setup` guides you through the connection.

## How it works

Both distributions use SPHERE's MCP server at `<SPHERE URL>/api/v1/orbit/mcp`, authenticated with your key in the `x-api-key` header.

- **The plugin** declares that server directly. Claude Code asks for the key and the URL, keeps the key in the credential store and sends it in the header.
- **The extension** exists because Claude Desktop talks to local extensions over stdio, cannot send a custom header to a remote MCP server, and its **Connect** button for remote servers only supports OAuth. It is a small local bridge ([`desktop-extension/server/index.js`](desktop-extension/server/index.js), no dependencies) that forwards each message to SPHERE's stateless Streamable HTTP endpoint with your key in the header.

Then, in both cases:

1. Claude calls read tools (`list_my_organizations`, `search_pricings`, `get_pricing`...) with your key. SPHERE answers with what your account and the key's scopes allow.
2. For a change, Claude calls `propose_plan`. SPHERE validates it with the same rules as its web app and saves it as a plan in a conversation titled "Plans from assistants (MCP)", labelled with the key's name.
3. You open the link, review the plan and confirm it. SPHERE applies it with your own permissions, checked again step by step.
4. Claude can check the outcome with `get_plan` or withdraw a pending plan with `cancel_plan`.

Limits: 120 tool calls per minute per user, and the same plan size limits as SPHERE's web app.

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| The `sphere` tools do not appear (extension) | You are in the Code tab (use Option B there), the extension is disabled, or the conversation started before you enabled it. Start a new one |
| The `sphere` tools do not appear (plugin) | The key is not set yet, or the plugin was not reloaded. Run `/plugin configure sphere@sphere-plugins` and `/reload-plugins` |
| Claude Desktop shows "not connected to sphere" and a **Connect** button | That screen is for OAuth connectors and cannot take an API key. Use the extension (Option A) or configure the plugin from a terminal (Option B) |
| "SPHERE rejected the API key (401)" | The key is wrong, expired or revoked. Create a new one and update it |
| "has no access to organization ..." | The organization is not in the key's scopes. Edit the key or use another one |
| "only has VIEW scopes" | The key cannot propose changes. Use a `MANAGEMENT` or `ALL` key |
| "takes an API key with the ALL scope" | Ownership transfers, moves and organization deletions need `ALL` on that organization |
| "Could not reach SPHERE" | The URL is wrong, or a local SPHERE is not running |
| "allows 120 tool calls a minute" | Wait a minute and try again |

The extension's log is in `~/Library/Logs/Claude/mcp-server-SPHERE.log` on macOS. It never contains the key.

To check a key and a SPHERE instance from a terminal:

```bash
SPHERE_API_KEY="..." ./scripts/smoke-test.sh http://localhost:5173
```

## Other MCP clients

This repository only provides Claude distributions. Any other MCP client that can send headers can use SPHERE's server directly, with the same API key:

| Setting | Value |
|---|---|
| Transport | Streamable HTTP (stateless) |
| URL | `https://sphere.score.us.es/api/v1/orbit/mcp` |
| Header | `x-api-key: <your API key>` |

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) to build and test locally, and [SECURITY.md](SECURITY.md) for how the key is handled and how to report a vulnerability. Changes are listed in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE) © SCORE Lab
