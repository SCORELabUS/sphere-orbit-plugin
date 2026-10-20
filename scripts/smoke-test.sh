#!/usr/bin/env bash
# Checks that a SPHERE instance answers MCP requests with the key in SPHERE_API_KEY.
# Usage: SPHERE_API_KEY=... scripts/smoke-test.sh [SPHERE URL]
set -euo pipefail

base_url="${1:-https://sphere.score.us.es}"
endpoint="${base_url%/}/api/v1/orbit/mcp"

if [ -z "${SPHERE_API_KEY:-}" ]; then
  echo "SPHERE_API_KEY is not set. Export it first; this script never prints it." >&2
  exit 1
fi

echo "Endpoint: $endpoint"

# The key goes through a header file on stdin, so it never shows in the process list.
response="$(
  printf 'x-api-key: %s\n' "$SPHERE_API_KEY" | curl --silent --show-error --fail-with-body \
    --header @- \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json, text/event-stream' \
    --data '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
    "$endpoint"
)" || {
  echo "Request failed:" >&2
  echo "$response" >&2
  exit 1
}

tools="$(printf '%s' "$response" | grep -o '"name":"[a-z_]*"' | cut -d'"' -f4 || true)"
if [ -z "$tools" ]; then
  echo "Unexpected answer:" >&2
  echo "$response" >&2
  exit 1
fi

echo "Connected. $(printf '%s\n' "$tools" | wc -l | tr -d ' ') tools available:"
printf '  - %s\n' $tools
