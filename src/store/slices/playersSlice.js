import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

function coerceTeamId(teamId) {
  if (teamId == null) return teamId;
  const isNumeric = typeof teamId === 'string' ? /^\d+$/.test(teamId) : typeof teamId === 'number';
  return isNumeric ? Number(teamId) : teamId;
}

// Async thunks
export const fetchPlayers = createAsyncThunk(
  'players/fetchPlayers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/players');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch players');
    }
  }
);

export const fetchPlayersByTeam = createAsyncThunk(
  'players/fetchPlayersByTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teams/${teamId}/players`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch players');
    }
  }
);

export const fetchPlayerById = createAsyncThunk(
  'players/fetchPlayerById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/players/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch player');
    }
  }
);

export const createPlayer = createAsyncThunk(
  'players/createPlayer',
  async (playerData, { rejectWithValue }) => {
    try {
      const payload = {
        first_name: playerData.firstName,
        last_name: playerData.lastName,
        position: playerData.position || null,
        jersey_number: playerData.number ? Number(playerData.number) : null,
        team_id: coerceTeamId(playerData.teamId),
      };
      const response = await api.post('/players', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create player');
    }
  }
);

export const updatePlayer = createAsyncThunk(
  'players/updatePlayer',
  async ({ id, playerData }, { rejectWithValue }) => {
    try {
      const payload = {
        first_name: playerData.firstName,
        last_name: playerData.lastName,
        position: playerData.position || null,
        jersey_number: playerData.number ? Number(playerData.number) : null,
        team_id: coerceTeamId(playerData.teamId),
      };
      const response = await api.put(`/players/${id}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update player');
    }
  }
);

export const deletePlayer = createAsyncThunk(
  'players/deletePlayer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/players/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete player');
    }
  }
);

const initialState = {
  players: [],
  currentPlayer: null,
  loading: false,
  error: null,
};

const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPlayer: (state) => {
      state.currentPlayer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch players
      .addCase(fetchPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload.data;
        state.error = null;
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch players by team
      .addCase(fetchPlayersByTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayersByTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload.data;
        state.error = null;
      })
      .addCase(fetchPlayersByTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch player by ID
      .addCase(fetchPlayerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlayer = action.payload.data;
        state.error = null;
      })
      .addCase(fetchPlayerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create player
      .addCase(createPlayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlayer.fulfilled, (state, action) => {
        state.loading = false;
        state.players.push(action.payload.data);
        state.error = null;
      })
      .addCase(createPlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update player
      .addCase(updatePlayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlayer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.players.findIndex(player => player.id === action.payload.data.id);
        if (index !== -1) {
          state.players[index] = action.payload.data;
        }
        if (state.currentPlayer?.id === action.payload.data.id) {
          state.currentPlayer = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updatePlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete player
      .addCase(deletePlayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlayer.fulfilled, (state, action) => {
        state.loading = false;
        state.players = state.players.filter(player => player.id !== action.payload.id);
        state.error = null;
      })
      .addCase(deletePlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentPlayer } = playersSlice.actions;
export default playersSlice.reducer;

