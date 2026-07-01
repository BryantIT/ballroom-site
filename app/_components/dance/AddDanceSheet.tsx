"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, ChevronLeft } from "lucide-react";
import type { DanceStyleRow, DanceLevelRow } from "@/app/_lib/dal/dances";
import { addDanceAction } from "@/app/_lib/actions/dances";
import LevelBadge from "./LevelBadge";

const CATEGORY_LABELS: Record<string, string> = {
  standard: "International Standard",
  latin:    "International Latin",
  smooth:   "American Smooth",
  rhythm:   "American Rhythm",
};

const CATEGORY_ORDER = ["standard", "latin", "smooth", "rhythm"];

const LEVELS = [
  { name: "bronze" as const, label: "Bronze" },
  { name: "silver" as const, label: "Silver" },
  { name: "gold"   as const, label: "Gold" },
  { name: "open"   as const, label: "Open" },
];

type Step =
  | { type: "browse" }
  | { type: "level"; style: DanceStyleRow; levels: DanceLevelRow[] };

export default function AddDanceSheet({
  availableStyles,
  levelsMap,
}: {
  availableStyles: DanceStyleRow[];
  levelsMap: Record<string, DanceLevelRow[]>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>({ type: "browse" });
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    setOpen(false);
    setStep({ type: "browse" });
  }

  function handleSelectStyle(style: DanceStyleRow) {
    setStep({ type: "level", style, levels: levelsMap[style.id] ?? [] });
  }

  function handleSelectLevel(levelId: string | undefined) {
    if (step.type !== "level") return;
    startTransition(async () => {
      await addDanceAction(step.style.id, levelId);
      handleClose();
      router.refresh();
    });
  }

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    styles: availableStyles.filter((s) => s.category === cat),
  })).filter((g) => g.styles.length > 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-navy-900 shadow-lg hover:bg-gold-400 transition-colors"
        aria-label="Add dance"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Sheet */}
          <div className="relative flex flex-col rounded-t-3xl bg-navy-900 border-t border-white/10 max-h-[85dvh]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              {step.type === "level" ? (
                <button
                  onClick={() => setStep({ type: "browse" })}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft size={18} />
                  <span className="text-sm">Back</span>
                </button>
              ) : (
                <h2 className="font-display font-semibold text-white text-lg">Add a dance</h2>
              )}
              <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-4 pb-8">
              {step.type === "browse" ? (
                availableStyles.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">
                    You&apos;ve added all available dance styles!
                  </p>
                ) : (
                  <div className="space-y-6">
                    {grouped.map(({ category, label, styles }) => (
                      <div key={category}>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                          {label}
                        </p>
                        <div className="space-y-2">
                          {styles.map((style) => (
                            <button
                              key={style.id}
                              onClick={() => handleSelectStyle(style)}
                              className="w-full text-left flex items-center justify-between rounded-xl border border-white/5 bg-navy-800 px-4 py-3 hover:border-white/15 transition-colors"
                            >
                              <span className="text-white font-medium">{style.name}</span>
                              <ChevronLeft size={16} className="text-slate-500 rotate-180" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-2">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">
                      {CATEGORY_LABELS[step.style.category]}
                    </p>
                    <h3 className="font-display text-xl font-bold text-white">{step.style.name}</h3>
                  </div>
                  <p className="text-sm text-slate-400 text-center">
                    What level are you currently working at?
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {LEVELS.map((level) => (
                      <button
                        key={level.name}
                        onClick={() => {
                          const match = step.levels.find((l) => l.name === level.name);
                          handleSelectLevel(match?.id);
                        }}
                        disabled={isPending}
                        className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-navy-800 px-4 py-5 hover:border-white/15 transition-colors disabled:opacity-50"
                      >
                        <LevelBadge level={level.name} size="md" />
                      </button>
                    ))}
                    <button
                      onClick={() => handleSelectLevel(undefined)}
                      disabled={isPending}
                      className="col-span-2 rounded-2xl border border-white/5 bg-navy-800 px-4 py-3 text-sm text-slate-400 hover:border-white/15 transition-colors disabled:opacity-50"
                    >
                      Not sure yet — skip for now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
