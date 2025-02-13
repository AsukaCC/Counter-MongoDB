module.exports = {
  apps: [
    {
      name: 'counter-api',
      script: 'app.js',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        // Redis 配置
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        REDIS_PASSWORD: '',
        // MongoDB 配置
        MONGODB_HOST: 'localhost',
        MONGODB_PORT: 27017,
        MONGODB_USERNAME: 'root',
        MONGODB_PASSWORD: 'root123123',
        MONGODB_DATABASE: 'counter',
        // 其他配置
        COUNTER_LENGTH: 7,
        PORT: 8081,
        RATE_LIMIT: 40,
        LIMIT_DURATION: 1,
      },
      pre_start: 'docker-compose up -d',
      post_stop: 'docker-compose down',
    },
  ],
};
