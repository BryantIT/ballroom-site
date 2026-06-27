import { getAuthUser } from "@/app/_lib/dal/auth";
import { getUserDances, getAvailableStyles, getLevelsForStyle } from "@/app/_lib/dal/dances";
import DanceCard from "@/app/_components/dance/DanceCard";
import AddDanceSheet from "@/app/_components/dance/AddDanceSheet";
import { redirect } from "next/navigation";

const CATEGORIES = [
  { key: "standard", label: "International Standard" },
  { key: "latin",    label: "International Latin" },
  { key: "smooth",   label: "American Smooth" },
  { key: "rhythm",   label: "American Rhythm" },
] as const;

export default async function DancesPage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const [myDances, availableStyles] = await Promise.all([
    getUserDances(authUser.userId),
    getAvailableStyles(authUser.userId),
  ]);

  // Pre-fetch levels for all available styles so the sheet doesn't need a round-trip
  const levelsMap: Record<string, Awaited<ReturnType<typeof getLevelsForStyle>>> = {};
  await Promise.all(
    availableStyles.map(async (s) => {
      levelsMap[s.id] = await getLevelsForStyle(s.id);
    })
  );

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    dances: myDances.filter((d) => d.styleCategory === cat.key),
  })).filter((g) => g.dances.length > 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {myDances.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-navy-800 p-8 text-center space-y-3">
          <div className="text-4xl">🕺</div>
          <h3 className="font-semibold text-white text-lg">No dances yet</h3>
          <p className="text-slate-400 text-sm">
            Tap the + button to add the styles you&apos;re learning.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ key, label, dances }) => (
            <section key={key}>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                {label}
              </p>
              <div className="space-y-2">
                {dances.map((dance) => (
                  <DanceCard key={dance.id} dance={dance} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <AddDanceSheet availableStyles={availableStyles} levelsMap={levelsMap} />
    </div>
  );
}
