import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers } from '../store/slices/playersSlice';
import { fetchTeams } from '../store/slices/teamsSlice';
import { fetchFixtures } from '../store/slices/fixturesSlice';
import { fetchResults } from '../store/slices/resultsSlice';
import {
  UserGroupIcon,
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  TrophyIcon,
  PlusIcon,
  PencilIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const MyTeam = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { players, loading: playersLoading } = useSelector((state) => state.players);
  const { teams, loading: teamsLoading } = useSelector((state) => state.teams);
  const { fixtures, loading: fixturesLoading } = useSelector((state) => state.fixtures);
  const { results, loading: resultsLoading } = useSelector((state) => state.results);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  useEffect(() => {
    dispatch(fetchPlayers());
    dispatch(fetchTeams());
    dispatch(fetchFixtures());
    dispatch(fetchResults());
  }, [dispatch]);

  // Get coach's assigned team based on coach_id relationship
  // Try multiple ways to match coach to team
  const coachTeam = teams.find(team => {
    // Check direct coach_id match
    if (team.coach_id === user?.id) return true;
    
    // Check nested coach object
    if (team.coach?.id === user?.id) return true;
    
    // Check if coach_id is a string and user.id is a number or vice versa
    if (String(team.coach_id) === String(user?.id)) return true;
    if (String(team.coach?.id) === String(user?.id)) return true;
    
    return false;
  }) || (teams.length > 0 ? teams[0] : null); // Fallback to first team for testing

  // Debug: Log team assignment information
  console.log('Coach Team Debug:', {
    userId: user?.id,
    userRole: user?.role,
    teamsCount: teams.length,
    coachTeam: coachTeam,
    teamCoachIds: teams.map(t => ({ id: t.id, coach_id: t.coach_id, coach: t.coach }))
  });
  
  // Filter players to only show players from the coach's team
  const myPlayers = players.filter(player => {
    const playerTeamId = player.team_id || player.teamId || player.team?.id;
    const coachTeamId = coachTeam?.id || coachTeam?.team_id;
    return String(playerTeamId) === String(coachTeamId);
  });

  // Get team-specific fixtures and results
  const teamFixtures = coachTeam ? 
    fixtures.filter(f => {
      const homeTeamId = f.home_team_id || f.homeTeamId || f.home_team?.id;
      const awayTeamId = f.away_team_id || f.awayTeamId || f.away_team?.id;
      const coachTeamId = coachTeam?.id || coachTeam?.team_id;
      
      return String(homeTeamId) === String(coachTeamId) || String(awayTeamId) === String(coachTeamId);
    }) : [];
  
  const teamResults = coachTeam ? 
    results.filter(r => {
      const fixture = fixtures.find(f => f.id === r.fixture_id || f.fixture_id === r.fixture_id);
      if (!fixture) return false;
      
      const homeTeamId = fixture.home_team_id || fixture.homeTeamId || fixture.home_team?.id;
      const awayTeamId = fixture.away_team_id || fixture.awayTeamId || fixture.away_team?.id;
      const coachTeamId = coachTeam?.id || coachTeam?.team_id;
      
      return String(homeTeamId) === String(coachTeamId) || String(awayTeamId) === String(coachTeamId);
    }) : [];

  const upcomingMatches = teamFixtures.filter(f => f.status === 'Scheduled').slice(0, 3);
  const recentResults = teamResults.slice(0, 3);

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setShowAddPlayer(true);
  };

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setShowAddPlayer(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Team Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your assigned team. You can edit players but cannot delete the team.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            onClick={handleAddPlayer}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Player
          </button>
        </div>
      </div>

      {/* Coach's Team Information */}
      {coachTeam ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {coachTeam.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {coachTeam.league?.name || 'No league assigned'} • Your Team
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Coach: {user?.firstName} {user?.lastName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Coach
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {myPlayers.length} players
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No Team Assigned
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You haven't been assigned to a team yet. Please contact an administrator to assign you to a team.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {coachTeam && (
        <>
          {/* Team Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Team Players
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {myPlayers.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Upcoming Matches
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {upcomingMatches.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Matches Played
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {recentResults.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrophyIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Team Wins
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {recentResults.filter(r => 
                          (r.home_team?.id === coachTeam.id && r.home_score > r.away_score) ||
                          (r.away_team?.id === coachTeam.id && r.away_score > r.home_score)
                        ).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Players */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Team Players
                </h3>
                <span className="text-sm text-gray-500">
                  {myPlayers.length} players
                </span>
              </div>
              
              {myPlayers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {myPlayers.map((player) => (
                    <div key={player.id || player.player_id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <UserIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              {player.first_name} {player.last_name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {player.position || 'No position'} • #{player.jersey_number || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPlayer(player)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit player"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No players in your team</h3>
                  <p className="mt-1 text-sm text-gray-500">Add players to start managing your team.</p>
                  <div className="mt-4">
                    <button
                      onClick={handleAddPlayer}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      Add First Player
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Upcoming Matches
                  </h3>
                  <ClockIcon className="ml-2 h-4 w-4 text-gray-400" />
                </div>
                <div className="mt-4">
                  {upcomingMatches.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingMatches.map((fixture) => (
                        <div key={fixture.id || fixture.fixture_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {fixture.home_team?.name || 'Team A'} vs {fixture.away_team?.name || 'Team B'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {fixture.match_date ? new Date(fixture.match_date).toLocaleDateString() : 'TBD'} at {fixture.venue?.name || 'TBD'}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                              {coachTeam && (
                                String(fixture.home_team_id || fixture.homeTeamId || fixture.home_team?.id) === String(coachTeam.id || coachTeam.team_id) 
                                  ? 'Home Match' 
                                  : 'Away Match'
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Scheduled
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming matches</h3>
                      <p className="mt-1 text-sm text-gray-500">Matches will appear here when scheduled.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Results */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Results
                </h3>
                <div className="mt-4">
                  {recentResults.length > 0 ? (
                    <div className="space-y-3">
                      {recentResults.map((result) => (
                        <div key={result.id || result.fixture_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {result.home_team?.name || 'Team A'} vs {result.away_team?.name || 'Team B'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {result.match_date ? new Date(result.match_date).toLocaleDateString() : 'Completed'}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                              {coachTeam && (
                                String(result.home_team?.id || result.home_team_id) === String(coachTeam.id || coachTeam.team_id) 
                                  ? 'Home Match' 
                                  : 'Away Match'
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {result.home_score} - {result.away_score}
                            </p>
                            <div className="flex items-center">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-xs text-gray-500">Completed</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No recent results</h3>
                      <p className="mt-1 text-sm text-gray-500">Results will appear here after matches are completed.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPlayer ? 'Edit Player' : 'Add New Player'}
              </h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter first name"
                    defaultValue={editingPlayer?.first_name || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter last name"
                    defaultValue={editingPlayer?.last_name || ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select position</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Defender">Defender</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Forward">Forward</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Jersey Number
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter jersey number"
                    defaultValue={editingPlayer?.jersey_number || ''}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddPlayer(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingPlayer ? 'Update Player' : 'Add Player'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTeam;
