// pm2-Config für aevum-api — SINGLE SOURCE: läuft aus dem Repo (Konsolidierung 2026-05-31).
// Frühere Standalone-Kopie /home/carlos/services/aevum-api wurde archiviert.
// Env wird in server.js absolut geladen (~/.envs/_shared.env + aevum.env) — cwd-unabhängig.
module.exports = {
  apps: [{
    name: 'aevum-api',
    script: 'server.js',
    cwd: '/home/carlos/projects/aevum-website/services/aevum-api',
    autorestart: true,
    max_memory_restart: '200M',
    out_file: '/home/carlos/logs/aevum-api.log',
    error_file: '/home/carlos/logs/aevum-api.err.log',
    merge_logs: true
  }]
};
