const redisClient = require('../redis/redisClient');
require('dotenv').config();

class RedisStore {
  constructor(options) {
    this.client = options.client;
    this.prefix = options.prefix || '_rate-limit';
    this.expiry = options.expiry || 60; // 默认 60 秒
  }

  async ipIncr(key) {
    const redisKey = `${key}${this.prefix}`;
    const count = await this.client.incr(redisKey);
    if (count === 1) {
      await this.client.expire(redisKey, this.expiry); // 设置过期时间
    }
    return count;
  }

  async ipGetTTL(key) {
    const redisKey = `${key}${this.prefix}`;
    const ttl = await this.client.ttl(redisKey);
    return ttl;
  }
}

const formatTime = (seconds) => {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.ceil((seconds % 3600) / 60);
    return `${hours} hour(s) ${minutes} minute(s)`;
  } else if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minute(s) ${remainingSeconds} second(s)`;
  } else {
    return `${seconds} second(s)`;
  }
};

const formatTimeChinese = (seconds) => {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.ceil((seconds % 3600) / 60);
    return `${hours} 小时 ${minutes} 分钟`;
  } else if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} 分钟 ${remainingSeconds} 秒`;
  } else {
    return `${seconds} 秒`;
  }
};

// 自定义中间件记录访问次数
const rateLimiter = async (req, res, next) => {
  // 从环境变量中获取限制时间，并转换为秒
  const limitDuration = parseInt(process.env.LIMIT_DURATION, 10);
  const limitDurationInSeconds = isNaN(limitDuration)
    ? 120 * 60
    : limitDuration * 60; // 默认 120 分钟

  const store = new RedisStore({
    client: redisClient,
    prefix: 'ipLimit',
    expiry: limitDurationInSeconds,
  });

  const key = req.ip;
  const requestDomain = req.hostname;

  // 打印请求的 IP 地址和域名
  console.log(`Request received from IP: ${key}, Domain: ${requestDomain}`);

  // 从环境变量中获取限制次数
  const rateLimit = parseInt(process.env.RATE_LIMIT, 10) || 10;

  // 从环境变量中获取IP白名单并解析为数组
  const ipWhitelist = process.env.WHITELIST
    ? process.env.WHITELIST.split(',')
    : [];

  // 检查IP是否在白名单中
  if (ipWhitelist.includes(key)) {
    return next(); // 如果在IP白名单中，跳过限制检查
  }

  const count = await store.ipIncr(key);

  // 检查访问次数
  if (count > rateLimit) {
    const ttl = await store.ipGetTTL(key);
    const timeRemaining = formatTime(ttl);
    const timeRemainingChinese = formatTimeChinese(ttl);
    return res
      .status(429)
      .send(
        `Too many requests - try again in ${timeRemaining}\n请求过多 - 请在 ${timeRemainingChinese} 后重试`
      );
  }

  next();
};

module.exports = rateLimiter;
