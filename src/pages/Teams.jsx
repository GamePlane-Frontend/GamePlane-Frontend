import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeams, createTeam, updateTeam, deleteTeam, assignCoachToTeam } from '../store/slices/teamsSlice';
import { fetchLeagues } from '../store/slices/leaguesSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Teams = () => {
  const dispatch = useDispatch();
  const { teams, loading, error } = useSelector((state) => state.teams);
  const { leagues } = useSelector((state) => state.leagues);
  const { users } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    leagueId: '',
    description: '',
    coachId: '', // Add coach selection
  });

  useEffect(() => {
    dispatch(fetchTeams());
    dispatch(fetchLeagues());
    dispatch(fetchUsers()); // Fetch users to get coaches
  }, [dispatch]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await dispatch(updateTeam({ id: editingTeam.id || editingTeam.team_id, teamData: formData })).unwrap();
      } else {
        await dispatch(createTeam(formData)).unwrap();
      }
      
      setShowModal(false);
      setEditingTeam(null);
      setFormData({
        name: '',
        leagueId: '',
        description: '',
        coachId: '', // Reset coach selection
      });
    } catch (error) {
      console.error('Failed to save team:', error);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name || '',
      leagueId: team.leagueId || team.league_id || team.league?.id || team.league?.league_id || '',
      description: team.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const deleteId = id || editingTeam?.id || editingTeam?.team_id;
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await dispatch(deleteTeam(deleteId)).unwrap();
      } catch (error) {
        console.error('Failed to delete team:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeam(null);
    setFormData({
      name: '',
      leagueId: '',
      description: '',
    });
  };

  const isAdmin = user?.role === 'ADMIN';
  const isCoach = user?.role === 'COACH';
  
  // Filter users to get only coaches
  const coaches = users.filter(user => user.role === 'COACH');
  
  // Filter teams based on user role
  const filteredTeams = isAdmin ? teams : 
    isCoach ? teams.filter(team => {
      // Check direct coach_id match
      if (team.coach_id === user?.id) return true;
      
      // Check nested coach object
      if (team.coach?.id === user?.id) return true;
      
      // Check if coach_id is a string and user.id is a number or vice versa
      if (String(team.coach_id) === String(user?.id)) return true;
      if (String(team.coach?.id) === String(user?.id)) return true;
      
      return false;
    }) : teams;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {isCoach ? 'My Team' : 'Teams'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isCoach 
              ? 'Manage your assigned team and players.'
              : 'Manage teams, assign coaches, and organize leagues.'
            }
          </p>
        </div>
        {isAdmin && (
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Team
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search teams..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Teams Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team, idx) => (
            <div key={team.id || team.team_id || `team-${idx}`} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <UserGroupIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {team.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>Central Sports Ground</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(team)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(team.id || team.team_id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">23</div>
                    <div className="text-sm text-gray-500">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">8</div>
                    <div className="text-sm text-gray-500">Matches Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">75%</div>
                    <div className="text-sm text-gray-500">Win Rate</div>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button 
                    onClick={() => {/* TODO: Add view details functionality */}}
                    className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Details
                  </button>
                  {/* Coaches can only view team details, admins can manage and delete */}
                  {isCoach && (
                    <button 
                      onClick={() => {/* TODO: Add view team details functionality */}}
                      className="flex-1 bg-blue-600 border border-transparent rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Team
                    </button>
                  )}
                  
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => handleEdit(team)}
                        className="flex-1 bg-blue-600 border border-transparent rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Manage
                      </button>
                      <button 
                        onClick={() => handleDelete(team.id || team.team_id)}
                        className="flex-1 bg-red-600 border border-transparent rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {isCoach ? 'No team assigned' : 'No teams'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isCoach 
              ? 'You haven\'t been assigned to a team yet. Please contact an administrator.'
              : 'Get started by creating a new team.'
            }
          </p>
          {isAdmin && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Team
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTeam ? 'Edit Team' : 'Add New Team'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="Enter team name"
                  />
                </div>
                
                <div>
                  <label htmlFor="leagueId" className="block text-sm font-medium text-gray-700">
                    League *
                  </label>
                  <select
                    name="leagueId"
                    id="leagueId"
                    required
                    value={formData.leagueId}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                  >
                    <option value="">Select a league</option>
                    {leagues.map((league, idx) => (
                      <option key={league.id || league.league_id || `league-${idx}`} value={league.id || league.league_id}>
                        {league.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="Enter team description"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingTeam ? 'Update' : 'Create'}
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

export default Teams;

