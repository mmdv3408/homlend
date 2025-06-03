module.exports = {
  apps: [{
    name: 'homeland',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      HOST: '0.0.0.0'
    }
  }]
};
