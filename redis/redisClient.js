const redis = require('redis');

const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client.on('error', (err) => {
  console.error('Redis 发生错误:', err);
});

client.on('connect', () => {
  console.log('Redis 连接成功');
});

client.on('end', () => {
  console.log('Redis 连接已关闭');
});

module.exports = client;
