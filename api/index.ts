export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  // Health
  if (path === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers });
  }

  // Leaderboard
  if (path === '/api/leaderboard') {
    return new Response(JSON.stringify([
      { rank: 1, name: 'Champion', win_count: 10, total_fights: 15, losses: 5 },
      { rank: 2, name: 'Contender', win_count: 8, total_fights: 12, losses: 4 },
      { rank: 3, name: 'Challenger', win_count: 5, total_fights: 8, losses: 3 },
    ]), { status: 200, headers });
  }

  // Fighters
  if (path === '/api/fighters') {
    return new Response(JSON.stringify({ fighters: [] }), { status: 200, headers });
  }

  // Fights
  if (path === '/api/fights') {
    return new Response(JSON.stringify({ fights: [] }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ 
    message: 'FightBook API',
    endpoints: ['/api/health', '/api/fighters', '/api/leaderboard', '/api/fights']
  }), { status: 200, headers });
}
