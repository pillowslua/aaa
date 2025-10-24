export default async function handler(req, res) {
  const { serverId } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Trong thực tế, fetch data từ DSTAT server
    // Giờ return mock data
    return res.status(200).json({
      success: true,
      serverId,
      stats: {
        current: Math.floor(Math.random() * 1000),
        peak: Math.floor(Math.random() * 2000),
        average: Math.floor(Math.random() * 800),
        timestamp: Date.now()
      }
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
