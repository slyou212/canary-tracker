const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'inconnue';
    const body = req.body || {};
    const entry = {
      id: Date.now(),
      ip,
      ...body,
      receivedAt: new Date().toISOString(),
    };

    await redis.lpush('canary:hits', JSON.stringify(entry));

    const topic = process.env.NTFY_TOPIC;
    if (topic) {
      const msg = [
        'CANARY DECLENCHE',
        `IP: ${ip}`,
        body.lat ? `GPS: ${body.lat}, ${body.lng}` : `GPS: non obtenu`,
        `Appareil: ${body.platform || '?'}`,
        `Heure: ${entry.receivedAt}`,
      ].join('\n');

      await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        body: msg,
        headers: {
          'Title': 'Canary Declenche',
          'Priority': 'urgent',
          'Tags': 'warning',
        }
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('track error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
