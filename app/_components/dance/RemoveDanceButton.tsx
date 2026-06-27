"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { removeDanceAction } from "@/app/_lib/actions/dances";

export default function RemoveDanceButton({ userDanceId }: { userDanceId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (!confirm("Remove this dance from your profile?")) return;
    startTransition(async () => {
      await removeDanceAction(userDanceId);
      router.push("/dances");
    });
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-400 hover:border-red-700/50 hover:bg-red-950/40 transition-colors disabled:opacity-50 w-full justify-center"
    >
      <Trash2 size={16} />
      {isPending ? "Removing…" : "Remove this dance"}
    </button>
  );
}
