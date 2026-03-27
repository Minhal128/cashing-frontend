"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ReactNode } from "react";

const FALLBACK_STRIPE_KEY = "pk_test_51SQLgHFO47mrrxETcaHFZdRXLi3RrBd7BVRPPzHRNGkTomfe9iSwvx7g8r0Nnysx8XOR7PZ7afPzR2afq7jQ8lIn00N66OSjiE";

// Initialize stripePromise outside of the component to avoid re-creating it and to ensure it's available immediately.
// Next.js replaces process.env.NEXT_PUBLIC_* at build time, so this is safe.
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || FALLBACK_STRIPE_KEY;
const stripePromise = loadStripe(stripeKey);

export default function StripeProvider({ children }: { children: ReactNode }) {
    return <Elements stripe={stripePromise}>{children}</Elements>;
}
