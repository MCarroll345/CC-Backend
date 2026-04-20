module.exports = {
  apps: [
    {
      name: 'cc-backend',
      script: 'src/server.js',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
