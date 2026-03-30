const redis = require('redis');

const rateLimiter = async(req, res, next) => {
    // const my_ip = ip.address();
    const xforwardedfor = req.headers['x-forwarded-for'];
    const my_ip = xforwardedfor ? xforwardedfor.split(',')[0] : req.socket.remoteAddress;
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

module.exports = rateLimiter;