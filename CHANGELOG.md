# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-10-19

### Added

- Claude Desktop extension (`desktop-extension/`, built into `sphere.mcpb`) for Claude chat and Cowork: a settings form for the SPHERE URL and API key, and a dependency-free stdio-to-HTTP bridge that sends the key in `x-api-key` to SPHERE's MCP server.
- `scripts/build-extension.sh` and `scripts/smoke-test.sh`.

### Removed

- The Claude Code and Codex plugins, their skills and marketplaces: this repository now only provides the Claude Desktop extension.
