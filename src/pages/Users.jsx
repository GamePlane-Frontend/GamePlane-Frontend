import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser, verifyUserPermissions } from '../store/slices/usersSlice';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'COACH',
  });

  // Calculate isAdmin before using it in useEffect
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'admin' || currentUser?.role === 'Admin';

  // Debug function to check authentication status
  const debugAuthStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔍 Authentication Debug:', {
      hasToken: !!token,
      tokenLength: token?.length,
      hasUser: !!user,
      userData: user ? JSON.parse(user) : null,
      currentUser: currentUser,
      isAdmin: isAdmin
    });
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 Token payload:', {
          userId: payload.userId,
          role: payload.role,
          exp: payload.exp,
          expDate: new Date(payload.exp * 1000).toISOString(),
          isExpired: payload.exp < Math.floor(Date.now() / 1000)
        });
      } catch (error) {
        console.error('❌ Error parsing token:', error);
      }
    }
  };

  // Test function to check other API endpoints
  const testOtherEndpoints = async () => {
    console.log('🧪 Testing other API endpoints...');
    
    try {
      // Test a simple endpoint first
      const response = await fetch('http://localhost:3100/api/leagues', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🧪 Leagues endpoint test:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🧪 Leagues data:', data);
      } else {
        const errorData = await response.text();
        console.log('🧪 Leagues error:', errorData);
      }
    } catch (error) {
      console.error('🧪 Leagues test error:', error);
    }
  };

  // Direct API test for user creation
  const testDirectUserCreation = async () => {
    console.log('🧪 Testing direct user creation API...');
    
    try {
      const testUserData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'test123',
        role: 'COACH'
      };
      
      const response = await fetch('http://localhost:3100/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testUserData)
      });
      
      console.log('🧪 Direct user creation test:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      const responseData = await response.text();
      console.log('🧪 Direct user creation response:', responseData);
      
    } catch (error) {
      console.error('🧪 Direct user creation test error:', error);
    }
  };

  useEffect(() => {
    // Debug authentication status
    debugAuthStatus();
    
    // Only make API calls if user is authenticated and we haven't loaded users yet
    if (currentUser && users.length === 0 && !loading) {
      console.log('Attempting to fetch users...', {
        currentUser: currentUser?.role,
        token: localStorage.getItem('token') ? 'Present' : 'Missing',
        tokenLength: localStorage.getItem('token')?.length
      });
      dispatch(fetchUsers());
    }
  }, [dispatch, currentUser]);

  // Handle authentication errors gracefully
  useEffect(() => {
    const handleAuthError = () => {
      if (error && error.includes('404')) {
        console.warn('Backend server not responding. Please check if the server is running.');
      } else if (error && error.includes('401')) {
        console.warn('Authentication required. Please log in.');
      }
    };
    
    handleAuthError();
  }, [error]);

  const handleInputChange = (e) => {
    console.log('Input change:', {
      name: e.target.name,
      value: e.target.value,
      currentFormData: formData
    });
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = { ...formData };
      if (editingUser && !userData.password) {
        delete userData.password; // Don't update password if empty
      }
      
      console.log('Submitting user data:', userData);
      console.log('Form data validation:', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        firstNameType: typeof userData.firstName,
        firstNameLength: userData.firstName?.length,
        firstNameTrimmed: userData.firstName?.trim(),
        isEmpty: !userData.firstName?.trim()
      });
      console.log('Current user role:', currentUser?.role);
      
      // Validate required fields
      if (!userData.firstName?.trim()) {
        alert('First name is required');
        return;
      }
      if (!userData.lastName?.trim()) {
        alert('Last name is required');
        return;
      }
      if (!userData.email?.trim()) {
        alert('Email is required');
        return;
      }
      if (!editingUser && !userData.password?.trim()) {
        alert('Password is required for new users');
        return;
      }
      
      if (editingUser) {
        await dispatch(updateUser({ id: editingUser.id, userData })).unwrap();
      } else {
        await dispatch(createUser(userData)).unwrap();
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'COACH',
      });
    } catch (error) {
      console.error('Failed to save user:', error);
      // The error will be displayed in the error message section
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '', // Don't pre-fill password
      role: user.role || 'COACH',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      alert('You cannot delete your own account');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'COACH',
    });
  };

  // Initialize user from localStorage if not in Redux state
  useEffect(() => {
    if (!currentUser) {
      const userFromStorage = JSON.parse(localStorage.getItem('user') || 'null');
      if (userFromStorage) {
        dispatch(verifyUserPermissions());
      }
    }
  }, [dispatch, currentUser]);

  // Show loading if user data is not yet loaded
  if (!currentUser && !error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading user data...</span>
      </div>
    );
  }

  // Redirect to login if no user
  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Authentication Required</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please log in to access this page.
        </p>
        <div className="mt-4">
          <a 
            href="/login" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">
          You need admin privileges to access this page.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Current role: {currentUser?.role || 'Not logged in'}
        </p>
        {!currentUser && (
          <div className="mt-4">
            <a 
              href="/login" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Go to Login
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Users
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
          <button
            type="button"
            onClick={() => {
              console.log('Current form data:', formData);
              console.log('Current user:', currentUser);
              testDirectUserCreation();
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Debug
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add User
          </button>
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
                {error.includes('404') ? 'Backend Server Error' : 
                 error.includes('401') ? 'Authentication Error' : 
                 'Error'}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {error.includes('404') ? 'The backend server is not responding. Please check if the server is running on port 3100.' :
                   error.includes('401') ? 'Authentication required. Please log in to access this page.' :
                   error}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">12</div>
                    <div className="text-sm text-gray-500">Leagues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">8</div>
                    <div className="text-sm text-gray-500">Teams</div>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    View Profile
                  </button>
                  <button className="flex-1 bg-blue-600 border border-transparent rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new user.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add User
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
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
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password {!editingUser && '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role *
                  </label>
                  <select
                    name="role"
                    id="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                  >
                    <option value="COACH">Coach</option>
                    <option value="ADMIN">Admin</option>
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
                    {editingUser ? 'Update' : 'Create'}
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

export default Users;

