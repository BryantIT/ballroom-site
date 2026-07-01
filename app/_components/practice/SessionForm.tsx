"use client";

import { useActionState, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { logSessionAction } from "@/app/_lib/actions/practice";
import type { LogSessionState } from "@/app/_lib/actions/practice";
import type { StyleGroup } from "@/app/_lib/dal/practice";

type Props = { styleGroups: StyleGroup[] };

const TYPE_OPTIONS = [
  { value: "solo",   label: "Solo" },
  { value: "class",  label: "Group Class" },
  { value: "lesson", label: "Private Lesson" },
] as const;

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function SessionForm({ styleGroups }: Props) {
  const [state, formAction, isPending] = useActionState<LogSessionState, FormData>(
    logSessionAction,
    null
  );

  const [selectedType, setSelectedType] = useState<"solo" | "class" | "lesson">("solo");
  const [duration, setDuration] = useState("60");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  function toggleId(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleGroup(styleId: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(styleId) ? next.delete(styleId) : next.add(styleId);
      return next;
    });
  }

  function toggleAllInGroup(styleId: string, patternIds: string[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = patternIds.every((id) => prev.has(id));
      patternIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  const totalSelected = selectedIds.size;

  return (
    <form action={formAction} className="space-y-5">
      {state?.errors?._root && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.errors._root}
        </p>
      )}

      {/* Date */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Date
        </label>
        <input
          type="date"
          name="date"
          defaultValue={todayString()}
          max={todayString()}
          className="w-full rounded-xl border border-white/10 bg-navy-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 [color-scheme:dark]"
        />
        {state?.errors?.date && (
          <p className="text-xs text-red-400">{state.errors.date}</p>
        )}
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Duration (minutes)
        </label>
        <div className="flex gap-2">
          {[30, 45, 60, 90].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setDuration(String(m))}
              className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                duration === String(m)
                  ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                  : "border-white/5 bg-navy-800 text-slate-400 hover:border-white/15 hover:text-white"
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
        <input
          type="number"
          name="durationMinutes"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min={1}
          max={480}
          placeholder="e.g. 45"
          className="w-full rounded-xl border border-white/10 bg-navy-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/20"
        />
        {state?.errors?.durationMinutes && (
          <p className="text-xs text-red-400">{state.errors.durationMinutes}</p>
        )}
      </div>

      {/* Session type */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Type
        </span>
        {/* Hidden input carries the selected value */}
        <input type="hidden" name="type" value={selectedType} />
        <div className="grid grid-cols-3 gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedType(opt.value)}
              className={`rounded-xl border py-3 text-sm font-medium transition-colors ${
                selectedType === opt.value
                  ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                  : "border-white/5 bg-navy-800 text-slate-400 hover:border-white/15 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patterns practiced */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Patterns practiced
          </span>
          {totalSelected > 0 && (
            <span className="text-xs text-gold-400">{totalSelected} selected</span>
          )}
        </div>

        {styleGroups.length === 0 ? (
          <p className="text-xs text-slate-600 italic">
            Add dances with a level set to track patterns here.
          </p>
        ) : (
          <div className="rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5">
            {styleGroups.map((group) => {
              const isOpen = openGroups.has(group.styleId);
              const groupIds = group.patterns.map((p) => p.id);
              const selectedInGroup = groupIds.filter((id) => selectedIds.has(id)).length;
              const allSelected = selectedInGroup === groupIds.length;

              return (
                <div key={group.styleId}>
                  <div className="flex items-center bg-navy-800/50">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.styleId)}
                      className="flex-1 flex items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="text-sm font-medium text-white">
                        {group.styleName}
                      </span>
                      <div className="flex items-center gap-2">
                        {selectedInGroup > 0 && (
                          <span className="rounded-full bg-gold-500/20 border border-gold-500/30 px-2 py-0.5 text-[11px] font-medium text-gold-400">
                            {selectedInGroup}
                          </span>
                        )}
                        {isOpen ? (
                          <ChevronUpIcon size={16} className="text-slate-500" />
                        ) : (
                          <ChevronDownIcon size={16} className="text-slate-500" />
                        )}
                      </div>
                    </button>
                  </div>

                  {isOpen && (
                    <div className="bg-navy-900/50 px-4 py-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleAllInGroup(group.styleId, groupIds)}
                        className="w-full text-left text-xs text-slate-500 hover:text-slate-300 py-1 transition-colors"
                      >
                        {allSelected ? "Uncheck all" : "Check all"}
                      </button>
                      {group.patterns.map((pattern) => (
                        <label
                          key={pattern.id}
                          className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            name="patternIds"
                            value={pattern.id}
                            checked={selectedIds.has(pattern.id)}
                            onChange={() => toggleId(pattern.id)}
                            className="rounded border-white/20 bg-navy-800 text-gold-500 focus:ring-gold-500/30 focus:ring-offset-0"
                          />
                          <span className="text-sm text-slate-300">{pattern.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Notes <span className="normal-case font-normal text-slate-600">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="What went well? What needs more work?"
          className="w-full rounded-xl border border-white/10 bg-navy-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/20 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-gold-500/10 border border-gold-500/30 py-3.5 text-sm font-semibold text-gold-400 hover:bg-gold-500/20 transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Log Session"}
      </button>
    </form>
  );
}
