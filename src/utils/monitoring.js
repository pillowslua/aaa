export const checkServer = async (server) => {
  const startTime = Date.now();
  
  try {
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
      return await checkViaImage(server, startTime);
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      ...server,
      status: 'error',
      responseTime: responseTime,
      lastChecked: new Date().toISOString()
    };
  }
};

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
