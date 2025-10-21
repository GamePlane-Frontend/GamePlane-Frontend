import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFixtures, createFixture, updateFixture, deleteFixture, updateFixtureStatus } from '../store/slices/fixturesSlice';
import { fetchTeams } from '../store/slices/teamsSlice';
import { fetchVenues } from '../store/slices/venuesSlice';
import { fetchLeagues } from '../store/slices/leaguesSlice';
import { fetchReferees } from '../store/slices/refereesSlice';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Fixtures = () => {
  const dispatch = useDispatch();
  const { fixtures, loading, error } = useSelector((state) => state.fixtures);
  const { teams } = useSelector((state) => state.teams);
  const { venues } = useSelector((state) => state.venues);
  const { leagues } = useSelector((state) => state.leagues);
  const { referees } = useSelector((state) => state.referees);
  const { user } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [editingFixture, setEditingFixture] = useState(null);
  const [formData, setFormData] = useState({
    homeTeamId: '',
    awayTeamId: '',
    venueId: '',
    refereeId: '',
    date: '',
    time: '',
    status: 'Scheduled',
  });

  useEffect(() => {
    // Only fetch data if user is authenticated and has proper role
    if (user && user.id) {
      // Check if user has admin role for these endpoints
      if (user.role === 'ADMIN') {
        dispatch(fetchFixtures());
        dispatch(fetchTeams());
        dispatch(fetchVenues());
        dispatch(fetchLeagues());
        dispatch(fetchReferees());
      } else {
        console.log('User role is not ADMIN, skipping data fetch');
      }
    }
  }, [dispatch, user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Helper function to get teams by league
  const getTeamsByLeague = (leagueId) => {
    return teams.filter(team => team.league_id === leagueId || team.leagueId === leagueId);
  };

  // Helper function to get league name by ID
  const getLeagueName = (leagueId) => {
    const league = leagues.find(l => l.id === leagueId || l.league_id === leagueId);
    return league ? league.name : 'Unknown League';
  };

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.homeTeamId || !formData.awayTeamId || !formData.venueId || !formData.date || !formData.time) {
        console.error('All required fields must be filled');
        return;
      }

      // Check if home and away teams are different
      if (formData.homeTeamId === formData.awayTeamId) {
        console.error('Home team and away team must be different');
        return;
      }

      // Get team league information
      const homeTeam = teams.find(t => (t.id || t.team_id) === formData.homeTeamId);
      const awayTeam = teams.find(t => (t.id || t.team_id) === formData.awayTeamId);
      const homeLeagueId = homeTeam?.league_id || homeTeam?.leagueId;
      const awayLeagueId = awayTeam?.league_id || awayTeam?.leagueId;
      
      // Enforce same-league fixtures to satisfy backend constraint
      if (homeLeagueId && awayLeagueId && homeLeagueId !== awayLeagueId) {
        alert("Error: Home and Away teams must be in the same league.");
        console.error('League mismatch:', { homeLeagueId, awayLeagueId });
        return;
      }

      // Determine league id (prefer home, else away)
      const fixtureLeagueId = homeLeagueId || awayLeagueId;

      // Validate and format the date properly
      if (!formData.date || !formData.time) {
        console.error('Date and time are required');
        alert('Error: Please provide both date and time.');
        return;
      }

      // Create a more robust date string
      const dateString = `${formData.date}T${formData.time}:00`;
      const fixtureDate = new Date(dateString);
      
      if (isNaN(fixtureDate.getTime())) {
        console.error('Invalid date format:', dateString);
        alert('Error: Invalid date or time format. Please check your inputs.');
        return;
      }

      // Convert frontend field names to backend expected field names
      const fixtureData = {
        league_id: fixtureLeagueId, // Prisma expects league_id (String)
        home_team_id: formData.homeTeamId,
        away_team_id: formData.awayTeamId,
        venue_id: formData.venueId,
        referee_id: formData.refereeId, // Add referee_id
        match_date: fixtureDate.toISOString(), // Use match_date instead of date
        status: formData.status,
      };
      
      if (editingFixture) {
        await dispatch(updateFixture({ id: editingFixture.id || editingFixture.fixture_id, fixtureData })).unwrap();
      } else {
        await dispatch(createFixture(fixtureData)).unwrap();
      }
      setShowModal(false);
      setEditingFixture(null);
      setFormData({
        homeTeamId: '',
        awayTeamId: '',
        venueId: '',
        refereeId: '',
        date: '',
        time: '',
        status: 'Scheduled',
      });
    } catch (error) {
      console.error('Failed to save fixture:', error);
      
      // Handle specific error types
      if (error.response?.status === 403) {
        alert('Error: You do not have permission to create fixtures. Please check your user role.');
      } else if (error.response?.status === 401) {
        alert('Error: You are not logged in. Please log in again.');
      } else if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('Error: Failed to save fixture. Please try again.');
      }
    }
  };

  const handleEdit = (fixture) => {
    setEditingFixture(fixture);
    
    // Handle both date and match_date fields with better validation
    const dateValue = fixture.match_date || fixture.date;
    let fixtureDate;
    
    if (dateValue) {
      fixtureDate = new Date(dateValue);
      
      // Validate the date
      if (isNaN(fixtureDate.getTime())) {
        console.error('Invalid fixture date:', dateValue);
        alert('Error: Invalid fixture date found. Please contact support.');
        return;
      }
    } else {
      console.error('No date found in fixture:', fixture);
      alert('Error: No date found for this fixture.');
      return;
    }
    
    setFormData({
      homeTeamId: fixture.home_team_id || fixture.homeTeamId || '',
      awayTeamId: fixture.away_team_id || fixture.awayTeamId || '',
      venueId: fixture.venue_id || fixture.venueId || '',
      refereeId: fixture.referee_id || fixture.refereeId || '',
      date: fixtureDate.toISOString().split('T')[0],
      time: fixtureDate.toTimeString().slice(0, 5),
      status: fixture.status || 'Scheduled',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fixture?')) {
      try {
        await dispatch(deleteFixture(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete fixture:', error);
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateFixtureStatus({ id, status })).unwrap();
    } catch (error) {
      console.error('Failed to update fixture status:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFixture(null);
    setFormData({
      homeTeamId: '',
      awayTeamId: '',
      venueId: '',
      refereeId: '',
      date: '',
      time: '',
      status: 'Scheduled',
    });
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Fixtures
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage match fixtures and schedules
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
              Add Fixture
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

      {/* Authentication Check */}
      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Authentication Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Please log in to view and manage fixtures.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission Error Check */}
      {user && error && error.includes('403') && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Access Denied
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>You don't have permission to access this resource. Please contact your administrator.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixtures List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {fixtures.map((fixture, idx) => (
              <li key={fixture.id || fixture.fixture_id || `fixture-${idx}`}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-600 font-bold text-lg">F</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {fixture.home_team?.name || fixture.homeTeam?.name} vs {fixture.away_team?.name || fixture.awayTeam?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(fixture.match_date || fixture.date)} at {fixture.venue?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      fixture.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      fixture.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {fixture.status}
                    </span>
                    {isAdmin && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(fixture)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fixture.id || fixture.fixture_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {!loading && fixtures.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No fixtures</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new fixture.
          </p>
          {isAdmin && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Fixture
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
                {editingFixture ? 'Edit Fixture' : 'Add New Fixture'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="homeTeamId" className="block text-sm font-medium text-gray-700">
                      Home Team *
                    </label>
                    <select
                      name="homeTeamId"
                      id="homeTeamId"
                      required
                      value={formData.homeTeamId}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                    >
                      <option value="">Select home team</option>
                      {teams.map((team, idx) => (
                        <option key={team.team_id || team.id || `team-${idx}`} value={team.team_id || team.id}>
                          {team.name} ({getLeagueName(team.league_id || team.leagueId)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="awayTeamId" className="block text-sm font-medium text-gray-700">
                      Away Team *
                    </label>
                    <select
                      name="awayTeamId"
                      id="awayTeamId"
                      required
                      value={formData.awayTeamId}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                    >
                      <option value="">Select away team</option>
                      {teams.map((team, idx) => (
                        <option key={team.team_id || team.id || `team-${idx}`} value={team.team_id || team.id}>
                          {team.name} ({getLeagueName(team.league_id || team.leagueId)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Cross-league warning */}
                {formData.homeTeamId && formData.awayTeamId && (() => {
                  const homeTeam = teams.find(t => (t.id || t.team_id) === formData.homeTeamId);
                  const awayTeam = teams.find(t => (t.id || t.team_id) === formData.awayTeamId);
                  const homeLeagueId = homeTeam?.league_id || homeTeam?.leagueId;
                  const awayLeagueId = awayTeam?.league_id || awayTeam?.leagueId;
                  
                  if (homeLeagueId && awayLeagueId && homeLeagueId !== awayLeagueId) {
                    return (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Cross-League Fixture
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                You are creating a cross-league fixture between teams from different leagues: 
                                <strong> {getLeagueName(homeLeagueId)}</strong> vs <strong>{getLeagueName(awayLeagueId)}</strong>.
                              </p>
                              <p className="mt-1">
                                The fixture will be assigned to the <strong>{getLeagueName(homeLeagueId)}</strong> league.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div>
                  <label htmlFor="venueId" className="block text-sm font-medium text-gray-700">
                    Venue *
                  </label>
                  <select
                    name="venueId"
                    id="venueId"
                    required
                    value={formData.venueId}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                  >
                    <option value="">Select venue</option>
                    {venues.map((venue, idx) => (
                      <option key={venue.venue_id || venue.id || `venue-${idx}`} value={venue.venue_id || venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="refereeId" className="block text-sm font-medium text-gray-700">
                    Referee *
                  </label>
                  <select
                    name="refereeId"
                    id="refereeId"
                    required
                    value={formData.refereeId}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                  >
                    <option value="">Select referee</option>
                    {referees.map((referee, idx) => (
                      <option key={referee.referee_id || referee.id || `referee-${idx}`} value={referee.referee_id || referee.id}>
                        {referee.full_name || referee.name || `Referee ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                      Time *
                    </label>
                    <input
                      type="time"
                      name="time"
                      id="time"
                      required
                      value={formData.time}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Postponed">Postponed</option>
                  </select>
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
                    {editingFixture ? 'Update' : 'Create'}
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

export default Fixtures;

