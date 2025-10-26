import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchVenues = createAsyncThunk(
  'venues/fetchVenues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/venues');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch venues');
    }
  }
);

export const fetchVenueById = createAsyncThunk(
  'venues/fetchVenueById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/venues/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch venue');
    }
  }
);

export const createVenue = createAsyncThunk(
  'venues/createVenue',
  async (venueData, { rejectWithValue }) => {
    try {
      const response = await api.post('/venues', venueData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create venue');
    }
  }
);

export const updateVenue = createAsyncThunk(
  'venues/updateVenue',
  async ({ id, venueData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/venues/${id}`, venueData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update venue');
    }
  }
);

export const deleteVenue = createAsyncThunk(
  'venues/deleteVenue',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/venues/${id}`);
      return { id, ...response.data };
    } catch (error) {
      console.error('Delete venue error:', error);
      
      // Handle specific error types
      if (error.response?.status === 404) {
        return rejectWithValue('Venue not found. It may have already been deleted.');
      } else if (error.response?.data?.error && error.response.data.error.includes('Foreign key constraint')) {
        return rejectWithValue('Cannot delete this venue because it is being used by existing fixtures/matches. Please remove or reassign all fixtures using this venue first.');
      } else {
        return rejectWithValue(error.response?.data?.error || 'Failed to delete venue');
      }
    }
  }
);

const initialState = {
  venues: [],
  currentVenue: null,
  loading: false,
  error: null,
};

const venuesSlice = createSlice({
  name: 'venues',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentVenue: (state) => {
      state.currentVenue = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch venues
      .addCase(fetchVenues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload.data;
        state.error = null;
      })
      .addCase(fetchVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch venue by ID
      .addCase(fetchVenueById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVenueById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVenue = action.payload.data;
        state.error = null;
      })
      .addCase(fetchVenueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create venue
      .addCase(createVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVenue.fulfilled, (state, action) => {
        state.loading = false;
        state.venues.push(action.payload.data);
        state.error = null;
      })
      .addCase(createVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update venue
      .addCase(updateVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVenue.fulfilled, (state, action) => {
        state.loading = false;
        const updatedVenue = action.payload.data;
        const index = state.venues.findIndex(venue => 
          (venue.id || venue.venue_id) === (updatedVenue.id || updatedVenue.venue_id)
        );
        if (index !== -1) {
          state.venues[index] = updatedVenue;
        }
        if ((state.currentVenue?.id || state.currentVenue?.venue_id) === (updatedVenue.id || updatedVenue.venue_id)) {
          state.currentVenue = updatedVenue;
        }
        state.error = null;
      })
      .addCase(updateVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete venue
      .addCase(deleteVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVenue.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.id;
        state.venues = state.venues.filter(venue => 
          (venue.id || venue.venue_id) !== deletedId
        );
        state.error = null;
      })
      .addCase(deleteVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentVenue } = venuesSlice.actions;
export default venuesSlice.reducer;

