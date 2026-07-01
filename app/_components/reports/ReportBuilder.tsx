"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadIcon, EyeIcon } from "lucide-react";

type Dance = {
  styleId: string;
  styleSlug: string;
  styleName: string;
  styleCategory: string;
};

type Props = {
  dances: Dance[];
  initialSelectedIds: string[];
  initialFrom: string;
  initialTo: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  standard: "Intl. Standard",
  latin:    "Intl. Latin",
  smooth:   "Am. Smooth",
  rhythm:   "Am. Rhythm",
};

export default function ReportBuilder({
  dances,
  initialSelectedIds,
  initialFrom,
  initialTo,
}: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelectedIds)
  );
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  function toggleDance(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === dances.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(dances.map((d) => d.styleId)));
    }
  }

  function buildParams() {
    return new URLSearchParams({
      dances: [...selectedIds].join(","),
      from,
      to,
    }).toString();
  }

  function handlePreview() {
    router.push(`/reports?${buildParams()}`);
  }

  const allSelected = selectedIds.size === dances.length;
  const noneSelected = selectedIds.size === 0;
  const pdfHref = `/api/reports/pdf?${buildParams()}`;

  // Group dances by category for display
  const grouped = (["standard", "latin", "smooth", "rhythm"] as const)
    .map((cat) => ({
      cat,
      label: CATEGORY_LABELS[cat],
      items: dances.filter((d) => d.styleCategory === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="rounded-2xl border border-white/5 bg-navy-800/50 overflow-hidden">
      {/* Date range */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Date Range
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              max={to}
              className="w-full rounded-xl border border-white/10 bg-navy-900 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 [color-scheme:dark]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              min={from}
              max={todayStr()}
              className="w-full rounded-xl border border-white/10 bg-navy-900 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Dance selection */}
      <div className="px-4 pt-3 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Dances
          </p>
          <button
            onClick={toggleAll}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>

        <div className="space-y-4">
          {grouped.map(({ cat, label, items }) => (
            <div key={cat}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1.5">
                {label}
              </p>
              <div className="space-y-1">
                {items.map((dance) => (
                  <label
                    key={dance.styleId}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(dance.styleId)}
                      onChange={() => toggleDance(dance.styleId)}
                      className="rounded border-white/20 bg-navy-900 text-gold-500 focus:ring-gold-500/30 focus:ring-offset-0"
                    />
                    <span className="text-sm text-white">{dance.styleName}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-white/5 flex gap-2">
        <button
          onClick={handlePreview}
          disabled={noneSelected}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-navy-900 py-2.5 text-sm font-medium text-slate-300 hover:border-white/20 hover:text-white transition-colors disabled:opacity-40"
        >
          <EyeIcon size={15} />
          Preview
        </button>
        <a
          href={noneSelected ? undefined : pdfHref}
          aria-disabled={noneSelected}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 py-2.5 text-sm font-medium text-gold-400 hover:bg-gold-500/20 transition-colors ${noneSelected ? "opacity-40 pointer-events-none" : ""}`}
        >
          <DownloadIcon size={15} />
          Download PDF
        </a>
      </div>
    </div>
  );
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
