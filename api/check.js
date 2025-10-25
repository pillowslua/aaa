export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'MeDsats-Monitor/1.0'
      }
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    return res.status(200).json({
      status: response.ok ? 'online' : 'offline',
      statusCode: response.status,
      responseTime: responseTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return res.status(200).json({
      status: error.name === 'AbortError' ? 'timeout' : 'offline',
      error: error.message,
      responseTime: responseTime,
      timestamp: new Date().toISOString()
    });
  }
}
