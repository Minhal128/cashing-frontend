'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiLoader, FiAlertCircle, FiX, FiDollarSign } from 'react-icons/fi';
import { SiCashapp, SiVenmo, SiPaypal } from 'react-icons/si';
import { BsBank } from 'react-icons/bs';
import { FaBitcoin } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
    fetchPayoutMethods,
    fetchBalance,
    withdrawFunds,
    savePayoutMethod,
    createDotsVerificationFlow,
    createPayoutMethodFlow,
    selectPayoutMethods,
    selectIsPayoutLoading,
    selectKycVerified,
    selectDotsVerified,
    selectDotsStatus,
    selectDotsVerificationFlowLink,
    selectBalance,
    selectError,
    clearError
} from '@/lib/store/walletSlice';
import { toast } from 'react-hot-toast';

interface PayoutMethodsProps {
    onClose: () => void;
}

type Step = 'select' | 'enter-details' | 'amount' | 'confirm' | 'success';

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

export default function PayoutMethods({ onClose }: PayoutMethodsProps) {
    const dispatch = useAppDispatch();
    const payoutMethods = useAppSelector(selectPayoutMethods);
    const isLoading = useAppSelector(selectIsPayoutLoading);
    const kycVerified = useAppSelector(selectKycVerified);
    const dotsVerified = useAppSelector(selectDotsVerified);
    const dotsStatus = useAppSelector(selectDotsStatus);
    const dotsVerificationFlowLink = useAppSelector(selectDotsVerificationFlowLink);
    const balance = useAppSelector(selectBalance);
    const error = useAppSelector(selectError);

    const [step, setStep] = useState<Step>('select');
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [handle, setHandle] = useState('');
    const [amount, setAmount] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerifyDots = async () => {
        setIsVerifying(true);
        try {
            const flowLink = await dispatch(createPayoutMethodFlow()).unwrap();
            toast.success('Opening payout setup...');
            window.location.assign(flowLink);
        } catch (err) {
            toast.error('Failed to open payout setup');
        }
        setIsVerifying(false);
    };

    useEffect(() => {
        if (dotsVerificationFlowLink) {
            window.location.assign(dotsVerificationFlowLink);
        }
    }, [dotsVerificationFlowLink]);

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
        setSelectedMethod(methodType);
        const method = payoutMethods.find(m => m.type === methodType);

        if (method?.isLinked && method.handle) {
            setHandle(method.handle);
            setStep('amount');
        } else {
            setStep('enter-details');
        }
    };

    const handleAddPayoutMethodViaDots = async () => {
        try {
            const flowLink = await dispatch(createPayoutMethodFlow()).unwrap();
            toast.success('Opening Dots to link your payout method...');
            window.open(flowLink, '_blank');
        } catch (err) {
            toast.error('Failed to open verification');
        }
    };

    const handleSaveHandle = async () => {
        if (!handle.trim() || !selectedMethod) return;

        try {
            await dispatch(savePayoutMethod({ method: selectedMethod, handle })).unwrap();
            toast.success('Payout method saved!');
            
            const flowLink = await dispatch(createPayoutMethodFlow()).unwrap();
            toast.success('Opening Dots to link your account...');
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

        try {
            await dispatch(withdrawFunds({
                amount: amountNum,
                destination: apiDestination,
                destinationDetails
            })).unwrap();

            setStep('success');
        } catch (err) {
            // Error handled by slice
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
            bank_account: 'Bank Account',
            crypto: 'Crypto'
        };
        return names[type] || type;
    };

    // Render KYC required banner
    const needsVerification = !kycVerified || !dotsVerified;
    
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
                        
                        {!dotsVerified && kycVerified && (
                            <>
                                <h3 className="text-white text-lg font-medium mb-2">Payment Verification Required</h3>
                                <p className="text-[#8CA1C2] text-sm mb-4">
                                    Your account needs additional verification for payouts. Status: {dotsStatus}
                                </p>
                                <button
                                    onClick={handleVerifyDots}
                                    disabled={isVerifying}
                                    className="bg-[#82F764] text-black font-medium py-3 px-6 rounded-full hover:opacity-90 mb-4 disabled:opacity-50"
                                >
                                    {isVerifying ? <FiLoader className="animate-spin mx-auto" /> : 'Verify with Dots'}
                                </button>
                                <p className="text-[#8CA1C2] text-xs">
                                    Click to open Dots verification in a new tab
                                </p>
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

                {/* Step: Select Method */}
                {step === 'select' && (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            {payoutMethods.map((method) => (
                                <button
                                    key={method.type}
                                    onClick={() => handleSelectMethod(method.type)}
                                    className="bg-[#2A3244] hover:bg-[#3A4254] rounded-xl p-4 text-center transition-colors relative"
                                >
                                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${METHOD_COLORS[method.type] || 'bg-[#4A5568]'} flex items-center justify-center text-2xl`}>
                                        {getProviderIcon(method.type)}
                                    </div>
                                    <p className="text-white text-sm font-medium">{method.displayName}</p>
                                    {method.isLinked && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#82F764] rounded-full flex items-center justify-center">
                                            <FiCheck className="text-black text-xs" />
                                        </div>
                                    )}
                                    {method.handle && (
                                        <p className="text-[#8CA1C2] text-xs mt-1 truncate">{method.handle}</p>
                                    )}
                                </button>
                            ))}
                        </div>

                        {dotsVerified && (
                            <button
                                onClick={handleAddPayoutMethodViaDots}
                                className="w-full mt-4 bg-[#2A3244] hover:bg-[#3A4254] text-[#82F764] py-3 px-4 rounded-xl transition-colors text-sm"
                            >
                                + Link a new payout account via Dots
                            </button>
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
                            placeholder={getHandlePlaceholder(selectedMethod)}
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            className="w-full bg-[#2A3244] text-white placeholder-[#8CA1C2] px-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-[#82F764]"
                        />

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
                                disabled={isLoading}
                                className="flex-1 bg-[#82F764] text-black font-medium py-3 rounded-full hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
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
                            ${parseFloat(amount).toFixed(2)} is on its way to your {formatMethodName(selectedMethod || '')} account.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-[#82F764] text-black font-medium py-3 px-8 rounded-full hover:opacity-90"
                        >
                            Done
                        </button>
                    </div>
                )}

                {/* Powered by Dots */}
                <div className="mt-6 flex justify-center">
                    <div className="flex items-center gap-2 text-[#8CA1C2] text-xs">
                        <span>Powered by</span>
                        <span className="font-semibold">Dots</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
