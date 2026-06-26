"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, fetchAuthSession } from "aws-amplify/auth";
import Link from "next/link";

const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function syncSession() {
    const session = await fetchAuthSession();
    const accessToken = session.tokens?.accessToken?.toString() ?? "";
    const idToken = session.tokens?.idToken?.toString() ?? "";
    const username = (session.tokens?.accessToken?.payload?.["username"] ?? "") as string;
    const refreshToken =
      localStorage.getItem(
        `CognitoIdentityServiceProvider.${CLIENT_ID}.${username}.refreshToken`
      ) ?? "";
    await fetch("/api/auth/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, idToken, refreshToken }),
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });

      if (isSignedIn) {
        await syncSession();
        router.push(nextPath);
        router.refresh();
        return;
      }

      if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
        router.push(`/signup/confirm?email=${encodeURIComponent(email)}`);
        return;
      }

      if (nextStep.signInStep === "RESET_PASSWORD") {
        router.push(`/forgot-password?email=${encodeURIComponent(email)}`);
        return;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    window.location.href = "/api/auth/sign-in?provider=Google";
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/5 bg-navy-800 p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm">
            Sign in to continue your dance journey.
          </p>
        </div>

        {/* Google sign-in */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {googleLoading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
          )}
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-navy-800 px-3 text-xs text-slate-500">
              or sign in with email
            </span>
          </div>
        </div>

        {/* Email / password form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-navy-900 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-gold-500 hover:text-gold-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-navy-900 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-full bg-gold-500 py-3.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-gold-500 hover:text-gold-400 transition-colors font-medium"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/5 bg-navy-800 p-8 shadow-2xl animate-pulse">
            <div className="h-8 w-40 rounded bg-white/5 mb-3" />
            <div className="h-4 w-56 rounded bg-white/5 mb-8" />
            <div className="h-11 w-full rounded-xl bg-white/5 mb-6" />
            <div className="h-px w-full bg-white/10 mb-6" />
            <div className="space-y-4">
              <div className="h-11 w-full rounded-xl bg-white/5" />
              <div className="h-11 w-full rounded-xl bg-white/5" />
              <div className="h-12 w-full rounded-full bg-white/5" />
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
