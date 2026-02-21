export default function handler() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'FightBook API v1.1',
      endpoints: ['/api/fighters', '/api/leaderboard', '/api/fights']
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    }
  );
}
