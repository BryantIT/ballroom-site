import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReportData } from "@/app/_lib/dal/reports";

const CATEGORY_LABELS: Record<string, string> = {
  standard: "International Standard",
  latin:    "International Latin",
  smooth:   "American Smooth",
  rhythm:   "American Rhythm",
};

const s = StyleSheet.create({
  page:          { padding: 48, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  // Header
  header:        { marginBottom: 24, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 16 },
  headerRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  label:         { fontSize: 8, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 },
  title:         { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#111827" },
  subtitle:      { fontSize: 11, color: "#6b7280", marginTop: 4 },
  generated:     { fontSize: 8, color: "#d1d5db" },
  // Summary
  summaryRow:    { flexDirection: "row", gap: 24, marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  summaryBlock:  { flex: 1 },
  summaryValue:  { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#111827" },
  summaryLabel:  { fontSize: 8, color: "#9ca3af", marginTop: 2 },
  // Dance section
  danceSection:  { marginBottom: 20 },
  danceMeta:     { fontSize: 7, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 },
  danceName:     { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#111827", marginTop: 2, marginBottom: 6 },
  progressBg:    { height: 4, backgroundColor: "#f3f4f6", borderRadius: 2, marginBottom: 8 },
  progressFill:  { height: 4, backgroundColor: "#d97706", borderRadius: 2 },
  progressLabel: { fontSize: 9, color: "#6b7280", marginBottom: 8 },
  // Pattern rows
  patternRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#f9fafb" },
  patternName:   { fontSize: 10, color: "#374151", flex: 1 },
  patternStatus: { fontSize: 9, color: "#9ca3af", width: 60, textAlign: "right" },
  patternStars:  { fontSize: 9, color: "#d97706", width: 52, textAlign: "right" },
  check:         { fontSize: 10, width: 14, color: "#d97706" },
  circle:        { fontSize: 10, width: 14, color: "#d1d5db" },
  // Footer
  footer:        { position: "absolute", bottom: 32, left: 48, right: 48, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  footerText:    { fontSize: 8, color: "#d1d5db" },
});

type Props = { data: ReportData };

export default function ReportDocument({ data }: Props) {
  const { userName, dateFrom, dateTo, generatedAt, dances, periodStats } = data;

  const h = Math.floor(periodStats.totalMinutes / 60);
  const m = periodStats.totalMinutes % 60;
  const practiceTime = h > 0 ? `${h}h ${m > 0 ? ` ${m}m` : ""}`.trim() : `${m}m`;
  const totalMastered = dances.reduce((s, d) => s + d.masteredCount, 0);
  const totalPatterns = dances.reduce((s, d) => s + d.totalCount, 0);

  return (
    <Document
      title={`Dance Progress Report — ${userName}`}
      author="DancePath"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.label}>Dance Progress Report</Text>
              <Text style={s.title}>{userName}</Text>
              <Text style={s.subtitle}>
                {fmt(dateFrom)} — {fmt(dateTo)}
              </Text>
            </View>
            <Text style={s.generated}>Generated {fmt(generatedAt)}</Text>
          </View>
        </View>

        {/* Period summary */}
        <View style={s.summaryRow}>
          <View style={s.summaryBlock}>
            <Text style={s.summaryValue}>{practiceTime}</Text>
            <Text style={s.summaryLabel}>Practice Time</Text>
          </View>
          <View style={s.summaryBlock}>
            <Text style={s.summaryValue}>{periodStats.sessionCount}</Text>
            <Text style={s.summaryLabel}>Sessions</Text>
          </View>
          <View style={s.summaryBlock}>
            <Text style={s.summaryValue}>{totalMastered}/{totalPatterns}</Text>
            <Text style={s.summaryLabel}>Patterns Mastered</Text>
          </View>
        </View>

        {/* Dances */}
        {dances.map((dance) => {
          const pct = dance.totalCount > 0
            ? (dance.masteredCount / dance.totalCount) * 100
            : 0;
          return (
            <View key={dance.styleId} style={s.danceSection} wrap={false}>
              <Text style={s.danceMeta}>
                {CATEGORY_LABELS[dance.styleCategory] ?? dance.styleCategory}
                {dance.levelName ? `  ·  ${dance.levelName.charAt(0).toUpperCase() + dance.levelName.slice(1)}` : ""}
              </Text>
              <Text style={s.danceName}>{dance.styleName}</Text>

              {dance.totalCount > 0 && (
                <>
                  <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={s.progressLabel}>
                    {dance.masteredCount} of {dance.totalCount} patterns mastered
                  </Text>
                </>
              )}

              {dance.patterns.map((p) => {
                const mastered = p.status === "mastered";
                const statusLabel =
                  p.status === "mastered" ? "Mastered" :
                  p.status === "working"  ? "Working" :
                  "Learning";
                return (
                  <View key={p.id} style={s.patternRow}>
                    <Text style={mastered ? s.check : s.circle}>
                      {mastered ? "✓" : "○"}
                    </Text>
                    <Text style={s.patternName}>{p.name}</Text>
                    {p.confidence !== null && (
                      <Text style={s.patternStars}>
                        {"★".repeat(p.confidence)}{"☆".repeat(5 - p.confidence)}
                      </Text>
                    )}
                    <Text style={s.patternStatus}>{statusLabel}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>DancePath</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  );
}

function fmt(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}
