import express from 'express';
import cors from 'cors';
import rateLimiter from './middleware/fixedWindowLimiter.js';
import proxyMiddleware from './middleware/proxyMiddleware.js';
import rateStats from './middleware/rateStats.js';
import createRateLimiter from './middleware/createRateLimiter.js';
import { connectPromise } from './config/redisClient.js';

const app = express();

app.use(cors());
app.set('trust proxy', 1); // trust the first proxy hop

app.get('/', (req, res) => {
    res.send("Hello from server");
})
const stratergy = process.env.RATE_LIMIT_STRATEGY || 'sliding';
app.get('/api/stats', rateStats)

// Login, signup, sensitive operations — strict
app.use('/api/secure', createRateLimiter({ stratergy, maxReq: 10, timeWindow: 60 }));

// General API usage — generous
app.use('/api/public', createRateLimiter({ stratergy, maxReq: 100, timeWindow: 60 }));

const proxy = proxyMiddleware();
app.use("/api/secure", proxy)
app.use("/api/public", proxy)

// Wait for Redis to connect before starting the server
connectPromise.then(() => {
    app.listen(3000, () => console.log("app running on localhost:3000"));
}).catch((err) => {
    console.error("Failed to start server, Redis connection error:", err);
    // Start anyway (fail-open) since middleware already handles Redis errors
    app.listen(3000, () => console.log("app running on localhost:3000 (Redis unavailable)"));
});