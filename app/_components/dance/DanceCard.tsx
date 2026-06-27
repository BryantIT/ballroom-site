import Link from "next/link";
import type { UserDanceRow } from "@/app/_lib/dal/dances";
import LevelBadge from "./LevelBadge";

const CATEGORY_LABELS: Record<string, string> = {
  standard: "International Standard",
  latin:    "International Latin",
  smooth:   "American Smooth",
  rhythm:   "American Rhythm",
};

export default function DanceCard({ dance }: { dance: UserDanceRow }) {
  return (
    <Link
      href={`/dances/${dance.styleSlug}`}
      className="flex items-center justify-between rounded-2xl border border-white/5 bg-navy-800 px-4 py-4 hover:border-white/10 transition-colors"
    >
      <div className="min-w-0">
        <p className="font-medium text-white truncate">{dance.styleName}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {CATEGORY_LABELS[dance.styleCategory] ?? dance.styleCategory}
        </p>
      </div>
      <LevelBadge level={dance.currentLevelName} />
    </Link>
  );
}
