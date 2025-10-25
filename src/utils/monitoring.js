// ============================================
// FILE 1: src/utils/monitoring.js
// CHỈ DÙNG API - KHÔNG FETCH/IMAGE
// ============================================

// Real monitoring functions - ONLY API for HTTP URLs
export const checkServer = async (server) => {
  const startTime = Date.now();
  
  try {
    // Check if URL is HTTP
    const isHttpUrl = server.url.startsWith('http://');
    const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:';
    
    // ALWAYS use API for HTTP URLs on HTTPS page
    if (isHttpUrl && isHttpsPage) {
      console.log(`Using API for HTTP URL: ${server.url}`);
      return await checkViaAPI(server, startTime);
    }
    
    // For HTTPS URLs, try direct fetch first
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
        lastChecked: new Date().toISOString(),
        method: 'direct'
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Fallback to API
      return await checkViaAPI(server, startTime);
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      ...server,
      status: 'error',
      responseTime: responseTime,
      lastChecked: new Date().toISOString(),
      error: error.message,
      method: 'error'
    };
  }
};

// Check via Vercel API endpoint - MAIN METHOD FOR HTTP
const checkViaAPI = async (server, startTime) => {
  try {
    const apiUrl = `/api/check?url=${encodeURIComponent(server.url)}`;
    console.log(`Calling API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`API Response:`, data);
    
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
    console.error(`API Error for ${server.url}:`, error);
    return {
      ...server,
      status: 'error',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      error: error.message,
      method: 'api-error'
    };
  }
};

export const checkAllServers = async (servers) => {
  console.log('Checking all servers...');
  const checks = servers.map(server => 
    checkServer(server).catch(error => ({
      ...server,
      status: 'error',
      error: error.message,
      lastChecked: new Date().toISOString(),
      method: 'catch-error'
    }))
  );
  
  const results = await Promise.all(checks);
  console.log('All checks complete:', results);
  return results;
};
