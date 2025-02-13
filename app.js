const express = require('express');
const connectDB = require('./db/mongodb');
const counterRoutes = require('./routes/counterRoutes');
const emojiRoutes = require('./routes/emojiRoutes');
const setHeaders = require('./middlewares/setHeaders');
const path = require('path');
const rateLimiter = require('./middlewares/rateLimiter'); // 引入修改后的速率限制中间件

const app = express();
const port = process.env.PORT || 3000;

// 连接到数据库
connectDB();

app.use(express.json());

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
