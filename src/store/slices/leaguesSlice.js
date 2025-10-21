import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

function toISODateString(dateStr) {
  if (!dateStr) return undefined;
  // If already looks like ISO, pass through
  if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) return dateStr;
  // Expecting YYYY-MM-DD from input; send start of day UTC
  return `${dateStr}T00:00:00.000Z`;
}

function mapLeaguePayload(data) {
  return {
    name: data.name,
    season: data.season || undefined,
    start_date: toISODateString(data.startDate),
    end_date: toISODateString(data.endDate),
    // description not included as backend does not accept it in Prisma model
  };
}

// Async thunks
export const fetchLeagues = createAsyncThunk(
  'leagues/fetchLeagues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leagues');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch leagues');
    }
  }
);

export const fetchLeagueById = createAsyncThunk(
  'leagues/fetchLeagueById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/leagues/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch league');
    }
  }
);

export const createLeague = createAsyncThunk(
  'leagues/createLeague',
  async (leagueData, { rejectWithValue }) => {
    try {
      const payload = mapLeaguePayload(leagueData);
      const response = await api.post('/leagues', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create league');
    }
  }
);

export const updateLeague = createAsyncThunk(
  'leagues/updateLeague',
  async ({ id, leagueData }, { rejectWithValue }) => {
    try {
      const payload = mapLeaguePayload(leagueData);
      const response = await api.put(`/leagues/${id}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update league');
    }
  }
);

export const deleteLeague = createAsyncThunk(
  'leagues/deleteLeague',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/leagues/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete league');
    }
  }
);

const initialState = {
  leagues: [],
  currentLeague: null,
  loading: false,
  error: null,
};

const leaguesSlice = createSlice({
  name: 'leagues',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentLeague: (state) => {
      state.currentLeague = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch leagues
      .addCase(fetchLeagues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeagues.fulfilled, (state, action) => {
        state.loading = false;
        state.leagues = action.payload.data;
        state.error = null;
      })
      .addCase(fetchLeagues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch league by ID
      .addCase(fetchLeagueById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeagueById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLeague = action.payload.data;
        state.error = null;
      })
      .addCase(fetchLeagueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create league
      .addCase(createLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLeague.fulfilled, (state, action) => {
        state.loading = false;
        state.leagues.push(action.payload.data);
        state.error = null;
      })
      .addCase(createLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update league
      .addCase(updateLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeague.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data;
        const id = updated.id || updated.league_id;
        const index = state.leagues.findIndex(league => (league.id || league.league_id) === id);
        if (index !== -1) {
          state.leagues[index] = updated;
        }
        if ((state.currentLeague?.id || state.currentLeague?.league_id) === id) {
          state.currentLeague = updated;
        }
        state.error = null;
      })
      .addCase(updateLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete league
      .addCase(deleteLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLeague.fulfilled, (state, action) => {
        state.loading = false;
        state.leagues = state.leagues.filter(league => (league.id || league.league_id) !== action.payload.id);
        state.error = null;
      })
      .addCase(deleteLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentLeague } = leaguesSlice.actions;
export default leaguesSlice.reducer;

