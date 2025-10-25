import React from 'react';
import { Globe, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const ServerCard = ({ server, isSelected, onClick }) => {
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

  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-xl border transition-all hover:scale-105 hover:shadow-2xl relative overflow-hidden group ${
        isSelected
          ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20'
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(server.status)} animate-pulse`}></div>
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
  );
};

export default ServerCard;
