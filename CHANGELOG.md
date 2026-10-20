# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-10-20

### Added

- `sphere` plugin for Claude Code (`plugins/sphere/`) with its marketplace (`.claude-plugin/marketplace.json`): it asks for the SPHERE API key and URL through `/plugin configure`, keeps the key in the system's credential store and sends it in `x-api-key`. Installable per project, per user or locally.
- `sphere` and `setup` skills: how to work with SPHERE's tools and plans, and how to connect without the key going through the conversation.
- README instructions for both distributions, with the exact commands and where to run them.

## [0.1.0] - 2026-10-19

### Added

- Claude Desktop extension (`desktop-extension/`, built into `sphere.mcpb`) for Claude chat and Cowork: a settings form for the SPHERE URL and API key, and a dependency-free stdio-to-HTTP bridge that sends the key in `x-api-key` to SPHERE's MCP server.
- `scripts/build-extension.sh` and `scripts/smoke-test.sh`.

