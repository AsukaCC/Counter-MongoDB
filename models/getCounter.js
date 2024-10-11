const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  count: { type: Number, default: 1 }, // 使用默认的Number类型
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
