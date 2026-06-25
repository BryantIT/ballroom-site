import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="bg-navy-900 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-gold-500/20 bg-navy-800 px-8 py-16 text-center md:px-16 lg:px-24">
          {/* Background glow */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <div
              className="h-[400px] w-[600px] rounded-full opacity-10 blur-3xl"
              style={{ background: "radial-gradient(ellipse, #c9a84c, transparent)" }}
            />
          </div>

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-widest text-gold-500 mb-5">
              Get started today
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-2xl mx-auto">
              Your journey to the floor starts here.
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Join dancers who are training smarter, progressing faster, and
              celebrating every step of the journey. It&apos;s completely free to start.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-gold-500 px-8 py-4 text-base font-semibold text-navy-900 hover:bg-gold-400 transition-colors shadow-lg"
              >
                Start Dancing Today — It&apos;s Free
              </Link>
              <Link
                href="/login"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Already have an account? Sign in →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
