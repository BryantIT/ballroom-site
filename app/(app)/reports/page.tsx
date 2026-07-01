import { redirect } from "next/navigation";
import { getAuthUser } from "@/app/_lib/dal/auth";
import { getUserDancesForReport, getReportData } from "@/app/_lib/dal/reports";
import ReportBuilder from "@/app/_components/reports/ReportBuilder";
import ReportPreview from "@/app/_components/reports/ReportPreview";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ dances?: string; from?: string; to?: string }>;
}) {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const params = await searchParams;
  const today = todayStr();
  const defaultFrom = daysAgo(30);

  const fromParam  = params.from  ?? defaultFrom;
  const toParam    = params.to    ?? today;
  const dancesParam = params.dances ?? "";

  const allDances = await getUserDancesForReport(authUser.userId);

  // Default selection: all dances
  const allStyleIds = allDances.map((d) => d.styleId);
  const selectedIds = dancesParam
    ? dancesParam.split(",").filter((id) => allStyleIds.includes(id))
    : allStyleIds;

  // Only fetch report data when there are params in the URL (explicit preview)
  const hasParams = !!(params.dances || params.from || params.to);

  let reportData = null;
  if (hasParams && selectedIds.length > 0) {
    try {
      reportData = await getReportData(
        authUser.userId,
        selectedIds,
        new Date(`${fromParam}T00:00:00Z`),
        new Date(`${toParam}T00:00:00Z`)
      );
    } catch {
      // fall through to show builder only
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">
          Progress Reports
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Choose dances and a date range, then preview or download as PDF.
        </p>
      </div>

      <ReportBuilder
        dances={allDances}
        initialSelectedIds={selectedIds}
        initialFrom={fromParam}
        initialTo={toParam}
      />

      {allDances.length === 0 && (
        <div className="rounded-2xl border border-white/5 bg-navy-800 p-8 text-center">
          <p className="text-slate-400 text-sm">
            Add some dances first to generate a report.
          </p>
        </div>
      )}

      {reportData && <ReportPreview data={reportData} />}
    </div>
  );
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}
