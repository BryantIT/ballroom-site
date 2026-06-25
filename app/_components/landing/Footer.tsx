import Link from "next/link";

const links = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Dance Styles", href: "#dance-styles" },
    { label: "Achievements", href: "#achievements" },
  ],
  Account: [
    { label: "Sign Up", href: "/signup" },
    { label: "Sign In", href: "/login" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <svg
                width="24"
                height="24"
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
              <span className="font-display text-lg font-bold text-white">
                DancePath
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              The progress tracker built for serious ballroom dancers. Track
              every step of your journey.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                {group}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-500 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <p>© {new Date().getFullYear()} DancePath. All rights reserved.</p>
          <p>Built for ballroom dancers, by ballroom dancers.</p>
        </div>
      </div>
    </footer>
  );
}
