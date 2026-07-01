import type { WeekData } from "@/app/_lib/dal/practice";

type FilledWeek = WeekData & { label: string };

function getISOWeekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0 offset
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

function fillWeeks(data: WeekData[], weeksBack = 8): FilledWeek[] {
  const dataMap = new Map(
    data.map((w) => [getISOWeekStart(new Date(w.weekStart)).getTime(), w])
  );

  const thisWeekStart = getISOWeekStart(new Date());
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return Array.from({ length: weeksBack }, (_, i) => {
    const weekStart = new Date(thisWeekStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - (weeksBack - 1 - i) * 7);
    const existing = dataMap.get(weekStart.getTime());
    const isCurrentWeek = i === weeksBack - 1;
    const label = isCurrentWeek
      ? "This week"
      : `${MONTHS[weekStart.getUTCMonth()]} ${weekStart.getUTCDate()}`;
    return {
      weekStart,
      totalMinutes: existing?.totalMinutes ?? 0,
      sessionCount: existing?.sessionCount ?? 0,
      label,
    };
  });
}

export default function WeeklySummary({ data }: { data: WeekData[] }) {
  const weeks = fillWeeks(data);
  const maxMinutes = Math.max(...weeks.map((w) => w.totalMinutes), 60);
  const totalThisWeek = weeks[weeks.length - 1].totalMinutes;
  const totalSessions = weeks.reduce((s, w) => s + w.sessionCount, 0);
  const totalHours = Math.round(weeks.reduce((s, w) => s + w.totalMinutes, 0) / 60 * 10) / 10;

  return (
    <div className="rounded-2xl border border-white/5 bg-navy-800/50 px-4 pt-4 pb-3 space-y-3">
      {/* Summary stats */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">This week</p>
          <p className="text-lg font-bold text-white">
            {totalThisWeek >= 60
              ? `${Math.round(totalThisWeek / 60 * 10) / 10}h`
              : `${totalThisWeek}m`}
          </p>
        </div>
        <div className="h-8 w-px bg-white/5" />
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">8-week total</p>
          <p className="text-lg font-bold text-white">{totalHours}h</p>
        </div>
        <div className="h-8 w-px bg-white/5" />
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Sessions</p>
          <p className="text-lg font-bold text-white">{totalSessions}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1 h-16">
        {weeks.map((week, i) => {
          const pct = maxMinutes > 0 ? week.totalMinutes / maxMinutes : 0;
          const isCurrentWeek = i === weeks.length - 1;
          return (
            <div
              key={week.weekStart.toISOString()}
              className="flex-1 flex flex-col items-center gap-1 group"
              title={`${week.label}: ${week.totalMinutes}m`}
            >
              <div className="w-full flex items-end h-12">
                <div
                  className={`w-full rounded-sm transition-all ${
                    isCurrentWeek
                      ? "bg-gold-500/80"
                      : "bg-white/10 group-hover:bg-white/20"
                  }`}
                  style={{ height: pct > 0 ? `${Math.max(pct * 100, 8)}%` : "2px" }}
                />
              </div>
              <span className="text-[9px] text-slate-600 truncate w-full text-center">
                {i === weeks.length - 1 ? "Now" : week.weekStart.getUTCDate().toString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
