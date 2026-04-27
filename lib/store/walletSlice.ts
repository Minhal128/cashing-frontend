// Wallet slice - NO localStorage, all state in Redux memory
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

// Types
export interface Transaction {
    id: string;
    type: string;
    amount: string;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'reversed';
    description?: string;
    createdAt: string;
    sender?: {
        firstName: string;
        lastName: string;
    };
    receiver?: {
        firstName: string;
        lastName: string;
    };
}

export interface PayoutMethod {
    type: string;
    displayName: string;
    handle: string | null;
    isLinked: boolean;
    icon: string;
}

interface WalletState {
    balance: string | null;
    currency: string;
    transactions: Transaction[];
    totalTransactions: number;
    currentPage: number;
    payoutMethods: PayoutMethod[];
    kycVerified: boolean;
    dotsEnrolled: boolean;
    dotsVerified: boolean;
    dotsStatus: string;
    dotsVerificationFlowLink: string | null;
    isLoading: boolean;
    isTransactionsLoading: boolean;
    isPayoutLoading: boolean;
    error: string | null;
}

const initialState: WalletState = {
    balance: null,
    currency: 'USD',
    transactions: [],
    totalTransactions: 0,
    currentPage: 1,
    payoutMethods: [],
    kycVerified: false,
    dotsEnrolled: false,
    dotsVerified: false,
    dotsStatus: 'unknown',
    dotsVerificationFlowLink: null,
    isLoading: false,
    isTransactionsLoading: false,
    isPayoutLoading: false,
    error: null
};

// Async thunks
export const fetchBalance = createAsyncThunk(
    'wallet/fetchBalance',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/wallet/balance');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch balance');
        }
    }
);

export const fetchTransactions = createAsyncThunk(
    'wallet/fetchTransactions',
    async ({ page = 1, limit = 20 }: { page?: number; limit?: number }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/wallet/transactions?page=${page}&limit=${limit}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch transactions');
        }
    }
);

export const fetchPayoutMethods = createAsyncThunk(
    'wallet/fetchPayoutMethods',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/wallet/payout-methods');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch payout methods');
        }
    }
);

export const depositFunds = createAsyncThunk(
    'wallet/depositFunds',
    async ({ amount, paymentMethodId }: { amount: number; paymentMethodId: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/wallet/deposit', { amount, paymentMethodId });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Deposit failed');
        }
    }
);

export const withdrawFunds = createAsyncThunk(
    'wallet/withdrawFunds',
    async (
        { amount, destination, destinationDetails, description }: {
            amount: number;
            destination: string;
            destinationDetails: Record<string, string>;
            description?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/wallet/withdraw/payout', {
                amount,
                destination,
                destinationDetails,
                description
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message
                || error.response?.data?.error
                || 'Withdrawal failed'
            );
        }
    }
);

export const savePayoutMethod = createAsyncThunk(
    'wallet/savePayoutMethod',
    async ({ method, handle }: { method: string; handle: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/wallet/payout-methods', { method, handle });
            return { method, handle: response.data.data.handle };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to save payout method');
        }
    }
);

export const createPayoutMethodFlow = createAsyncThunk(
    'wallet/createPayoutMethodFlow',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post('/wallet/payout-methods/flow');
            return response.data.data.flowLink;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create payout method flow');
        }
    }
);

export const enrollForPayouts = createAsyncThunk(
    'wallet/enrollForPayouts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post('/wallet/withdraw/enroll');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to enroll for payouts');
        }
    }
);

export const createDotsVerificationFlow = createAsyncThunk(
    'wallet/createDotsVerificationFlow',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post('/wallet/withdraw/verify');
            return response.data.data.flowLink;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create verification flow');
        }
    }
);

// Slice
const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetWallet: () => initialState,
        // Optimistic balance update
        optimisticUpdateBalance: (state, action: PayloadAction<{ amount: number; type: 'credit' | 'debit' }>) => {
            if (state.balance !== null) {
                const currentBalance = parseFloat(state.balance);
                const newBalance = action.payload.type === 'credit'
                    ? currentBalance + action.payload.amount
                    : currentBalance - action.payload.amount;
                state.balance = newBalance.toFixed(2);
            }
        }
    },
    extraReducers: (builder) => {
        // Fetch balance
        builder.addCase(fetchBalance.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchBalance.fulfilled, (state, action) => {
            state.isLoading = false;
            state.balance = action.payload.balance;
            state.currency = action.payload.currency;
        });
        builder.addCase(fetchBalance.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch transactions
        builder.addCase(fetchTransactions.pending, (state) => {
            state.isTransactionsLoading = true;
        });
        builder.addCase(fetchTransactions.fulfilled, (state, action) => {
            state.isTransactionsLoading = false;
            state.transactions = action.payload.data;
            state.totalTransactions = action.payload.total;
            state.currentPage = action.payload.page;
        });
        builder.addCase(fetchTransactions.rejected, (state, action) => {
            state.isTransactionsLoading = false;
            state.error = action.payload as string;
        });

        // Fetch payout methods
        builder.addCase(fetchPayoutMethods.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchPayoutMethods.fulfilled, (state, action) => {
            state.isLoading = false;
            const incomingMethods = Array.isArray(action.payload.methods)
                ? action.payload.methods
                : [];

            const hasCryptoMethod = incomingMethods.some((method: PayoutMethod) => method.type === 'crypto');

            state.payoutMethods = hasCryptoMethod
                ? incomingMethods
                : [
                    {
                        type: 'crypto',
                        displayName: 'Crypto',
                        handle: null,
                        isLinked: false,
                        icon: '₿'
                    },
                    ...incomingMethods
                ];
            state.kycVerified = action.payload.kycVerified;
            state.dotsEnrolled = action.payload.dotsEnrolled;
            state.dotsVerified = action.payload.dotsVerified || false;
            state.dotsStatus = action.payload.dotsStatus || 'unknown';
        });
        builder.addCase(fetchPayoutMethods.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Deposit funds
        builder.addCase(depositFunds.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(depositFunds.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action.payload.balance !== undefined) {
                state.balance = action.payload.balance.toFixed(2);
            }
        });
        builder.addCase(depositFunds.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Withdraw funds
        builder.addCase(withdrawFunds.pending, (state) => {
            state.isPayoutLoading = true;
            state.error = null;
        });
        builder.addCase(withdrawFunds.fulfilled, (state, action) => {
            state.isPayoutLoading = false;
            state.balance = action.payload.newBalance;
        });
        builder.addCase(withdrawFunds.rejected, (state, action) => {
            state.isPayoutLoading = false;
            state.error = action.payload as string;
        });

        // Save payout method
        builder.addCase(savePayoutMethod.fulfilled, (state, action) => {
            const methodIndex = state.payoutMethods.findIndex(m => m.type === action.payload.method);
            if (methodIndex >= 0) {
                state.payoutMethods[methodIndex].handle = action.payload.handle;
                state.payoutMethods[methodIndex].isLinked = true;
            }
        });

        // Enroll for payouts
        builder.addCase(enrollForPayouts.fulfilled, (state) => {
            state.dotsEnrolled = true;
        });

        // Create Dots verification flow
        builder.addCase(createDotsVerificationFlow.fulfilled, (state, action) => {
            state.dotsVerificationFlowLink = action.payload;
        });
    }
});

// Actions
export const { clearError, resetWallet, optimisticUpdateBalance } = walletSlice.actions;

// Selectors
export const selectBalance = (state: { wallet: WalletState }) => state.wallet.balance;
export const selectCurrency = (state: { wallet: WalletState }) => state.wallet.currency;
export const selectTransactions = (state: { wallet: WalletState }) => state.wallet.transactions;
export const selectPayoutMethods = (state: { wallet: WalletState }) => state.wallet.payoutMethods;
export const selectIsLoading = (state: { wallet: WalletState }) => state.wallet.isLoading;
export const selectIsPayoutLoading = (state: { wallet: WalletState }) => state.wallet.isPayoutLoading;
export const selectError = (state: { wallet: WalletState }) => state.wallet.error;
export const selectKycVerified = (state: { wallet: WalletState }) => state.wallet.kycVerified;
export const selectDotsEnrolled = (state: { wallet: WalletState }) => state.wallet.dotsEnrolled;
export const selectDotsVerified = (state: { wallet: WalletState }) => state.wallet.dotsVerified;
export const selectDotsStatus = (state: { wallet: WalletState }) => state.wallet.dotsStatus;
export const selectDotsVerificationFlowLink = (state: { wallet: WalletState }) => state.wallet.dotsVerificationFlowLink;

export default walletSlice.reducer;
