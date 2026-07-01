"use client";

import { useState, useTransition } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import LevelBadge from "./LevelBadge";
import { addDanceAction, addDanceWithHistoryAction } from "@/app/_lib/actions/dances";
import type { PatternForHistory } from "@/app/_lib/dal/patterns";

type Level = {
  id: string;
  name: "bronze" | "silver" | "gold" | "open";
  order: number;
};

type Props = {
  styleId: string;
  styleSlug: string;
  styleName: string;
  levels: Level[];
  allPatterns: PatternForHistory[];
};

export default function AddDanceWithHistoryFlow({
  styleId,
  styleSlug,
  styleName,
  levels,
  allPatterns,
}: Props) {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const previousPatterns = selectedLevel
    ? allPatterns.filter((p) => p.levelOrder < selectedLevel.order)
    : [];

  // Group previous patterns by level for rendering
  const levelGroups: { levelId: string; levelName: Level["name"]; patterns: PatternForHistory[] }[] =
    [];
  for (const p of previousPatterns) {
    const existing = levelGroups.find((g) => g.levelId === p.levelId);
    if (existing) {
      existing.patterns.push(p);
    } else {
      levelGroups.push({ levelId: p.levelId, levelName: p.levelName, patterns: [p] });
    }
  }

  function handleLevelClick(level: Level) {
    const hasPrev = allPatterns.some((p) => p.levelOrder < level.order);
    if (!hasPrev) {
      // Bronze or no seeded patterns for previous levels — skip modal
      startTransition(async () => {
        await addDanceWithHistoryAction({
          styleId,
          styleSlug,
          levelId: level.id,
          knownPatternIds: [],
          unknownPatternIds: [],
        });
      });
      return;
    }
    // Initialize all previous patterns as checked (user knows them)
    const prevIds = allPatterns
      .filter((p) => p.levelOrder < level.order)
      .map((p) => p.id);
    setCheckedIds(new Set(prevIds));
    setSelectedLevel(level);
  }

  function handleAddWithoutLevel() {
    startTransition(async () => {
      await addDanceAction(styleId);
    });
  }

  function togglePattern(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll(ids: string[], allChecked: boolean) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allChecked ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  function handleConfirm() {
    if (!selectedLevel) return;
    const allPrevIds = previousPatterns.map((p) => p.id);
    const knownPatternIds = allPrevIds.filter((id) => checkedIds.has(id));
    const unknownPatternIds = allPrevIds.filter((id) => !checkedIds.has(id));
    startTransition(async () => {
      await addDanceWithHistoryAction({
        styleId,
        styleSlug,
        levelId: selectedLevel.id,
        knownPatternIds,
        unknownPatternIds,
      });
    });
  }

  function handleSkip() {
    if (!selectedLevel) return;
    startTransition(async () => {
      await addDanceWithHistoryAction({
        styleId,
        styleSlug,
        levelId: selectedLevel.id,
        knownPatternIds: [],
        unknownPatternIds: [],
      });
    });
  }

  const knownCount = checkedIds.size;
  const totalCount = previousPatterns.length;

  return (
    <>
      {/* Level picker */}
      <div className="space-y-3">
        <p className="text-sm text-slate-400 text-center">Choose your starting level</p>
        <div className="grid grid-cols-2 gap-2">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => handleLevelClick(level)}
              disabled={isPending}
              className="flex items-center justify-center rounded-xl border border-white/5 bg-navy-800 px-4 py-3 hover:border-white/15 transition-colors disabled:opacity-50"
            >
              <LevelBadge level={level.name} size="md" />
            </button>
          ))}
        </div>
        <button
          onClick={handleAddWithoutLevel}
          disabled={isPending}
          className="w-full rounded-xl border border-white/5 bg-navy-800 px-4 py-3 text-sm text-slate-400 hover:border-white/15 transition-colors disabled:opacity-50"
        >
          Add without a level
        </button>
      </div>

      {/* History verification modal */}
      {selectedLevel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isPending && setSelectedLevel(null)}
          />

          {/* Sheet */}
          <div className="relative w-full sm:max-w-lg bg-navy-900 rounded-t-2xl sm:rounded-2xl border border-white/10 max-h-[85dvh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/5">
              <div>
                <h3 className="font-display text-lg font-bold text-white leading-tight">
                  Previous Level Patterns
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Check off the patterns you already know.{" "}
                  <span className="text-slate-500">
                    Unchecked ones will be added to your{" "}
                    <span className="capitalize">{selectedLevel.name}</span> practice list.
                  </span>
                </p>
              </div>
              <button
                onClick={() => !isPending && setSelectedLevel(null)}
                disabled={isPending}
                className="shrink-0 ml-3 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Close"
              >
                <XIcon size={20} />
              </button>
            </div>

            {/* Pattern list */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
              {levelGroups.map(({ levelId, levelName, patterns: groupPatterns }) => {
                const groupChecked = groupPatterns.filter((p) => checkedIds.has(p.id)).length;
                const allGroupChecked = groupChecked === groupPatterns.length;
                return (
                  <div key={levelId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LevelBadge level={levelName} size="sm" />
                        <span className="text-xs text-slate-500">
                          {groupChecked}/{groupPatterns.length} known
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          toggleAll(
                            groupPatterns.map((p) => p.id),
                            allGroupChecked
                          )
                        }
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {allGroupChecked ? "Uncheck all" : "Check all"}
                      </button>
                    </div>
                    <div className="space-y-1">
                      {groupPatterns.map((pattern) => {
                        const isChecked = checkedIds.has(pattern.id);
                        return (
                          <button
                            key={pattern.id}
                            onClick={() => togglePattern(pattern.id)}
                            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 border text-left transition-colors ${
                              isChecked
                                ? "border-gold-500/30 bg-gold-500/5"
                                : "border-white/5 bg-navy-800/50 hover:border-white/10"
                            }`}
                          >
                            <div
                              className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                isChecked
                                  ? "border-gold-500 bg-gold-500/20 text-gold-400"
                                  : "border-white/20 text-transparent"
                              }`}
                            >
                              <CheckIcon size={12} />
                            </div>
                            <span className="text-sm text-white">{pattern.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary + actions */}
            <div className="px-5 py-4 border-t border-white/5 space-y-2">
              {totalCount > 0 && (
                <p className="text-xs text-slate-500 text-center">
                  {knownCount === totalCount
                    ? "All patterns known — nothing to carry forward."
                    : `${totalCount - knownCount} pattern${totalCount - knownCount !== 1 ? "s" : ""} will be added to your ${selectedLevel.name} practice list.`}
                </p>
              )}
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="w-full rounded-xl bg-gold-500/10 border border-gold-500/30 py-3 text-sm font-semibold text-gold-400 hover:bg-gold-500/20 transition-colors disabled:opacity-50"
              >
                {isPending
                  ? "Adding…"
                  : `Add ${styleName} — ${capitalize(selectedLevel.name)}`}
              </button>
              <button
                onClick={handleSkip}
                disabled={isPending}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-400 transition-colors disabled:opacity-50"
              >
                Skip — add without reviewing previous patterns
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
