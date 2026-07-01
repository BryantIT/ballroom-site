import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { getAuthUser } from "@/app/_lib/dal/auth";
import { getPatternsForForm } from "@/app/_lib/dal/practice";
import SessionForm from "@/app/_components/practice/SessionForm";

export default async function NewPracticePage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const styleGroups = await getPatternsForForm(authUser.userId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <Link
        href="/practice"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeftIcon size={16} />
        Practice
      </Link>

      <div>
        <h2 className="font-display text-2xl font-bold text-white">Log a Session</h2>
        <p className="mt-1 text-sm text-slate-400">
          Record what you worked on to track your progress over time.
        </p>
      </div>

      <SessionForm styleGroups={styleGroups} />
    </div>
  );
}
