import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLeagues } from '../store/slices/leaguesSlice';
import {
  fetchTeams as fetchAllTeams,
} from '../store/slices/teamsSlice';
import {
  fetchFixtures as fetchAllFixtures,
} from '../store/slices/fixturesSlice';
import {
  fetchResults as fetchAllResults,
} from '../store/slices/resultsSlice';
import {
  TrophyIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { leagues, loading: leaguesLoading } = useSelector((state) => state.leagues);
  const { teams, loading: teamsLoading } = useSelector((state) => state.teams);
  const { fixtures, loading: fixturesLoading } = useSelector((state) => state.fixtures);
  const { results, loading: resultsLoading } = useSelector((state) => state.results);

  useEffect(() => {
    dispatch(fetchLeagues());
    dispatch(fetchAllTeams());
    dispatch(fetchAllFixtures());
    dispatch(fetchAllResults());
  }, [dispatch]);

  const stats = [
    {
      name: 'Total Leagues',
      value: leagues.length,
      icon: TrophyIcon,
      color: 'bg-blue-500',
      href: '/leagues',
    },
    {
      name: 'Total Teams',
      value: teams.length,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      href: '/teams',
    },
    {
      name: 'Upcoming Fixtures',
      value: fixtures.filter(f => f.status === 'Scheduled').length,
      icon: CalendarIcon,
      color: 'bg-yellow-500',
      href: '/fixtures',
    },
    {
      name: 'Completed Matches',
      value: results.length,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      href: '/results',
    },
  ];

  const quickActions = [
    {
      name: 'Create League',
      description: 'Add a new league to the system',
      href: '/leagues',
      icon: PlusIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Add Team',
      description: 'Register a new team',
      href: '/teams',
      icon: PlusIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Schedule Fixture',
      description: 'Create a new match fixture',
      href: '/fixtures',
      icon: PlusIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Record Result',
      description: 'Add match results and scores',
      href: '/results',
      icon: PlusIcon,
      color: 'bg-purple-500',
    },
  ];

  const recentFixtures = fixtures.slice(0, 5);
  const recentResults = results.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your GamePlan system today.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div>
                    <span className={`${action.color} rounded-lg inline-flex p-3 ring-4 ring-white`}>
                      <Icon className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" />
                      {action.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Fixtures */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Fixtures
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentFixtures.length > 0 ? (
                  recentFixtures.map((fixture, index) => (
                    <li key={fixture.id}>
                      <div className="relative pb-8">
                        {index !== recentFixtures.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <CalendarIcon className="h-5 w-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {fixture.homeTeam?.name} vs {fixture.awayTeam?.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(fixture.date).toLocaleDateString()} at {fixture.venue?.name}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                fixture.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                fixture.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {fixture.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">No fixtures found</li>
                )}
              </ul>
            </div>
            <div className="mt-6">
              <Link
                to="/fixtures"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View all fixtures
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Results */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Results
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentResults.length > 0 ? (
                  recentResults.map((result, index) => (
                    <li key={result.id}>
                      <div className="relative pb-8">
                        {index !== recentResults.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                              <ChartBarIcon className="h-5 w-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {result.fixture?.homeTeam?.name} vs {result.fixture?.awayTeam?.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(result.fixture?.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <span className="font-semibold">
                                {result.homeScore} - {result.awayScore}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">No results found</li>
                )}
              </ul>
            </div>
            <div className="mt-6">
              <Link
                to="/results"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View all results
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
