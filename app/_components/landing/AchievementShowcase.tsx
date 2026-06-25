const achievements = [
  {
    emoji: "👣",
    title: "First Steps",
    description: "Marked your very first pattern",
    xp: "+25 XP",
    rarity: "common",
  },
  {
    emoji: "🥉",
    title: "Bronze Graduate",
    description: "Mastered all Bronze patterns in a dance",
    xp: "+200 XP",
    rarity: "uncommon",
  },
  {
    emoji: "🔥",
    title: "On a Roll",
    description: "Practiced 7 days in a row",
    xp: "+100 XP",
    rarity: "uncommon",
  },
  {
    emoji: "🏆",
    title: "Competition Ready",
    description: "Logged your first competition",
    xp: "+150 XP",
    rarity: "rare",
  },
  {
    emoji: "🥈",
    title: "Silver Lining",
    description: "Mastered all Silver patterns in a dance",
    xp: "+350 XP",
    rarity: "rare",
  },
  {
    emoji: "⭐",
    title: "Social Star",
    description: "Shared your first achievement",
    xp: "+50 XP",
    rarity: "common",
  },
];

const rarityStyle: Record<string, string> = {
  common: "border-white/10 bg-navy-800",
  uncommon: "border-gold-500/25 bg-navy-800",
  rare: "border-gold-500/50 bg-navy-700",
};

export default function AchievementShowcase() {
  return (
    <section className="bg-navy-900 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-500 mb-4">
            Achievements
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-5">
            Celebrate every milestone
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Every pattern mastered, every streak kept, and every level completed
            earns you recognition. Because progress deserves to be celebrated.
          </p>
        </div>

        {/* XP bar teaser */}
        <div className="mx-auto max-w-md mb-16 rounded-2xl border border-white/5 bg-navy-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Dancer Level
              </p>
              <p className="text-lg font-bold text-white">Developing Dancer</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Next level</p>
              <p className="text-sm text-gold-400 font-semibold">
                850 / 1500 XP
              </p>
            </div>
          </div>
          {/* XP bar */}
          <div className="h-2.5 rounded-full bg-navy-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400"
              style={{ width: "57%" }}
              role="progressbar"
              aria-valuenow={850}
              aria-valuemin={0}
              aria-valuemax={1500}
              aria-label="XP progress"
            />
          </div>
        </div>

        {/* Achievement grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievements.map((achievement) => (
            <div
              key={achievement.title}
              className={`group rounded-2xl border p-6 transition-colors duration-300 hover:border-gold-500/40 ${rarityStyle[achievement.rarity]}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-navy-900 text-3xl shadow-inner">
                  {achievement.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {achievement.title}
                    </h3>
                    <span className="text-xs font-semibold text-gold-500 whitespace-nowrap">
                      {achievement.xp}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-snug">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-slate-500 text-sm">
          50+ achievements to unlock as you progress.
        </p>
      </div>
    </section>
  );
}
