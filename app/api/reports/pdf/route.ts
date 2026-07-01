export const runtime = "nodejs";

import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getAuthUser } from "@/app/_lib/dal/auth";
import { getReportData } from "@/app/_lib/dal/reports";
import ReportDocument from "@/app/_components/reports/ReportDocument";

export async function GET(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dancesParam = searchParams.get("dances") ?? "";
  const fromParam  = searchParams.get("from") ?? defaultFrom();
  const toParam    = searchParams.get("to")   ?? todayStr();

  const styleIds = dancesParam
    ? dancesParam.split(",").filter(Boolean)
    : [];

  const dateFrom = new Date(`${fromParam}T00:00:00Z`);
  const dateTo   = new Date(`${toParam}T00:00:00Z`);

  if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
    return new Response("Invalid date range", { status: 400 });
  }

  try {
    const data = await getReportData(
      authUser.userId,
      styleIds,
      dateFrom,
      dateTo
    );

    // Cast needed: renderToBuffer expects DocumentProps element; TS sees Props
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(
      React.createElement(ReportDocument, { data }) as any
    );

    const filename = `dance-report-${toParam}.pdf`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return new Response("Failed to generate report", { status: 500 });
  }
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}
