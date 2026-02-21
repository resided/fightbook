export default function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (path === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers });
  }

  if (path === '/api/leaderboard') {
    return new Response(JSON.stringify([
      { rank: 1, name: 'Champion', win_count: 10 },
      { rank: 2, name: 'Contender', win_count: 8 },
      { rank: 3, name: 'Challenger', win_count: 5 },
    ]), { status: 200, headers });
  }

  if (path === '/api/fighters') {
    return new Response(JSON.stringify({ fighters: [] }), { status: 200, headers });
  }

  if (path === '/api/fights') {
    return new Response(JSON.stringify({ fights: [] }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ 
    message: 'FightBook API',
    endpoints: ['/api/health', '/api/fighters', '/api/leaderboard', '/api/fights']
  }), { status: 200, headers });
}
