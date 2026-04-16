const express = require('express');
const rateLimiter = require('./middleware/rateLimiter');
const proxyMiddleware = require('./middleware/proxyMiddleware');

const app = express();

app.set('trust proxy', 1); // trust the first proxy hop

// Login, signup, sensitive operations — strict
app.use('/api/secure', rateLimiter({maxReq: 10, timeWindow: 60}));

// General API usage — generous
app.use('/api/public', rateLimiter({maxReq: 100, timeWindow: 60}));

const proxy = proxyMiddleware();
app.use("/api/secure", proxy)
app.use("/api/public", proxy)

app.listen(3000, () => console.log("app running on localhost:3000"));