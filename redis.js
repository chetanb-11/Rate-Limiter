const redis = require('redis');

const client = redis.createClient({
    username: 'default',
    password: 'UkRhX0P8i5tEosDbSFfnL6ANnkM5YogN',
    socket: {
        host: 'redis-19335.crce219.us-east-1-4.ec2.cloud.redislabs.com',
        port: 19335
    }
});

client.on('error', err => console.log('Redis Client Error', err));

(async () => {
    await client.connect();
    
    await client.set('foo', 'bar');
    const result = await client.get('foo');
    console.log(result)  // >>> bar
})();

module.exports = client;