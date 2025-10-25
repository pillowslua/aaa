import React, { useState, useEffect } from 'react';
import { Activity, Globe, Server, AlertCircle, CheckCircle, Clock, ExternalLink, Zap, Shield } from 'lucide-react';
import { checkAllServers } from './utils/monitoring';
import ServerCard from './components/ServerCard';
import StatsCard from './components/StatsCard';

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

function App() {
  const [servers, setServers] = useState(
    SERVER_CONFIG.map(s => ({ ...s, status: 'checking', responseTime: null, lastChecked: null }))
  );
  const [selectedServer, setSelectedServer] = useState(null);
  const [lastCheck, setLastCheck] = useState(new Date());
  const [isChecking, setIsChecking] = useState(false);

  const checkAllServersHandler = async () => {
    setIsChecking(true);
    const results = await checkAllServers(servers);
    setServers(results);
    setLastCheck(new Date());
    setIsChecking(false);
  };

  useEffect(() => {
    checkAllServersHandler();
    const interval = setInterval(checkAllServersHandler, 30000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = servers.filter(s => s.status === 'online').length;
  const offlineCount = servers.filter(s => ['offline', 'error', 'timeout'].includes(s.status)).length;
  const avgResponseTime = servers
    .filter(s => s.responseTime)
    .reduce((acc, s) => acc + s.responseTime, 0) / servers.filter(s => s.responseTime).length || 0;

  // Check if selected server is HTTP - use proxy
  const isHttpUrl = selectedServer?.url.startsWith('http://');
  const iframeUrl = isHttpUrl 
    ? `/api/proxy?url=${encodeURIComponent(selectedServer.url)}`
    : selectedServer?.url;

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
                onClick={checkAllServersHandler}
                disabled={isChecking}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
              >
                <Activity className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Refresh All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Servers" value={servers.length} icon={Server} color="slate" />
          <StatsCard title="Online" value={onlineCount} icon={CheckCircle} color="green" />
          <StatsCard title="Issues" value={offlineCount} icon={AlertCircle} color="red" />
          <StatsCard title="Avg Response" value={`${avgResponseTime.toFixed(0)}ms`} icon={Zap} color="blue" />
        </div>

        {/* Servers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              isSelected={selectedServer?.id === server.id}
              onClick={() => setSelectedServer(server)}
            />
          ))}
        </div>

        {/* Selected Server Preview */}
        {selectedServer && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-800/50 to-slate-700/50">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedServer.name}</h2>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedServer.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    } animate-pulse`}></div>
                    <span className="text-slate-300 capitalize font-semibold">{selectedServer.status}</span>
                  </div>
                  {selectedServer.responseTime && (
                    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-lg">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-slate-300">{selectedServer.responseTime}ms</span>
                    </div>
                  )}
                  {isHttpUrl && (
                    <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/30">
                      <Shield className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 text-xs">via Proxy</span>
                    </div>
                  )}
                  <a 
                    href={selectedServer.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1 rounded-lg hover:bg-blue-500/20 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Direct
                  </a>
                </div>
              </div>
              <button
                onClick={() => setSelectedServer(null)}
                className="text-slate-400 hover:text-white text-3xl hover:bg-slate-700/50 w-10 h-10 rounded-lg transition-all ml-4"
              >
                ×
              </button>
            </div>
            
            {/* Iframe Preview - Works for both HTTP and HTTPS via proxy */}
            <div className="relative bg-white" style={{ height: '600px' }}>
              <iframe
                key={iframeUrl}
                src={iframeUrl}
                className="w-full h-full"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title={selectedServer.name}
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/10 to-transparent"></div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-slate-800/50 px-6 py-3 rounded-full border border-slate-700">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm">
              Last checked: <span className="text-white font-semibold">{lastCheck.toLocaleTimeString()}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-sm">Auto-refresh every 30s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
