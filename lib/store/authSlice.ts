// Auth slice - NO localStorage for tokens, in-memory only
// Refresh token uses httpOnly cookie (set by server)
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

// SECURITY: DO NOT USE localStorage or sessionStorage for tokens
// Access token stored in Redux memory only
// Refresh token handled via httpOnly cookie

export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    tag?: string;
    profileImage?: string;
    kycStatus: 'pending' | 'processing' | 'verified' | 'requires_input' | 'failed';
    isVerified: boolean;
}

interface AuthState {
    user: User | null;
    accessToken: string | null; // In-memory only, NOT persisted
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
};

// Thunks
export const signIn = createAsyncThunk(
    'auth/signIn',
    async ({ email, password }: { email?: string; phone?: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/signin', { email, password });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Sign in failed');
        }
    }
);

export const signUp = createAsyncThunk(
    'auth/signUp',
    async (
        { email, phone, password, firstName, lastName }: {
            email: string;
            phone: string;
            password: string;
            firstName: string;
            lastName: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/auth/signup', {
                email,
                phone,
                password,
                firstName,
                lastName
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Sign up failed');
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { getState, rejectWithValue }) => {
        try {
            const response = await api.get('/auth/status');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ email, code }: { email: string; code: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/verify-otp', { email, code });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
        }
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearAuthError: (state) => {
            state.error = null;
        },
        updateKycStatus: (state, action: PayloadAction<User['kycStatus']>) => {
            if (state.user) {
                state.user.kycStatus = action.payload;
            }
        }
    },
    extraReducers: (builder) => {
        // Sign in
        builder.addCase(signIn.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(signIn.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = {
                _id: action.payload._id,
                email: action.payload.email,
                firstName: action.payload.firstName,
                lastName: action.payload.lastName,
                phone: action.payload.phone || '',
                kycStatus: action.payload.kycStatus || 'pending',
                isVerified: action.payload.isVerified
            };
            state.accessToken = action.payload.token;
            state.isAuthenticated = true;
        });
        builder.addCase(signIn.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Sign up
        builder.addCase(signUp.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(signUp.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = {
                _id: action.payload._id,
                email: action.payload.email,
                firstName: action.payload.firstName,
                lastName: action.payload.lastName,
                phone: action.payload.phone || '',
                kycStatus: 'pending',
                isVerified: false
            };
            state.accessToken = action.payload.token;
            state.isAuthenticated = true;
        });
        builder.addCase(signUp.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch current user
        builder.addCase(fetchCurrentUser.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = {
                _id: action.payload._id,
                email: action.payload.email,
                firstName: action.payload.firstName,
                lastName: action.payload.lastName,
                phone: action.payload.phone || '',
                tag: action.payload.tag,
                profileImage: action.payload.profileImage,
                kycStatus: action.payload.kycStatus || 'pending',
                isVerified: action.payload.isVerified
            };
            state.isAuthenticated = true;
        });
        builder.addCase(fetchCurrentUser.rejected, (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.accessToken = null;
            state.user = null;
        });

        // Verify OTP
        builder.addCase(verifyOtp.fulfilled, (state, action) => {
            state.accessToken = action.payload.token;
            state.isAuthenticated = true;
            if (state.user) {
                state.user.isVerified = true;
            }
        });
    }
});

// Actions
export const { setAccessToken, logout, clearAuthError, updateKycStatus } = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectKycStatus = (state: { auth: AuthState }) => state.auth.user?.kycStatus;

export default authSlice.reducer;
