const express = require('express');
const connectDB = require('./mongodb/mongodb');
const counterRoutes = require('./routes/counterRoutes');
const emojiRoutes = require('./routes/emojiRoutes');
const setHeaders = require('./middlewares/setHeaders');
const path = require('path');
const rateLimiter = require('./middlewares/rateLimiter'); // 引入修改后的速率限制中间件
const redisClient = require('./redis/redisClient');
const loadEnv = require('./config/load_env');

loadEnv();

const app = express();

// 使用设置请求头的中间件
app.use(setHeaders);

// 添加调试日志
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// 使用记录访问次数的中间件
app.use('/api/counter', rateLimiter, counterRoutes);
app.use('/api/emoji', rateLimiter, emojiRoutes);

const startServer = async () => {
  try {
    // 连接 MongoDB
    await connectDB();

    // 连接 Redis
    await redisClient.connect();

    // 只有在数据库连接成功后才启动服务器
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`服务器运行在端口 ${port}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 优雅关闭服务
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信号，正在关闭服务...');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('收到 SIGINT 信号，正在关闭服务...');
  await redisClient.quit();
  process.exit(0);
});

startServer();
