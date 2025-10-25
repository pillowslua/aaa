export const checkServer = async (server) => {
  const startTime = Date.now();
  
  try {
    // Check if URL is HTTP and we're on HTTPS (mixed content issue)
    const isHttpUrl = server.url.startsWith('http://');
    const isHttpsPage = window.location.protocol === 'https:';
    
    // If mixed content issue, use API endpoint
    if (isHttpUrl && isHttpsPage) {
      return await checkViaAPI(server, startTime);
    }
    
    // Otherwise try direct fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(server.url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      return {
        ...server,
        status: 'online',
        responseTime: responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Try API as fallback
      return await checkViaAPI(server, startTime);
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      ...server,
      status: 'error',
      responseTime: responseTime,
      lastChecked: new Date().toISOString(),
      error: error.message
    };
  }
};

// Check via Vercel API endpoint
const checkViaAPI = async (server, startTime) => {
  try {
    const response = await fetch(`/api/check?url=${encodeURIComponent(server.url)}`);
    const data = await response.json();
    
    const responseTime = Date.now() - startTime;
    
    return {
      ...server,
      status: data.status || 'unknown',
      responseTime: data.responseTime || responseTime,
      lastChecked: new Date().toISOString(),
      statusCode: data.statusCode,
      method: 'api'
    };
  } catch (error) {
    return {
      ...server,
      status: 'error',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      error: error.message
    };
  }
};

// Fallback: Check via Image loading
const checkViaImage = (server, startTime) => {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      img.src = '';
      resolve({
        ...server,
        status: 'timeout',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      });
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve({
        ...server,
        status: 'online',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      });
    };

    img.onerror = () => {
      clearTimeout(timeout);
      const responseTime = Date.now() - startTime;
      resolve({
        ...server,
        status: responseTime < 5000 ? 'online' : 'offline',
        responseTime: responseTime,
        lastChecked: new Date().toISOString()
      });
    };

    img.src = server.url + '/favicon.ico?' + Date.now();
  });
};

export const checkAllServers = async (servers) => {
  const checks = servers.map(server => 
    checkServer(server).catch(error => ({
      ...server,
      status: 'error',
      error: error.message,
      lastChecked: new Date().toISOString()
    }))
  );
  
  return await Promise.all(checks);
};
