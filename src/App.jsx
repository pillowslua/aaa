import React, { useState, useEffect } from 'react';
import { Activity, Globe, Server, AlertCircle, CheckCircle, Clock, ExternalLink, Zap, Shield } from 'lucide-react';
import { checkAllServers } from './utils/monitoring';
import ServerCard from './components/ServerCard';
import StatsCard from './components/StatsCard';

// ⚠️ THAY ĐỔI URLs CỦA BẠN Ở ĐÂY
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

  // Check if selected server is HTTP
  const isHttpUrl = selectedServer?.url.startsWith('http://');

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
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedServer.name}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-lg">
                    <span className="text-slate-300 capitalize font-semibold">{selectedServer.status}</span>
                  </div>
                  {selectedServer.method && (
                    <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-lg">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-xs">via {selectedServer.method}</span>
                    </div>
                  )}
                  <a 
                    href={selectedServer.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Site
                  </a>
                </div>
              </div>
              <button
                onClick={() => setSelectedServer(null)}
                className="text-slate-400 hover:text-white text-3xl"
              >
                ×
              </button>
            </div>
            
            {/* Preview - Show warning for HTTP or iframe for HTTPS */}
            {isHttpUrl ? (
              <div className="relative bg-slate-900/50" style={{ height: '600px' }}>
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Shield className="w-24 h-24 text-yellow-500 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-3">HTTP Website Detected</h3>
                  <p className="text-slate-400 mb-6 max-w-md">
                    Cannot display HTTP content in preview due to browser security (Mixed Content Policy).
                    <br/><br/>
                    Status monitoring is working via API. Click "Visit Site" to open in new tab.
                  </p>
                  <div className="flex gap-4">
                    <a 
                      href={selectedServer.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2 font-semibold"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Open in New Tab
                    </a>
                  </div>
                  <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-400">
                      <strong className="text-white">Server Status:</strong>
                      <div className="mt-2 space-y-1">
                        <div>Status: <span className="text-green-400">{selectedServer.status}</span></div>
                        <div>Response Time: <span className="text-blue-400">{selectedServer.responseTime}ms</span></div>
                        <div>Last Check: <span className="text-slate-300">{new Date(selectedServer.lastChecked).toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative bg-white" style={{ height: '600px' }}>
                <iframe
                  src={selectedServer.url}
                  className="w-full h-full"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  title={selectedServer.name}
                />
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-slate-800/50 px-6 py-3 rounded-full border border-slate-700">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm">
              Last checked: <span className="text-white font-semibold">{lastCheck.toLocaleTimeString()}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
