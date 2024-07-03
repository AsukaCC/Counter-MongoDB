const express = require('express');
const connectDB = require('./db/mongodb');
const counterRoutes = require('./routes/counterRoutes');
const emojiRoutes = require('./routes/emojiRoutes');
const setHeaders = require('./middlewares/setHeaders');
const path = require('path');
const fs = require('fs');
const { getDirectories } = require('./utils/themesTypeUtils');
const { renderHome } = require('./utils/homeUtils');

const app = express();
const port = process.env.PORT || 3000;

// 连接到数据库
connectDB();

app.use(express.json());

// 使用设置请求头的中间件
app.use(setHeaders);

// 使用swagger-ui-express
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 使用路由模块
app.use('/api/counter', counterRoutes);
app.use('/api/emoji', emojiRoutes);

// 在根路径加载index.html并渲染文件夹名列表
app.get('/', renderHome);

// app.get('/', async (req, res) => {
//   try {
//     const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
//     res.send(html);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
