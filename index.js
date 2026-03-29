const express = require('express');
const ip = require('ip');
const redis = require('./redis');
const { createProxyMiddleware } = require('http-proxy-middleware');
const MAX_ALLOWED_REQ = 5;
const MAX_TIME = 20;


const app = express();

const rateLimiter = async(req, res, next) => {
    const my_ip = ip.address();

    // increment out ip request
    const request = await redis.incr(my_ip); // ip_mapping[my_ip] = ip_mapping[my_ip] + 1 || 1;

    if (request === 1) {
        console.log("clearing mapping");
        await redis.expire(my_ip, MAX_TIME);
    }

    console.log(`recieved request no ${request} from ${my_ip}`);

    if (request > MAX_ALLOWED_REQ) {
        return res.status(429).json({
            error: "too many request",
            message: `You have exceeded the ${MAX_ALLOWED_REQ} requests in ${MAX_TIME} seconds limit.`
        });
    }

    // if(ip_mapping[my_ip] > MAX_ALLOWED_REQ){
    //     console.error("bss kar aur request mat bhaij");
    //     res.status(429).send("Too many requests");
    // }
    next();
}

app.use(rateLimiter);

app.use("/api", createProxyMiddleware({
    target: 'https://jsonplaceholder.typicode.com',
    changeOrigin: true,
    pathRewrite: {
        '^/api' : '',
    },
    onProxyResponse: function(proxyRes, req, res) {
        console.log(`Successfully proxied request from ${ip.address()}`);
    }
}))

app.listen(3000, () => console.log("app running on localhost:3000"));