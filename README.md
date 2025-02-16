npm init -y
npm install express mongoose redis dotenv jsonwebtoken passport-google-oauth20 cors rate-limit
npm install --save-dev nodemon
npm install passport cookie-parser express-session 

Cookies are a widely used mechanism for storing authentication tokens and maintaining user sessions.

The SESSION_SECRET is a random secret key used by the express-session middleware to encrypt and sign session data stored in cookies.

Why is SESSION_SECRET Important?
Security: It prevents session tampering and protects user data.
Integrity: Ensures that the session ID is valid and not altered by attackers.
Authentication: Required when using session-based authentication

What Happens Without SESSION_SECRET?
Sessions won't work properly, and the server might throw an error.
Session hijacking risk: Without encryption, attackers could manipulate sessions.
Authentication failure: Some auth strategies (like Google OAuth) require secure session handling.

How to Generate a Secure SESSION_SECRET:-
Run this command in the terminal:
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
This will generate a random 64-character secure key. Use it in your .env file.

-------------------***************************------------------------------
Step 2: URL Shortening API:-

npm install shortid valid-url
npm i body-parser

shortid → Generates unique short IDs for URLs.
valid-url → Validates if a given URL is properly formatted.

1. Create the URL Model
Create src/models/Url.js:

2. Create URL Shortening Routes
Create src/routes/urlRoutes.js:

3. Create Authentication Middleware
Create src/middlewares/authMiddleware.js:

4. Integrate Routes in server.js
Modify src/server.js:

Test URL Shortening API in Postman:-
1. Macking short url:-
Method: POST
URL: http://localhost:5000/api/shorten
Headers:
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
Body: { "originalUrl": "https://example.com" }
Expected Response: 
{
    "_id": "67adbdefa5173ee6cc434c39",
    "originalUrl": "https://example.com",
    "shortUrl": "http://localhost:5000/Ry-zhD6iL",
    "clicks": 0,
    "createdBy": "103014158487352735860",
    "createdAt": "2025-02-13T09:39:59.965Z",
    "__v": 0
}

2. Redirect Short URL
Open http://localhost:5000/abc123 in a browser.
It should redirect to https://example.com.

-------------------------------***********************------------------------------------
Test cases:-
1. Modularize Business Logic
Move URL validation and short ID generation into a separate utils file (utils/urlUtils.js).
Example:
const validUrl = require("valid-url");
const shortid = require("shortid");

exports.validateUrl = (url) => validUrl.isUri(url);
exports.generateShortCode = () => shortid.generate();

2. Optimize Database Queries
Add indexing on frequently queried fields like shortUrl and createdBy to improve performance.
Example:
UrlSchema.index({ shortUrl: 1, createdBy: 1 });

3. Improve Error Handling with Middleware
Instead of wrapping each controller function in a try-catch, create a middleware (middleware/errorHandler.js) to handle errors centrally.
Example:
module.exports = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong" });
};

Then, use next(error) in controllers.

4. Enhance Click Analytics for Scalability
Instead of incrementing clicks synchronously in redirectUrl, use a background queue (e.g., Bull with Redis) to handle updates asynchronously

------------------------------********************************-------------------------------
Step 3:- Implementing Analytics Tracking for Clicks

Now, we need to track analytics data when a user accesses a short URL. This includes:
> IP Address
> User-Agent (browser & OS info)
> Device Type (Mobile/Desktop)
> Timestamp

1. Create a new model: models/Analytics.js
2. Update URL Controller (controllers/urlController.js)
Modify the redirectUrl function to log analytics.
> npm install ua-parser-js

3. Testing in Postman
> Make sure a shortened URL exists (POST /api/shorten)
> Redirect to a shortened URL (GET /api/urls/{shortUrl})
> Verify analytics data
    Connect to MongoDB and check the analytics collection:
    > db.analytics.find().pretty()
--------------
Implementing the API to Fetch URL Analytics:-
1. Update controllers/urlController.js
2. Update routes/urlRoutes.js
3. Testing in postman:
Get: http://localhost:5000/api/urls/analytics/{shortCode}
Authorization Bearer 

-------------------------**********************----------------------
Step 4: Implementing GET /api/analytics/topic/:topic API

create analytics Controller (controllers/analytivsController.js)
> getTopicAnalytics.

This step will allow users to get analytics for all URLs under a specific topic (e.g., all URLs related to "Technology", "Sports", etc.)
Testing in postman:
Get: http://localhost:5000/api/analytics/topic/:topic
Authorization Bearer 

-------------------------***********************----------------------
Step 5. Implement the Overall Analytics API endpoint now. Here’s the plan:
> Fetch all URLs created by the authenticated user.
> Aggregate total URLs, total clicks, and unique users.
> Compute clicks by date, OS type, and device type from analytics data.

update analytics Controller (controllers/analytivsController.js)
> getOverallAnalytics.

Testing in postman:-
GET http://localhost:5000/api/analytics/overall
Authorization: Bearer <your_token>

-------------------------***********************----------------------
Caching:
Implement caching using Redis to store both short and long URLs, improving the performance of the API by reducing database load. Cache data wherever necessary, such as when retrieving URL analytics or redirecting short URLs, to ensure quick access and response times.

Caching Implementation: Use Redis caching to efficiently store and serve short and long URLs.
Testing & Error Handling: Write integration tests for all endpoints with comprehensive error handling.

Check, if the redis is installed in you locall machine or not:
> redis-server
> redis-cli ping
  If Redis is running, you should get a response: PONG
OR
> redis-cli
> ping
> set

1. redis is installed in you vsCode editor:-
npm install redis

2. Create a new file config/redis.js to initialize Redis:
config/redis.js

3. Implement Caching in URL Shortening:
Modify controllers/urlControllers.js to cache shortened URLs.
(a) Update redirectUrl to use Redis caching:
controllers/urlController.js: redirect

4. Cache Analytics Data
Modify getUrlAnalytics to cache analytics data:
controllers/urlController.js: getUrlAnalytics

5. Step 5: Clear Cache When Data Changes
Whenever a new short URL is created or analytics data is updated, invalidate the cache.
(a) Invalidate Cache on New URL Creation
Modify createShorten:
exports.createShorten = async (req, res) => {
    // ... existing code ...
    
    const newUrl = await Url.create({ originalUrl, shortUrl, createdBy, topic: topic || "General" });

    // Invalidate cache
    await redisClient.del(`shortUrl:${newUrl.shortUrl}`);

    res.json(newUrl);
};

(b) Invalidate Cache on New Analytics Entry
Modify redirectUrl
await Analytics.create({
    shortUrl: url.shortUrl,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    createdAt: new Date(),
    os,
    device
});
// Invalidate analytics cache
await redisClient.del(`analytics:${shortCode}`);

6. Step 6: Write Integration Tests
You can use Jest and Supertest to test caching behavior.
> npm install --save-dev jest supertest
create folder and file, tests/url.test.js:-
Now, add the following Jest command in package.json:
"scripts": {
  "test": "jest --runInBand"
}
Run this command: npm test
