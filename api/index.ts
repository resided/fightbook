import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '/';
  const path = url.split('?')[0];

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (path === '/api/health') {
    return res.status(200).json({ status: 'ok' });
  }

  if (path === '/api/leaderboard') {
    return res.status(200).json([
      { rank: 1, name: 'Champion', win_count: 10 },
      { rank: 2, name: 'Contender', win_count: 8 },
      { rank: 3, name: 'Challenger', win_count: 5 },
    ]);
  }

  if (path === '/api/fighters') {
    return res.status(200).json({ fighters: [] });
  }

  if (path === '/api/fights') {
    return res.status(200).json({ fights: [] });
  }

  return res.status(200).json({ 
    message: 'FightBook API',
    endpoints: ['/api/health', '/api/fighters', '/api/leaderboard', '/api/fights']
  });
}
