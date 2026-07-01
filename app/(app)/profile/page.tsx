import { redirect } from "next/navigation";
import Link from "next/link";
import { FileBarChart2, ChevronRight } from "lucide-react";
import { getAuthUser, getAuthUserAttributes } from "@/app/_lib/dal/auth";
import { db } from "@/app/_lib/db";
import { users } from "@/app/_lib/db/schema";
import { eq } from "drizzle-orm";
import { getDancerLevel } from "@/app/_lib/gamification";
import LogoutButton from "@/app/_components/profile/LogoutButton";

export default async function ProfilePage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const [attrs, dbUser] = await Promise.all([
    getAuthUserAttributes(),
    db.query.users.findFirst({ where: eq(users.id, authUser.userId) }),
  ]);

  const name = attrs?.name ?? dbUser?.name ?? "Dancer";
  const email = attrs?.email ?? dbUser?.email ?? "";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const totalXp = dbUser?.totalXp ?? 0;
  const level = getDancerLevel(totalXp);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Avatar + identity */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold-500/20 ring-2 ring-gold-500/30">
          <span className="font-display text-xl font-bold text-gold-400">
            {initials}
          </span>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">{name}</h2>
          <p className="text-sm text-slate-400">{email}</p>
          <span className="mt-1 inline-block rounded-full bg-gold-500/15 px-2.5 py-0.5 text-xs font-semibold text-gold-400">
            {level.name} · {totalXp.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* Tools */}
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Tools
        </p>
        <div className="rounded-2xl border border-white/5 bg-navy-800 divide-y divide-white/5">
          <Link
            href="/reports"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
          >
            <FileBarChart2 size={18} strokeWidth={1.8} className="text-gold-400 shrink-0" />
            <span className="flex-1 text-sm font-medium text-white">
              Progress Reports
            </span>
            <ChevronRight size={16} className="text-slate-500" />
          </Link>
        </div>
      </section>

      {/* Account */}
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Account
        </p>
        <div className="rounded-2xl border border-white/5 bg-navy-800">
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
