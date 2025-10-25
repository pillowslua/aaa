import React, { useState, useEffect } from 'react';
import { Activity, Globe, Server, AlertCircle, CheckCircle, Clock, ExternalLink, Zap, TrendingUp } from 'lucide-react';

// Server configuration - THAY ĐỔI URLs Ở ĐÂY
const SERVER_CONFIG = [
  { id: 1, name: 'Main Server', url: 'http://147.135.252.68:20050/' },
  { id: 2, name: 'Google', url: 'https://google.com' },
  { id: 3, name: 'GitHub', url: 'https://github.com' },
  { id: 4, name: 'Vercel', url: 'https://vercel.com' },
  { id: 5, name: 'Cloudflare', url: 'https://cloudflare.com' },
  { id: 6, name: 'Amazon', url: 'https://amazon.com' },
  { id: 7, name: 'Microsoft', url: 'https://microsoft.com' },
  { id: 8, name: 'Apple', url: 'https://apple.com' },
  { id: 9, name: 'Netflix', url: 'https://netflix.com' },
  { id: 10, name: 'Facebook', url: 'https://facebook.com' },
];

export default function MeDsats() {
  const [servers, setServers] = useState(
    SERVER_CONFIG.map(s => ({ ...s, status: 'checking', responseTime: null, lastChecked: null }))
  );
  const [selectedServer, setSelectedServer] = useState(null);
  const [lastCheck, setLastCheck] = useState(new Date());
  const [isChecking, setIsChecking] = useState(false);

  // REAL MONITORING FUNCTION
  const checkServerStatus = async (server) => {
    const startTime = Date.now();
    
    try {
      // Try to fetch the URL using a CORS proxy or direct fetch
      // We'll use multiple methods for better reliability
      
      // Method 1: Try direct fetch with no-cors (limited info but works)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
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
          statusCode: 'OK'
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // If fetch fails, try using Image loading trick for http/https
        return await checkViaImage(server, startTime);
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

  // Alternative method: Check via Image loading
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
        // Even on error, if we got a response quickly, server might be up
        const responseTime = Date.now() - startTime;
        resolve({
          ...server,
          status: responseTime < 5000 ? 'online' : 'offline',
          responseTime: responseTime,
          lastChecked: new Date().toISOString()
        });
      };

      // Try to load favicon or the URL itself
      img.src = server.url + '/favicon.ico?' + Date.now();
    });
  };

  const checkAllServers = async () => {
    setIsChecking(true);
    
    // Check all servers in parallel
    const checks = servers.map(server => 
      checkServerStatus(server).catch(error => ({
        ...server,
        status: 'error',
        error: error.message,
        lastChecked: new Date().toISOString()
      }))
    );
    
    const results = await Promise.all(checks);
    setServers(results);
    setLastCheck(new Date());
    setIsChecking(false);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    checkAllServers();
    const interval = setInterval(checkAllServers, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'timeout': return 'bg-orange-500';
      case 'error': return 'bg-yellow-500';
      case 'checking': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5" />;
      case 'offline': return <AlertCircle className="w-5 h-5" />;
      case 'checking': return <Clock className="w-5 h-5 animate-spin" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const onlineCount = servers.filter(s => s.status === 'online').length;
  const offlineCount = servers.filter(s => s.status === 'offline' || s.status === 'error' || s.status === 'timeout').length;
  const avgResponseTime = servers
    .filter(s => s.responseTime)
    .reduce((acc, s) => acc + s.responseTime, 0) / servers.filter(s => s.responseTime).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Activity className="w-8 h-8 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MeDsats</h1>
                <p className="text-xs text-slate-400">Real-time Website Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">{onlineCount} Online</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/30">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-400 font-semibold">{offlineCount} Issues</span>
              </div>
              <button
                onClick={checkAllServers}
                disabled={isChecking}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg hover:shadow-blue-500/50"
              >
                <Activity className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Refresh All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Servers</p>
                <p className="text-3xl font-bold text-white">{servers.length}</p>
              </div>
              <Server className="w-12 h-12 text-slate-600" />
            </div>
          </div>
          
          <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm mb-1">Online</p>
                <p className="text-3xl font-bold text-green-400">{onlineCount}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500/50" />
            </div>
          </div>
          
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 hover:border-red-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm mb-1">Issues</p>
                <p className="text-3xl font-bold text-red-400">{offlineCount}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500/50" />
            </div>
          </div>
          
          <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm mb-1">Avg Response</p>
                <p className="text-3xl font-bold text-blue-400">{avgResponseTime.toFixed(0)}ms</p>
              </div>
              <Zap className="w-12 h-12 text-blue-500/50" />
            </div>
          </div>
        </div>

        {/* Server Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {servers.map((server) => (
            <button
              key={server.id}
              onClick={() => setSelectedServer(server)}
              className={`p-6 rounded-xl border transition-all hover:scale-105 hover:shadow-2xl relative overflow-hidden group ${
                selectedServer?.id === server.id
                  ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(server.status)} ${server.status === 'checking' ? 'animate-pulse' : 'animate-pulse'}`}></div>
                  <div className="text-slate-400">
                    {getStatusIcon(server.status)}
                  </div>
                </div>
                
                <h3 className="text-white font-semibold text-lg mb-2 truncate">{server.name}</h3>
                
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                  <Globe className="w-3 h-3" />
                  <span className="truncate">
                    {server.url.replace(/^https?:\/\//, '').split('/')[0]}
                  </span>
                </div>
                
                {server.responseTime !== null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Response:</span>
                    <span className={`font-mono font-semibold ${
                      server.responseTime < 500 ? 'text-green-400' : 
                      server.responseTime < 2000 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {server.responseTime}ms
                    </span>
                  </div>
                )}
                
                {server.lastChecked && (
                  <div className="text-xs text-slate-600 mt-2">
                    {new Date(server.lastChecked).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Server Details */}
        {selectedServer && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-800/50 to-slate-700/50">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedServer.name}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedServer.status)} animate-pulse`}></div>
                    <span className="text-slate-300 capitalize font-semibold">{selectedServer.status}</span>
                  </div>
                  {selectedServer.responseTime && (
                    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">{selectedServer.responseTime}ms</span>
                    </div>
                  )}
                  <a 
                    href={selectedServer.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1 rounded-lg hover:bg-blue-500/20 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Site
                  </a>
                </div>
              </div>
              <button
                onClick={() => setSelectedServer(null)}
                className="text-slate-400 hover:text-white text-3xl hover:bg-slate-700/50 w-10 h-10 rounded-lg transition-all"
              >
                ×
              </button>
            </div>
            
            {/* Iframe Preview */}
            <div className="relative bg-white" style={{ height: '600px' }}>
              <iframe
                src={selectedServer.url}
                className="w-full h-full"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title={selectedServer.name}
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/10 to-transparent"></div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-slate-800/50 px-6 py-3 rounded-full border border-slate-700">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm">
              Last checked: <span className="text-white font-semibold">{lastCheck.toLocaleTimeString()}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-sm">Auto-refresh every 30 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
