"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Landing from "./landing/page";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const dotsFlowCompleted = new URLSearchParams(window.location.search).get("dots_flow") === "completed";
    if (dotsFlowCompleted) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <main className="bg-[#0B1220] min-h-screen px-4 py-5">
      <Landing />
    </main>
  );
}
