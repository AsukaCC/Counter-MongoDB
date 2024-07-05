const express = require('express');
const connectDB = require('./db/mongodb');
const counterRoutes = require('./routes/counterRoutes');
const emojiRoutes = require('./routes/emojiRoutes');
const setHeaders = require('./middlewares/setHeaders');
const path = require('path');
const { renderHome } = require('./utils/homeUtils');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const rateLimiter = require('./middlewares/rateLimiter'); // 引入修改后的速率限制中间件

const app = express();
const port = process.env.PORT || 3000;

// 连接到数据库
connectDB();

app.use(express.json());

// 使用设置请求头的中间件
app.use(setHeaders);

// 使用swagger-ui-express
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 添加调试日志
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// 使用记录访问次数的中间件
app.use('/api/counter', rateLimiter, counterRoutes);
app.use('/api/emoji', rateLimiter, emojiRoutes);

// 使用路由模块
app.use('/api/counter', counterRoutes);
app.use('/api/emoji', emojiRoutes);

// 在根路径加载index.html并渲染文件夹名列表
app.get('/', renderHome);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
