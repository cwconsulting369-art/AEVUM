module.exports = {
  apps: [{
    name: 'aevum-api',
    script: 'server.js',
    cwd: '/home/carlos/services/aevum-api',
    autorestart: true,
    max_memory_restart: '200M',
    out_file: '/home/carlos/services/aevum-api/pm2.log',
    error_file: '/home/carlos/services/aevum-api/pm2.err.log',
    merge_logs: true
  }]
};
