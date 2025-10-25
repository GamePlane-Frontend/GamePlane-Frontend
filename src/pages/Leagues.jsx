import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLeagues,
  createLeague,
  updateLeague,
  deleteLeague,
} from '../store/slices/leaguesSlice';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon,
  UserGroupIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const Leagues = () => {
  const dispatch = useDispatch();
  const { leagues, loading, error } = useSelector((state) => state.leagues);
  const { user } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [editingLeague, setEditingLeague] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    season: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    dispatch(fetchLeagues());
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
      if (editingLeague) {
        await dispatch(
          updateLeague({
            id: editingLeague.id || editingLeague.league_id,
            leagueData: formData,
          })
        ).unwrap();
      } else {
        await dispatch(createLeague(formData)).unwrap();
      }
      setShowModal(false);
      setEditingLeague(null);
      setFormData({
        name: '',
        description: '',
        season: '',
        startDate: '',
        endDate: '',
      });
    } catch (error) {
      console.error('Failed to save league:', error);
    }
  };

  const handleEdit = (league) => {
    setEditingLeague(league);
    setFormData({
      name: league.name || '',
      description: league.description || '',
      season: league.season || '',
      startDate: league.startDate || league.start_date || '',
      endDate: league.endDate || league.end_date || '',
    });
    setShowModal(true);
  };

  const handleDetails = (league) => {
    setSelectedLeague(league);
    setShowDetailsModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this league?')) {
      try {
        await dispatch(deleteLeague(id)).unwrap();
        alert('League deleted successfully!');
      } catch (error) {
        console.error('Failed to delete league:', error);
        alert('Failed to delete league.');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLeague(null);
    setFormData({
      name: '',
      description: '',
      season: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLeague(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Leagues
          </h2>
        </div>
        {isAdmin && (
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Create League
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league, idx) => (
            <div
              key={league.id || league.league_id || `league-${idx}`}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrophyIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {league.name}
                      </h3>
                      <p className="text-sm text-gray-500">Football</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {league.description ||
                      'Elite youth football competition for ages 16-18'}
                  </p>
                </div>

                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  <span className="mr-4">4 Teams</span>
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>{league.season || '1 Season'}</span>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => handleDetails(league)}
                    className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Details
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEdit(league)}
                        className="flex-1 bg-blue-600 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(league.id || league.league_id)
                        }
                        className="flex-1 bg-red-600 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
      {!loading && leagues.length === 0 && (
        <div className="text-center py-12">
          <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leagues</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new league.
          </p>
          {isAdmin && (
            <div className="mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add League
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingLeague ? 'Edit League' : 'Add New League'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  League Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                  placeholder="Enter league name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Season
                </label>
                <input
                  type="text"
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                  placeholder="e.g., 2024/25"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingLeague ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedLeague && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-24 mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              League Details
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Name:</strong> {selectedLeague.name}
              </p>
              <p>
                <strong>Description:</strong>{' '}
                {selectedLeague.description || 'N/A'}
              </p>
              <p>
                <strong>Season:</strong> {selectedLeague.season || 'N/A'}
              </p>
              <p>
                <strong>Start Date:</strong>{' '}
                {selectedLeague.startDate ||
                  selectedLeague.start_date ||
                  'N/A'}
              </p>
              <p>
                <strong>End Date:</strong>{' '}
                {selectedLeague.endDate || selectedLeague.end_date || 'N/A'}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseDetailsModal}
                className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leagues;
