"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, Check, Loader2 } from "lucide-react";
import { useStripe, useElements, CardElement, PaymentElement, Elements } from "@stripe/react-stripe-js";
import Image from "next/image";
import api from "@/lib/api";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "react-hot-toast";

// Import icons
import CardIcon from "../../public/assets/card.png";
import CashAppIcon from "../../public/assets/cash.png";
import VenmoIcon from "../../public/assets/venmo.png";

interface FundsModalProps {
  isOpenFundsModal: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

type PaymentMethod = 'card' | 'cashapp' | 'venmo' | 'paypal' | 'current';
type Step = 'select' | 'amount' | 'card-details' | 'processing' | 'success';

// PayPal SVG Icon Component - Official PayPal Logo
const PayPalIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.65h6.536c2.17 0 3.895.476 5.129 1.414 1.292 1.002 1.94 2.5 1.94 4.46 0 .942-.156 1.834-.466 2.658a7.5 7.5 0 0 1-1.305 2.247 6.106 6.106 0 0 1-2.024 1.55c-.8.38-1.66.62-2.557.72-.463.051-.925.077-1.385.077h-1.07a.77.77 0 0 0-.757.65l-.927 5.84a.641.641 0 0 1-.633.54l-1.106.11z" fill="#003087"/>
    <path d="M19.855 7.944c-.192 2.376-1.272 3.834-2.826 4.679-1.554.845-3.432.959-5.157.959h-.646a.77.77 0 0 0-.757.65l-1.01 6.355a.641.641 0 0 1-.633.54H6.122l-.208 1.31a.534.534 0 0 0 .527.62h3.693a.641.641 0 0 0 .633-.54l.026-.164.832-5.274.054-.29a.641.641 0 0 1 .633-.54h.398c2.581 0 4.602-.818 5.193-3.185.247-.99.119-1.816-.213-2.397a2.11 2.11 0 0 0-.835-.743z" fill="#0070E0"/>
  </svg>
);

// Chime SVG icon for the bank method tile.
const ChimeIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chimeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#22C55E', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#16A34A', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="chimeGlow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle
      cx="16"
      cy="16"
      r="12"
      fill="url(#chimeGradient)"
      filter="url(#chimeGlow)"
    />
    <path
      d="M21 11.2C19.9 10.2 18.5 9.7 16.8 9.7C12.8 9.7 10 12.5 10 16.6C10 20.7 12.8 23.5 16.8 23.5C18.5 23.5 19.9 23 21 22"
      stroke="#FFFFFF"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Debit Card SVG Icon Component - Credit card design
const DebitCardIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="28" height="20" rx="3" fill="url(#cardGradient)"/>
    <rect x="2" y="11" width="28" height="4" fill="#000" opacity="0.3"/>
    <rect x="5" y="19" width="10" height="2" rx="1" fill="#fff" opacity="0.8"/>
    <rect x="17" y="19" width="10" height="2" rx="1" fill="#fff" opacity="0.8"/>
    <defs>
      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#667EEA', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#764BA2', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
  </svg>
);

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: any;
  iconType: 'image' | 'component';
  bgColor: string;
  description: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'card',
    name: 'Debit Card',
    icon: CardIcon,
    iconType: 'image',
    bgColor: 'bg-gradient-to-br from-[#667EEA] to-[#764BA2]',
    description: 'Visa, Mastercard, Discover'
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    icon: CashAppIcon,
    iconType: 'image',
    bgColor: 'bg-gradient-to-br from-[#00D632] to-[#00B329]',
    description: 'Instant transfer'
  },
  {
    id: 'venmo',
    name: 'Venmo',
    icon: VenmoIcon,
    iconType: 'image',
    bgColor: 'bg-gradient-to-br from-[#3D95CE] to-[#008CFF]',
    description: 'Connect your Venmo'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: PayPalIcon,
    iconType: 'component',
    bgColor: 'bg-white',
    description: 'PayPal balance or card'
  },
  {
    id: 'current',
    name: 'Chime',
    icon: ChimeIcon,
    iconType: 'component',
    bgColor: 'bg-gradient-to-br from-[#22C55E] to-[#15803D]',
    description: 'Chime account - instant'
  }
];

const QUICK_AMOUNTS = [25, 50, 100, 250, 500, 1000];

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#6B7280',
      },
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444',
    },
  },
};

function GenericStripeCheckoutForm({
  buttonText,
  buttonBg,
  buttonHover,
  icon: Icon
}: {
  buttonText: string;
  buttonBg: string;
  buttonHover: string;
  icon?: any;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?payment=success`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <PaymentElement />
      {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className={`w-full ${buttonBg} ${buttonHover} disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Processing...
          </>
        ) : (
          <>
            <span>{buttonText}</span>
            {Icon ? (
              <Icon />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </>
        )}
      </button>
    </form>
  );
}

export default function FundsModal({
  isOpenFundsModal,
  onClose,
  onRefresh,
}: FundsModalProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState<Step>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);    const [paypalConfig, setPaypalConfig] = useState<any>(null);

    useEffect(() => {
      // Fetch PayPal config
      api.get('/wallet/paypal/config').then(res => {
        setPaypalConfig({
          clientId: res.data.clientId,
          environment: res.data.environment
        });
      }).catch(console.error);
    }, []);
  const [paymentElementReady, setPaymentElementReady] = useState(false);
  const [braintreeToken, setBraintreeToken] = useState<string | null>(null);
  const [braintreeInstance, setBraintreeInstance] = useState<any>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpenFundsModal) {
      setStep('select');
      setSelectedMethod(null);
      setAmount('');
      setCustomAmount('');
      setCardComplete(false);
      setCardReady(false);
    }
  }, [isOpenFundsModal]);

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('amount');
  };

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setCustomAmount(sanitized);
    setAmount(sanitized);
  };

  const getEffectiveAmount = (): number => {
    return parseFloat(amount) || 0;
  };

  const handleContinue = async () => {
    const depositAmount = getEffectiveAmount();
    if (depositAmount < 1) {
      toast.error('Minimum amount is $1.00');
      return;
    }
    if (depositAmount > 10000) {
      toast.error('Maximum amount is $10,000');
      return;
    }

    if (selectedMethod === 'card') {
      setStep('card-details');
    } else if (selectedMethod === 'paypal') {
      // PayPal - redirect to PayPal
      await handlePayPalCheckout();
    } else if (selectedMethod === 'venmo') {
      // Venmo handled directly by JS SDK Buttons
    } else if (selectedMethod === 'current') {
      // Current/Bank - use Stripe ACH
      await handleBankCheckout();
    } else if (selectedMethod === 'cashapp') {
      // Cash App - Stripe integration
      await createPaymentIntent('cashapp');
    }
  };

  const handlePayPalCheckout = async () => {
    setLoading(true);
    try {
      const response = await api.post("/wallet/paypal/create-order", {
        amount: getEffectiveAmount()
      });
      
      // Redirect to PayPal
      if (response.data.approvalUrl) {
        window.location.href = response.data.approvalUrl;
      } else {
        throw new Error('PayPal approval URL not received');
      }
    } catch (error: any) {
      console.error("PayPal checkout error:", error);
      toast.error(error.response?.data?.message || 'Failed to start PayPal checkout');
      setLoading(false);
    }
  };

  const handleVenmoCheckout = async () => {
    setLoading(true);
    setStep('processing');
    
    try {
      const response = await api.post("/wallet/venmo/create-order", {
        amount: getEffectiveAmount()
      });

      // Redirect to Venmo logic via PayPal link
      if (response.data.approvalUrl) {
        window.location.href = response.data.approvalUrl;
      } else {
        throw new Error('Venmo approval URL not received');
      }
    } catch (error: any) {
      console.error("Venmo checkout error:", error);
      toast.error(error.response?.data?.message || error.message || 'Venmo payment failed');
      setStep('amount');
    } finally {
      setLoading(false);
    }
  };

  const handleBankCheckout = async () => {
    setLoading(true);
    try {
      const response = await api.post("/wallet/bank/create-intent", {
        amount: getEffectiveAmount()
      });
      
      setClientSecret(response.data.clientSecret);
      setStep('card-details'); // Reuse for bank form
    } catch (error: any) {
      console.error("Bank checkout error:", error);
      toast.error(error.response?.data?.message || 'Failed to initialize bank payment');
      setLoading(false);
    }
  };

  const createPaymentIntent = async (paymentType: PaymentMethod) => {
    setLoading(true);
    try {
      const response = await api.post("/wallet/create-payment-intent", {
        amount: getEffectiveAmount(),
        paymentMethodType: paymentType
      });
      
      setClientSecret(response.data.clientSecret);
      
      // For cashapp, show the payment UI
      if (paymentType === 'cashapp') {
        setStep('card-details');
        setPaymentElementReady(false);
      } else {
        // For other methods, auto-process
        setStep('processing');
        await processPaymentIntent(response.data.paymentIntentId);
      }
    } catch (error: any) {
      console.error("Payment Intent creation error:", error);
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const processPaymentIntent = async (paymentIntentId: string) => {
    try {
      await api.post("/wallet/confirm-payment", {
        paymentIntentId: paymentIntentId,
        amount: getEffectiveAmount()
      });

      setStep('success');
      onRefresh?.();
      window.dispatchEvent(new CustomEvent('refresh-balances'));
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      toast.error(error.response?.data?.message || 'Payment failed');
      setStep('amount');
    } finally {
      setLoading(false);
    }
  };

  const handleCardDeposit = async () => {
    if (!stripe || !elements) {
      toast.error('Payment system not ready');
      return;
    }

    if (loading) {
      return; // Prevent double submission
    }

    setLoading(true);

    try {


      // Handle regular card payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error('Card details not found');
        setLoading(false);
        return;
      }

      // Create payment method
      console.log('Calling createPaymentMethod...');
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      console.log('createPaymentMethod result:', { pmError, paymentMethod });

      if (pmError) {
        throw new Error(pmError.message);
      }

      // Move to processing screen after we have the payment method
      setStep('processing');

      // Save payment method and deposit
      console.log('Saving payment method to backend...', paymentMethod.id);
      const pmRes = await api.post("/wallet/payment-methods", {
        type: "card",
        paymentMethodId: paymentMethod.id,
        provider: paymentMethod.card?.brand || "Card",
        details: `****${paymentMethod.card?.last4}`
      });
      console.log('Saved PM:', pmRes.data);

      // Process deposit
      console.log('Processing deposit...');
      await api.post("/wallet/deposit", {
        amount: getEffectiveAmount(),
        paymentMethodId: pmRes.data._id
      });
      console.log('Deposit processed successfully');

      setStep('success');
      onRefresh?.();
      window.dispatchEvent(new CustomEvent('refresh-balances'));
    } catch (error: any) {
      console.error("Deposit error strictly caught in try/catch:", error);
      toast.error(error?.response?.data?.message || error?.message || 'Deposit failed');
      setStep('card-details');
    } finally {
      console.log('Resetting loading to false in finally block');
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'amount') setStep('select');
    else if (step === 'card-details') setStep('amount');
  };

  const handleClose = () => {
    onClose();
  };

  const selectedOption = PAYMENT_OPTIONS.find(p => p.id === selectedMethod);

  if (!isOpenFundsModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-gradient-to-b from-[#1E293B] to-[#0F172A] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            {(step === 'amount' || step === 'card-details') && (
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h2 className="text-white text-xl font-semibold flex-1 text-center">
              {step === 'select' && 'Add Funds'}
              {step === 'amount' && 'Enter Amount'}
              {step === 'card-details' && 'Card Details'}
              {step === 'processing' && 'Processing'}
              {step === 'success' && 'Success!'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step: Select Method */}
          {step === 'select' && (
            <div className="space-y-3">
              <p className="text-gray-400 text-sm text-center mb-5">
                Choose your payment method
              </p>

              {PAYMENT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectMethod(option.id)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#82F764]/40 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 group hover:shadow-lg hover:shadow-[#82F764]/10 hover:scale-[1.02]"
                >
                  <div className={`w-16 h-16 ${option.bgColor} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300 group-hover:shadow-2xl`}>
                    {option.iconType === 'image' ? (
                      <Image 
                        src={option.icon} 
                        alt={option.name} 
                        width={36} 
                        height={36}
                        className="object-contain"
                      />
                    ) : (
                      <option.icon />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-semibold text-lg group-hover:text-[#82F764] transition-colors">{option.name}</p>
                    <p className="text-gray-400 text-sm mt-0.5">{option.description}</p>
                  </div>
                  <div className="text-gray-500 group-hover:text-[#82F764] transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>256-bit encryption • PCI DSS compliant</span>
              </div>
            </div>
          )}

          {/* Step: Amount */}
          {step === 'amount' && selectedOption && (
            <div className="space-y-6">
              {/* Selected Method */}
              <div className="flex items-center justify-center gap-3">
                <div className={`w-12 h-12 ${selectedOption.bgColor} rounded-xl flex items-center justify-center shadow-lg`}>
                  {selectedOption.iconType === 'image' ? (
                    <Image 
                      src={selectedOption.icon} 
                      alt={selectedOption.name} 
                      width={28} 
                      height={28}
                      className="object-contain"
                    />
                  ) : (
                    <selectedOption.icon />
                  )}
                </div>
                <span className="text-white font-semibold text-lg">{selectedOption.name}</span>
              </div>

              {/* Amount Display */}
              <div className="py-4">
                <div className="text-center text-gray-400 text-sm mb-3">Enter amount</div>
                <div className="flex items-center justify-center">
                  <span className="text-gray-400 text-5xl font-light mr-1">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customAmount || amount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="0"
                    className="bg-transparent text-white text-6xl font-bold text-center outline-none w-40 placeholder-gray-700"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Amounts */}
              <div className="grid grid-cols-3 gap-3">
                {QUICK_AMOUNTS.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => handleAmountSelect(quickAmount)}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      amount === quickAmount.toString()
                        ? 'bg-[#82F764] text-black shadow-lg shadow-[#82F764]/30'
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>

              {/* Fee Info */}
              <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                <span className="text-gray-400 text-sm">Processing fee</span>
                <span className="text-[#82F764] font-semibold">FREE</span>
              </div>

              {/* Continue / PayPal Button */}
              {selectedMethod === 'venmo' && paypalConfig ? (
                <div className="w-full mt-4 min-h-[55px]">
                  {getEffectiveAmount() >= 1 ? (
                    <PayPalScriptProvider options={{ "clientId": paypalConfig.clientId, components: "buttons,funding-eligibility", "enable-funding": "venmo", "currency": "USD" }}>
                      <PayPalButtons
                        fundingSource="venmo"
                        style={{
                          color: "blue",
                          shape: "rect",
                          label: "pay",
                          height: 55
                        }}
                        createOrder={async () => {
                          try {
                            const res = await api.post("/wallet/venmo/create-order", {
                              amount: getEffectiveAmount()
                            });
                            return res.data.orderId;
                          } catch (err: any) {
                            toast.error("Failed to create Venmo order");
                            throw err;
                          }
                        }}
                        onApprove={async (data, actions) => {
                          try {
                            setStep('processing');
                            const res = await api.post("/wallet/venmo/capture-order", {
                              orderId: data.orderID
                            });
                            if (res.data.status === 'COMPLETED' || res.data.success || res.status === 200) {
                              setStep('success');
                              onRefresh?.();
                              window.dispatchEvent(new CustomEvent('refresh-balances'));
                            }
                          } catch (err: any) {
                            console.error("Capture error", err);
                            toast.error(err.response?.data?.message || "Venmo payment failed");
                            setStep('amount');
                          }
                        }}
                        onError={(err) => {
                          console.error("Venmo button error", err);
                          toast.error("Venmo payment encountered an error");
                        }}
                        onCancel={() => {
                          toast.error("Venmo payment cancelled");
                        }}
                      />
                    </PayPalScriptProvider>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-700 text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed"
                    >
                      Enter an amount
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleContinue}
                  disabled={getEffectiveAmount() < 1}
                  className="w-full bg-[#82F764] hover:bg-[#6AD84F] disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg shadow-[#82F764]/20 disabled:shadow-none"
                >
                  {getEffectiveAmount() >= 1
                    ? `Continue • $${getEffectiveAmount().toFixed(2)}`
                    : 'Enter an amount'
                  }
                </button>
              )}
            </div>
          )}

          {/* Step: Card Details */}
          {step === 'card-details' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Adding</p>
                <p className="text-white text-3xl font-bold">${getEffectiveAmount().toFixed(2)}</p>
              </div>

              {/* Dynamic Payment Element for Cash App and Bank (Current) */}
              {(selectedMethod === 'cashapp' || selectedMethod === 'current') && clientSecret ? (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                  <div className="mb-4">
                    <div className={`w-20 h-20 ${selectedOption?.bgColor || 'bg-gray-800'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      {selectedOption?.iconType === 'image' ? (
                        <Image src={selectedOption.icon} alt={selectedOption.name} width={48} height={48} className="object-contain" />
                      ) : selectedOption?.icon ? (
                        <selectedOption.icon />
                      ) : null}
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-2">Pay with {selectedOption?.name}</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Enter your payment details below
                    </p>
                  </div>

                  {stripe && (
                    <Elements stripe={stripe} options={{ clientSecret, appearance: { theme: "night" } }}>
                      <GenericStripeCheckoutForm 
                        buttonText={`Pay with ${selectedOption?.name}`}
                        buttonBg={selectedMethod === 'cashapp' ? 'bg-[#00D632]' : 'bg-[#82F764]'}
                        buttonHover={selectedMethod === 'cashapp' ? 'hover:bg-[#00BD2B]' : 'hover:bg-[#6AD84F]'}
                      />
                    </Elements>
                  )}
                </div>
              ) : (
                <>
                  {/* Card Input */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="block text-gray-400 text-sm mb-3">Card information</label>
                    <CardElement
                      options={CARD_ELEMENT_OPTIONS}
                      onReady={() => setCardReady(true)}
                      onChange={(e) => setCardComplete(e.complete)}
                    />
                  </div>

                  {/* Supported Cards */}
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-gray-500 text-xs">Supported:</span>
                    <div className="flex gap-2">
                      {['Visa', 'Mastercard', 'Amex', 'Discover'].map((card) => (
                        <span key={card} className="text-gray-400 text-xs bg-white/5 px-2 py-1 rounded">
                          {card}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handleCardDeposit}
                    disabled={!cardComplete || !cardReady || loading}
                    className="w-full bg-[#82F764] hover:bg-[#6AD84F] disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      `Add $${getEffectiveAmount().toFixed(2)}`
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && selectedOption && (
            <div className="py-12 text-center">
              <div className={`w-24 h-24 ${selectedOption.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-xl`}>
                {selectedOption.iconType === 'image' ? (
                  <Image 
                    src={selectedOption.icon} 
                    alt={selectedOption.name} 
                    width={56} 
                    height={56}
                    className="object-contain"
                  />
                ) : (
                  <div className="scale-150">
                    <selectedOption.icon />
                  </div>
                )}
              </div>
              <Loader2 className="text-[#82F764] w-10 h-10 animate-spin mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">Processing Payment</h3>
              <p className="text-gray-400">
                Adding ${getEffectiveAmount().toFixed(2)} via {selectedOption.name}
              </p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="py-10 text-center">
              <div className="w-24 h-24 bg-[#82F764] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#82F764]/30">
                <Check className="text-black w-12 h-12" strokeWidth={3} />
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">Funds Added!</h3>
              <p className="text-[#82F764] text-4xl font-bold mb-2">
                +${getEffectiveAmount().toFixed(2)}
              </p>
              <p className="text-gray-400 text-sm mb-8">
                Your wallet has been updated
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-[#82F764] hover:bg-[#6AD84F] text-black font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#82F764]/20"
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
