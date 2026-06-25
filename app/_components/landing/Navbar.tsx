"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-900/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="14" cy="14" r="13" stroke="#c9a84c" strokeWidth="1.5" />
            <path
              d="M9 19 C9 19 10 12 14 10 C18 8 19 14 19 14 C19 14 18 20 14 20 C10 20 9 19 9 19Z"
              fill="#c9a84c"
              opacity="0.9"
            />
            <circle cx="14" cy="8" r="2" fill="#c9a84c" />
          </svg>
          <span className="font-display text-xl font-bold text-white tracking-tight">
            DancePath
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#dance-styles" className="hover:text-white transition-colors">
            Dance Styles
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5 p-2 text-slate-300"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span
            className={`block h-0.5 w-6 bg-current transition-transform duration-200 ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-transform duration-200 ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-navy-900 px-6 py-5 space-y-4">
          <a
            href="#features"
            onClick={() => setOpen(false)}
            className="block text-slate-300 hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setOpen(false)}
            className="block text-slate-300 hover:text-white transition-colors"
          >
            How It Works
          </a>
          <a
            href="#dance-styles"
            onClick={() => setOpen(false)}
            className="block text-slate-300 hover:text-white transition-colors"
          >
            Dance Styles
          </a>
          <div className="pt-2 flex flex-col gap-3 border-t border-white/5">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex justify-center rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
