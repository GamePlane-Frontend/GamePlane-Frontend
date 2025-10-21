import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

function mapTeamPayload(data) {
  return {
    name: data.name,
    league_id: data.leagueId,
    // description omitted (not supported by backend Prisma model)
  };
}

// Async thunks
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teams');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch teams');
    }
  }
);

export const fetchTeamsByLeague = createAsyncThunk(
  'teams/fetchTeamsByLeague',
  async (leagueId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/leagues/${leagueId}/teams`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch teams');
    }
  }
);

export const fetchTeamById = createAsyncThunk(
  'teams/fetchTeamById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teams/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch team');
    }
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const payload = mapTeamPayload(teamData);
      const response = await api.post('/teams', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create team');
    }
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ id, teamData }, { rejectWithValue }) => {
    try {
      const payload = mapTeamPayload(teamData);
      const response = await api.put(`/teams/${id}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update team');
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/teams/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete team');
    }
  }
);

const initialState = {
  teams: [],
  currentTeam: null,
  loading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload.data;
        state.error = null;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch teams by league
      .addCase(fetchTeamsByLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamsByLeague.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload.data;
        state.error = null;
      })
      .addCase(fetchTeamsByLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch team by ID
      .addCase(fetchTeamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTeam = action.payload.data;
        state.error = null;
      })
      .addCase(fetchTeamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.push(action.payload.data);
        state.error = null;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update team
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data;
        const id = updated.id || updated.team_id;
        const index = state.teams.findIndex(team => (team.id || team.team_id) === id);
        if (index !== -1) {
          state.teams[index] = updated;
        }
        if ((state.currentTeam?.id || state.currentTeam?.team_id) === id) {
          state.currentTeam = updated;
        }
        state.error = null;
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete team
      .addCase(deleteTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.filter(team => (team.id || team.team_id) !== action.payload.id);
        state.error = null;
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentTeam } = teamsSlice.actions;
export default teamsSlice.reducer;

