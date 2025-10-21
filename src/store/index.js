import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import usersSlice from './slices/usersSlice';
import leaguesSlice from './slices/leaguesSlice';
import teamsSlice from './slices/teamsSlice';
import playersSlice from './slices/playersSlice';
import fixturesSlice from './slices/fixturesSlice';
import resultsSlice from './slices/resultsSlice';
import refereesSlice from './slices/refereesSlice';
import venuesSlice from './slices/venuesSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: usersSlice,
    leagues: leaguesSlice,
    teams: teamsSlice,
    players: playersSlice,
    fixtures: fixturesSlice,
    results: resultsSlice,
    referees: refereesSlice,
    venues: venuesSlice,
  },
});

// Type definitions for TypeScript (if needed)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
