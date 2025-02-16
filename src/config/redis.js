const redis = require('redis');
require("dotenv").config();

// Create a Redis client
const redisClient = redis.createClient({
    // url: process.env.REDIS_URL || 'redis://localhost:6379'
    url: 'redis://127.0.0.1:6379'
    // url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch((err) => {
    console.error('Redis connection error:', err);
});

module.exports = redisClient;