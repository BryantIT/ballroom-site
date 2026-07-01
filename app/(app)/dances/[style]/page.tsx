import { notFound, redirect } from "next/navigation";
import { getAuthUser } from "@/app/_lib/dal/auth";
import {
  getDanceStyleBySlug,
  getLevelsForStyle,
  getUserDanceForStyle,
} from "@/app/_lib/dal/dances";
import { getPatternsForStyleGrouped } from "@/app/_lib/dal/patterns";
import Link from "next/link";
import LevelBadge from "@/app/_components/dance/LevelBadge";
import LevelSelector from "@/app/_components/dance/LevelSelector";
import RemoveDanceButton from "@/app/_components/dance/RemoveDanceButton";
import AddDanceWithHistoryFlow from "@/app/_components/dance/AddDanceWithHistoryFlow";

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

  const styleRow = await getDanceStyleBySlug(slug);
  if (!styleRow) notFound();

  const [levels, userDance] = await Promise.all([
    getLevelsForStyle(styleRow.id),
    getUserDanceForStyle(authUser.userId, styleRow.id),
  ]);

  // Only pre-fetch patterns for the history modal when the dance isn't added yet
  const allPatterns = userDance ? [] : await getPatternsForStyleGrouped(styleRow.id);

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
            <LevelBadge
              level={userDance.currentLevelId
                ? levels.find((l) => l.id === userDance.currentLevelId)?.name ?? null
                : null}
              size="md"
            />
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

          {/* Patterns link */}
          {userDance.currentLevelId && (
            <Link
              href={`/dances/${styleRow.slug}/patterns`}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-navy-800 px-4 py-3 hover:border-white/15 transition-colors"
            >
              <span className="text-sm font-medium text-white">View Patterns</span>
              <span className="text-xs text-slate-500">Practice checklist →</span>
            </Link>
          )}

          {/* Remove */}
          <RemoveDanceButton userDanceId={userDance.id} />
        </>
      ) : (
        <>
          {/* Not added — show progression preview */}
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

          {/* Level picker + history verification flow */}
          <AddDanceWithHistoryFlow
            styleId={styleRow.id}
            styleSlug={styleRow.slug}
            styleName={styleRow.name}
            levels={levels}
            allPatterns={allPatterns}
          />
        </>
      )}
    </div>
  );
}
