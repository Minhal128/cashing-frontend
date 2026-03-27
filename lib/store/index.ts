import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './walletSlice';
import authReducer from './authSlice';

export const store = configureStore({
    reducer: {
        wallet: walletReducer,
        auth: authReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        }),
    devTools: process.env.NODE_ENV !== 'production'
});

// SECURITY: NO persistence to localStorage
// All state is in-memory only for financial data

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
