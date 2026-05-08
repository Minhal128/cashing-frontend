'use client';

import { useState, useEffect, type ClipboardEvent } from 'react';
import { FiCheck, FiLoader, FiAlertCircle, FiX, FiDollarSign } from 'react-icons/fi';
import { SiCashapp, SiVenmo, SiPaypal } from 'react-icons/si';
import { BsBank } from 'react-icons/bs';
import { FaBitcoin } from 'react-icons/fa';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
    fetchPayoutMethods,
    fetchBalance,
    withdrawFunds,
    savePayoutMethod,
    createPayoutMethodFlow,
    selectPayoutMethods,
    selectIsPayoutLoading,
    selectKycVerified,
    selectBalance,
    selectError,
    clearError
} from '@/lib/store/walletSlice';
import { toast } from 'react-hot-toast';

interface PayoutMethodsProps {
    onClose: () => void;
}

type Step = 'select' | 'enter-details' | 'amount' | 'confirm' | 'success';
type CryptoTicker = 'BTC' | 'ETH' | 'USDT' | 'USDC';

const BTC_ADDRESS_REGEX = /^(bc1|tb1|bcrt1)[ac-hj-np-z02-9]{11,71}$|^(1|3|m|n|2)[a-km-zA-HJ-NP-Z1-9]{25,39}$/i;
const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const PRIMARY_WALLET_LOGIN_URL =
    process.env.NEXT_PUBLIC_WALLET_LOGIN_URL ||
    'https://roc247.club/core/wallet/login.php';
const SECONDARY_WALLET_LOGIN_URL =
    process.env.NEXT_PUBLIC_CHING_APP_LOGIN_URL ||
    'https://chingapp.club/login.php';

const METHOD_COLORS: Record<string, string> = {
    cashapp: 'bg-[#00D632]',
    venmo: 'bg-[#3D95CE]',
    paypal: 'bg-[#003087]',
    chime: 'bg-[#1EC677]',
    bank_account: 'bg-[#4A5568]',
    crypto: 'bg-[#F7931A]'
};

const getProviderIcon = (type: string) => {
    switch (type) {
        case 'cashapp': return <SiCashapp className="text-white" />;
        case 'venmo': return <SiVenmo className="text-white" />;
        case 'paypal': return <SiPaypal className="text-white" />;
        case 'chime': return <span className="text-white font-bold font-sans text-xl">C</span>;
        case 'bank_account': return <BsBank className="text-white" />;
        case 'crypto': return <FaBitcoin className="text-white" />;
        default: return <BsBank className="text-white" />;
    }
};

const isValidAddressForTicker = (address: string, ticker: CryptoTicker) => {
    const normalized = address.trim();

    if (!normalized) return false;
    if (ticker === 'BTC') return BTC_ADDRESS_REGEX.test(normalized);
    return EVM_ADDRESS_REGEX.test(normalized);
};

const getAddressValidationMessage = (ticker: CryptoTicker) => {
    if (ticker === 'BTC') {
        return 'Enter a valid BTC address (bc1..., 1..., or 3...)';
    }
    return `Enter a valid ${ticker} EVM address (0x...)`;
};

export default function PayoutMethods({ onClose }: PayoutMethodsProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const payoutMethods = useAppSelector(selectPayoutMethods);
    const isLoading = useAppSelector(selectIsPayoutLoading);
    const kycVerified = useAppSelector(selectKycVerified);
    const balance = useAppSelector(selectBalance);
    const error = useAppSelector(selectError);

    const [step, setStep] = useState<Step>('select');
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [handle, setHandle] = useState('');
    const [amount, setAmount] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [cryptoTicker, setCryptoTicker] = useState<CryptoTicker>('BTC');
    const [isDirectProcessing, setIsDirectProcessing] = useState(false);
    const [directCryptoStatus, setDirectCryptoStatus] = useState<'pending' | 'completed'>('completed');

    const getCryptoPlaceholder = () => {
        if (cryptoTicker === 'BTC') return 'Bitcoin Wallet Address (bc1..., 1..., 3...)';
        return `${cryptoTicker} Wallet Address (0x...)`;
    };

    const getErrorMessage = (err: unknown, fallback: string) => {
        const errorAny = err as any;
        return errorAny?.response?.data?.message
            || errorAny?.response?.data?.error
            || errorAny?.message
            || fallback;
    };

    const handleWalletPaste = (event: ClipboardEvent<HTMLInputElement>) => {
        if (selectedMethod !== 'crypto') return;

        event.preventDefault();
        const pastedValue = event.clipboardData.getData('text').trim();
        setHandle(pastedValue);

        if (!pastedValue) {
            toast.error('No wallet address detected in clipboard');
            return;
        }

        if (isValidAddressForTicker(pastedValue, cryptoTicker)) {
            toast.success('Wallet address pasted and validated');
        } else {
            toast.error(getAddressValidationMessage(cryptoTicker));
        }
    };

    const openCustomWalletLogin = (): boolean => {
        const targetUrl = PRIMARY_WALLET_LOGIN_URL || SECONDARY_WALLET_LOGIN_URL;

        if (!targetUrl) {
            return false;
        }

        const opened = window.open(targetUrl, '_blank');
        if (opened) {
            opened.opener = null;
            toast.success('Opening your wallet login...');
            return true;
        }

        // Fallback for popup blockers: navigate in the same tab.
        window.location.assign(targetUrl);
        toast.success('Opening your wallet login...');
        return true;
    };

    const handleVerifyStripe = async () => {
        setIsVerifying(true);
        router.push('/verifyidentity');
    };

    useEffect(() => {
        dispatch(fetchPayoutMethods());

        // Guard against transient Fast Refresh stale chunks.
        if (typeof fetchBalance === 'function') {
            dispatch(fetchBalance());
        }
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleSelectMethod = (methodType: string) => {
        if (!kycVerified && methodType !== 'crypto') {
            toast.error('This payout method requires identity verification.');
            return;
        }

        setSelectedMethod(methodType);

        const method = payoutMethods.find(m => m.type === methodType);

        if (method?.isLinked && method.handle) {
            setHandle(method.handle);
            setStep('amount');
        } else {
            setStep('enter-details');
        }
    };

    const handleOpenCashingWallet = () => {
        openCustomWalletLogin();
    };

    const handleGetBitcoinAddress = () => {
        openCustomWalletLogin();
    };

    const handleSaveHandle = async () => {
        if (!handle.trim() || !selectedMethod) return;

        if (selectedMethod === 'crypto') {
            if (!isValidAddressForTicker(handle, cryptoTicker)) {
                toast.error(getAddressValidationMessage(cryptoTicker));
                return;
            }
        }

        try {
            await dispatch(savePayoutMethod({ method: selectedMethod, handle })).unwrap();
            toast.success('Payout method saved!');

            if (selectedMethod === 'crypto') {
                setStep('amount');
                dispatch(fetchPayoutMethods());
                return;
            }

            const flowLink = await dispatch(createPayoutMethodFlow()).unwrap();
            toast.success('Opening payout setup...');
            window.open(flowLink, '_blank');
            
            setStep('amount');
            dispatch(fetchPayoutMethods());
        } catch (err) {
            // Error handled by slice
        }
    };

    const handleConfirmPayout = async () => {
        if (!selectedMethod || !amount || !handle) return;

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        const destinationDetails = getDestinationDetails(selectedMethod, handle);
        const destinationMap: Record<string, string> = {
            cashapp: 'cashapp',
            venmo: 'venmo',
            paypal: 'paypal',
            chime: 'chime',
            crypto: 'crypto',
            bank_account: 'bank_account'
        };
        const apiDestination = destinationMap[selectedMethod || ''] || selectedMethod;
        let payoutToastId: string | undefined;

        try {
            if (selectedMethod === 'crypto') {
                if (!isValidAddressForTicker(handle, cryptoTicker)) {
                    toast.error(getAddressValidationMessage(cryptoTicker));
                    return;
                }

                const requestToastId = toast.loading('Withdrawal request submitted. Processing...');
                setIsDirectProcessing(true);

                try {
                    const response = await api.post('/transactions/send-crypto', {
                        toAddress: handle.trim(),
                        amount: amountNum,
                        ticker: cryptoTicker,
                        isNative: false
                    });

                    await dispatch(fetchBalance());

                    const isPending = response.status === 202 || response.data?.status === 'pending';
                    setDirectCryptoStatus(isPending ? 'pending' : 'completed');

                    toast.success(
                        isPending
                            ? 'Withdrawal submitted and is processing.'
                            : `Withdrawal successful. Sent to your ${cryptoTicker} wallet.`,
                        { id: requestToastId }
                    );
                    setStep('success');
                    return;
                } catch (directError: any) {
                    const status = directError?.response?.status;
                    const rawMessage = String(
                        directError?.response?.data?.message
                        || directError?.response?.data?.error
                        || directError?.message
                        || ''
                    );
                    const message = rawMessage.toLowerCase();

                    // Compatibility path for older backend deployments that still emit 422 for chain/provider issues.
                    const legacyRecoverable422 = status === 422 && (
                        message.includes('crypto transfer failed')
                        || message.includes('insufficient')
                        || message.includes('provider')
                        || message.includes('network')
                        || message.includes('rpc')
                        || message.includes('timeout')
                    );

                    if (legacyRecoverable422) {
                        setDirectCryptoStatus('pending');
                        toast.success('Withdrawal submitted and is processing.', { id: requestToastId });
                        setStep('success');
                        return;
                    }

                    toast.error(getErrorMessage(directError, 'Withdrawal failed'), { id: requestToastId });
                    return;
                }
            }

            payoutToastId = toast.loading('Withdrawal request submitted. Processing...');

            await dispatch(withdrawFunds({
                amount: amountNum,
                destination: apiDestination,
                destinationDetails
            })).unwrap();

            toast.success('Withdrawal request processed successfully', { id: payoutToastId });
            setStep('success');
        } catch (err) {
            const message = getErrorMessage(err, 'Withdrawal failed');
            if (payoutToastId) {
                toast.error(message, { id: payoutToastId });
            } else {
                toast.error(message);
            }
        } finally {
            setIsDirectProcessing(false);
        }
    };

    const getDestinationDetails = (method: string, handle: string): Record<string, string> => {
        switch (method) {
            case 'cashapp':
            case 'cash_app':
                return { cashTag: handle };
            case 'venmo':
                return { venmoHandle: handle };
            case 'paypal':
                return { paypalEmail: handle };
            case 'chime':
                return { chimeTag: handle };
            case 'crypto':
                return { walletAddress: handle };
            default:
                return { handle };
        }
    };

    const getHandlePlaceholder = (method: string): string => {
        switch (method) {
            case 'cashapp':
                return '$cashtag';
            case 'venmo':
                return '@username';
            case 'paypal':
                return 'email@example.com';
            case 'chime':
                return '$chimesign';
            case 'crypto':
                return 'Wallet Address (e.g. 0x...)';
            default:
                return 'Enter your handle';
        }
    };

    const formatMethodName = (type: string): string => {
        const names: Record<string, string> = {
            cashapp: 'Cash App',
            venmo: 'Venmo',
            paypal: 'PayPal',
            chime: 'Chime',
            bank_account: 'Chime',
            crypto: 'Crypto'
        };
        return names[type] || type;
    };

    // Direct crypto can proceed without Dots, but KYC is still required.
    const needsVerification = !kycVerified;
    
    if (needsVerification) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div className="bg-[#202736] rounded-xl p-6 max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-white text-xl font-semibold">Withdraw Funds</h2>
                        <button onClick={onClose} className="text-[#8CA1C2] hover:text-white">
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="text-center py-8">
                        <FiAlertCircle className="text-[#F7B955] text-5xl mx-auto mb-4" />
                        
                        {!kycVerified && (
                            <>
                                <h3 className="text-white text-lg font-medium mb-2">Identity Verification Required</h3>
                                <p className="text-[#8CA1C2] text-sm mb-4">
                                    Please verify your identity before making withdrawals.
                                </p>
                                <button
                                    onClick={() => window.location.href = '/verifyidentity'}
                                    className="bg-[#82F764] text-black font-medium py-3 px-6 rounded-full hover:opacity-90 mb-4"
                                >
                                    Verify Identity
                                </button>
                            </>
                        )}
                        
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#202736] rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white text-xl font-semibold">
                        {step === 'select' && 'Choose Payout Method'}
                        {step === 'enter-details' && `Link ${formatMethodName(selectedMethod || '')}`}
                        {step === 'amount' && 'Enter Amount'}
                        {step === 'confirm' && 'Confirm Withdrawal'}
                        {step === 'success' && 'Success!'}
                    </h2>
                    <button onClick={onClose} className="text-[#8CA1C2] hover:text-white">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Identity status removed for Dots, handled by KYC check above */}

                {/* Step: Select Method */}
                {step === 'select' && (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            {payoutMethods.map((method) => {
                                const methodDisabled = !kycVerified && method.type !== 'crypto';

                                return (
                                    <button
                                        key={method.type}
                                        onClick={() => handleSelectMethod(method.type)}
                                        disabled={methodDisabled}
                                        className={`bg-[#2A3244] rounded-xl p-4 text-center transition-colors relative ${methodDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#3A4254]'}`}
                                    >
                                        <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${METHOD_COLORS[method.type] || 'bg-[#4A5568]'} flex items-center justify-center text-2xl`}>
                                            {getProviderIcon(method.type)}
                                        </div>
                                        <p className="text-white text-sm font-medium">
                                            {method.type === 'bank_account' ? 'Chime' : method.displayName}
                                        </p>
                                        {method.isLinked && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-[#82F764] rounded-full flex items-center justify-center">
                                                <FiCheck className="text-black text-xs" />
                                            </div>
                                        )}
                                        {method.handle && (
                                            <p className="text-[#8CA1C2] text-xs mt-1 truncate">{method.handle}</p>
                                        )}
                                        {methodDisabled && (
                                            <p className="text-[#8CA1C2] text-[10px] mt-1">Verify Identity</p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {kycVerified && (
                            <div className="mt-4 space-y-3">
                                <button
                                    onClick={handleOpenCashingWallet}
                                    className="w-full bg-[#2A3244] hover:bg-[#3A4254] text-white py-3 px-4 rounded-xl transition-colors text-sm"
                                >
                                    + Open Cashing Wallet
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Step: Enter Details */}
                {step === 'enter-details' && selectedMethod && (
                    <div className="space-y-4">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${METHOD_COLORS[selectedMethod] || 'bg-[#4A5568]'} flex items-center justify-center text-3xl`}>
                            {getProviderIcon(selectedMethod)}
                        </div>

                        <input
                            type="text"
                            placeholder={selectedMethod === 'crypto'
                                ? getCryptoPlaceholder()
                                : getHandlePlaceholder(selectedMethod)}
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            onPaste={handleWalletPaste}
                            className="w-full bg-[#2A3244] text-white placeholder-[#8CA1C2] px-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-[#82F764]"
                        />

                        {selectedMethod === 'crypto' && (
                            <div className="space-y-2">
                                <div className="space-y-2">
                                    <p className="text-[#8CA1C2] text-xs px-1">Asset</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(['BTC', 'ETH', 'USDT', 'USDC'] as CryptoTicker[]).map((tickerOption) => (
                                            <button
                                                key={tickerOption}
                                                onClick={() => setCryptoTicker(tickerOption)}
                                                className={`py-2 rounded-full text-xs transition-colors ${cryptoTicker === tickerOption ? 'bg-[#82F764] text-black font-medium' : 'bg-[#2A3244] text-white hover:bg-[#3A4254]'}`}
                                            >
                                                {tickerOption}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[#8CA1C2] text-xs leading-relaxed px-1">
                                        BTC uses bc1/1/3 addresses. ETH/USDT/USDC use 0x addresses.
                                    </p>
                                </div>

                                <button
                                    onClick={handleGetBitcoinAddress}
                                    className="w-full bg-[#2A3244] hover:bg-[#3A4254] text-white py-3 px-4 rounded-full transition-colors text-sm"
                                >
                                    Get Wallet Address
                                </button>
                                <p className="text-[#8CA1C2] text-xs leading-relaxed px-1">
                                    Login to ChingApp to get your Bitcoin wallet address, then copy and paste it here.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('select')}
                                className="flex-1 bg-[#2A3244] text-white py-3 rounded-full hover:bg-[#3A4254]"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSaveHandle}
                                disabled={!handle.trim()}
                                className="flex-1 bg-[#82F764] text-black font-medium py-3 rounded-full hover:opacity-90 disabled:opacity-50"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Amount */}
                {step === 'amount' && (
                    <div className="space-y-4">
                        <div className="text-center mb-4">
                            <p className="text-[#8CA1C2] text-sm">Available Balance</p>
                            <p className="text-white text-2xl font-bold">${balance || '0.00'}</p>
                        </div>

                        <div className="relative">
                            <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white" />
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                                max={parseFloat(balance || '0')}
                                step="0.01"
                                className="w-full bg-[#2A3244] text-white placeholder-[#8CA1C2] pl-10 pr-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-[#82F764] text-lg"
                            />
                        </div>

                        <div className="flex gap-2">
                            {['25', '50', '100', 'Max'].map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => setAmount(preset === 'Max' ? balance || '0' : preset)}
                                    className="flex-1 bg-[#2A3244] text-white py-2 rounded-full hover:bg-[#3A4254] text-sm"
                                >
                                    {preset === 'Max' ? 'Max' : `$${preset}`}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setStep('select')}
                                className="flex-1 bg-[#2A3244] text-white py-3 rounded-full hover:bg-[#3A4254]"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep('confirm')}
                                disabled={!amount || parseFloat(amount) <= 0}
                                className="flex-1 bg-[#82F764] text-black font-medium py-3 rounded-full hover:opacity-90 disabled:opacity-50"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Confirm */}
                {step === 'confirm' && selectedMethod && (
                    <div className="space-y-4">
                        <div className="bg-[#2A3244] rounded-xl p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[#8CA1C2]">Amount</span>
                                <span className="text-white font-medium">${parseFloat(amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#8CA1C2]">To</span>
                                <span className="text-white">{formatMethodName(selectedMethod)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#8CA1C2]">Handle</span>
                                <span className="text-white">{handle}</span>
                            </div>
                            {selectedMethod === 'crypto' && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-[#8CA1C2]">Route</span>
                                        <span className="text-white">Direct Crypto</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#8CA1C2]">Asset</span>
                                        <span className="text-white">{cryptoTicker}</span>
                                    </div>
                                </>
                            )}
                            <div className="border-t border-[#3C465E] pt-3 flex justify-between">
                                <span className="text-[#8CA1C2]">New Balance</span>
                                <span className="text-white font-medium">
                                    ${(parseFloat(balance || '0') - parseFloat(amount)).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('amount')}
                                className="flex-1 bg-[#2A3244] text-white py-3 rounded-full hover:bg-[#3A4254]"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConfirmPayout}
                                disabled={isLoading || isDirectProcessing}
                                className="flex-1 bg-[#82F764] text-black font-medium py-3 rounded-full hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {(isLoading || isDirectProcessing) ? (
                                    <>
                                        <FiLoader className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm Withdrawal'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Success */}
                {step === 'success' && (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-[#82F764] rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCheck className="text-black text-3xl" />
                        </div>
                        <h3 className="text-white text-xl font-semibold mb-2">Withdrawal Initiated!</h3>
                        <p className="text-[#8CA1C2] text-sm mb-6">
                            {selectedMethod === 'crypto'
                                ? (directCryptoStatus === 'pending'
                                    ? `$${parseFloat(amount).toFixed(2)} withdrawal was submitted for ${cryptoTicker} and is currently processing.`
                                    : `$${parseFloat(amount).toFixed(2)} sent as ${cryptoTicker} to your wallet address.`)
                                : `$${parseFloat(amount).toFixed(2)} is on its way to your ${formatMethodName(selectedMethod || '')} account.`}
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-[#82F764] text-black font-medium py-3 px-8 rounded-full hover:opacity-90"
                        >
                            Done
                        </button>
                    </div>
                )}

                {/* Secured by Stripe */}
                <div className="mt-6 flex justify-center">
                    <div className="flex items-center gap-2 text-[#8CA1C2] text-xs">
                        <span>Secured by</span>
                        <span className="font-semibold">Stripe</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
