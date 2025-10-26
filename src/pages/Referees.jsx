import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReferees, createReferee, updateReferee, deleteReferee } from '../store/slices/refereesSlice';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, StarIcon, CalendarIcon, ClockIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

const Referees = () => {
  const dispatch = useDispatch();
  const { referees, loading, error } = useSelector((state) => state.referees);
  const { user } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [editingReferee, setEditingReferee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experience: '',
  });

  useEffect(() => {
    dispatch(fetchReferees());
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
      if (editingReferee) {
        await dispatch(updateReferee({ id: editingReferee.id, refereeData: formData })).unwrap();
      } else {
        await dispatch(createReferee(formData)).unwrap();
      }
      setShowModal(false);
      setEditingReferee(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        experience: '',
      });
    } catch (error) {
      console.error('Failed to save referee:', error);
    }
  };

  const handleEdit = (referee) => {
    setEditingReferee(referee);
    setFormData({
      firstName: referee.firstName || referee.first_name || '',
      lastName: referee.lastName || referee.last_name || '',
      email: referee.email || '',
      phone: referee.phone || '',
      experience: referee.experience || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this referee?')) {
      try {
        await dispatch(deleteReferee(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete referee:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReferee(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      experience: '',
    });
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Referees
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
              Add Referee
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
              placeholder="Search referees..."
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

      {/* Referees Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {referees.map((referee) => (
            <div key={referee.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {referee.firstName || referee.first_name} {referee.lastName || referee.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {referee.experience || 5} years experience
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-green-600">4.8</span>
                    <div className="flex ml-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    <span>{referee.email || 'mike.referee@gameplan.com'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    <span>{referee.phone || '+1234567892'}</span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <CalendarIcon className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900">12</div>
                    <div className="text-xs text-gray-500">This Season</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <ClockIcon className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900">3</div>
                    <div className="text-xs text-gray-500">Upcoming</div>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button 
                    onClick={() => {/* TODO: Add view schedule functionality */}}
                    className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Schedule
                  </button>
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => handleEdit(referee)}
                        className="flex-1 bg-blue-600 border border-transparent rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Manage
                      </button>
                      <button 
                        onClick={() => handleDelete(referee.id)}
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
      {!loading && referees.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No referees</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new referee.
          </p>
          {isAdmin && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Referee
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
                {editingReferee ? 'Edit Referee' : 'Add New Referee'}
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="referee@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="+1234567890"
                  />
                </div>
                
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    id="experience"
                    min="0"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="Years of experience"
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
                    {editingReferee ? 'Update' : 'Create'}
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

export default Referees;

