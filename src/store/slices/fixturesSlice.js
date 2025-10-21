import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchFixtures = createAsyncThunk(
  'fixtures/fetchFixtures',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/fixtures');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch fixtures');
    }
  }
);

export const fetchFixturesByLeague = createAsyncThunk(
  'fixtures/fetchFixturesByLeague',
  async (leagueId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/leagues/${leagueId}/fixtures`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch fixtures');
    }
  }
);

export const fetchFixturesByTeam = createAsyncThunk(
  'fixtures/fetchFixturesByTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teams/${teamId}/fixtures`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch fixtures');
    }
  }
);

export const fetchFixturesByDateRange = createAsyncThunk(
  'fixtures/fetchFixturesByDateRange',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/fixtures/date-range?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch fixtures');
    }
  }
);

export const fetchFixtureById = createAsyncThunk(
  'fixtures/fetchFixtureById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/fixtures/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch fixture');
    }
  }
);

export const createFixture = createAsyncThunk(
  'fixtures/createFixture',
  async (fixtureData, { rejectWithValue }) => {
    try {
      const response = await api.post('/fixtures', fixtureData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create fixture');
    }
  }
);

export const updateFixture = createAsyncThunk(
  'fixtures/updateFixture',
  async ({ id, fixtureData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/fixtures/${id}`, fixtureData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update fixture');
    }
  }
);

export const updateFixtureStatus = createAsyncThunk(
  'fixtures/updateFixtureStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/fixtures/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update fixture status');
    }
  }
);

export const deleteFixture = createAsyncThunk(
  'fixtures/deleteFixture',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/fixtures/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete fixture');
    }
  }
);

const initialState = {
  fixtures: [],
  currentFixture: null,
  loading: false,
  error: null,
};

const fixturesSlice = createSlice({
  name: 'fixtures',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFixture: (state) => {
      state.currentFixture = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch fixtures
      .addCase(fetchFixtures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFixtures.fulfilled, (state, action) => {
        state.loading = false;
        state.fixtures = action.payload.data;
        state.error = null;
      })
      .addCase(fetchFixtures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch fixtures by league
      .addCase(fetchFixturesByLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFixturesByLeague.fulfilled, (state, action) => {
        state.loading = false;
        state.fixtures = action.payload.data;
        state.error = null;
      })
      .addCase(fetchFixturesByLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch fixtures by team
      .addCase(fetchFixturesByTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFixturesByTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.fixtures = action.payload.data;
        state.error = null;
      })
      .addCase(fetchFixturesByTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch fixtures by date range
      .addCase(fetchFixturesByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFixturesByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.fixtures = action.payload.data;
        state.error = null;
      })
      .addCase(fetchFixturesByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch fixture by ID
      .addCase(fetchFixtureById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFixtureById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFixture = action.payload.data;
        state.error = null;
      })
      .addCase(fetchFixtureById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create fixture
      .addCase(createFixture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFixture.fulfilled, (state, action) => {
        state.loading = false;
        state.fixtures.push(action.payload.data);
        state.error = null;
      })
      .addCase(createFixture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update fixture
      .addCase(updateFixture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFixture.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.fixtures.findIndex(fixture => fixture.id === action.payload.data.id);
        if (index !== -1) {
          state.fixtures[index] = action.payload.data;
        }
        if (state.currentFixture?.id === action.payload.data.id) {
          state.currentFixture = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateFixture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update fixture status
      .addCase(updateFixtureStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFixtureStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.fixtures.findIndex(fixture => fixture.id === action.payload.data.id);
        if (index !== -1) {
          state.fixtures[index] = action.payload.data;
        }
        if (state.currentFixture?.id === action.payload.data.id) {
          state.currentFixture = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateFixtureStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete fixture
      .addCase(deleteFixture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFixture.fulfilled, (state, action) => {
        state.loading = false;
        state.fixtures = state.fixtures.filter(fixture => fixture.id !== action.payload.id);
        state.error = null;
      })
      .addCase(deleteFixture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentFixture } = fixturesSlice.actions;
export default fixturesSlice.reducer;

