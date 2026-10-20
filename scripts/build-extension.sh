#!/usr/bin/env bash
# Builds the Claude Desktop extension: dist/sphere.mcpb.
# Usage: scripts/build-extension.sh
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mcpb="@anthropic-ai/mcpb@2.1.2"

cd "$root/desktop-extension"
npx -y "$mcpb" validate manifest.json

mkdir -p "$root/dist"
npx -y "$mcpb" pack . "$root/dist/sphere.mcpb"
echo "Built $root/dist/sphere.mcpb"
