import { useState } from 'react';
import { useDispatch } from 'react-redux';
import api from '../services/api';

const DebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const dispatch = useDispatch();

  const [testResults, setTestResults] = useState('');

  const testPlayerOperation = async () => {
    setTestResults('Testing player operation...');
    try {
      // Test creating a simple player
      const testPlayerData = {
        firstName: 'Test',
        lastName: 'Player',
        teamId: '1', // Assuming team ID 1 exists
        position: 'MF',
        number: '99'
      };
      
      console.log('🧪 Testing player creation with data:', testPlayerData);
      const response = await api.post('/players', {
        first_name: testPlayerData.firstName,
        last_name: testPlayerData.lastName,
        position: testPlayerData.position,
        jersey_number: Number(testPlayerData.number),
        team_id: testPlayerData.teamId // Keep as string since team_id is String type
      });
      
      setTestResults(`✅ Player creation successful: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setTestResults(`❌ Player creation failed: ${error.message}\nResponse: ${JSON.stringify(error.response?.data, null, 2)}`);
    }
  };

  const runDebugTests = async () => {
    const info = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Check localStorage
    info.tests.localStorage = {
      token: localStorage.getItem('token') ? 'Present' : 'Missing',
      user: localStorage.getItem('user') ? 'Present' : 'Missing'
    };

    // Test 2: Check API base URL
    info.tests.apiConfig = {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api',
      nodeEnv: import.meta.env.NODE_ENV
    };

    // Test 3: Test API connectivity
    try {
      const response = await api.get('/players');
      info.tests.apiConnectivity = {
        status: 'success',
        statusCode: response.status,
        dataLength: response.data?.data?.length || 0
      };
    } catch (error) {
      info.tests.apiConnectivity = {
        status: 'error',
        message: error.message,
        statusCode: error.response?.status,
        responseData: error.response?.data
      };
    }

    // Test 4: Test teams endpoint
    try {
      const response = await api.get('/teams');
      info.tests.teamsEndpoint = {
        status: 'success',
        statusCode: response.status,
        dataLength: response.data?.data?.length || 0,
        sampleTeam: response.data?.data?.[0] || null,
        teamIds: response.data?.data?.map(t => ({ team_id: t.team_id, id: t.id, _id: t._id })) || []
      };
    } catch (error) {
      info.tests.teamsEndpoint = {
        status: 'error',
        message: error.message,
        statusCode: error.response?.status,
        responseData: error.response?.data
      };
    }

    // Test 5: Test specific player operations
    try {
      // First get a list of players to see if any exist
      const playersResponse = await api.get('/players');
      const players = playersResponse.data?.data || [];
      
      info.tests.playerOperations = {
        totalPlayers: players.length,
        samplePlayer: players[0] || null,
        playerIds: players.map(p => ({ player_id: p.player_id, id: p.id, _id: p._id, team_id: p.team_id }))
      };

      // If we have players, try to fetch one by ID
      if (players.length > 0) {
        const firstPlayer = players[0];
        const playerId = firstPlayer.player_id || firstPlayer.id || firstPlayer._id;
        
        try {
          const playerResponse = await api.get(`/players/${playerId}`);
          info.tests.playerOperations.fetchById = {
            status: 'success',
            playerId: playerId,
            response: playerResponse.data
          };
        } catch (fetchError) {
          info.tests.playerOperations.fetchById = {
            status: 'error',
            playerId: playerId,
            message: fetchError.message,
            statusCode: fetchError.response?.status,
            responseData: fetchError.response?.data
          };
        }
      }
    } catch (error) {
      info.tests.playerOperations = {
        status: 'error',
        message: error.message,
        statusCode: error.response?.status,
        responseData: error.response?.data
      };
    }

    setDebugInfo(info);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded text-sm z-50"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 mb-3">
        <button
          onClick={runDebugTests}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm"
        >
          Run Debug Tests
        </button>
        <button
          onClick={testPlayerOperation}
          className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm"
        >
          Test Player Creation
        </button>
      </div>
      
      {testResults && (
        <div className="text-xs mb-3">
          <h4 className="font-bold mb-1">Test Results:</h4>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-32 text-xs">
            {testResults}
          </pre>
        </div>
      )}
      
      {Object.keys(debugInfo).length > 0 && (
        <div className="text-xs">
          <h4 className="font-bold mb-1">Debug Info:</h4>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-64">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
