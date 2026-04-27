const client = require('../redis.js');

async function rateStats(req, res) {
    try {
        const stats = [];

        for await (const keys of client.scanIterator({ MATCH: 'rate_limit:*' })) {
            const keyList = Array.isArray(keys) ? keys : [keys];
            
            for (const key of keyList) {
                const count = await client.get(key);
                const ttl = await client.ttl(key);

                // key format: rate_limit:/api/secure:192.168.1.1
                const parts = key.split(':');
                const ip = parts.slice(3).join(':'); // handles IPv6
                const route = parts[1] + ':' + parts[2]; // /api/secure or /api/public

                stats.push({ ip, route, requests: Number(count), ttl });
            }
        }

        res.json(stats);
    } catch (err) {
        console.error('Error fetching rate stats:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
}

module.exports = rateStats;