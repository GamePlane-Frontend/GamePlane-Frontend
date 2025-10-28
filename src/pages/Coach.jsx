import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLeagues } from '../store/slices/leaguesSlice';
import { fetchTeams } from '../store/slices/teamsSlice';
import { fetchPlayers } from '../store/slices/playersSlice';
import { fetchFixtures } from '../store/slices/fixturesSlice';
import { fetchResults } from '../store/slices/resultsSlice';
import {
  TrophyIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  MapPinIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Coach = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { leagues, loading: leaguesLoading } = useSelector((state) => state.leagues);
  const { teams, loading: teamsLoading } = useSelector((state) => state.teams);
  const { players, loading: playersLoading } = useSelector((state) => state.players);
  const { fixtures, loading: fixturesLoading } = useSelector((state) => state.fixtures);
  const { results, loading: resultsLoading } = useSelector((state) => state.results);

  useEffect(() => {
    dispatch(fetchLeagues());
    dispatch(fetchTeams());
    dispatch(fetchPlayers());
    dispatch(fetchFixtures());
    dispatch(fetchResults());
  }, [dispatch]);

  // Get coach's assigned team
  const coachTeam = teams.find(team => {
    // Check direct coach_id match
    if (team.coach_id === user?.id) return true;
    
    // Check nested coach object
    if (team.coach?.id === user?.id) return true;
    
    // Check if coach_id is a string and user.id is a number or vice versa
    if (String(team.coach_id) === String(user?.id)) return true;
    if (String(team.coach?.id) === String(user?.id)) return true;
    
    return false;
  });

  // Filter data for coach's team
  const myPlayers = players.filter(player => {
    const playerTeamId = player.team_id || player.teamId || player.team?.id;
    const coachTeamId = coachTeam?.id || coachTeam?.team_id;
    return String(playerTeamId) === String(coachTeamId);
  });

  // Filter fixtures for coach's team (both home and away matches)
  const teamFixtures = fixtures.filter(fixture => {
    const homeTeamId = fixture.home_team_id || fixture.homeTeamId || fixture.home_team?.id;
    const awayTeamId = fixture.away_team_id || fixture.awayTeamId || fixture.away_team?.id;
    const coachTeamId = coachTeam?.id || coachTeam?.team_id;
    
    return String(homeTeamId) === String(coachTeamId) || String(awayTeamId) === String(coachTeamId);
  });

  const upcomingFixtures = teamFixtures.filter(f => f.status === 'Scheduled').slice(0, 5);
  const recentResults = results.filter(result => {
    const fixture = fixtures.find(f => f.id === result.fixture_id || f.fixture_id === result.fixture_id);
    if (!fixture) return false;
    
    const homeTeamId = fixture.home_team_id || fixture.homeTeamId || fixture.home_team?.id;
    const awayTeamId = fixture.away_team_id || fixture.awayTeamId || fixture.away_team?.id;
    const coachTeamId = coachTeam?.id || coachTeam?.team_id;
    
    return String(homeTeamId) === String(coachTeamId) || String(awayTeamId) === String(coachTeamId);
  }).slice(0, 5);

  const coachStats = [
    {
      name: 'My Players',
      value: myPlayers.length,
      change: coachTeam ? `${myPlayers.length} players` : 'No team assigned',
      icon: UsersIcon,
      color: 'bg-blue-500',
      href: '/app/my-team',
    },
    {
      name: 'Upcoming Matches',
      value: upcomingFixtures.length,
      change: coachTeam ? `${upcomingFixtures.length} scheduled` : 'No team assigned',
      icon: CalendarIcon,
      color: 'bg-green-500',
      href: '/app/fixtures',
    },
    {
      name: 'Team Results',
      value: recentResults.length,
      change: coachTeam ? `${recentResults.length} recent` : 'No team assigned',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      href: '/app/results',
    },
    {
      name: 'My Team',
      value: coachTeam ? coachTeam.name : 'Not Assigned',
      change: coachTeam ? 'Active' : 'Contact Admin',
      icon: TrophyIcon,
      color: 'bg-purple-500',
      href: '/app/my-team',
    },
  ];

  const quickActions = [
    {
      name: 'My Team',
      description: 'View your team details and players',
      href: '/app/my-team',
      icon: UserGroupIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Manage Players',
      description: 'View and edit your team players',
      href: '/app/players',
      icon: UsersIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Check Fixtures',
      description: 'View upcoming matches',
      href: '/app/fixtures',
      icon: CalendarIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'View Results',
      description: 'See match results and scores',
      href: '/app/results',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Coach Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.firstName || 'Coach'}! Here's your team overview and management tools.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <UserIcon className="h-4 w-4" />
            <span>Coach Role</span>
          </div>
        </div>
      </div>

      {/* Team Information */}
      {coachTeam ? (
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{coachTeam.name}</h3>
              <p className="text-blue-100 mt-1">
                {coachTeam.description || 'Your assigned team'}
              </p>
              <div className="flex items-center mt-2 space-x-4 text-sm">
                <span className="flex items-center">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  {myPlayers.length} Players
                </span>
                <span className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {upcomingFixtures.length} Upcoming Matches
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{coachTeam.name.charAt(0)}</div>
              <div className="text-sm text-blue-100">Team Initial</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-xl font-bold">No Team Assigned</h3>
              <p className="text-red-100 mt-1">
                You haven't been assigned to a team yet. Please contact an administrator to get assigned to a team.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Coach Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {coachStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <dt>
                <div className={`absolute ${stat.color} rounded-md p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  <span className="sr-only">Increased by</span>
                  {stat.change}
                </div>
              </dd>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-gray-200"
                >
                  <dt>
                    <div className={`absolute ${action.color} rounded-md p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                      {action.name}
                    </p>
                  </dt>
                  <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </dd>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity and Upcoming Matches */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Matches */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Upcoming Matches
              </h3>
              <ClockIcon className="ml-2 h-4 w-4 text-gray-400" />
            </div>
            <div className="flow-root mt-4">
              {upcomingFixtures.length > 0 ? (
                <ul className="-mb-8">
                  {upcomingFixtures.map((fixture, index) => (
                    <li key={fixture.id || fixture.fixture_id}>
                      <div className={`relative ${index < upcomingFixtures.length - 1 ? 'pb-8' : ''}`}>
                        {index < upcomingFixtures.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <CalendarIcon className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5">
                            <p className="text-sm text-gray-500">
                              {fixture.home_team?.name || 'Team A'} vs {fixture.away_team?.name || 'Team B'}
                            </p>
                            <p className="text-xs text-gray-400">
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
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming matches</h3>
                  <p className="mt-1 text-sm text-gray-500">Check back later for scheduled matches.</p>
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
                  {recentResults.map((result, index) => (
                    <div key={result.id || result.fixture_id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            result.home_score > result.away_score ? 'bg-green-100' : 
                            result.home_score < result.away_score ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <CheckCircleIcon className={`h-4 w-4 ${
                              result.home_score > result.away_score ? 'text-green-600' : 
                              result.home_score < result.away_score ? 'text-red-600' : 'text-gray-600'
                            }`} />
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {result.home_team?.name || 'Team A'} vs {result.away_team?.name || 'Team B'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {result.home_score} - {result.away_score}
                          </p>
                          <p className="text-xs text-blue-600 font-medium">
                            {coachTeam && (
                              String(result.home_team?.id || result.home_team_id) === String(coachTeam.id || coachTeam.team_id) 
                                ? 'Home Match' 
                                : 'Away Match'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {result.home_score} - {result.away_score}
                        </p>
                        <p className="text-xs text-gray-500">
                          {result.match_date || 'Completed'}
                        </p>
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

      {/* Coach Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Coach Tips
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>View your team details and players in "My Team"</li>
                <li>Manage your team's players and their information</li>
                <li>Check upcoming fixtures for your team's matches</li>
                <li>View results to track your team's performance</li>
                <li>Contact admin if you need team assignment or changes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coach;
