const redis = require('redis');
require("dotenv").config();

// Create a Redis client
const redisClient = redis.createClient({
    // url: process.env.REDIS_URL || 'redis://localhost:6379'
    url: 'redis://127.0.0.1:6379'
    // url: process.env.REDIS_URL
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

// Connect to Redis
redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch((err) => {
    console.error('Redis connection error:', err);
});

module.exports = redisClient;