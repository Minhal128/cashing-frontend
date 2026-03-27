"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface PlaidLinkProps {
    onSuccess: () => void;
    variant?: 'primary' | 'link';
}

export default function PlaidLink({ onSuccess, variant = 'primary' }: PlaidLinkProps) {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const createLinkToken = async () => {
            try {
                const response = await api.post('/plaid/create-link-token');
                setToken(response.data.link_token);
            } catch (error) {
                console.error('Error creating Plaid link token:', error);
                toast.error('Failed to initialize bank link');
            }
        };

        createLinkToken();
    }, []);

    const handleOnSuccess = useCallback(async (public_token: string, metadata: any) => {
        try {
            await api.post('/plaid/exchange-public-token', {
                public_token,
                metadata
            });
            toast.success('Bank account linked successfully');
            onSuccess();
        } catch (error) {
            console.error('Error exchanging public token:', error);
            toast.error('Failed to link bank account');
        }
    }, [onSuccess]);

    const config: Parameters<typeof usePlaidLink>[0] = {
        token,
        onSuccess: handleOnSuccess,
    };

    const { open, ready } = usePlaidLink(config);

    if (variant === 'link') {
        return (
            <button
                onClick={() => open()}
                disabled={!ready}
                className="text-[11px] text-[#82F764] hover:underline font-DMSans disabled:opacity-50"
            >
                Link with Plaid
            </button>
        );
    }

    return (
        <button
            onClick={() => open()}
            disabled={!ready}
            className="w-full h-10 px-4 mt-2 rounded-lg bg-[#82F764] text-black font-semibold hover:bg-[#6edb55] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Link bank account
        </button>
    );
}
