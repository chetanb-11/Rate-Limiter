const { createProxyMiddleware } = require('http-proxy-middleware');

function proxyMiddleware() {
    return createProxyMiddleware({
        target: 'https://jsonplaceholder.typicode.com',
        changeOrigin: true,
        pathRewrite: {
            '^/api/secure': '',
            '^/api/public': '',
        },
        on: {
            proxyRes: function (proxyRes, req, res) {
                // console.log(`Successfully proxied request from ${ip.address()}`);
            }
        },
    })
}

module.exports = proxyMiddleware;