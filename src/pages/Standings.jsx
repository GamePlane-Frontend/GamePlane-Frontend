import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeagues } from '../store/slices/leaguesSlice';
import { fetchTeams } from '../store/slices/teamsSlice';
import { fetchResults } from '../store/slices/resultsSlice';
import { TrophyIcon, UserGroupIcon, ChartBarIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';

const Standings = () => {
  const dispatch = useDispatch();
  const { leagues, loading: leaguesLoading } = useSelector((state) => state.leagues);
  const { teams, loading: teamsLoading } = useSelector((state) => state.teams);
  const { results, loading: resultsLoading } = useSelector((state) => state.results);
  const { user } = useSelector((state) => state.auth);

  const [selectedLeague, setSelectedLeague] = useState('');

  useEffect(() => {
    dispatch(fetchLeagues());
    dispatch(fetchTeams());
    dispatch(fetchResults());
  }, [dispatch]);

  // Mock standings data - in a real app, this would come from the backend
  const mockStandings = [
    {
      position: 1,
      team: 'Lightning Bolts',
      teamId: 'L',
      played: 8,
      won: 6,
      drawn: 1,
      lost: 1,
      goalsFor: 18,
      goalsAgainst: 8,
      goalDifference: 10,
      points: 19,
      form: 'up'
    },
    {
      position: 2,
      team: 'Thunder Hawks',
      teamId: 'T',
      played: 8,
      won: 5,
      drawn: 2,
      lost: 1,
      goalsFor: 15,
      goalsAgainst: 7,
      goalDifference: 8,
      points: 17,
      form: 'stable'
    },
    {
      position: 3,
      team: 'Fire Dragons',
      teamId: 'F',
      played: 8,
      won: 3,
      drawn: 3,
      lost: 2,
      goalsFor: 12,
      goalsAgainst: 10,
      goalDifference: 2,
      points: 12,
      form: 'down'
    },
    {
      position: 4,
      team: 'Storm Eagles',
      teamId: 'S',
      played: 8,
      won: 1,
      drawn: 2,
      lost: 5,
      goalsFor: 6,
      goalsAgainst: 16,
      goalDifference: -10,
      points: 5,
      form: 'down'
    }
  ];

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <TrophyIcon className="h-5 w-5 text-yellow-600" />;
      case 2:
        return <div className="h-5 w-5 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-gray-600">2</span>
        </div>;
      case 3:
        return <div className="h-5 w-5 bg-orange-300 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-orange-600">3</span>
        </div>;
      default:
        return <div className="h-5 w-5 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-gray-600">{position}</span>
        </div>;
    }
  };

  const getFormIcon = (form) => {
    switch (form) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTeamColor = (teamId) => {
    switch (teamId) {
      case 'L': return 'bg-blue-100 text-blue-800';
      case 'T': return 'bg-teal-100 text-teal-800';
      case 'F': return 'bg-red-100 text-red-800';
      case 'S': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loading = leaguesLoading || teamsLoading || resultsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            League Standings
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <span className="text-sm text-gray-500">2024 Spring Season</span>
        </div>
      </div>

      {/* League Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <TrophyIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Premier Youth League Table</h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    POSITION
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TEAM
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    W
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    D
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    L
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GF
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GA
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GD
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PTS
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FORM
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockStandings.map((team) => (
                  <tr key={team.team} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPositionIcon(team.position)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${getTeamColor(team.teamId)}`}>
                          <span className="text-sm font-bold text-white">{team.teamId}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{team.team}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {team.played}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                      {team.won}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-orange-600 font-medium">
                      {team.drawn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">
                      {team.lost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {team.goalsFor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {team.goalsAgainst}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-center text-sm font-medium ${
                      team.goalDifference > 0 ? 'text-green-600' : 
                      team.goalDifference < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                      {team.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getFormIcon(team.form)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <div className="grid grid-cols-4 gap-4">
                <div>P: Played</div>
                <div>W: Won</div>
                <div>D: Drawn</div>
                <div>L: Lost</div>
                <div>GF: Goals For</div>
                <div>GA: Goals Against</div>
                <div>GD: Goal Difference</div>
                <div>Pts: Points</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Standings;

