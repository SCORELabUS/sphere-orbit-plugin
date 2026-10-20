# Security

## How the API key is handled

| Distribution | Where the key lives | Who sends it |
|---|---|---|
| Claude Desktop extension | The system's secure credential store (macOS Keychain, etc.), entered in the extension's settings form | The extension's bridge, in the `x-api-key` header |
| Claude Code plugin | The system's secure credential store, entered with `/plugin configure`; per user, never in the project's files | Claude Code, in the `x-api-key` header |

In both cases the key goes to SPHERE over the URL you configured. It is not part of the conversation: the model never receives it, the bridge never logs it, and the skills tell Claude never to ask for it, print it or read it.

The code that runs on your machine is [`desktop-extension/server/index.js`](desktop-extension/server/index.js), a short dependency-free script used by the extension, plus the optional `scripts/smoke-test.sh`. The plugin runs no code of its own. This repository contains no keys.

Use `https://` for any SPHERE that is not on your own machine: with `http://` the key travels unencrypted.

## What a leaked key allows

Through MCP, a key can **read** whatever its scopes reach and **propose** plans. It cannot apply them: every change waits in SPHERE until the key's owner confirms it while signed in to the web app. Deletions and ownership transfers also need a typed confirmation phrase.

Reads are the real exposure (private pricings, members, invitations), so keep keys narrow.

## Recommendations

- Do not use `claude plugin install --config api_key=...`: it would leave the key in your shell history. Use `/plugin configure`.
- One key per machine, with a name that identifies it. Its name shows next to every plan it proposes.
- The narrowest scope: `VIEW` for read-only use, `MANAGEMENT` to propose changes, `ALL` only for ownership transfers, moves and organization deletions.
- Only the organizations Claude needs, and an expiry date.
- Agents with shell access could read the environment. In Claude Code, keep command approvals on, or prefer a `VIEW` key.
- Revoke the key in SPHERE > API keys as soon as you stop using the extension or plugin, or if you pasted it anywhere by mistake.
- Data stored in SPHERE (names, descriptions, files) is written by other users. SPHERE's server tells the model to treat it as data, never as instructions, but review every plan before confirming it.

## Reporting a vulnerability

Do not open a public issue. Report it privately through [GitHub security advisories](https://github.com/SCORELabUS/sphere-orbit-plugin/security/advisories/new) for this repository.
