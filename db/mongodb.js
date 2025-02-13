const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB 连接字符串未设置');
    }

    if (
      !mongoURI.startsWith('mongodb://') &&
      !mongoURI.startsWith('mongodb+srv://')
    ) {
      throw new Error(
        'MongoDB 连接字符串格式错误，必须以 mongodb:// 或 mongodb+srv:// 开头'
      );
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error.message);
    throw error; // 向上抛出错误，让 app.js 捕获处理
  }
};

module.exports = connectDB;
