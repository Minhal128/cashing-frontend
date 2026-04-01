'use client';

import { useState } from 'react';
import { FiX, FiCreditCard, FiDollarSign, FiLoader, FiCheck, FiChevronLeft } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { depositFunds, fetchBalance, selectIsLoading } from '@/lib/store/walletSlice';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface AddFundsModalProps {
    onClose: () => void;
}

type PaymentMethod = 'card' | 'cashapp' | 'venmo' | 'paypal' | 'current';
type Step = 'select' | 'amount' | 'processing' | 'success';

interface PaymentOption {
    id: PaymentMethod;
    name: string;
    icon: string;
    color: string;
    bgColor: string;
    description: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
    {
        id: 'card',
        name: 'Debit Card',
        icon: '💳',
        color: '#6366F1',
        bgColor: 'bg-gradient-to-br from-[#667EEA] to-[#764BA2]',
        description: 'Visa, Mastercard, Discover'
    },
    {
        id: 'cashapp',
        name: 'Cash App',
        icon: '💵',
        color: '#00D632',
        bgColor: 'bg-gradient-to-br from-[#00D632] to-[#00B329]',
        description: 'Instant transfer'
    },
    {
        id: 'venmo',
        name: 'Venmo',
        icon: '💙',
        color: '#008CFF',
        bgColor: 'bg-gradient-to-br from-[#3D95CE] to-[#008CFF]',
        description: 'Connect your Venmo'
    },
    {
        id: 'paypal',
        name: 'PayPal',
        icon: '🅿️',
        color: '#003087',
        bgColor: 'bg-gradient-to-br from-[#003087] to-[#0070E0]',
        description: 'PayPal balance or card'
    },
    {
        id: 'current',
        name: 'Chime',
        icon: 'C',
        color: '#22C55E',
        bgColor: 'bg-gradient-to-br from-[#22C55E] to-[#15803D]',
        description: 'Chime account - instant'
    }
];

const QUICK_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export default function AddFundsModal({ onClose }: AddFundsModalProps) {
    const dispatch = useAppDispatch();
    const isLoading = useAppSelector(selectIsLoading);

    const [step, setStep] = useState<Step>('select');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [amount, setAmount] = useState('');
    const [customAmount, setCustomAmount] = useState('');

    const handleSelectMethod = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setStep('amount');
    };

    const handleAmountSelect = (value: number) => {
        setAmount(value.toString());
        setCustomAmount('');
    };

    const handleCustomAmountChange = (value: string) => {
        // Only allow numbers and decimal point
        const sanitized = value.replace(/[^0-9.]/g, '');
        // Prevent multiple decimal points
        const parts = sanitized.split('.');
        if (parts.length > 2) return;
        // Limit decimal places to 2
        if (parts[1] && parts[1].length > 2) return;
        
        setCustomAmount(sanitized);
        setAmount(sanitized);
    };

    const getEffectiveAmount = (): number => {
        return parseFloat(amount) || 0;
    };

    const handleDeposit = async () => {
        const depositAmount = getEffectiveAmount();
        
        if (depositAmount < 1) {
            toast.error('Minimum deposit is $1.00');
            return;
        }

        if (depositAmount > 10000) {
            toast.error('Maximum deposit is $10,000');
            return;
        }

        setStep('processing');

        try {
            // For demo purposes, simulate processing
            // In production, this would integrate with Stripe Connect
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success
            setStep('success');
            
            // Refresh balance
            dispatch(fetchBalance());
            window.dispatchEvent(new CustomEvent('refresh-balances'));
            
            toast.success(`$${depositAmount.toFixed(2)} added successfully!`);
        } catch (error: any) {
            toast.error(error.message || 'Deposit failed');
            setStep('amount');
        }
    };

    const selectedOption = PAYMENT_OPTIONS.find(p => p.id === selectedMethod);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#2A3244]">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-[#202736] to-[#2A3244] px-6 py-4 border-b border-[#2A3244]">
                    <div className="flex items-center justify-between">
                        {step !== 'select' && step !== 'success' && (
                            <button
                                onClick={() => step === 'amount' ? setStep('select') : null}
                                className="text-[#8CA1C2] hover:text-white transition-colors"
                            >
                                <FiChevronLeft size={24} />
                            </button>
                        )}
                        <h2 className="text-white text-xl font-semibold flex-1 text-center">
                            {step === 'select' && 'Add Funds'}
                            {step === 'amount' && 'Enter Amount'}
                            {step === 'processing' && 'Processing'}
                            {step === 'success' && 'Success!'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-[#8CA1C2] hover:text-white transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step: Select Payment Method */}
                    {step === 'select' && (
                        <div className="space-y-3">
                            <p className="text-[#8CA1C2] text-sm text-center mb-4">
                                Choose how you want to add funds
                            </p>

                            {PAYMENT_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleSelectMethod(option.id)}
                                    className="w-full bg-[#202736] hover:bg-[#2A3244] border border-[#2A3244] hover:border-[#82F764]/40 rounded-xl p-5 flex items-center gap-4 transition-all duration-300 group hover:shadow-lg hover:shadow-[#82F764]/10 hover:scale-[1.02]"
                                >
                                    <div className={`w-16 h-16 ${option.bgColor} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300`}>
                                        {option.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-white font-semibold text-lg group-hover:text-[#82F764] transition-colors">{option.name}</p>
                                        <p className="text-[#8CA1C2] text-sm mt-0.5">{option.description}</p>
                                    </div>
                                    <div className="text-[#8CA1C2] group-hover:text-[#82F764] transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))}

                            {/* Security Note */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-[#8CA1C2] text-xs">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>256-bit encryption • PCI DSS compliant</span>
                            </div>
                        </div>
                    )}

                    {/* Step: Enter Amount */}
                    {step === 'amount' && selectedOption && (
                        <div className="space-y-6">
                            {/* Selected Method Badge */}
                            <div className="flex items-center justify-center gap-3 bg-[#202736] rounded-xl p-3">
                                <div className={`w-10 h-10 ${selectedOption.bgColor} rounded-lg flex items-center justify-center text-xl`}>
                                    {selectedOption.icon}
                                </div>
                                <span className="text-white font-medium">{selectedOption.name}</span>
                            </div>

                            {/* Amount Input */}
                            <div className="relative">
                                <div className="text-center mb-2">
                                    <span className="text-[#8CA1C2] text-sm">Enter amount</span>
                                </div>
                                <div className="relative flex items-center justify-center">
                                    <span className="text-[#8CA1C2] text-4xl mr-1">$</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={customAmount || amount}
                                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                                        placeholder="0.00"
                                        className="bg-transparent text-white text-5xl font-bold text-center outline-none w-48 placeholder-[#3C465E]"
                                    />
                                </div>
                            </div>

                            {/* Quick Amount Buttons */}
                            <div className="grid grid-cols-3 gap-3">
                                {QUICK_AMOUNTS.map((quickAmount) => (
                                    <button
                                        key={quickAmount}
                                        onClick={() => handleAmountSelect(quickAmount)}
                                        className={`py-3 rounded-xl font-semibold transition-all duration-300 ${
                                            amount === quickAmount.toString()
                                                ? 'bg-[#82F764] text-black shadow-lg shadow-[#82F764]/30 scale-105'
                                                : 'bg-[#202736] text-white hover:bg-[#2A3244] border border-[#2A3244] hover:border-[#82F764]/30'
                                        }`}
                                    >
                                        ${quickAmount}
                                    </button>
                                ))}
                            </div>

                            {/* Fee Notice */}
                            <div className="bg-[#202736] rounded-xl p-4 flex items-center justify-between text-sm border border-[#2A3244]">
                                <span className="text-[#8CA1C2]">Processing fee</span>
                                <span className="text-[#82F764] font-semibold text-base">FREE</span>
                            </div>

                            {/* Continue Button */}
                            <button
                                onClick={handleDeposit}
                                disabled={getEffectiveAmount() < 1}
                                className="w-full bg-[#82F764] hover:bg-[#6AD84F] disabled:bg-[#2A3244] disabled:text-[#8CA1C2] text-black font-bold py-4 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-[#82F764]/20"
                            >
                                {getEffectiveAmount() >= 1 
                                    ? `Add $${getEffectiveAmount().toFixed(2)}`
                                    : 'Enter an amount'
                                }
                            </button>
                        </div>
                    )}

                    {/* Step: Processing */}
                    {step === 'processing' && selectedOption && (
                        <div className="py-12 text-center">
                            <div className={`w-20 h-20 ${selectedOption.bgColor} rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 animate-pulse`}>
                                {selectedOption.icon}
                            </div>
                            <FiLoader className="text-[#82F764] text-3xl animate-spin mx-auto mb-4" />
                            <h3 className="text-white text-xl font-semibold mb-2">Processing Payment</h3>
                            <p className="text-[#8CA1C2] text-sm">
                                Adding ${getEffectiveAmount().toFixed(2)} via {selectedOption.name}...
                            </p>
                        </div>
                    )}

                    {/* Step: Success */}
                    {step === 'success' && (
                        <div className="py-8 text-center">
                            <div className="w-20 h-20 bg-[#82F764] rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiCheck className="text-black text-4xl" />
                            </div>
                            <h3 className="text-white text-2xl font-bold mb-2">Funds Added!</h3>
                            <p className="text-[#82F764] text-3xl font-bold mb-4">
                                +${getEffectiveAmount().toFixed(2)}
                            </p>
                            <p className="text-[#8CA1C2] text-sm mb-8">
                                Your wallet has been updated successfully
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full bg-[#82F764] hover:bg-[#6AD84F] text-black font-semibold py-4 rounded-xl transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
