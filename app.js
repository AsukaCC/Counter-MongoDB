const express = require('express');
const connectDB = require('./mongodb/mongodb');
const counterRoutes = require('./routes/counterRoutes');
const emojiRoutes = require('./routes/emojiRoutes');
const setHeaders = require('./middlewares/setHeaders');
const path = require('path');
const { createRateLimiter } = require('./middlewares/rateLimiter');
const createRedisClient = require('./redis/redisClient');
const loadEnv = require('./config/load_env');
const { getThemes } = require('./utils/themeUtils');

loadEnv();

const app = express();

// 使用设置请求头的中间件
app.use(setHeaders);

// 添加调试日志
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

async function startServer() {
  try {
    // 连接 MongoDB
    await connectDB();

    // 创建并连接 Redis 客户端
    const redisClient = await createRedisClient();

    // 创建限流中间件
    const rateLimiter = createRateLimiter(redisClient);

    // 添加主题列表 API
    app.get('/api/themes', (req, res) => {
      const themes = getThemes();
      res.json({ themes });
    });

    // 使用记录访问次数的中间件
    app.use('/api/counter', rateLimiter, counterRoutes);
    app.use('/api/emoji', rateLimiter, emojiRoutes);

    // 只有在数据库连接成功后才启动服务器
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`服务器运行在端口 http://localhost:${port}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 优雅关闭服务
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信号，正在关闭服务...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('收到 SIGINT 信号，正在关闭服务...');
  process.exit(0);
});

startServer();
