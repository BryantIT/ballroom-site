"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "aws-amplify/auth";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });

      if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        router.push(`/signup/confirm?email=${encodeURIComponent(email)}`);
        return;
      }

      // Auto-confirmed (e.g. admin-created users)
      router.push("/login");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/5 bg-navy-800 p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Start your journey
          </h1>
          <p className="text-slate-400 text-sm">
            Create your free DancePath account.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full rounded-xl border border-white/10 bg-navy-900 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors"
            />
          </div>

          {/* Email */}
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

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-white/10 bg-navy-900 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors"
            />
          </div>

          {/* Error */}
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
            disabled={loading}
            className="w-full rounded-full bg-gold-500 py-3.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg
                className="h-4 w-4 animate-spin"
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
            )}
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p className="text-xs text-slate-600 text-center">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-slate-500 hover:text-white transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-gold-500 hover:text-gold-400 transition-colors font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
