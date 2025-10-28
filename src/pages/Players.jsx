import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers, createPlayer, updatePlayer, deletePlayer } from '../store/slices/playersSlice';
import { fetchTeams } from '../store/slices/teamsSlice';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import DebugPanel from '../Components/DebugPanel';

const Players = () => {
  const dispatch = useDispatch();
  const { players, loading, error } = useSelector((state) => state.players);
  const { teams, loading: teamsLoading, error: teamsError } = useSelector((state) => state.teams);
  const { user } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    teamId: '',
    position: '',
    number: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchPlayers());
    dispatch(fetchTeams()).then((result) => {
      console.log('Teams fetch result:', result);
    }).catch((error) => {
      console.error('Teams fetch error:', error);
    });
  }, [dispatch]);

  // Debug teams data
  useEffect(() => {
    console.log('Teams state changed:', teams);
    if (teams.length > 0) {
      console.log('Available teams:', teams);
      console.log('First team structure:', teams[0]);
      console.log('All team IDs:', teams.map((team, idx) => ({
        index: idx,
        team: team,
        id: team.id,
        _id: team._id,
        team_id: team.team_id,
        teamId: team.teamId,
        allKeys: Object.keys(team),
        extractedId: team.id || team._id || team.team_id || team.teamId
      })));
    } else {
      console.log('No teams available');
    }
  }, [teams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change - ${name}:`, value);
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    console.log('Form submission data:', formData);
    console.log('Selected team ID:', formData.teamId);
    console.log('Available teams:', teams);
    
    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.teamId) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    // Check if the selected team exists
    const selectedTeam = teams.find(team => {
      const teamId = team.team_id || team.id || team._id || team.teamId;
      console.log(`Comparing team ID ${teamId} with selected ${formData.teamId} (${typeof teamId} vs ${typeof formData.teamId})`);
      return teamId == formData.teamId;
    });
    console.log('Selected team object:', selectedTeam);
    
    if (!selectedTeam) {
      const availableIds = teams.map(t => t.team_id || t.id || t._id || t.teamId || 'undefined');
      setFormError(`Selected team does not exist. Available teams: ${availableIds.join(', ')}`);
      return;
    }
    
    try {
      if (editingPlayer) {
        console.log('Updating player:', editingPlayer);
        const playerId = editingPlayer.player_id || editingPlayer.id || editingPlayer._id;
        console.log('Player ID for update:', playerId);
        const result = await dispatch(updatePlayer({ 
          id: playerId, 
          playerData: formData 
        })).unwrap();
        console.log('Update successful:', result);
      } else {
        console.log('Creating new player with data:', formData);
        const result = await dispatch(createPlayer(formData)).unwrap();
        console.log('Create successful:', result);
      }
      setShowModal(false);
      setEditingPlayer(null);
      setFormData({
        firstName: '',
        lastName: '',
        teamId: '',
        position: '',
        number: '',
      });
    } catch (error) {
      console.error('Failed to save player:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response,
        status: error.status
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save player';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setFormError(errorMessage);
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      firstName: player.firstName || player.first_name || '',
      lastName: player.lastName || player.last_name || '',
      teamId: player.teamId || player.team_id || player.team?.team_id || player.team?.id || player.team?._id || '',
      position: player.position || '',
      number: player.number || player.jersey_number || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (player) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        const playerId = player.player_id || player.id || player._id;
        await dispatch(deletePlayer(playerId)).unwrap();
      } catch (error) {
        console.error('Failed to delete player:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlayer(null);
    setFormError('');
    setFormData({
      firstName: '',
      lastName: '',
      teamId: '',
      position: '',
      number: '',
    });
  };

  const isAdmin = user?.role === 'ADMIN';
  const isCoach = user?.role === 'COACH';
  
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

  // Filter players based on user role
  const filteredPlayers = isAdmin ? players : 
    isCoach ? players.filter(player => {
      const playerTeamId = player.team_id || player.teamId || player.team?.id;
      const coachTeamId = coachTeam?.id || coachTeam?.team_id;
      return String(playerTeamId) === String(coachTeamId);
    }) : players;
  
  // For coaches, filter players to only show players from teams they coach
  // For now, we'll show all players but restrict edit/delete to admin only
  // TODO: Implement proper coach-team relationship filtering

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {isCoach ? 'My Team Players' : 'Players Management'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isCoach 
              ? `Manage players for ${coachTeam?.name || 'your team'}. You can view and edit your team's players.`
              : 'Manage players across all teams. Add, edit, or remove players from the system.'
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
              Add Player
            </button>
          </div>
        )}
      </div>

      {/* Coach Team Info */}
      {isCoach && coachTeam && (
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{coachTeam.name}</h3>
              <p className="text-blue-100 mt-1">
                {coachTeam.description || 'Your assigned team'}
              </p>
              <div className="flex items-center mt-2 space-x-4 text-sm">
                <span className="flex items-center">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  {filteredPlayers.length} Players
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{coachTeam.name.charAt(0)}</div>
              <div className="text-sm text-blue-100">Team Initial</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
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
              placeholder="Search players..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            All Teams
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          Players Error: {error}
        </div>
      )}
      
      {teamsError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          Teams Error: {teamsError}
        </div>
      )}

      {/* Players Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlayers.map((player, index) => {
            const getRoleBadge = (position) => {
              switch (position) {
                case 'FW': return { text: 'Forward', color: 'bg-red-100 text-red-800' };
                case 'MF': return { text: 'Midfielder', color: 'bg-blue-100 text-blue-800' };
                case 'DF': return { text: 'Defender', color: 'bg-green-100 text-green-800' };
                case 'GK': return { text: 'Goalkeeper', color: 'bg-purple-100 text-purple-800' };
                default: return { text: 'Player', color: 'bg-gray-100 text-gray-800' };
              }
            };
            
            const roleBadge = getRoleBadge(player.position);
            
            return (
              <div key={player.player_id || player.id || player._id || `${player.firstName || player.first_name || 'player'}-${player.lastName || player.last_name || 'item'}-${index}`} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-teal-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {(player.firstName || player.first_name)} {(player.lastName || player.last_name)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {player.team?.name || 'Lightning Bolts'}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}>
                      {roleBadge.text}
                    </span>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">12</div>
                      <div className="text-sm text-gray-500">Goals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">8</div>
                      <div className="text-sm text-gray-500">Assists</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">15</div>
                      <div className="text-sm text-gray-500">Matches</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex space-x-3">
                    <button 
                      onClick={() => {/* TODO: Add view stats functionality */}}
                      className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Stats
                    </button>
                    {/* Show edit button for coaches and admins, but only for players from their teams */}
                    {(isAdmin || isCoach) && (
                      <button 
                        onClick={() => handleEdit(player)}
                        className="flex-1 bg-blue-600 border border-transparent rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {isCoach ? 'Edit Player' : 'Manage'}
                      </button>
                    )}
                    
                    {/* Only admins can delete players */}
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(player)}
                        className="flex-1 bg-red-600 border border-transparent rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No players</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new player.
          </p>
          {isAdmin && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Player
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
                {editingPlayer ? 'Edit Player' : 'Add New Player'}
              </h3>
              
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="teamId" className="block text-sm font-medium text-gray-700">
                    Team *
                  </label>
                  <select
                    name="teamId"
                    id="teamId"
                    required
                    value={formData.teamId}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    disabled={teams.length === 0 || teamsLoading}
                  >
                    <option value="">
                      {teamsLoading ? 'Loading teams...' : teams.length === 0 ? 'No teams available' : 'Select a team'}
                    </option>
                    {teams.map((team, idx) => {
                      // Try multiple possible ID field names, prioritizing team_id
                      const teamId = team.team_id || team.id || team._id || team.teamId;
                      console.log(`Team ${idx}:`, team, 'ID:', teamId);
                      return (
                        <option key={teamId || `team-${idx}`} value={teamId || ''}>
                          {team.name || team.team_name || `Team ${idx + 1}`}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                      Position
                    </label>
                    <select
                      name="position"
                      id="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                    >
                      <option value="">Select position</option>
                      <option value="GK">Goalkeeper</option>
                      <option value="DF">Defender</option>
                      <option value="MF">Midfielder</option>
                      <option value="FW">Forward</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                      Jersey Number
                    </label>
                    <input
                      type="number"
                      name="number"
                      id="number"
                      min="1"
                      max="99"
                      value={formData.number}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                      placeholder="Number"
                    />
                  </div>
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
                    disabled={teams.length === 0 || teamsLoading}
                  >
                    {editingPlayer ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug Panel - Remove this after debugging */}
      <DebugPanel />
    </div>
  );
};

export default Players;

