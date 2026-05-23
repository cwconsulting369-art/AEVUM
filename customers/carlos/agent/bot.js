import { fileURLToPath } from 'url';
import path from 'path';

process.env.AEVUM_BOT_CONFIG_DIR = path.dirname(fileURLToPath(import.meta.url));

await import('../../shared/agent/bot.js');
