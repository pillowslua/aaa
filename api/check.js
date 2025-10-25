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

    // Try HEAD request first (faster)
    let response;
    try {
      response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'MeDsats-Monitor/1.0',
          'Accept': '*/*'
        }
      });
    } catch (headError) {
      // If HEAD fails, try GET
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'MeDsats-Monitor/1.0',
          'Accept': '*/*'
        }
      });
    }

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    return res.status(200).json({
      status: response.ok ? 'online' : 'offline',
      statusCode: response.status,
      statusText: response.statusText,
      responseTime: responseTime,
      timestamp: new Date().toISOString(),
      headers: {
        contentType: response.headers.get('content-type'),
        server: response.headers.get('server')
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Determine error type
    let status = 'offline';
    if (error.name === 'AbortError') {
      status = 'timeout';
    } else if (error.message.includes('ENOTFOUND')) {
      status = 'dns_error';
    } else if (error.message.includes('ECONNREFUSED')) {
      status = 'connection_refused';
    }
    
    return res.status(200).json({
      status: status,
      error: error.message,
      errorType: error.name,
      responseTime: responseTime,
      timestamp: new Date().toISOString()
    });
  }
}
