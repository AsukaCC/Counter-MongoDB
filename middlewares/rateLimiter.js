const fs = require('fs');
const path = require('path');
const redisClient = require('../redis/redisClient');

class RedisStore {
  constructor(client) {
    this.client = client;
  }

  async ipIncr(ip, duration) {
    const redisKey = `rate_limit:${ip}`;
    const count = await this.client.INCR(redisKey);
    if (count === 1) {
      await this.client.EXPIRE(redisKey, duration);
    }
    return count;
  }

  async originIncr(origin, duration) {
    const redisKey = `rate_limit:${origin}`;
    const count = await this.client.INCR(redisKey);
    if (count === 1) {
      await this.client.EXPIRE(redisKey, duration);
    }
    return count;
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

const logRequest = (ip, origin) => {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
  const logMessage = `${timestamp} - ${origin} - ${ip}\n`;
  const logDirectory = path.join(__dirname, '..', 'log');
  const logFilePath = path.join(logDirectory, 'access.log');

  // 检查并创建log文件夹
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
  }

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file', err);
    }
  });
};

const createRateLimiter = (redisClient) => {
  const store = new RedisStore(redisClient);
  const rateLimit = parseInt(process.env.RATE_LIMIT) || 60;
  const duration = parseInt(process.env.LIMIT_DURATION) || 60;

  return async (req, res, next) => {
    try {
      console.log('====================');
      const ip = req.ip;
      const origin = req.get('origin') || 'unknown';
      console.log(`Request received from IP: ${ip}, Origin: ${origin}`);
      console.log('====================');

      const [ipCount, originCount] = await Promise.all([
        store.ipIncr(ip, duration),
        store.originIncr(origin, duration),
      ]);

      if (ipCount > rateLimit || originCount > rateLimit) {
        return res.status(429).json({
          error: '请求过于频繁，请稍后再试',
          ipCount,
          originCount,
          rateLimit,
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(error);
    }
  };
};

module.exports = { createRateLimiter };
