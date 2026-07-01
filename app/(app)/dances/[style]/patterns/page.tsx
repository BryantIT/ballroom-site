import { notFound, redirect } from "next/navigation";
import { getAuthUser } from "@/app/_lib/dal/auth";
import { getDanceStyleBySlug, getUserDanceForStyle, getLevelsForStyle } from "@/app/_lib/dal/dances";
import { getPatternsForLevel, getCarryForwardPatterns } from "@/app/_lib/dal/patterns";
import LevelBadge from "@/app/_components/dance/LevelBadge";
import PatternRow from "@/app/_components/dance/PatternRow";
import PatternProgressBar from "@/app/_components/dance/PatternProgressBar";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function PatternsPage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style: slug } = await params;

  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const styleRow = await getDanceStyleBySlug(slug);
  if (!styleRow) notFound();

  const userDance = await getUserDanceForStyle(authUser.userId, styleRow.id);
  if (!userDance) redirect(`/dances/${slug}`);

  const levels = await getLevelsForStyle(styleRow.id);
  const currentLevel = levels.find((l) => l.id === userDance.currentLevelId);

  if (!currentLevel) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <Link
          href={`/dances/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeftIcon size={16} />
          {styleRow.name}
        </Link>
        <div className="rounded-2xl border border-white/5 bg-navy-800 p-8 text-center space-y-3">
          <p className="text-slate-400 text-sm">No level set for this dance.</p>
          <Link
            href={`/dances/${slug}`}
            className="inline-block rounded-xl bg-gold-500/10 border border-gold-500/30 px-4 py-2 text-sm font-medium text-gold-400 hover:bg-gold-500/20 transition-colors"
          >
            Set a level
          </Link>
        </div>
      </div>
    );
  }

  const [patternsData, carryForward] = await Promise.all([
    getPatternsForLevel(styleRow.id, currentLevel.id, authUser.userId),
    getCarryForwardPatterns(styleRow.id, currentLevel.order, authUser.userId),
  ]);

  const mastered = patternsData.filter((p) => p.status === "mastered").length;
  const pinned = patternsData.filter((p) => p.isPinned);
  const unpinned = patternsData.filter((p) => !p.isPinned);
  const ordered = [...pinned, ...unpinned];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Back link */}
      <Link
        href={`/dances/${slug}`}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeftIcon size={16} />
        {styleRow.name}
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold text-white">Patterns</h2>
        <div className="flex items-center gap-2">
          <LevelBadge level={currentLevel.name} size="sm" />
          <span className="text-xs text-slate-500">{styleRow.name}</span>
        </div>
      </div>

      {/* Progress bar */}
      {patternsData.length > 0 && (
        <PatternProgressBar total={patternsData.length} mastered={mastered} />
      )}

      {/* Pattern list */}
      {patternsData.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-navy-800 p-8 text-center">
          <p className="text-slate-400 text-sm">No patterns seeded for this level yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ordered.map((pattern) => (
            <PatternRow key={pattern.id} pattern={pattern} />
          ))}
        </div>
      )}

      {/* Carry-forward patterns from previous levels */}
      {carryForward.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 shrink-0">
              From Previous Levels
            </p>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <p className="text-xs text-slate-600 text-center -mt-1">
            Patterns you haven&apos;t mastered yet from earlier in the syllabus
          </p>
          <div className="space-y-2">
            {carryForward.map((pattern) => (
              <PatternRow
                key={pattern.id}
                pattern={pattern}
                levelLabel={capitalize(pattern.levelName)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
