import Image from "next/image";

const dances = [
  {
    name: "Waltz",
    category: "Standard",
    description: "Elegant rise and fall with sweeping rotations.",
    image: "https://placehold.co/400x280/0f1629/c9a84c?text=Waltz",
  },
  {
    name: "Tango",
    category: "Standard",
    description: "Sharp, staccato movements with dramatic character.",
    image: "https://placehold.co/400x280/0f1629/c9a84c?text=Tango",
  },
  {
    name: "Foxtrot",
    category: "Standard",
    description: "Smooth, flowing footwork across the floor.",
    image: "https://placehold.co/400x280/0f1629/c9a84c?text=Foxtrot",
  },
  {
    name: "Cha Cha",
    category: "Latin",
    description: "Cheeky Cuban hip action with a syncopated rhythm.",
    image: "https://placehold.co/400x280/0f1629/c9a84c?text=Cha+Cha",
  },
  {
    name: "Rumba",
    category: "Latin",
    description: "Slow, sensual movement and deliberate hip sway.",
    image: "https://placehold.co/400x280/0f1629/c9a84c?text=Rumba",
  },
  {
    name: "Quickstep",
    category: "Standard",
    description: "Fast, light footwork with chassés and hops.",
    image: "https://placehold.co/400x280/0f1629/c9a84c?text=Quickstep",
  },
];

const categoryColor: Record<string, string> = {
  Standard: "bg-blue-500/15 text-blue-300",
  Latin: "bg-rose-500/15 text-rose-300",
};

export default function DanceStyles() {
  return (
    <section id="dance-styles" className="bg-navy-950 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-500 mb-4">
            Dance Styles
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-5">
            Every dance, every level
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Track your progress across Standard and Latin styles with the full
            ISTD and NDCA syllabus built right in.
          </p>
        </div>

        {/* Dance grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dances.map((dance) => (
            <div
              key={dance.name}
              className="group overflow-hidden rounded-2xl border border-white/5 bg-navy-800 hover:border-gold-500/25 transition-colors duration-300"
            >
              <div className="overflow-hidden">
                <Image
                  src={dance.image}
                  alt={`${dance.name} ballroom dance`}
                  width={400}
                  height={280}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">{dance.name}</h3>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-medium ${categoryColor[dance.category]}`}
                  >
                    {dance.category}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {dance.description}
                </p>
                {/* Level indicators */}
                <div className="mt-5 flex items-center gap-2">
                  {["Bronze", "Silver", "Gold", "Open"].map((level) => (
                    <span
                      key={level}
                      className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-500"
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* See all link */}
        <p className="mt-12 text-center text-slate-500 text-sm">
          Also includes Samba, Viennese Waltz, Paso Doble, Jive, and more.{" "}
          <a
            href="/signup"
            className="text-gold-500 hover:text-gold-400 transition-colors"
          >
            See all styles →
          </a>
        </p>
      </div>
    </section>
  );
}
