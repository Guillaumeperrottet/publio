"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    person_profiles: "identified_only",
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug();
    },
    capture_pageview: false, // Disable automatic pageview capture
    capture_pageleave: true, // Enable automatic pageleave events
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function PostHogPageview() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      posthog?.capture("$pageview");
    }
  }, []);

  return null;
}
