import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVenues, createVenue, updateVenue, deleteVenue, clearError } from '../store/slices/venuesSlice';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon, UserGroupIcon, CalendarIcon, TruckIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';

const Venues = () => {
  const dispatch = useDispatch();
  const { venues, loading, error } = useSelector((state) => state.venues);
  const { user } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '', // Only supported fields: name and location
  });

  useEffect(() => {
    dispatch(fetchVenues());
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
      if (editingVenue) {
        const venueId = editingVenue.venue_id || editingVenue.id;
        console.log('Updating venue with ID:', venueId);
        console.log('Form data:', formData);
        await dispatch(updateVenue({ id: venueId, venueData: formData })).unwrap();
      } else {
        await dispatch(createVenue(formData)).unwrap();
      }
      setShowModal(false);
      setEditingVenue(null);
      setFormData({
        name: '',
        location: '',
      });
    } catch (error) {
      console.error('Failed to save venue:', error);
    }
  };

  const handleEdit = (venue) => {
    console.log('Editing venue:', venue);
    console.log('Venue ID:', venue.venue_id || venue.id);
    setEditingVenue(venue);
    setFormData({
      name: venue.name || '',
      location: venue.location || '', // Use 'location' to match backend
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    // Check if ID exists
    if (!id) {
      console.error('Venue ID is undefined, cannot delete');
      alert('Error: Venue ID is missing. Cannot delete venue.');
      return;
    }

    console.log('Deleting venue with ID:', id);
    
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        await dispatch(deleteVenue(id)).unwrap();
        console.log('Venue deleted successfully');
        alert('Venue deleted successfully!');
      } catch (error) {
        console.error('Failed to delete venue:', error);
        // The error message is now handled by the slice and will be displayed via the error state
        alert(`Error: ${error.message || 'Failed to delete venue. Please try again.'}`);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVenue(null);
    setFormData({
      name: '',
      location: '',
    });
  };

  const isAdmin = user?.role === 'ADMIN';
  const isCoach = user?.role === 'COACH';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Venues
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
              Add Venue
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
              placeholder="Search venues..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => dispatch(clearError())}
                  className="text-sm font-medium text-red-800 hover:text-red-900"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Venues Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <div key={venue.venue_id || venue.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {venue.name}
                    </h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>{venue.location || '123 Sports Ave, City Center'}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(venue)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(venue.venue_id || venue.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                
                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-2">Facilities</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <TruckIcon className="h-3 w-3 mr-1" />
                      Parking
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                      Concessions
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <UserIcon className="h-3 w-3 mr-1" />
                      Changing Rooms
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Upcoming matches:</span> 
                    <span className={`ml-1 ${venue.fixtures && venue.fixtures.length > 0 ? 'text-orange-600 font-semibold' : 'text-green-600'}`}>
                      {venue.fixtures && venue.fixtures.length > 0 ? `${venue.fixtures.length} scheduled` : 'No fixtures'}
                    </span>
                  </div>
                  {venue.fixtures && venue.fixtures.length > 0 && (
                    <div className="mt-1 text-xs text-orange-600">
                      ⚠️ Cannot delete - venue is in use
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button 
                    onClick={() => {/* TODO: Add view schedule functionality */}}
                    className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Schedule
                  </button>
                  {/* Coaches can only view venue schedule, admins can manage and delete */}
                  {isCoach && (
                    <button 
                      onClick={() => {/* TODO: Add view schedule functionality */}}
                      className="flex-1 bg-blue-600 border border-transparent rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Schedule
                    </button>
                  )}
                  
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => handleEdit(venue)}
                        className="flex-1 bg-blue-600 border border-transparent rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Manage
                      </button>
                      <button 
                        onClick={() => handleDelete(venue.venue_id || venue.id)}
                        disabled={venue.fixtures && venue.fixtures.length > 0}
                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                          venue.fixtures && venue.fixtures.length > 0 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                        title={venue.fixtures && venue.fixtures.length > 0 ? 'Cannot delete venue with active fixtures' : 'Delete venue'}
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
      {!loading && venues.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No venues</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new venue.
          </p>
          {isAdmin && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Venue
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
                {editingVenue ? 'Edit Venue' : 'Add New Venue'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="Enter venue name"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <textarea
                    name="location"
                    id="location"
                    rows={2}
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="Enter venue location"
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
                    {editingVenue ? 'Update' : 'Create'}
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

export default Venues;

