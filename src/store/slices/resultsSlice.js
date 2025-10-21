import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchResults = createAsyncThunk(
  'results/fetchResults',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/results');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch results');
    }
  }
);

export const fetchResultsByLeague = createAsyncThunk(
  'results/fetchResultsByLeague',
  async (leagueId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/leagues/${leagueId}/results`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch results');
    }
  }
);

export const fetchResultsByTeam = createAsyncThunk(
  'results/fetchResultsByTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teams/${teamId}/results`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch results');
    }
  }
);

export const fetchResultByFixture = createAsyncThunk(
  'results/fetchResultByFixture',
  async (fixtureId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/fixtures/${fixtureId}/result`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch result');
    }
  }
);

export const fetchResultById = createAsyncThunk(
  'results/fetchResultById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/results/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch result');
    }
  }
);

export const createResult = createAsyncThunk(
  'results/createResult',
  async (resultData, { rejectWithValue }) => {
    try {
      const response = await api.post('/results', resultData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create result');
    }
  }
);

export const createResultByFixture = createAsyncThunk(
  'results/createResultByFixture',
  async ({ fixtureId, resultData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/fixtures/${fixtureId}/result`, resultData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create result');
    }
  }
);

export const updateResult = createAsyncThunk(
  'results/updateResult',
  async ({ id, resultData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/results/${id}`, resultData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update result');
    }
  }
);

export const updateResultByFixture = createAsyncThunk(
  'results/updateResultByFixture',
  async ({ fixtureId, resultData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/fixtures/${fixtureId}/result`, resultData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update result');
    }
  }
);

export const deleteResult = createAsyncThunk(
  'results/deleteResult',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/results/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete result');
    }
  }
);

export const deleteResultByFixture = createAsyncThunk(
  'results/deleteResultByFixture',
  async (fixtureId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/fixtures/${fixtureId}/result`);
      return { fixtureId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete result');
    }
  }
);

const initialState = {
  results: [],
  currentResult: null,
  loading: false,
  error: null,
};

const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentResult: (state) => {
      state.currentResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch results
      .addCase(fetchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
        state.error = null;
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch results by league
      .addCase(fetchResultsByLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResultsByLeague.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
        state.error = null;
      })
      .addCase(fetchResultsByLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch results by team
      .addCase(fetchResultsByTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResultsByTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
        state.error = null;
      })
      .addCase(fetchResultsByTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch result by fixture
      .addCase(fetchResultByFixture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResultByFixture.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload.data;
        state.error = null;
      })
      .addCase(fetchResultByFixture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch result by ID
      .addCase(fetchResultById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResultById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload.data;
        state.error = null;
      })
      .addCase(fetchResultById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create result
      .addCase(createResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResult.fulfilled, (state, action) => {
        state.loading = false;
        state.results.push(action.payload.data);
        state.error = null;
      })
      .addCase(createResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create result by fixture
      .addCase(createResultByFixture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResultByFixture.fulfilled, (state, action) => {
        state.loading = false;
        state.results.push(action.payload.data);
        state.error = null;
      })
      .addCase(createResultByFixture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update result
      .addCase(updateResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResult.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.results.findIndex(result => result.id === action.payload.data.id);
        if (index !== -1) {
          state.results[index] = action.payload.data;
        }
        if (state.currentResult?.id === action.payload.data.id) {
          state.currentResult = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update result by fixture
      .addCase(updateResultByFixture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResultByFixture.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.results.findIndex(result => result.id === action.payload.data.id);
        if (index !== -1) {
          state.results[index] = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateResultByFixture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete result
      .addCase(deleteResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResult.fulfilled, (state, action) => {
        state.loading = false;
        state.results = state.results.filter(result => result.id !== action.payload.id);
        state.error = null;
      })
      .addCase(deleteResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete result by fixture
      .addCase(deleteResultByFixture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResultByFixture.fulfilled, (state, action) => {
        state.loading = false;
        state.results = state.results.filter(result => result.fixtureId !== action.payload.fixtureId);
        state.error = null;
      })
      .addCase(deleteResultByFixture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentResult } = resultsSlice.actions;
export default resultsSlice.reducer;

