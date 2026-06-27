import { notFound, redirect } from "next/navigation";
import { getAuthUser } from "@/app/_lib/dal/auth";
import {
  getDanceStyleBySlug,
  getLevelsForStyle,
  getUserDanceForStyle,
} from "@/app/_lib/dal/dances";
import LevelBadge from "@/app/_components/dance/LevelBadge";
import LevelSelector from "@/app/_components/dance/LevelSelector";
import RemoveDanceButton from "@/app/_components/dance/RemoveDanceButton";
import { addDanceAction } from "@/app/_lib/actions/dances";

const CATEGORY_LABELS: Record<string, string> = {
  standard: "International Standard",
  latin:    "International Latin",
  smooth:   "American Smooth",
  rhythm:   "American Rhythm",
};

export default async function DanceStylePage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style: slug } = await params;

  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const [styleRow, userDance] = await Promise.all([
    getDanceStyleBySlug(slug).then((s) => s ?? null),
    getDanceStyleBySlug(slug).then((s) =>
      s ? getUserDanceForStyle(authUser.userId, s.id) : null
    ),
  ]);

  if (!styleRow) notFound();

  const levels = await getLevelsForStyle(styleRow.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
          {CATEGORY_LABELS[styleRow.category] ?? styleRow.category}
        </p>
        <h2 className="font-display text-3xl font-bold text-white">{styleRow.name}</h2>
        {userDance && (
          <div className="mt-2">
            <LevelBadge level={userDance.currentLevelId ? levels.find((l) => l.id === userDance.currentLevelId)?.name : null} size="md" />
          </div>
        )}
      </div>

      {userDance ? (
        <>
          {/* Level selector */}
          <LevelSelector
            userDanceId={userDance.id}
            levels={levels}
            currentLevelId={userDance.currentLevelId}
          />

          {/* Level progression */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Progression
            </p>
            <div className="space-y-1">
              {levels.map((level, i) => {
                const isCurrent = level.id === userDance.currentLevelId;
                const currentOrder = levels.find((l) => l.id === userDance.currentLevelId)?.order ?? 0;
                const isPast = level.order < currentOrder;
                return (
                  <div
                    key={level.id}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                      isCurrent
                        ? "border-gold-500/30 bg-gold-500/5"
                        : "border-white/5 bg-navy-800/50"
                    }`}
                  >
                    <span className={`text-xs font-mono w-4 text-center ${isPast ? "text-slate-600" : "text-slate-500"}`}>
                      {i + 1}
                    </span>
                    <LevelBadge level={level.name} />
                    {isCurrent && (
                      <span className="ml-auto text-xs text-gold-500 font-medium">Current</span>
                    )}
                    {isPast && (
                      <span className="ml-auto text-xs text-slate-600">Completed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remove */}
          <RemoveDanceButton userDanceId={userDance.id} />
        </>
      ) : (
        <>
          {/* Not added — show progression preview + add button */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Progression
            </p>
            <div className="space-y-1">
              {levels.map((level, i) => (
                <div
                  key={level.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/5 bg-navy-800/50"
                >
                  <span className="text-xs font-mono w-4 text-center text-slate-500">{i + 1}</span>
                  <LevelBadge level={level.name} />
                </div>
              ))}
            </div>
          </div>

          <form
            action={async (formData: FormData) => {
              "use server";
              const styleId = formData.get("styleId") as string;
              const levelId = (formData.get("levelId") as string) || undefined;
              await addDanceAction(styleId, levelId);
            }}
            className="space-y-3"
          >
            <input type="hidden" name="styleId" value={styleRow.id} />
            <div className="space-y-2">
              <p className="text-sm text-slate-400 text-center">Choose your starting level</p>
              <div className="grid grid-cols-2 gap-2">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    type="submit"
                    name="levelId"
                    value={level.id}
                    className="flex items-center justify-center rounded-xl border border-white/5 bg-navy-800 px-4 py-3 hover:border-white/15 transition-colors"
                  >
                    <LevelBadge level={level.name} size="md" />
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="w-full rounded-xl border border-white/5 bg-navy-800 px-4 py-3 text-sm text-slate-400 hover:border-white/15 transition-colors"
              >
                Add without a level
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
