import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

function extractErrorMessage(error) {
  if (error?.response) {
    const data = error.response.data;
    if (!data) return 'Request failed';
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      if (typeof first === 'string') return first;
      if (first.msg) return first.msg;
      if (first.message) return first.message;
    }
    return 'Request failed';
  }
  if (error?.request && !error.response) {
    return 'Network error: unable to reach API server';
  }
  return 'Request failed';
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Attempting login with credentials:', { 
        email: credentials.email, 
        role: credentials.role,
        hasPassword: !!credentials.password 
      });
      
      const response = await api.post('/auth/login', credentials);
      console.log('✅ Login successful, response:', response.data);
      
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('❌ Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Provide more specific error messages
      if (error.response?.status === 500) {
        return rejectWithValue('Backend server error. Please check if the server is running and database is connected.');
      } else if (error.response?.status === 404) {
        return rejectWithValue('Login endpoint not found. Please check backend server configuration.');
      } else if (error.response?.status === 401) {
        return rejectWithValue('Invalid email or password.');
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        return rejectWithValue('Cannot connect to server. Please check if backend is running on port 3100.');
      }
      
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;

