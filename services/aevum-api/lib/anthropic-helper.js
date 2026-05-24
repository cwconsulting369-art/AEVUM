// AEVUM Anthropic Helper
// Created: 2026-05-24 (Agent C1)
//
// Thin wrapper around Anthropic Messages API for non-streaming calls.
// Mirrors pattern from lib/auto-plan.js (which uses direct fetch).
// Returns { text, usage: { input_tokens, output_tokens } }.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-4-5';
const DEFAULT_MAX_TOKENS = 1500;

export async function callAnthropic({
  messages,
  system = null,
  model = DEFAULT_MODEL,
  maxTokens = DEFAULT_MAX_TOKENS
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error('anthropic_key_missing');
    err.code = 'NO_API_KEY';
    throw err;
  }

  const body = {
    model,
    max_tokens: maxTokens,
    messages
  };
  if (system) body.system = system;

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`anthropic_error_${res.status}`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  const text = (data.content?.[0]?.text || '').trim();
  return {
    text,
    usage: {
      input_tokens: data.usage?.input_tokens || 0,
      output_tokens: data.usage?.output_tokens || 0
    }
  };
}
