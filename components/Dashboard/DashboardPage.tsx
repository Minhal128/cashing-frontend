import ActivityCard from "./DashboradComponents/ActivityCard";
import BalanceCard from "./DashboradComponents/BalanceCard";
import BalanceChart from "./DashboradComponents/BalanceChart";
import CardSection from "./DashboradComponents/CardSection";
import RecentTransactions from "./DashboradComponents/RecentTransactions";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface DashboardPageProps {
  setActivePage: (page: string) => void;
}

export default function DashboardPage({ setActivePage }: DashboardPageProps) {
  const searchParams = useSearchParams();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/wallet/wallets");
      setWallets(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Handle PayPal redirect back
    const paypalSuccess = searchParams?.get('paypal_success');
    const venmoSuccess = searchParams?.get('venmo_success');
    const orderId = searchParams?.get('token');

    if (paypalSuccess === 'true' && orderId) {
      handlePayPalReturn(orderId);
    } else if (venmoSuccess === 'true' && orderId) {
      handleVenmoReturn(orderId);
    }

    // Handle Stripe redirect back
    const paymentIntent = searchParams?.get('payment_intent');
    const redirectStatus = searchParams?.get('redirect_status');

    if (paymentIntent && redirectStatus) {
      handleStripeReturn(paymentIntent, redirectStatus);
    }
  }, [searchParams]);

  const handleStripeReturn = async (paymentIntent: string, redirectStatus: string) => {
    console.log(`Stripe Return - Intent: ${paymentIntent}, Status: ${redirectStatus}`);
    
    if (redirectStatus === 'succeeded') {
      const loadingToast = toast.loading('Processing payment...');
      try {
        const response = await api.post('/wallet/confirm-payment', { paymentIntentId: paymentIntent });
        toast.dismiss(loadingToast);

        if (response.data.success) {
          const status = response.data.paymentStatus;
          if (status === 'processing') {
            toast.success('Payment initiated! Funds will be available once cleared (1-3 business days)');
          } else {
            toast.success(`Funds added successfully!`);
          }
          fetchDashboardData();
        }
      } catch (error: any) {
        toast.dismiss(loadingToast);
        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Payment failed';
        console.error('Payment confirmation error:', error.response?.data);
        toast.error(errorMsg);
      }
      // Clean URL
      window.history.replaceState({}, '', '/dashboard');
    } else {
      console.warn(`Payment redirect status: ${redirectStatus}`);
      toast.error(`Payment ${redirectStatus}. Please try again.`);
      window.history.replaceState({}, '', '/dashboard');
    }
  };

  const handlePayPalReturn = async (orderId: string) => {
    const loadingToast = toast.loading('Processing PayPal payment...');
    try {
      const response = await api.post('/wallet/paypal/capture-order', { orderId });
      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success(`$${response.data.transaction.amount} added!`);
        fetchDashboardData();
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error('PayPal: ' + (error.response?.data?.message || 'Payment failed'));
      console.error('PAYPAL 400 DETAILED:', error.response?.data);
    }
    // Clean URL
    window.history.replaceState({}, '', '/dashboard');
  };

  const handleVenmoReturn = async (orderId: string) => {
    const loadingToast = toast.loading('Processing Venmo payment...');
    try {
      const response = await api.post('/wallet/venmo/capture-order', { orderId });
      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success(`$${response.data.transaction.amount} added via Venmo!`);
        fetchDashboardData();
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error('Venmo: ' + (error.response?.data?.message || 'Payment failed'));
      console.error('VENMO ERROR DETAILED:', error.response?.data);
    }
    // Clean URL
    window.history.replaceState({}, '', '/dashboard');
  };

  const handleRefresh = () => {
    fetchDashboardData();
    setRefreshCount(prev => prev + 1);
    window.dispatchEvent(new CustomEvent('refresh-balances'));
  };

  const totalBalance = wallets.reduce((acc, w) => acc + (w.type === 'fiat' ? w.balance : 0), 0);

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-7xl">
        {/* Main Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-min">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="h-fit">
              <BalanceCard
                setActivePage={setActivePage}
                balance={totalBalance}
                loading={loading}
                onRefresh={handleRefresh}
              />
            </div>

            <div className="h-fit">
              <BalanceChart />
            </div>

            <div className="h-fit">
              <RecentTransactions key={refreshCount} />
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="flex flex-col gap-4">
            <div className="h-fit">
              <CardSection setActivePage={setActivePage} />
            </div>

            <div className="h-fit">
              <ActivityCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
