import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      {/* Minimal header */}
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <circle cx="14" cy="14" r="13" stroke="#c9a84c" strokeWidth="1.5" />
            <path
              d="M9 19 C9 19 10 12 14 10 C18 8 19 14 19 14 C19 14 18 20 14 20 C10 20 9 19 9 19Z"
              fill="#c9a84c"
              opacity="0.9"
            />
            <circle cx="14" cy="8" r="2" fill="#c9a84c" />
          </svg>
          <span className="font-display text-lg font-bold text-white tracking-tight">
            DancePath
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>

      <footer className="px-6 py-5 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} DancePath
      </footer>
    </div>
  );
}
