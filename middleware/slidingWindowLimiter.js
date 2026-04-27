import client from "../config/redisClient.js";

export default function slidingWindowLimiter({ maxReq, timeWindow }) {
    if (!Number.isInteger(maxReq) || maxReq < 1) throw new Error("maxReq must be positive integer");
    if (!Number.isInteger(timeWindow) || timeWindow < 1) throw new Error("timeWindow must be positive integer");

    return async (req, res, next) => {
        const my_ip = req.ip;
        const now = Date.now();
        const key = `rate_limit|sliding|${req.baseUrl}|${my_ip}`;
        const windowStart = now - timeWindow * 1000;

        try {
            const pipeline = client.multi();

            // Remove timestamps older than the window
            pipeline.zRemRangeByScore(key, "-inf", windowStart);

            // count remaining request in curr window
            pipeline.zCard(key);

            // add curr req timestamp
            pipeline.zAdd(key, { score: now, value: `${now}-${Math.random()}` });

            // set expiry so keys clean auto
            pipeline.expire(key, timeWindow);

            const result = await pipeline.exec();
            const prunedCount = result[0]; // entries removed outside window
            const requestCount = result[1];

            console.log(`[SlidingWindow] ${key} | pruned: ${prunedCount} | active: ${requestCount} | remaining: ${Math.max(0, maxReq - requestCount - 1)}`);

            res.set({
                "X-RateLimit-Limit": maxReq,
                "X-RateLimit-Remaining": Math.max(0, maxReq - requestCount - 1),
                "X-RateLimit-Reset": Math.ceil((now + timeWindow * 1000) / 1000),
            });

            if(requestCount >= maxReq){
                console.log(`[SlidingWindow] BLOCKED ${my_ip} | ${requestCount}/${maxReq} requests in last ${timeWindow}s`);
                res.set("Retry-After", timeWindow);
                return res.status(429).json({
                    error: "Too Many Requests",
                    message: `Limit of ${maxReq} requests per ${timeWindow}s exceeded`,
                    retryAfter: timeWindow
                });
            }

            next();
        }
        catch (err) {
            console.error("SlidingWindow Redis error: ", err);

            // This is fail-open
            next();
        }
    };
}