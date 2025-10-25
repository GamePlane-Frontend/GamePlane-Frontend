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
  ArrowUpIcon,
  InformationCircleIcon,
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
      name: 'Active Leagues',
      value: leagues.length,
      change: '+12%',
      icon: TrophyIcon,
      color: 'bg-blue-500',
      href: '/leagues',
    },
    {
      name: 'Total Teams',
      value: teams.length,
      change: '+8%',
      icon: UserGroupIcon,
      color: 'bg-green-500',
      href: '/teams',
    },
    {
      name: 'Upcoming Fixtures',
      value: fixtures.filter(f => f.status === 'Scheduled').length,
      change: '+15%',
      icon: CalendarIcon,
      color: 'bg-orange-500',
      href: '/fixtures',
    },
    {
      name: 'Matches Played',
      value: results.length,
      change: '+23%',
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
            Admin Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening in your leagues.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
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
                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  <ArrowUpIcon className="self-center flex-shrink-0 h-3 w-3 text-green-500" />
                  <span className="sr-only">Increased by</span>
                  {stat.change}
                </div>
              </dd>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity and League Standings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Activity
              </h3>
              <InformationCircleIcon className="ml-2 h-4 w-4 text-gray-400" />
            </div>
            <div className="flow-root mt-4">
              <ul className="-mb-8">
                <li>
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                          <span className="text-white text-xs font-bold">✓</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <p className="text-sm text-gray-500">
                          New team "Storm Eagles" registered
                        </p>
                        <p className="text-xs text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="relative pb-8">
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                          <span className="text-white text-xs font-bold">!</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <p className="text-sm text-gray-500">
                          Match result submitted for approval
                        </p>
                        <p className="text-xs text-gray-400">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="relative pb-8">
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <span className="text-white text-xs font-bold">S</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <p className="text-sm text-gray-500">
                          Season "2024 Spring" started
                        </p>
                        <p className="text-xs text-gray-400">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="relative">
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                          <span className="text-white text-xs font-bold">R</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <p className="text-sm text-gray-500">
                          Referee assigned to upcoming match
                        </p>
                        <p className="text-xs text-gray-400">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* League Standings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              League Standings
            </h3>
            <div className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <TrophyIcon className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Lightning Bolts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">19 pts</p>
                    <p className="text-xs text-gray-500">8 played</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">2</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Thunder Hawks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">17 pts</p>
                    <p className="text-xs text-gray-500">8 played</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-orange-600">3</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Fire Dragons</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">12 pts</p>
                    <p className="text-xs text-gray-500">8 played</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">4</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Storm Eagles</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">5 pts</p>
                    <p className="text-xs text-gray-500">8 played</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
