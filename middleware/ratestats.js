import client from "../config/redisClient.js";

export default async function rateStats(req, res) {
    try {
        const stats = [];

        // Scan all rate_limit keys — both fixed and sliding use "rate_limit|" prefix
        for await (const keys of client.scanIterator({ MATCH: 'rate_limit|*' })) {
            const keyList = Array.isArray(keys) ? keys : [keys];

            for (const key of keyList) {
                // Key format: rate_limit|<strategy>|<route>|<ip>
                // Using "|" as delimiter avoids collision with ":" in IPv6 addresses
                const parts = key.split('|');
                const strategy = parts[1];  // "fixed" or "sliding"
                const route = parts[2];     // "/api/secure" or "/api/public"
                const ip = parts[3];        // full IP including IPv6

                const ttl = await client.ttl(key);

                let requests;
                if (strategy === 'sliding') {
                    // Sliding window stores timestamps in a Sorted Set
                    requests = await client.zCard(key);
                } else {
                    // Fixed window stores a simple counter string
                    requests = Number(await client.get(key));
                }

                stats.push({ ip, route, strategy, requests, ttl });
            }
        }

        // Sort by requests descending so the most active clients appear first
        stats.sort((a, b) => b.requests - a.requests);

        res.json({
            total: stats.length,
            stats,
        });
    } catch (err) {
        console.error('Error fetching rate stats:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
}