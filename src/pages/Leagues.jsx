import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeagues, createLeague, updateLeague, deleteLeague } from '../store/slices/leaguesSlice';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon  , TrophyIcon} from '@heroicons/react/24/outline';

const Leagues = () => {
  const dispatch = useDispatch();
  const { leagues, loading, error } = useSelector((state) => state.leagues);
  const { user } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
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
        await dispatch(updateLeague({ id: editingLeague.id || editingLeague.league_id, leagueData: formData })).unwrap();
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

  const handleDelete = async (id) => {
    const deleteId = id || editingLeague?.id || editingLeague?.league_id;
    if (window.confirm('Are you sure you want to delete this league?')) {
      try {
        await dispatch(deleteLeague(deleteId)).unwrap();
      } catch (error) {
        console.error('Failed to delete league:', error);
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

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Leagues
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage football leagues and competitions
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
              Add League
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

      {/* Leagues Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league, idx) => (
            <div key={league.id || league.league_id || `league-${idx}`} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-lg">L</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        League Name
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {league.name}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  {league.description && (
                    <p className="text-gray-600 mb-2">{league.description}</p>
                  )}
                  {league.season && (
                    <p className="text-gray-500">Season: {league.season}</p>
                  )}
                </div>
                {isAdmin && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => handleEdit(league)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(league.id || league.league_id)}
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
      {!loading && leagues.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <TrophyIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leagues</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new league.
          </p>
          {isAdmin && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add League
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
                {editingLeague ? 'Edit League' : 'Add New League'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    League Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="Enter league name"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="Enter league description"
                  />
                </div>
                
                <div>
                  <label htmlFor="season" className="block text-sm font-medium text-gray-700">
                    Season
                  </label>
                  <input
                    type="text"
                    name="season"
                    id="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="e.g., 2024/25"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="input-field mt-1"
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
                    {editingLeague ? 'Update' : 'Create'}
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

export default Leagues;

