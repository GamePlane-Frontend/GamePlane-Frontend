import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchReferees = createAsyncThunk(
  'referees/fetchReferees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/referees');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch referees');
    }
  }
);

export const fetchRefereeById = createAsyncThunk(
  'referees/fetchRefereeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/referees/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch referee');
    }
  }
);

export const createReferee = createAsyncThunk(
  'referees/createReferee',
  async (refereeData, { rejectWithValue }) => {
    try {
      const payload = {
        first_name: refereeData.firstName,
        last_name: refereeData.lastName,
        email: refereeData.email || null,
        phone: refereeData.phone || null,
        experience: refereeData.experience ? Number(refereeData.experience) : null,
      };
      const response = await api.post('/referees', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create referee');
    }
  }
);

export const updateReferee = createAsyncThunk(
  'referees/updateReferee',
  async ({ id, refereeData }, { rejectWithValue }) => {
    try {
      const payload = {
        first_name: refereeData.firstName,
        last_name: refereeData.lastName,
        email: refereeData.email || null,
        phone: refereeData.phone || null,
        experience: refereeData.experience ? Number(refereeData.experience) : null,
      };
      const response = await api.put(`/referees/${id}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update referee');
    }
  }
);

export const deleteReferee = createAsyncThunk(
  'referees/deleteReferee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/referees/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete referee');
    }
  }
);

const initialState = {
  referees: [],
  currentReferee: null,
  loading: false,
  error: null,
};

const refereesSlice = createSlice({
  name: 'referees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentReferee: (state) => {
      state.currentReferee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch referees
      .addCase(fetchReferees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferees.fulfilled, (state, action) => {
        state.loading = false;
        state.referees = action.payload.data;
        state.error = null;
      })
      .addCase(fetchReferees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch referee by ID
      .addCase(fetchRefereeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRefereeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReferee = action.payload.data;
        state.error = null;
      })
      .addCase(fetchRefereeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create referee
      .addCase(createReferee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReferee.fulfilled, (state, action) => {
        state.loading = false;
        state.referees.push(action.payload.data);
        state.error = null;
      })
      .addCase(createReferee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update referee
      .addCase(updateReferee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReferee.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.referees.findIndex(referee => referee.id === action.payload.data.id);
        if (index !== -1) {
          state.referees[index] = action.payload.data;
        }
        if (state.currentReferee?.id === action.payload.data.id) {
          state.currentReferee = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateReferee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete referee
      .addCase(deleteReferee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReferee.fulfilled, (state, action) => {
        state.loading = false;
        state.referees = state.referees.filter(referee => referee.id !== action.payload.id);
        state.error = null;
      })
      .addCase(deleteReferee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentReferee } = refereesSlice.actions;
export default refereesSlice.reducer;

