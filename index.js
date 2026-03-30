const express = require('express');
const ip = require('ip');
const redis = require('./redis');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimiter = require('./middleware/rateLimiter')

const MAX_ALLOWED_REQ = 5;
const MAX_TIME = 20;


const app = express();

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