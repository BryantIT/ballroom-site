const testimonials = [
  {
    quote:
      "Finally a tracker that actually knows the syllabus. I can see exactly which figures I've mastered at Bronze and what's left before I test for Silver.",
    name: "Sarah M.",
    role: "Bronze/Silver dancer",
    initials: "SM",
    color: "bg-violet-500",
  },
  {
    quote:
      "My instructor and I open DancePath at the start of every lesson to decide what to work on. It's completely changed how we use our time together.",
    name: "James K.",
    role: "Silver/Gold competitor",
    initials: "JK",
    color: "bg-blue-500",
  },
  {
    quote:
      "The achievement system keeps me motivated on weeks when I feel like I'm not improving. Seeing the streaks and XP add up is genuinely encouraging.",
    name: "Lisa T.",
    role: "Social dancer",
    initials: "LT",
    color: "bg-emerald-500",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-navy-950 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-500 mb-4">
            Testimonials
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-5">
            Loved by dancers
          </h2>
          <p className="text-lg text-slate-400">
            From social dancers to serious competitors, DancePath fits how you train.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-white/5 bg-navy-800 p-7"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#c9a84c"
                    aria-hidden="true"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              <blockquote className="flex-1 text-slate-300 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.color}`}
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
