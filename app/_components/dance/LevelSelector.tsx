"use client";

import { useTransition, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import type { DanceLevelRow } from "@/app/_lib/dal/dances";
import { updateLevelAction } from "@/app/_lib/actions/dances";
import LevelBadge from "./LevelBadge";

export default function LevelSelector({
  userDanceId,
  levels,
  currentLevelId,
}: {
  userDanceId: string;
  levels: DanceLevelRow[];
  currentLevelId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticLevelId, setOptimisticLevelId] = useOptimistic(currentLevelId);

  function handleSelect(levelId: string) {
    if (levelId === optimisticLevelId) return;
    startTransition(async () => {
      setOptimisticLevelId(levelId);
      await updateLevelAction(userDanceId, levelId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        Current level
      </p>
      <div className="grid grid-cols-2 gap-2">
        {levels.map((level) => {
          const isActive = level.id === optimisticLevelId;
          return (
            <button
              key={level.id}
              onClick={() => handleSelect(level.id)}
              disabled={isPending}
              className={`flex items-center justify-center rounded-xl border px-4 py-3 transition-all disabled:opacity-60 ${
                isActive
                  ? "border-gold-500/50 bg-gold-500/10"
                  : "border-white/5 bg-navy-800 hover:border-white/15"
              }`}
            >
              <LevelBadge level={level.name} size="md" />
            </button>
          );
        })}
      </div>
      {isPending && (
        <p className="text-xs text-slate-500 text-center">Saving…</p>
      )}
    </div>
  );
}
