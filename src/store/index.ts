import { configureStore } from '@reduxjs/toolkit';
import graphReducer from './slices/graph';

export const store = configureStore({
  reducer: {
    graph: graphReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;