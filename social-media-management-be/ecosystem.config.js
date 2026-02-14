module.exports = {
  apps: [
    {
      name: 'sky-reserve-api',
      script: './dist/server.js',
      instances: 1, // We let the app handle clustering internally
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        ENABLE_CLUSTER: 'true',
      },
      env_production: {
        NODE_ENV: 'production',
        ENABLE_CLUSTER: 'true',
      },
    },
  ],
};
