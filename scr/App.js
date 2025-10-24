import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trash2, Plus, Play, Pause } from 'lucide-react';

export default function MultiServerDSTAT() {
  const [servers, setServers] = useState([
    { id: 1, name: 'Server 1', url: 'http://147.135.252.68:20050/', active: false, data: [], current: 0, peak: 0, avg: 0, history: [] },
    { id: 2, name: 'Server 2', url: 'ws://example2.com:8080', active: false, data: [], current: 0, peak: 0, avg: 0, history: [] }
  ]);
  const [newServerName, setNewServerName] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const wsRefs = useRef({});

  const connectToServer = (serverId) => {
    const server = servers.find(s => s.id === serverId);
    if (!server || wsRefs.current[serverId]) return;

    try {
      const ws = new WebSocket(server.url);
      
      ws.onopen = () => {
        setServers(prev => prev.map(s => 
          s.id === serverId ? { ...s, active: true } : s
        ));
      };

      ws.onclose = () => {
        setServers(prev => prev.map(s => 
          s.id === serverId ? { ...s, active: false } : s
        ));
        delete wsRefs.current[serverId];
      };

      ws.onerror = () => {
        setServers(prev => prev.map(s => 
          s.id === serverId ? { ...s, active: false } : s
        ));
      };

      ws.onmessage = (event) => {
        const requests = Number(event.data);
        const time = Date.now();
        
        setServers(prev => prev.map(s => {
          if (s.id === serverId) {
            const newHistory = [...s.history, requests].slice(-60);
            const newData = [...s.data, { time, requests }].slice(-60);
            const newPeak = Math.max(s.peak, requests);
            const newAvg = Math.round(newHistory.reduce((a, b) => a + b, 0) / newHistory.length);
            
            return {
              ...s,
              current: requests,
              peak: newPeak,
              avg: newAvg,
              history: newHistory,
              data: newData
            };
          }
          return s;
        }));
      };

      wsRefs.current[serverId] = ws;
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const disconnectFromServer = (serverId) => {
    if (wsRefs.current[serverId]) {
      wsRefs.current[serverId].close();
      delete wsRefs.current[serverId];
    }
  };

  const addServer = () => {
    if (newServerName && newServerUrl) {
      const newServer = {
        id: Date.now(),
        name: newServerName,
        url: newServerUrl,
        active: false,
        data: [],
        current: 0,
        peak: 0,
        avg: 0,
        history: []
      };
      setServers([...servers, newServer]);
      setNewServerName('');
      setNewServerUrl('');
    }
  };

  const removeServer = (serverId) => {
    disconnectFromServer(serverId);
    setServers(servers.filter(s => s.id !== serverId));
  };

  const toggleConnection = (serverId) => {
    const server = servers.find(s => s.id === serverId);
    if (server.active) {
      disconnectFromServer(serverId);
    } else {
      connectToServer(serverId);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(wsRefs.current).forEach(ws => ws.close());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Multi-Server DSTAT Monitor</h1>
        
        {/* Add Server Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Server</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Server Name"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="WebSocket URL (ws://example.com:8080)"
              value={newServerUrl}
              onChange={(e) => setNewServerUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addServer}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus size={20} /> Add
            </button>
          </div>
        </div>

        {/* Server Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {servers.map(server => (
            <div key={server.id} className="bg-white rounded-lg shadow">
              {/* Server Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${server.active ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <h3 className="font-semibold text-lg">{server.name}</h3>
                    <p className="text-sm text-gray-500">{server.url}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleConnection(server.id)}
                    className={`p-2 rounded-lg ${server.active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                  >
                    {server.active ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={() => removeServer(server.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Current</div>
                  <div className="text-2xl font-bold text-gray-800">{server.current}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Peak</div>
                  <div className="text-2xl font-bold text-gray-800">{server.peak}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Average</div>
                  <div className="text-2xl font-bold text-gray-800">{server.avg}</div>
                </div>
              </div>

              {/* Chart */}
              <div className="p-4 h-64">
                {server.data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={server.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(time) => new Date(time).toLocaleTimeString()}
                        formatter={(value) => [`${value} RPS`, 'Requests']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="requests" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    {server.active ? 'Waiting for data...' : 'Not connected'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
