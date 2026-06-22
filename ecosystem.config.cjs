module.exports = {
  apps: [
    {
      name: 'culture-os',
      script: 'dist/server.cjs',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        APP_URL: 'https://culture-os.shuntian.uk'
      }
    }
  ]
};
