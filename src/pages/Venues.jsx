import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVenues, createVenue, updateVenue, deleteVenue } from '../store/slices/venuesSlice';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Venues = () => {
  const dispatch = useDispatch();
  const { venues, loading, error } = useSelector((state) => state.venues);
  const { user } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '', // Changed from 'address' to 'location' to match Prisma
    capacity: '',
    city: '',
    country: '',
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
        await dispatch(updateVenue({ id: editingVenue.id, venueData: formData })).unwrap();
      } else {
        await dispatch(createVenue(formData)).unwrap();
      }
      setShowModal(false);
      setEditingVenue(null);
      setFormData({
        name: '',
        location: '',
        capacity: '',
        city: '',
        country: '',
      });
    } catch (error) {
      console.error('Failed to save venue:', error);
    }
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name || '',
      address: venue.location || '', // Prisma uses 'location' not 'address'
      capacity: venue.capacity || '',
      city: venue.city || '',
      country: venue.country || '',
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

    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        await dispatch(deleteVenue(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete venue:', error);
        alert('Error: Failed to delete venue. Please try again.');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVenue(null);
    setFormData({
      name: '',
      location: '',
      capacity: '',
      city: '',
      country: '',
    });
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Venues
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage football venues and stadiums
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
              Add Venue
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

      {/* Venues Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <div key={venue.venue_id || venue.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-lg">V</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Venue Name
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {venue.name}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  {venue.location && (
                    <p className="text-gray-600 mb-1">{venue.location}</p>
                  )}
                  {venue.city && venue.country && (
                    <p className="text-gray-500 mb-1">{venue.city}, {venue.country}</p>
                  )}
                  {venue.capacity && (
                    <p className="text-gray-500">Capacity: {venue.capacity.toLocaleString()}</p>
                  )}
                </div>
                {isAdmin && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => handleEdit(venue)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(venue.venue_id || venue.id)}
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      id="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                      placeholder="Country"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    id="capacity"
                    min="0"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="Venue capacity"
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

