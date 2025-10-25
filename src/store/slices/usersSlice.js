import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setUser } from './authSlice';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching users - token check:', {
        token: localStorage.getItem('token') ? 'Present' : 'Missing',
        tokenLength: localStorage.getItem('token')?.length,
        user: localStorage.getItem('user') ? 'Present' : 'Missing'
      });
      const response = await api.get('/users');
      console.log('Users fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
    }
  }
);

// Verify current user permissions
export const verifyUserPermissions = createAsyncThunk(
  'users/verifyUserPermissions',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Since /auth/me doesn't exist, use localStorage data
      const userFromStorage = JSON.parse(localStorage.getItem('user') || 'null');
      const token = localStorage.getItem('token');
      
      if (!userFromStorage || !token) {
        return rejectWithValue('No user data found');
      }
      
      // Sync authenticated user into auth slice
      dispatch(setUser(userFromStorage));
      
      return { success: true, user: userFromStorage };
    } catch (error) {
      console.error('Failed to verify user permissions:', error);
      return rejectWithValue('Failed to verify user permissions');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue, getState }) => {
    console.log('Creating user with data:', userData);
    try {
      const state = getState();
      const currentUser = state.auth.user;
      
      const token = localStorage.getItem('token');
      console.log('Current user:', currentUser);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // Check if token exists and is valid
      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }
      
      // Check if current user is admin (handle different case formats)
      const userRole = currentUser?.role?.toUpperCase();
      if (userRole !== 'ADMIN') {
        return rejectWithValue('Only administrators can create users');
      }
      
      // Transform data to match backend expectations
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        role: userData.role,
      };
      
      console.log('📤 Sending user creation request:', {
        url: '/users',
        method: 'POST',
        payload: payload,
        originalUserData: userData,
        payloadKeys: Object.keys(payload),
        payloadValues: Object.values(payload),
        firstNameCheck: {
          value: payload.firstName,
          type: typeof payload.firstName,
          length: payload.firstName?.length,
          trimmed: payload.firstName?.trim(),
          isEmpty: !payload.firstName?.trim()
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const response = await api.post('/users', payload);
      console.log('User created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 403) {
        return rejectWithValue('Access denied: You do not have permission to create users. Please ensure you are logged in as an administrator.');
      }
      
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      // Transform data to match backend expectations
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      };
      
      // Only include password if it's provided
      if (userData.password) {
        payload.password = userData.password;
      }
      
      
      const response = await api.put(`/users/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete user');
    }
  }
);

const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify user permissions
      .addCase(verifyUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Don't update users array, just verify permissions
      })
      .addCase(verifyUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.data;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload.data);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.data.id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
        if (state.currentUser?.id === action.payload.data.id) {
          state.currentUser = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload.id);
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;

