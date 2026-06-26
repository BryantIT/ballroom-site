"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Hub } from "aws-amplify/utils";
// This import is intentional — importing signInWithRedirect triggers the
// enableOAuthListener side effect, which registers attemptCompleteOAuthFlow
// with the Amplify singleton. Since Amplify.configure() has already run by
// the time this module loads, ADD_OAUTH_LISTENER calls it immediately,
// which reads the PKCE verifier from localStorage and exchanges the auth code.
import { getCurrentUser, signInWithRedirect as _initOAuthListener } from "aws-amplify/auth";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    function complete() {
      if (handled.current) return;
      handled.current = true;
      router.replace("/dashboard");
    }

    function fail() {
      if (handled.current) return;
      handled.current = true;
      router.replace("/login?error=oauth_failed");
    }

    // Listen for Amplify Hub events
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn") complete();
      if (payload.event === "signInWithRedirect_failure") fail();
    });

    // Poll getCurrentUser as a fallback — the Hub event can fire before
    // the listener is registered, so we need this safety net.
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        await getCurrentUser();
        clearInterval(interval);
        complete();
      } catch {
        if (attempts >= 20) {
          clearInterval(interval);
          fail();
        }
      }
    }, 500);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
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
