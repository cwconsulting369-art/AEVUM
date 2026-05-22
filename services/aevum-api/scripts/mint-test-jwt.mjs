#!/usr/bin/env node
// Mint a test customer JWT — DEV ONLY.
// Usage:
//   node scripts/mint-test-jwt.mjs <account_id> [account_slug] [ttl_seconds]
// Defaults to Carlos/AEVUM if no args given.

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: '/home/carlos/.envs/_shared.env', override: true });
dotenv.config({ path: '/home/carlos/.envs/aevum.env', override: true });

const { issueJwt } = await import(path.join(__dirname, '..', 'lib', 'crypto.js'));

const accountId = process.argv[2] || '5c527a37-6bf6-44d2-b9ec-dc1cd2fc1b25';
const accountSlug = process.argv[3] || 'carlos';
const ttl = parseInt(process.argv[4] || '600', 10);

const tok = issueJwt({
  sub: accountId,
  account_id: accountId,
  account_slug: accountSlug,
  scope: 'customer'
}, ttl);

process.stdout.write(tok);
