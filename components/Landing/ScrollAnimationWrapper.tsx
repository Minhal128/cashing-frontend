"use client";

import { ReactNode } from "react";
import useScrollAnimation from "../../app/hooks/useScrollAnimation";

export default function ScrollAnimationWrapper({
  children,
}: {
  children: ReactNode;
}) {
  useScrollAnimation();
  return <>{children}</>;
}
