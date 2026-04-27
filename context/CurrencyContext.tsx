"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

type Currency = 'USD' | 'EUR' | 'GBP' | 'PKR';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatCurrency: (amount: number) => string;
    getCurrencySymbol: () => string;
    isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const currencySymbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    PKR: '₨',
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>('USD');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserCurrency = async () => {
            if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await api.get('/wallet/profile');
                const userCurrency = res.data.currency as Currency;
                if (userCurrency && ['USD', 'EUR', 'GBP', 'PKR'].includes(userCurrency)) {
                    setCurrencyState(userCurrency);
                }
            } catch (error: unknown) {
                const isUnauthorized =
                    typeof error === 'object' &&
                    error !== null &&
                    'response' in error &&
                    typeof (error as { response?: { status?: number } }).response?.status === 'number' &&
                    (error as { response?: { status?: number } }).response?.status === 401;

                if (!isUnauthorized) {
                    console.error('Failed to fetch user currency:', error);
                }
                // Keep default USD
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserCurrency();
    }, []);

    const setCurrency = (newCurrency: Currency) => {
        console.log('CurrencyContext: Updating currency from', currency, 'to', newCurrency);
        setCurrencyState(newCurrency);
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const getCurrencySymbol = (): string => {
        return currencySymbols[currency];
    };

    // Debug: Log when currency changes
    useEffect(() => {
        console.log('CurrencyContext: Currency state changed to', currency);
    }, [currency]);

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                setCurrency,
                formatCurrency,
                getCurrencySymbol,
                isLoading,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
