"use client";

import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#fff",
      fontFamily: '"DM Sans", sans-serif',
      fontSize: "14px",
      "::placeholder": {
        color: "#9CA3AF",
      },
    },
    invalid: {
      color: "#EF4444",
    },
  },
};

export default function AddNewCardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleAddCard = async () => {
    if (!stripe || !elements) {
      const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
      console.error("Stripe/Elements not loaded. Key present:", !!key, "Key starts with:", key.substring(0, 7));
      toast.error("Stripe is not loaded yet. Please wait or refresh.");
      return;
    }

    try {
      const newErrors: { [key: string]: string } = {};
      if (!name) newErrors.name = "Name is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      setLoading(true);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error("Card element not found");
        setLoading(false);
        return;
      }

      // Create payment method with Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: name,
        },
      });

      if (error) {
        console.error("Stripe createPaymentMethod error:", error);
        toast.error(error.message || "Failed to validate card");
        setLoading(false);
        return;
      }

      // Send payment method ID to backend
      try {
        await api.post("/wallet/payment-methods", {
          type: "card",
          paymentMethodId: paymentMethod.id,
          provider: paymentMethod.card?.brand || "card",
          details: paymentMethod.card?.last4 || "****",
        });

        toast.success("Card added successfully!");
        setLoading(false);
        // Small delay to allow user to see success toast before reload
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (apiError: any) {
        console.error("Backend error saving card:", apiError);
        toast.error(apiError.response?.data?.message || "Failed to save card to account");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Card addition error:", error);
      toast.error(error.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#111827] border border-white/10 p-4 text-white">
      <h2 className="mb-4 text-lg font-DMSans">Add new card</h2>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1 ml-1 font-DMSans">Name on card</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Doe"
          className={`w-full rounded-lg font-DMSans bg-[#202736] px-4 py-3 text-sm outline-none focus:border-white/30 ${errors.name ? "border border-red-500" : ""
            }`}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1 font-DMSans">{errors.name}</p>
        )}
      </div>

      {/* Stripe Card Element */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1 ml-1 font-DMSans">Card Details</label>
        <div className="rounded-lg bg-[#202736] px-4 py-3 border border-white/5 focus-within:border-white/20">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={handleAddCard}
          disabled={loading}
          className="w-full rounded-xl font-DMSans bg-[#82F764] px-6 py-3 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? "Processing..." : "Add Card"}
        </button>
      </div>
    </div>
  );
}
