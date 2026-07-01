"use client";

import { useOptimistic, useTransition, useState } from "react";
import { PinIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import {
  updatePatternStatusAction,
  updatePatternConfidenceAction,
  updatePatternNotesAction,
  togglePatternPinAction,
} from "@/app/_lib/actions/patterns";
import type { PatternWithProgress } from "@/app/_lib/dal/patterns";

type Status = "learning" | "working" | "mastered";

const STATUS_LABELS: Record<Status, string> = {
  learning: "Learning",
  working: "Working",
  mastered: "Mastered",
};

const STATUS_STYLES: Record<Status, string> = {
  learning: "border-slate-600 text-slate-400 bg-slate-800/50",
  working:  "border-blue-500/50 text-blue-400 bg-blue-500/10",
  mastered: "border-gold-500/50 text-gold-400 bg-gold-500/10",
};

type Props = {
  pattern: PatternWithProgress;
  levelLabel?: string;
};

export default function PatternRow({ pattern, levelLabel }: Props) {
  const [, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [notesValue, setNotesValue] = useState(pattern.notes ?? "");
  const [notesSaving, setNotesSaving] = useState(false);

  const [optStatus, setOptStatus] = useOptimistic<Status | null>(
    pattern.status as Status | null
  );
  const [optConfidence, setOptConfidence] = useOptimistic<number | null>(
    pattern.confidence
  );
  const [optPinned, setOptPinned] = useOptimistic<boolean>(pattern.isPinned);

  const currentStatus: Status = optStatus ?? "learning";

  function handleStatusClick(s: Status) {
    startTransition(async () => {
      setOptStatus(s);
      await updatePatternStatusAction(pattern.id, s);
    });
  }

  function handleStarClick(star: number) {
    const next = optConfidence === star ? null : star;
    startTransition(async () => {
      setOptConfidence(next);
      if (next !== null) await updatePatternConfidenceAction(pattern.id, next);
    });
  }

  function handlePinClick() {
    startTransition(async () => {
      setOptPinned(!optPinned);
      await togglePatternPinAction(pattern.id, !optPinned);
    });
  }

  async function handleNotesSave() {
    setNotesSaving(true);
    await updatePatternNotesAction(pattern.id, notesValue);
    setNotesSaving(false);
  }

  return (
    <div
      className={`rounded-xl border transition-colors ${
        optPinned ? "border-gold-500/30 bg-gold-500/5" : "border-white/5 bg-navy-800/50"
      }`}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Pin button */}
        <button
          onClick={handlePinClick}
          className={`shrink-0 rounded-md p-1 transition-colors ${
            optPinned
              ? "text-gold-400 hover:text-gold-300"
              : "text-slate-600 hover:text-slate-400"
          }`}
          aria-label={optPinned ? "Unpin pattern" : "Pin as focus"}
        >
          <PinIcon size={14} />
        </button>

        {/* Name + optional level origin badge */}
        <span className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-white truncate">{pattern.name}</span>
          {levelLabel && (
            <span className="shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              {levelLabel}
            </span>
          )}
        </span>

        {/* Star confidence */}
        <div className="flex gap-0.5 shrink-0">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              className={`text-base transition-colors ${
                (optConfidence ?? 0) >= star
                  ? "text-gold-400"
                  : "text-slate-700 hover:text-slate-500"
              }`}
              aria-label={`Rate confidence ${star}`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Expand notes */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors ml-1"
          aria-label={expanded ? "Collapse notes" : "Expand notes"}
        >
          {expanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </button>
      </div>

      {/* Status buttons */}
      <div className="flex gap-2 px-4 pb-3">
        {(["learning", "working", "mastered"] as Status[]).map((s) => (
          <button
            key={s}
            onClick={() => handleStatusClick(s)}
            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
              currentStatus === s
                ? STATUS_STYLES[s]
                : "border-white/5 text-slate-500 bg-transparent hover:border-white/10 hover:text-slate-400"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Notes panel */}
      {expanded && (
        <div className="border-t border-white/5 px-4 py-3 space-y-2">
          {pattern.description && (
            <p className="text-xs text-slate-500 italic">{pattern.description}</p>
          )}
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Add coaching notes, corrections, reminders…"
            rows={3}
            className="w-full rounded-lg bg-navy-900 border border-white/10 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-white/20 resize-none"
          />
          <div className="flex items-center justify-between">
            {pattern.updatedAt && (
              <span className="text-xs text-slate-600">
                Updated {new Date(pattern.updatedAt).toLocaleDateString()}
              </span>
            )}
            <button
              onClick={handleNotesSave}
              disabled={notesSaving}
              className="ml-auto rounded-lg bg-gold-500/10 border border-gold-500/30 px-3 py-1.5 text-xs font-medium text-gold-400 hover:bg-gold-500/20 transition-colors disabled:opacity-50"
            >
              {notesSaving ? "Saving…" : "Save notes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
