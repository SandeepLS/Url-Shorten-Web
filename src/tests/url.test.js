const request = require("supertest");
const app = require("../server"); // Ensure correct path to your Express app
const redisClient = require("../config/redis"); // Ensure correct path to your Redis client

describe("URL Caching Tests", () => {
    beforeAll(async () => {
        await redisClient.connect(); // Ensure Redis is connected
    });

    afterAll(async () => {
        await redisClient.quit(); // Close Redis connection after tests
    });

    test("Should return cached URL", async () => {
        // Store a URL in Redis cache manually for testing
        await redisClient.set("shortUrl:test123", JSON.stringify({ originalUrl: "https://example.com" }));

        // Make a request to the redirect endpoint
        const res = await request(app).get("/api/urls/test123");

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("https://example.com");
    });

    test("Should fetch analytics from cache", async () => {
        // Store analytics data in Redis cache
        const cachedAnalytics = JSON.stringify({ totalClicks: 10, uniqueUsers: 5 });
        await redisClient.set("analytics:test123", cachedAnalytics);

        // Make a request to get analytics
        const res = await request(app).get("/api/analytics/test123");

        expect(res.status).toBe(200);
        expect(res.body).toEqual(JSON.parse(cachedAnalytics));
    });
});
