// Unit tests for lib/anthropic-helper.js
// Uses global fetch mock — no real Anthropic calls.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callAnthropic } from '../lib/anthropic-helper.js';

describe('callAnthropic', () => {
  const origFetch = global.fetch;
  const origKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  afterEach(() => {
    global.fetch = origFetch;
    process.env.ANTHROPIC_API_KEY = origKey;
  });

  it('throws when no API key is set', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    await expect(
      callAnthropic({ messages: [{ role: 'user', content: 'hi' }] })
    ).rejects.toThrow(/anthropic_key_missing/);
  });

  it('sends cache_control when cacheSystem=true', async () => {
    let capturedBody = null;
    global.fetch = vi.fn(async (_url, init) => {
      capturedBody = JSON.parse(init.body);
      return {
        ok: true,
        json: async () => ({
          content: [{ text: 'hello' }],
          usage: { input_tokens: 10, output_tokens: 5, cache_creation_input_tokens: 100, cache_read_input_tokens: 0 }
        })
      };
    });
    const r = await callAnthropic({
      messages: [{ role: 'user', content: 'hi' }],
      system: 'long system prompt',
      cacheSystem: true
    });
    expect(capturedBody.system).toBeInstanceOf(Array);
    expect(capturedBody.system[0].cache_control).toEqual({ type: 'ephemeral' });
    expect(r.usage.cache_creation_input_tokens).toBe(100);
  });

  it('sends plain string system when cacheSystem=false', async () => {
    let capturedBody = null;
    global.fetch = vi.fn(async (_url, init) => {
      capturedBody = JSON.parse(init.body);
      return {
        ok: true,
        json: async () => ({ content: [{ text: 'ok' }], usage: { input_tokens: 1, output_tokens: 1 } })
      };
    });
    await callAnthropic({
      messages: [{ role: 'user', content: 'hi' }],
      system: 'short sys',
      cacheSystem: false
    });
    expect(typeof capturedBody.system).toBe('string');
  });

  it('captures usage tokens including cache fields', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        content: [{ text: 'reply' }],
        usage: { input_tokens: 50, output_tokens: 20, cache_creation_input_tokens: 200, cache_read_input_tokens: 1000 }
      })
    }));
    const r = await callAnthropic({ messages: [{ role: 'user', content: 'hi' }] });
    expect(r.usage.input_tokens).toBe(50);
    expect(r.usage.output_tokens).toBe(20);
    expect(r.usage.cache_creation_input_tokens).toBe(200);
    expect(r.usage.cache_read_input_tokens).toBe(1000);
  });

  it('throws on non-2xx response with status code', async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 429,
      json: async () => ({ error: { type: 'rate_limit_error' } })
    }));
    await expect(
      callAnthropic({ messages: [{ role: 'user', content: 'hi' }] })
    ).rejects.toThrow(/anthropic_error_429/);
  });
});
