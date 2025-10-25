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
    return res.status(400).send('URL parameter is required');
  }

  try {
    console.log(`Proxying: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Get content type
    const contentType = response.headers.get('content-type') || 'text/html';
    
    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', 'frame-ancestors *');
    
    // Get HTML content
    let html = await response.text();
    
    // Rewrite URLs in HTML to use proxy
    html = html.replace(
      /(href|src)=["'](?!http|\/\/|#|data:)([^"']+)["']/gi,
      (match, attr, relativeUrl) => {
        try {
          const baseUrl = new URL(url);
          const absoluteUrl = new URL(relativeUrl, baseUrl.origin).href;
          return `${attr}="/api/proxy?url=${encodeURIComponent(absoluteUrl)}"`;
        } catch {
          return match;
        }
      }
    );
    
    // Inject base tag
    html = html.replace(
      /<head>/i,
      `<head><base href="${url}">`
    );

    return res.status(200).send(html);

  } catch (error) {
    console.error(`Proxy error for ${url}:`, error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: system-ui; 
              padding: 40px; 
              background: #1a1a1a; 
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
            }
            .error-box {
              background: #2a2a2a;
              border: 2px solid #ff4444;
              border-radius: 12px;
              padding: 30px;
              max-width: 500px;
              text-align: center;
            }
            h1 { color: #ff4444; margin: 0 0 20px 0; }
            p { color: #999; line-height: 1.6; }
            a { color: #4a9eff; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="error-box">
            <h1>⚠️ Proxy Error</h1>
            <p><strong>Cannot load:</strong> ${url}</p>
            <p>Error: ${error.message}</p>
            <p><a href="${url}" target="_blank">Open directly in new tab →</a></p>
          </div>
        </body>
      </html>
    `);
  }
}
