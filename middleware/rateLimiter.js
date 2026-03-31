const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const client = require('../redis.js');

function rateLimiter({ maxReq, timeWindow }) {
    if (!Number.isInteger(maxReq) || maxReq < 1) throw new Error("maxReq must be positive integer");
    if (!Number.isInteger(timeWindow) || timeWindow < 1) throw new Error("timeWindow must be positive integer");

    return async (req, res, next) => {
        try {
            const my_ip = req.ip;

            // increment out ip request
            const key = `rate_limit:${req.baseUrl}:${my_ip}`;

            const requestCount = await client.incr(key); // ip_mapping[my_ip] = ip_mapping[my_ip] + 1 || 1;

            if (requestCount === 1) {
                console.log("clearing mapping");
                await client.expire(key, timeWindow);
            }

            // Attach standard rate-limit headers
            res.set({
                'X-RateLimit-Limit': String(maxReq),
                'X-RateLimit-Remaining': String(Math.max(0, maxReq - requestCount)),
                'X-RateLimit-Reset': String(timeWindow),
            });
            // console.log(maxReq);
            console.log(`recieved request no ${requestCount} from ${key}`);
            // logger.info({ requestCount, key, ip: req.ip }, 'rate limit check');

            if (requestCount > maxReq) {
                console.log(`You have exceeded the ${maxReq} requests in ${timeWindow} seconds limit.`);
                return res.status(429).json({
                    error: "too many request",
                    message: `You have exceeded the ${maxReq} requests in ${timeWindow} seconds limit.`
                });
            }
            
            
            // if(ip_mapping[my_ip] > MAX_ALLOWED_REQ){
                //     console.error("bss kar aur request mat bhaij");
                //     res.status(429).send("Too many requests");
                // }
                next();
            } catch (err) {
                console.error("Rate limiter error:", err);
                // logger.error({ err, ip: req.ip }, 'rate limiter failed');
            next() // fail open
        }
    }

}

module.exports = rateLimiter;