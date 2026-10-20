#!/usr/bin/env node
// Stdio-to-HTTP bridge for SPHERE's MCP server.
// Claude Desktop talks to local extensions over stdio and cannot send a custom header to a remote MCP
// server, so this process forwards every JSON-RPC message to SPHERE's stateless Streamable HTTP
// endpoint with the user's API key in `x-api-key`. It has no dependencies.
// Configuration comes from the environment (filled by the extension's settings form):
//   SPHERE_URL      address of the SPHERE instance
//   SPHERE_API_KEY  the user's API key (never logged)
'use strict';

const readline = require('node:readline');

const REQUEST_TIMEOUT_MS = 120_000;

const baseUrl = (process.env.SPHERE_URL || 'https://sphere.score.us.es').trim().replace(/\/+$/, '');
const apiKey = (process.env.SPHERE_API_KEY || '').trim();
const endpoint = `${baseUrl}/api/v1/orbit/mcp`;

function fail(message) {
  process.stderr.write(`[sphere] ${message}\n`);
  process.exit(1);
}

if (!/^https?:\/\//.test(baseUrl)) {
  fail('SPHERE URL must start with http:// or https://');
}
if (!apiKey) {
  fail('SPHERE API key is missing. Open the extension settings and enter one.');
}

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function replyError(id, message) {
  if (id === undefined || id === null) {
    process.stderr.write(`[sphere] ${message}\n`);
    return;
  }
  send({ jsonrpc: '2.0', id, error: { code: -32000, message } });
}

function describeHttpError(status, body) {
  if (status === 401) {
    return 'SPHERE rejected the API key (401). It may be wrong, expired or revoked: create a new one in SPHERE > API keys and update it in the extension settings.';
  }
  if (status === 429) {
    return 'SPHERE allows 120 tool calls a minute. Wait a minute and try again.';
  }
  const detail = body.trim().slice(0, 300);
  return `SPHERE answered HTTP ${status}${detail ? `: ${detail}` : ''}`;
}

function forward(payload) {
  const items = Array.isArray(payload) ? payload : [payload];
  for (const item of items) {
    if (item !== null && typeof item === 'object') send(item);
  }
}

// Reads a text/event-stream body and forwards each `data:` event as a JSON-RPC message.
async function forwardEventStream(body) {
  const decoder = new TextDecoder();
  let buffer = '';
  const flush = (block) => {
    const data = block
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).replace(/^ /, ''))
      .join('\n');
    if (data) forward(JSON.parse(data));
  };
  for await (const chunk of body) {
    buffer += decoder.decode(chunk, { stream: true }).replace(/\r\n/g, '\n');
    let end;
    while ((end = buffer.indexOf('\n\n')) !== -1) {
      flush(buffer.slice(0, end));
      buffer = buffer.slice(end + 2);
    }
  }
  if (buffer.trim()) flush(buffer);
}

async function handle(line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    process.stderr.write('[sphere] Ignored a line that is not valid JSON\n');
    return;
  }
  const id = Array.isArray(message) ? undefined : message.id;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'x-api-key': apiKey,
      },
      body: line,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      replyError(id, describeHttpError(response.status, await response.text()));
      return;
    }
    if (response.status === 202 || response.status === 204 || !response.body) return;

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream')) {
      await forwardEventStream(response.body);
    } else {
      const text = await response.text();
      if (text.trim()) forward(JSON.parse(text));
    }
  } catch (error) {
    const reason = error && error.name === 'TimeoutError' ? 'timed out' : String(error && error.message);
    replyError(id, `Could not reach SPHERE at ${baseUrl}: ${reason}`);
  }
}

const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
const pending = new Set();
lines.on('line', (line) => {
  if (!line.trim()) return;
  const task = handle(line).finally(() => pending.delete(task));
  pending.add(task);
});
// Let in-flight requests finish before exiting when the client closes stdin.
lines.on('close', () => Promise.allSettled([...pending]).then(() => process.exit(0)));
