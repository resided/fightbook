export default function handler(req: Request) {
  const url = new URL(req.url);
  let path = url.pathname;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (path === '/api/health' || path === '/_api/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), { status: 200, headers });
  }

  if (path === '/api/leaderboard' || path === '/_api/leaderboard') {
    return new Response(JSON.stringify([
      { rank: 1, name: 'Champion', win_count: 10 },
      { rank: 2, name: 'Contender', win_count: 8 },
      { rank: 3, name: 'Challenger', win_count: 5 },
    ]), { status: 200, headers });
  }

  if (path === '/api/fighters' || path === '/_api/fighters') {
    return new Response(JSON.stringify({ fighters: [] }), { status: 200, headers });
  }

  if (path === '/api/fights' || path === '/_api/fights') {
    return new Response(JSON.stringify({ fights: [] }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ 
    message: 'FightBook API',
    endpoints: ['/api/health', '/api/fighters', '/api/fights', '/api/leaderboard']
  }), { status: 200, headers });
}
