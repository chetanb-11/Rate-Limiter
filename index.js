const express = require('express');
const cors = require('cors');
const rateLimiter = require('./middleware/rateLimiter');
const proxyMiddleware = require('./middleware/proxyMiddleware');
const rateStats = require('./middleware/ratestats');

const app = express();

app.use(cors());
app.set('trust proxy', 1); // trust the first proxy hop

app.get('/', (req, res) => {
    res.send("Hello from server");
})

app.get('/api/stats', rateStats)

// Login, signup, sensitive operations — strict
app.use('/api/secure', rateLimiter({ maxReq: 10, timeWindow: 60 }));

// General API usage — generous
app.use('/api/public', rateLimiter({ maxReq: 100, timeWindow: 60 }));

const proxy = proxyMiddleware();
app.use("/api/secure", proxy)
app.use("/api/public", proxy)

app.listen(3000, () => console.log("app running on localhost:3000"));