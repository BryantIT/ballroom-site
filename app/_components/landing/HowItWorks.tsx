import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Choose your dances",
    description:
      "Add the styles you're currently learning and set your syllabus level for each — Bronze, Silver, Gold, or Open. DancePath loads the right patterns automatically.",
    image: "https://placehold.co/520x380/0f1629/c9a84c?text=Choose+Your+Dances",
    imageAlt: "Selecting dance styles interface",
  },
  {
    number: "02",
    title: "Track every pattern",
    description:
      "After each lesson or practice session, mark figures as learning, working, or mastered. Add coaching notes and rate your confidence on each pattern.",
    image: "https://placehold.co/520x380/0f1629/c9a84c?text=Track+Patterns",
    imageAlt: "Pattern tracking interface",
  },
  {
    number: "03",
    title: "Celebrate your growth",
    description:
      "Unlock achievements as you hit milestones, share your progress on social media, and print reports to review with your instructor.",
    image: "https://placehold.co/520x380/0f1629/c9a84c?text=Earn+Achievements",
    imageAlt: "Achievement celebration interface",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-navy-900 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-500 mb-4">
            How It Works
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-5">
            From first steps to champion
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Three simple steps that turn every lesson into measurable progress.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-24">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Text */}
              <div>
                <span className="font-display text-7xl font-bold text-gold-500/20 leading-none block mb-4">
                  {step.number}
                </span>
                <h3 className="font-display text-3xl lg:text-4xl font-bold text-white mb-5">
                  {step.title}
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                  {step.description}
                </p>
              </div>

              {/* Image */}
              <div className="relative">
                <div
                  className="absolute inset-0 -m-4 rounded-3xl opacity-20 blur-2xl"
                  style={{
                    background:
                      "radial-gradient(ellipse, #c9a84c 0%, transparent 70%)",
                  }}
                  aria-hidden="true"
                />
                <Image
                  src={step.image}
                  alt={step.imageAlt}
                  width={520}
                  height={380}
                  className="relative w-full rounded-2xl border border-white/5 shadow-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
