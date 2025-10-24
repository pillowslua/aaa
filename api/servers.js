export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Danh sách 10 servers trống - bạn có thể update URLs thực tế
  const servers = [
    {
      id: 1,
      name: 'US-East-1',
      url: '', // Để trống - bạn điền URL thực tế
      wsUrl: '', // WebSocket URL
      ip: '142.250.185.46',
      location: 'US',
      region: 'Virginia',
      flag: '🇺🇸'
    },
    {
      id: 2,
      name: 'US-West-2',
      url: '',
      wsUrl: '',
      ip: '35.247.243.240',
      location: 'US',
      region: 'Oregon',
      flag: '🇺🇸'
    },
    {
      id: 3,
      name: 'UK-London',
      url: '',
      wsUrl: '',
      ip: '35.242.133.81',
      location: 'UK',
      region: 'London',
      flag: '🇬🇧'
    },
    {
      id: 4,
      name: 'EU-Frankfurt',
      url: '',
      wsUrl: '',
      ip: '34.107.221.82',
      location: 'DE',
      region: 'Frankfurt',
      flag: '🇩🇪'
    },
    {
      id: 5,
      name: 'ASIA-Singapore',
      url: '',
      wsUrl: '',
      ip: '34.87.139.26',
      location: 'SG',
      region: 'Singapore',
      flag: '🇸🇬'
    },
    {
      id: 6,
      name: 'ASIA-Tokyo',
      url: '',
      wsUrl: '',
      ip: '35.187.226.24',
      location: 'JP',
      region: 'Tokyo',
      flag: '🇯🇵'
    },
    {
      id: 7,
      name: 'AU-Sydney',
      url: '',
      wsUrl: '',
      ip: '35.201.5.13',
      location: 'AU',
      region: 'Sydney',
      flag: '🇦🇺'
    },
    {
      id: 8,
      name: 'CA-Toronto',
      url: '',
      wsUrl: '',
      ip: '35.203.43.61',
      location: 'CA',
      region: 'Toronto',
      flag: '🇨🇦'
    },
    {
      id: 9,
      name: 'BR-SaoPaulo',
      url: '',
      wsUrl: '',
      ip: '35.198.10.68',
      location: 'BR',
      region: 'São Paulo',
      flag: '🇧🇷'
    },
    {
      id: 10,
      name: 'IN-Mumbai',
      url: '',
      wsUrl: '',
      ip: '34.93.197.58',
      location: 'IN',
      region: 'Mumbai',
      flag: '🇮🇳'
    }
  ];

  // GET - Lấy danh sách servers
  if (req.method === 'GET') {
    return res.status(200).json({ 
      success: true,
      servers,
      count: servers.length 
    });
  }

  // POST - Thêm server mới
  if (req.method === 'POST') {
    const newServer = req.body;
    // Trong thực tế, bạn sẽ lưu vào database
    return res.status(201).json({ 
      success: true,
      message: 'Server added successfully',
      server: newServer 
    });
  }

  // PUT - Update server
  if (req.method === 'PUT') {
    const { id } = req.query;
    const updatedData = req.body;
    return res.status(200).json({ 
      success: true,
      message: 'Server updated successfully',
      serverId: id 
    });
  }

  // DELETE - Xóa server
  if (req.method === 'DELETE') {
    const { id } = req.query;
    return res.status(200).json({ 
      success: true,
      message: 'Server deleted successfully',
      serverId: id 
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
