const express = require('express');
const ip = require('ip');
const redis = require('./redis');

const MAX_ALLOWED_REQ = 5;
const MAX_TIME = 5;

// let ip_mapping = {}

const app = express();

// setInterval(() => {
//     ip_mapping = {};
//     console.log("ip mapping clear");
// }, MAX_TIME)

app.use(async(req, res, next)=>{
    const my_ip = ip.address();

    // increment out ip request
    const request = await redis.incr(my_ip);
    // ip_mapping[my_ip] = ip_mapping[my_ip] + 1 || 1;

    if(request === 1){
        await redis.expire(my_ip, MAX_TIME);
    }

    // console.log(`recieved request no ${ip_mapping[my_ip]} from ${my_ip}`);

    if(request > MAX_ALLOWED_REQ){
        return res.status(429).json({message:"too many request"}); 
    }

    // if(ip_mapping[my_ip] > MAX_ALLOWED_REQ){
    //     console.error("bss kar aur request mat bhaij");
    //     res.status(429).send("Too many requests");
    // }
    next();
})

app.get("/", (req, res) => {
    // console.log("received a request");

    // const my_ip = ip.address();
    // console.log(my_ip);

    res.status(200).send("ok");
})

app.listen(3000, () => console.log("app running on localhost:3000"));