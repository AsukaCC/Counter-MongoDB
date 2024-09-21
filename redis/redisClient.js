const loadEnv = require('../config/load_env');
loadEnv();
const redis = require('redis');

const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client.on('error', (err) => {
  console.log('Redis error: ', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client
  .connect()
  .then(() => {
    console.log('Redis client connected');
  })
  .catch((err) => {
    console.error('Failed to connect to Redis', err);
  });

module.exports = client;
