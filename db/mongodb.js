const mongoose = require('mongoose');
const loadEnv = require('../config/load_env');
loadEnv();

const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/<your-dataBaseName>';
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1); // 退出进程
  }
};

module.exports = connectDB;
