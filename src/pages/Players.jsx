import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlayers, createPlayer, updatePlayer, deletePlayer } from '../store/slices/playersSlice';
import { fetchTeams } from '../store/slices/teamsSlice';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Players = () => {
  const dispatch = useDispatch();
  const { players, loading, error } = useSelector((state) => state.players);
  const { teams } = useSelector((state) => state.teams);
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

  useEffect(() => {
    dispatch(fetchPlayers());
    dispatch(fetchTeams());
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
      if (editingPlayer) {
        await dispatch(updatePlayer({ id: editingPlayer.id || editingPlayer._id, playerData: formData })).unwrap();
      } else {
        await dispatch(createPlayer(formData)).unwrap();
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
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      firstName: player.firstName || player.first_name || '',
      lastName: player.lastName || player.last_name || '',
      teamId: player.teamId || player.team_id || player.team?.id || player.team?._id || '',
      position: player.position || '',
      number: player.number || player.jersey_number || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await dispatch(deletePlayer(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete player:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlayer(null);
    setFormData({
      firstName: '',
      lastName: '',
      teamId: '',
      position: '',
      number: '',
    });
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Players
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage football players and their team associations
          </p>
        </div>
        {isAdmin && (
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Player
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Players Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player, index) => (
            <div key={player.id || player._id || `${player.firstName || player.first_name || 'player'}-${player.lastName || player.last_name || 'item'}-${index}`} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {(player.firstName || player.first_name || '')?.[0]}{(player.lastName || player.last_name || '')?.[0]}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Player Name
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {(player.firstName || player.first_name)} {(player.lastName || player.last_name)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <p className="text-gray-500">
                    Team: {player.team?.name || 'No team assigned'}
                  </p>
                  <p className="text-gray-500">
                    Position: {player.position || 'Not specified'}
                  </p>
                  {(player.number || player.jersey_number) && (
                    <p className="text-gray-500">Number: {player.number || player.jersey_number}</p>
                  )}
                </div>
                {isAdmin && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => handleEdit(player)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(player.id || player._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && players.length === 0 && (
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
                  >
                    <option value="">Select a team</option>
                    {teams.map((team, idx) => (
                      <option key={team.id || team._id || `team-${idx}`} value={team.id || team._id}>
                        {team.name}
                      </option>
                    ))}
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
                  >
                    {editingPlayer ? 'Update' : 'Create'}
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

export default Players;

