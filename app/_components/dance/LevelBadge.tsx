const CONFIG = {
  bronze: { label: "Bronze", className: "bg-amber-900/40 text-amber-400 border border-amber-700/40" },
  silver: { label: "Silver", className: "bg-slate-700/40 text-slate-300 border border-slate-500/40" },
  gold:   { label: "Gold",   className: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/40" },
  open:   { label: "Open",   className: "bg-purple-900/40 text-purple-400 border border-purple-700/40" },
} as const;

export default function LevelBadge({
  level,
  size = "sm",
}: {
  level: "bronze" | "silver" | "gold" | "open" | null | undefined;
  size?: "sm" | "md";
}) {
  if (!level) {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium border border-white/10 bg-white/5 text-slate-500 ${size === "md" ? "text-sm" : "text-xs"}`}>
        No level
      </span>
    );
  }

  const { label, className } = CONFIG[level];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${className} ${size === "md" ? "text-sm" : "text-xs"}`}>
      {label}
    </span>
  );
}
