# Contributing

## Layout

| Path | What it is |
|---|---|
| `desktop-extension/manifest.json` | The extension: metadata, the settings form (SPHERE URL and API key) and how Claude Desktop starts the server |
| `desktop-extension/server/index.js` | Stdio-to-HTTP bridge to SPHERE's MCP endpoint. No dependencies |
| `desktop-extension/icon.png` | Extension icon |
| `scripts/build-extension.sh` | Validates the manifest and packs `dist/sphere.mcpb` (not committed) |
| `scripts/smoke-test.sh` | Checks that a key reaches a SPHERE instance |

## Local testing

1. Start SPHERE locally (in the SPHERE repository: `pnpm run dev:setup`, then `pnpm run dev`) and create an API key in its web app.
2. Check the key and the server:

   ```bash
   SPHERE_API_KEY="..." ./scripts/smoke-test.sh http://localhost:5173
   ```

3. Build and install the extension (see the README), setting **SPHERE URL** to `http://localhost:5173`. Use a Chat or Cowork conversation: the Code tab does not load extensions.

The bridge's log is `~/Library/Logs/Claude/mcp-server-SPHERE.log` on macOS.

## Releasing

1. Bump `version` in `desktop-extension/manifest.json` and add an entry to [CHANGELOG.md](CHANGELOG.md).
2. Push a tag named `v<version>`. The release workflow builds `sphere.mcpb` and attaches it to a GitHub release.

## Before opening a pull request

```bash
./scripts/build-extension.sh
```

Never commit keys, real or test ones.
