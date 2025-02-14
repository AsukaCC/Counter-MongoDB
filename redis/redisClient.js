const redis = require('redis');

const createRedisClient = async () => {
  const client = redis.createClient({
    password: process.env.REDIS_PASSWORD,
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

  // 连接 Redis
  await client.connect();

  // 确保程序退出时关闭连接
  process.on('SIGINT', async () => {
    await client.quit();
    process.exit();
  });

  return client;
};

module.exports = createRedisClient;
