const fs = require('fs');
const path = require('path');
const redisClient = require('../redis/redisClient');
const loadEnv = require('../config/load_env');
loadEnv();

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

// 自定义中间件记录访问次数
const rateLimiter = async (req, res, next) => {
  const separator = '====================';

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

  // 获取原始客户端 IP 地址
  const forwardedFor = req.headers['x-forwarded-for'];
  const ipAddress = forwardedFor
    ? forwardedFor.split(',').shift()
    : req.connection.remoteAddress;

  // 获取请求来源
  const originHost = req.headers.host || '无法解析来源域名';
  const origin = req.headers.origin || req.headers.referer || '';

  // 解析来源域名
  const parsedOrigin = origin ? new URL(origin).hostname : originHost;

  // 打印请求的 IP 地址和来源
  console.log(
    `${separator}\nRequest received from IP: ${ipAddress}, Origin: ${parsedOrigin}\n${separator}`
  );

  // 记录日志到文件
  logRequest(ipAddress, parsedOrigin);

  // 从环境变量中获取限制次数
  const rateLimit = parseInt(process.env.RATE_LIMIT, 10) || 10;

  // 从环境变量中获取IP白名单和黑名单并解析为数组
  const ipWhitelist = process.env.WHITELIST_IPS
    ? process.env.WHITELIST_IPS.split(',')
    : [];
  const ipBlacklist = process.env.BLACKLIST_IPS
    ? process.env.BLACKLIST_IPS.split(',')
    : [];

  // 从环境变量中获取允许的来源和拒绝的来源并解析为数组
  const allowedOrigins = process.env.WHITELIST_ORIGINS
    ? process.env.WHITELIST_ORIGINS.split(',')
    : [];
  const blockedOrigins = process.env.BLACKLIST_ORIGINS
    ? process.env.BLACKLIST_ORIGINS.split(',')
    : [];

  // 检查请求来源是否在黑名单中
  if (blockedOrigins.includes(parsedOrigin)) {
    console.log(
      `${separator}\nOrigin ${parsedOrigin} is in the blacklist.\n${separator}`
    );
    return res.status(403).json({
      code: 403,
      error: 'Forbidden',
      message: 'Access from this origin is forbidden',
      message_zh: '不允许从此来源访问',
    });
  }

  // 检查请求来源是否在白名单中
  if (allowedOrigins.includes(parsedOrigin)) {
    console.log(
      `${separator}\nOrigin ${parsedOrigin} is in the whitelist.\n${separator}`
    );
    // 检查IP是否在黑名单中
    if (ipBlacklist.includes(ipAddress)) {
      console.log(
        `${separator}\nIP ${ipAddress} is in the blacklist.\n${separator}`
      );
      return res.status(403).json({
        code: 403,
        error: 'Forbidden',
        message: 'Access from this IP address is forbidden',
        message_zh: '此IP地址的访问被禁止',
      });
    }
    // 检查IP是否在白名单中
    if (ipWhitelist.includes(ipAddress)) {
      console.log(
        `${separator}\nIP ${ipAddress} is in the whitelist.\n${separator}`
      );
      return next(); // 如果在IP白名单中，跳过限制检查
    }
    // 对不在黑名单和白名单的IP进行正常的限制检查
    const count = await store.ipIncr(ipAddress);
    // 检查访问次数
    if (count > rateLimit) {
      const ttl = await store.ipGetTTL(ipAddress);
      const timeRemaining = formatTime(ttl);
      const timeRemainingChinese = formatTimeChinese(ttl);
      console.log('请求过多');
      return res.status(429).json({
        code: 429,
        error: 'Too many requests',
        message: `Too many requests - try again in ${timeRemaining}`,
        message_zh: `请求过多 - 请在 ${timeRemainingChinese} 后重试`,
      });
    }
    return next();
  }

  // 如果域名不在白名单，检查IP是否在黑名单中
  if (ipBlacklist.includes(ipAddress)) {
    console.log(
      `${separator}\nIP ${ipAddress} is in the blacklist.\n${separator}`
    );
    return res.status(403).json({
      code: 403,
      error: 'Forbidden',
      message: 'Access from this IP address is forbidden',
      message_zh: '此IP地址的访问被禁止',
    });
  }

  // 对于其他请求（域名不在白名单），进行正常的限制检查
  const count = await store.ipIncr(ipAddress);

  // 检查访问次数
  if (count > rateLimit) {
    const ttl = await store.ipGetTTL(ipAddress);
    const timeRemaining = formatTime(ttl);
    const timeRemainingChinese = formatTimeChinese(ttl);
    console.log('请求过多');
    return res.status(429).json({
      code: 429,
      error: 'Too many requests',
      message: `Too many requests - try again in ${timeRemaining}`,
      message_zh: `请求过多 - 请在 ${timeRemainingChinese} 后重试`,
    });
  }

  next();
};

module.exports = rateLimiter;
