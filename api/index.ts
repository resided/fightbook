export default function handler() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: Date.now(),
      message: 'FightBook API v1',
      endpoints: {
        fighters: '/api/fighters',
        leaderboard: '/api/leaderboard', 
        fights: '/api/fights'
      }
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
