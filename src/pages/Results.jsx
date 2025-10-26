import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResults, createResultByFixture, updateResultByFixture, deleteResultByFixture } from '../store/slices/resultsSlice';
import { fetchFixtures } from '../store/slices/fixturesSlice';
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Results = () => {
  const dispatch = useDispatch();
  const { results, loading, error } = useSelector((state) => state.results);
  const { fixtures } = useSelector((state) => state.fixtures);
  const { user } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [formData, setFormData] = useState({
    fixtureId: '',
    homeScore: '',
    awayScore: '',
  });

  useEffect(() => {
    dispatch(fetchResults());
    dispatch(fetchFixtures());
  }, [dispatch]);

  // Debug logging for fixtures
  useEffect(() => {
    if (fixtures.length > 0) {
      console.log('Fixtures data:', fixtures);
      const completed = fixtures.filter(f => f.status === 'Completed' && (f.fixture_id || f.id));
      console.log('Completed fixtures:', completed);
    }
  }, [fixtures]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate fixture ID
      const fixtureId = editingResult ? (editingResult.fixture_id || editingResult.fixtureId) : formData.fixtureId;
      
      if (!fixtureId) {
        alert('Error: Fixture ID is missing. Cannot save result.');
        console.error('Fixture ID is undefined');
        return;
      }

      const resultData = {
        home_score: parseInt(formData.homeScore),
        away_score: parseInt(formData.awayScore),
      };
      
      if (editingResult) {
        await dispatch(updateResultByFixture({ fixtureId, resultData })).unwrap();
      } else {
        await dispatch(createResultByFixture({ fixtureId, resultData })).unwrap();
      }
      setShowModal(false);
      setEditingResult(null);
      setFormData({
        fixtureId: '',
        homeScore: '',
        awayScore: '',
      });
    } catch (error) {
      console.error('Failed to save result:', error);
    }
  };

  const handleEdit = (result) => {
    setEditingResult(result);
    setFormData({
      fixtureId: result.fixture_id || result.fixtureId || '',
      homeScore: result.home_score || result.homeScore || '',
      awayScore: result.away_score || result.awayScore || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (fixtureId) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        await dispatch(deleteResultByFixture(fixtureId)).unwrap();
      } catch (error) {
        console.error('Failed to delete result:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingResult(null);
    setFormData({
      fixtureId: '',
      homeScore: '',
      awayScore: '',
    });
  };

  const isAdmin = user?.role === 'ADMIN';
  
  // Calculate completed fixtures inside component
  const completedFixtures = fixtures.filter(f => f.status === 'Completed' && (f.fixture_id || f.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Match Results
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
              Submit Result
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

      {/* No Completed Fixtures Warning */}
      {fixtures.length > 0 && completedFixtures.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No Completed Fixtures
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You need to have completed fixtures before you can add results. Please complete some fixtures first.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, idx) => (
            <div key={result.result_id || result.id || `result-${idx}`} className="bg-white shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">L</span>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {result.fixture?.homeTeam?.name || 'Lightning Bolts'}
                          </h3>
                          <p className="text-sm text-gray-500">Home</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {result.home_score || result.homeScore || 2} - {result.away_score || result.awayScore || 1}
                        </div>
                        <p className="text-xs text-gray-500">Final Score</p>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">T</span>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {result.fixture?.awayTeam?.name || 'Thunder Hawks'}
                          </h3>
                          <p className="text-sm text-gray-500">Away</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>Venue: {result.fixture?.venue?.name || 'Central Sports Ground'}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Approved
                    </span>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>Mar 15, 2024</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button 
                    onClick={() => {/* TODO: Add view details functionality */}}
                    className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Details
                  </button>
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => handleEdit(result)}
                        className="flex-1 bg-blue-600 border border-transparent rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Manage
                      </button>
                      <button 
                        onClick={() => handleDelete(result.fixture_id || result.fixtureId)}
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
      {!loading && results.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding match results.
          </p>
          {isAdmin && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Result
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
                {editingResult ? 'Edit Result' : 'Add New Result'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fixtureId" className="block text-sm font-medium text-gray-700">
                    Fixture *
                  </label>
                  <select
                    name="fixtureId"
                    id="fixtureId"
                    required
                    value={formData.fixtureId}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    disabled={!!editingResult}
                  >
                    <option value="">Select a fixture</option>
                    {completedFixtures.map((fixture, idx) => {
                      const fixtureId = fixture.fixture_id || fixture.id;
                      const homeTeam = fixture.home_team?.name || fixture.homeTeam?.name;
                      const awayTeam = fixture.away_team?.name || fixture.awayTeam?.name;
                      const matchDate = fixture.match_date || fixture.date;
                      
                      if (!fixtureId) {
                        console.warn('Fixture missing ID:', fixture);
                        return null;
                      }
                      
                      return (
                        <option key={fixtureId || `fixture-${idx}`} value={fixtureId}>
                          {homeTeam || 'Unknown'} vs {awayTeam || 'Unknown'} - {new Date(matchDate).toLocaleDateString()}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="homeScore" className="block text-sm font-medium text-gray-700">
                      Home Score *
                    </label>
                    <input
                      type="number"
                      name="homeScore"
                      id="homeScore"
                      required
                      min="0"
                      value={formData.homeScore}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="awayScore" className="block text-sm font-medium text-gray-700">
                      Away Score *
                    </label>
                    <input
                      type="number"
                      name="awayScore"
                      id="awayScore"
                      required
                      min="0"
                      value={formData.awayScore}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                      placeholder="0"
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
                    {editingResult ? 'Update' : 'Create'}
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

export default Results;

