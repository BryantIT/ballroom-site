"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Hub } from "aws-amplify/utils";
import { getCurrentUser } from "aws-amplify/auth";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    // Listen for the signIn event that Amplify fires after it exchanges the
    // OAuth code for tokens and stores them in cookies.
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (handled.current) return;

      if (payload.event === "signedIn") {
        handled.current = true;
        router.replace("/dashboard");
        router.refresh();
      }

      if (payload.event === "signInWithRedirect_failure") {
        handled.current = true;
        router.replace("/login?error=oauth_failed");
      }
    });

    // Fallback: if tokens are already in cookies (e.g. page refreshed after
    // the Hub event already fired) just navigate immediately.
    getCurrentUser()
      .then(() => {
        if (!handled.current) {
          handled.current = true;
          router.replace("/dashboard");
          router.refresh();
        }
      })
      .catch(() => {
        // Not signed in yet — Hub listener will handle it
      });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <svg
        className="h-8 w-8 animate-spin text-gold-500"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
      <p className="text-slate-400 text-sm">Finishing sign-in…</p>
    </div>
  );
}
