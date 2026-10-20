# Contributing

## Layout

| Path | What it is |
|---|---|
| `desktop-extension/manifest.json` | The extension: metadata, the settings form (SPHERE URL and API key) and how Claude Desktop starts the server |
| `desktop-extension/server/index.js` | Stdio-to-HTTP bridge to SPHERE's MCP endpoint. No dependencies |
| `desktop-extension/icon.png` | Extension icon |
| `plugins/sphere/.claude-plugin/plugin.json` | Claude Code plugin: metadata, `userConfig` (API key and URL) and the MCP server |
| `plugins/sphere/skills/*/SKILL.md` | Skills of the plugin |
| `.claude-plugin/marketplace.json` | Claude Code marketplace that lists the plugin |
| `scripts/build-extension.sh` | Validates the manifest and packs `dist/sphere.mcpb` (not committed) |
| `scripts/smoke-test.sh` | Checks that a key reaches a SPHERE instance |

## Local testing

1. Start SPHERE locally (in the SPHERE repository: `pnpm run dev:setup`, then `pnpm run dev`) and create an API key in its web app.
2. Check the key and the server:

   ```bash
   SPHERE_API_KEY="..." ./scripts/smoke-test.sh http://localhost:5173
   ```

3. **Extension:** build it with `./scripts/build-extension.sh`, drag `dist/sphere.mcpb` into **Settings > Extensions** and set **SPHERE URL** to `http://localhost:5173`. Use a Chat or Cowork conversation: the Code tab does not load extensions.
4. **Plugin:** load it from your checkout for one Claude Code session, then run `/plugin configure sphere@sphere-plugins` and set **SPHERE URL** to `http://localhost:5173`:

   ```bash
   claude --plugin-dir ./plugins/sphere
   ```

   To try the install flow without touching your own settings, point `CLAUDE_CONFIG_DIR` at an empty folder and run `claude plugin install sphere --marketplace . --scope project` from an empty project.

The bridge's log is `~/Library/Logs/Claude/mcp-server-SPHERE.log` on macOS.

## Releasing

1. Bump `version` in `desktop-extension/manifest.json` **and** `plugins/sphere/.claude-plugin/plugin.json` (Claude Code keeps users on the installed version until it changes) and add an entry to [CHANGELOG.md](CHANGELOG.md).
2. Push a tag named `v<version>`. The release workflow builds `sphere.mcpb` and attaches it to a GitHub release.

## Before opening a pull request

```bash
./scripts/build-extension.sh
```

```bash
claude plugin validate --strict ./plugins/sphere
```

```bash
claude plugin validate --strict .
```

When SPHERE's MCP server gains or changes tools, update [`skills/sphere/SKILL.md`](plugins/sphere/skills/sphere/SKILL.md).

Never commit keys, real or test ones.
