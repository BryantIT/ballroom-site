"use client";

import { useEffect, useState } from "react";
import { getXpProgress } from "@/app/_lib/gamification";

export default function XpBar({ totalXp }: { totalXp: number }) {
  const { level, nextLevel, pct, xpToNext } = getXpProgress(totalXp);

  // Animate from 0 on mount
  const [displayPct, setDisplayPct] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDisplayPct(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="rounded-2xl border border-white/5 bg-navy-800/50 px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Dancer Level
          </p>
          <p className="text-lg font-bold text-white mt-0.5">{level.name}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total XP</p>
          <p className="text-lg font-bold text-gold-400">{totalXp.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-700 ease-out"
            style={{ width: `${displayPct}%` }}
          />
        </div>
        {nextLevel && xpToNext !== null && (
          <p className="text-xs text-slate-600">
            {xpToNext.toLocaleString()} XP to{" "}
            <span className="text-slate-500">{nextLevel.name}</span>
          </p>
        )}
        {!nextLevel && (
          <p className="text-xs text-slate-500">Max level reached 🏆</p>
        )}
      </div>
    </div>
  );
}
