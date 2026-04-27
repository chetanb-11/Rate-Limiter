import client from "../config/redisClient";

export default function slidingWindowLimiter({ maxReq, timeWindow }) {
    if (!Number.isInteger(maxReq) || maxReq < 1) throw new Error("maxReq must be positive integer");
    if (!Number.isInteger(timeWindow) || timeWindow < 1) throw new Error("timeWindow must be positive integer");

    return async (req, res, next) => {
        const my_ip = req.ip;
        const time = new Date.now();
        const key = `rate_limiting:sliding${my_ip}`;
        const requestCount = await client.incr(key)
    }
}