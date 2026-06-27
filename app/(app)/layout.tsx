import { redirect } from "next/navigation";
import { getAuthUser, getAuthUserAttributes } from "@/app/_lib/dal/auth";
import { db } from "@/app/_lib/db";
import { users } from "@/app/_lib/db/schema";
import BottomNav from "@/app/_components/nav/BottomNav";
import TopBar from "@/app/_components/nav/TopBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  // Upsert user row on every protected page load — non-critical, skip on db error
  try {
    const attrs = await getAuthUserAttributes();
    await db
      .insert(users)
      .values({
        id: authUser.userId,
        email: attrs?.email ?? "",
        name: attrs?.name ?? null,
      })
      .onConflictDoNothing();
  } catch {
    // db unavailable (e.g. DATABASE_URL not set) — page still renders
  }

  return (
    <div className="flex flex-col min-h-dvh bg-navy-900">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
