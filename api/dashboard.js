const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async function handler(req, res) {
  const secret = req.headers['x-admin-token'];
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  try {
    const raw = await redis.lrange('canary:hits', 0, 99);
    const hits = raw.map(h => typeof h === 'string' ? JSON.parse(h) : h);
    return res.status(200).json({ total: hits.length, hits });
  } catch (err) {
    console.error('dashboard error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
