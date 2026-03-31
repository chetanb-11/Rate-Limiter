const express = require('express');
const rateLimiter = require('./middleware/rateLimiter');
const proxyMiddleware = require('./middleware/proxyMiddleware');

const app = express();

app.set('trust proxy', 1); // trust the first proxy hop

app.use('/api/secure', rateLimiter({maxReq: 3, timeWindow: 10}));
app.use('/api/public', rateLimiter({maxReq: 10, timeWindow: 10}));

const proxy = proxyMiddleware();
app.use("/api/secure", proxy)
app.use("/api/public", proxy)

app.listen(3000, () => console.log("app running on localhost:3000"));