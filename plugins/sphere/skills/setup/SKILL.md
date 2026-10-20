---
name: setup
description: Use when the user wants to connect Claude Code to SPHERE, set up or change their SPHERE API key or URL, or when the sphere MCP tools are missing or fail with an authentication error (401, missing key, no access). Guides them through creating a key and configuring it without the key ever going through the conversation.
---

# Connecting to SPHERE

The plugin talks to SPHERE's MCP server, authenticated with one of the user's SPHERE API keys sent in the `x-api-key` header. Claude Code stores the key in the system's secure credential store.

## Rules for the API key

- **Never ask the user to paste the key into the conversation**, and never run a command that contains it. Everything in the conversation goes through the model and stays in the history. The user enters the key themselves, in the places described below.
- Never print, read or echo the key. Do not suggest `claude plugin install --config api_key=...`, which would leave the key in the shell history.
- If the user pastes a key into the conversation anyway, tell them to revoke it in SPHERE > API keys and create a new one.

## 1. Create the key

Tell the user to open SPHERE (by default <https://sphere.score.us.es>), go to **API keys** and create a key:

- A dedicated key for this use, with a name that identifies it (the name shows next to every plan Claude proposes).
- The narrowest scopes that work: `VIEW` to read only, `MANAGEMENT` to propose changes, `ALL` only to transfer ownership, move or delete organizations.
- Only on the organizations it needs, with an expiry date.

The key is shown once; they should copy it then.

## 2. Configure it

Installing the plugin from a shell does not ask for the key, so the user sets **SPHERE API key** and **SPHERE URL** themselves, once, and again whenever a value must change. They can do it inside Claude Code with `/plugin configure sphere@sphere-plugins`, or `/plugin`, the **Installed** tab, **sphere**, **Configure options**. From a terminal, `claude plugin configure sphere@sphere-plugins` shows which options are still unset.

Afterwards they run `/reload-plugins` (or restart Claude Code). The key is stored per user in the credential store, so one configuration serves every project where the plugin is enabled.

`SPHERE URL` defaults to `https://sphere.score.us.es`. For a local SPHERE they set it to its address, for example `http://localhost:5173`.

The Code tab of Claude Desktop has no screen for plugin options: the user configures it from a terminal with `claude` and `/plugin configure`, and it works in the Code tab afterwards. The Chat and Cowork tabs of Claude Desktop use the `sphere.mcpb` extension instead, not this plugin.

## 3. Check the connection

Call `list_my_organizations`. If it answers, the connection works: show the user their organizations in a short list.

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| The `sphere` tools do not appear | The key is missing or the plugin is disabled. Configure the key and run `/reload-plugins` or restart Claude Code |
| `401` / "takes one of your API keys" | The key is wrong, expired or revoked. Create a new one |
| "has no access to organization ..." | The organization is not in the key's scopes. Add it to the key or use another key |
| "only has VIEW scopes" | The key cannot propose changes. Use a `MANAGEMENT` or `ALL` key |
| "takes an API key with the ALL scope" | Ownership transfers, moves and organization deletions need `ALL` on that organization |
| Connection refused or timeout on a local SPHERE | SPHERE is not running, or `SPHERE URL` points to the wrong port |
| "allows 120 tool calls a minute" | Wait a minute and try again |
