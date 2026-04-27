"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ReactNode } from "react";

// Initialize stripePromise outside of the component to avoid re-creating it and to ensure it's available immediately.
// Next.js replaces process.env.NEXT_PUBLIC_* at build time, so this is safe.
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
    console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing. Stripe Elements will not initialize.");
}
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function StripeProvider({ children }: { children: ReactNode }) {
    return <Elements stripe={stripePromise}>{children}</Elements>;
}
