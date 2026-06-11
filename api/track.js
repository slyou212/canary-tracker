import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // IP réelle (Vercel passe l'IP dans ce header)
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'inconnue';

    const body = req.body;
    const entry = {
      id: Date.now(),
      ip,
      ...body,
      receivedAt: new Date().toISOString(),
    };

    // Stockage Redis (liste des accès)
    await redis.lpush('canary:hits', JSON.stringify(entry));

    // Envoi email via un simple webhook (ou Resend/Sendgrid)
    // Option simple : notify via ntfy.sh (aucune config requise)
    const topic = process.env.NTFY_TOPIC; // ex: "canary-sindis-abc123"
    if (topic) {
      const msg = [
        `🚨 Canary déclenché !`,
        `IP: ${ip}`,
        body.lat ? `GPS: ${body.lat}, ${body.lng} (±${Math.round(body.accuracy)}m)` : `GPS: ${body.geoError || 'non obtenu'}`,
        `Appareil: ${body.platform}`,
        `Navigateur: ${body.userAgent?.substring(0, 80)}`,
        `Heure: ${entry.receivedAt}`,
      ].join('\n');

      await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        body: msg,
        headers: {
          'Title': '🚨 Canary Token Déclenché',
          'Priority': 'urgent',
          'Tags': 'warning,bell',
        }
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
