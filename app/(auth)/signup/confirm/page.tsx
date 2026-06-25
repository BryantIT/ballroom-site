"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import Link from "next/link";

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      router.push("/login?confirmed=1");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Confirmation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await resendSignUpCode({ username: email });
      setResent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code.");
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/5 bg-navy-800 p-8 shadow-2xl">
        <div className="mb-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 text-2xl">
            ✉️
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Check your email
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            We sent a confirmation code to{" "}
            <span className="text-white font-medium">{email}</span>. Enter it
            below to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Confirmation code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              maxLength={6}
              className="w-full rounded-xl border border-white/10 bg-navy-900 px-4 py-3 text-sm text-white placeholder-slate-600 tracking-widest focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors"
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

          {resent && (
            <p className="text-sm text-green-400">
              A new code has been sent to your email.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full rounded-full bg-gold-500 py-3.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {loading ? "Confirming…" : "Confirm account"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Didn&apos;t receive the email?{" "}
        <button
          onClick={handleResend}
          className="text-gold-500 hover:text-gold-400 transition-colors font-medium"
        >
          Resend code
        </button>
        {" · "}
        <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/5 bg-navy-800 p-8 shadow-2xl animate-pulse">
            <div className="h-12 w-12 rounded-full bg-white/5 mb-4" />
            <div className="h-8 w-48 rounded bg-white/5 mb-3" />
            <div className="h-4 w-64 rounded bg-white/5 mb-8" />
            <div className="h-11 w-full rounded-xl bg-white/5 mb-4" />
            <div className="h-12 w-full rounded-full bg-white/5" />
          </div>
        </div>
      }
    >
      <ConfirmForm />
    </Suspense>
  );
}
