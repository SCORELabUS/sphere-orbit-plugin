# Security

## How the API key is handled

The key is typed once in the extension's settings form in Claude Desktop, which stores it in the system's secure credential store (macOS Keychain, etc.). Claude Desktop passes it to the extension's bridge as an environment variable, and the bridge sends it to SPHERE in the `x-api-key` header, over the URL you configured.

The key is not part of the conversation: the model never receives it, and the bridge never logs it.

The code that runs on your machine is [`desktop-extension/server/index.js`](desktop-extension/server/index.js), a short dependency-free script, plus the optional `scripts/smoke-test.sh`. This repository contains no keys.

Use `https://` for any SPHERE that is not on your own machine: with `http://` the key travels unencrypted.

## What a leaked key allows

Through MCP, a key can **read** whatever its scopes reach and **propose** plans. It cannot apply them: every change waits in SPHERE until the key's owner confirms it while signed in to the web app. Deletions and ownership transfers also need a typed confirmation phrase.

Reads are the real exposure (private pricings, members, invitations), so keep keys narrow.

## Recommendations

- One key per machine, with a name that identifies it. Its name shows next to every plan it proposes.
- The narrowest scope: `VIEW` for read-only use, `MANAGEMENT` to propose changes, `ALL` only for ownership transfers, moves and organization deletions.
- Only the organizations Claude needs, and an expiry date.
- Revoke the key in SPHERE > API keys as soon as you stop using the extension, or if you pasted it anywhere by mistake.
- Data stored in SPHERE (names, descriptions, files) is written by other users. SPHERE's server tells the model to treat it as data, never as instructions, but review every plan before confirming it.

## Reporting a vulnerability

Do not open a public issue. Report it privately through [GitHub security advisories](https://github.com/SCORELabUS/sphere-orbit-plugin/security/advisories/new) for this repository.
