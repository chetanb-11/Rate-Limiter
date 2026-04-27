import 'dotenv/config';
import redis from 'redis';

const client = redis.createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

client.on('error', err => console.log('Redis Client Error', err));

(async () => {
    try{
    await client.connect();
    
    await client.set('foo', 'bar');
    const result = await client.get('foo');
    console.log(result)  // >>> bar
    } catch (err) {
        console.error("Redis not connected: ", err);
    }
})();

export default client;