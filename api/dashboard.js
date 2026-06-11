import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  // Protection basique par token secret
  const secret = req.headers['x-admin-token'];
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  try {
    const raw = await redis.lrange('canary:hits', 0, 99); // 100 derniers hits
    const hits = raw.map(h => typeof h === 'string' ? JSON.parse(h) : h);
    return res.status(200).json({ total: hits.length, hits });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur Redis' });
  }
}
