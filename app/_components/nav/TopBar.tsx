"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dances": "My Dances",
  "/practice": "Practice",
  "/achievements": "Achievements",
  "/profile": "Profile",
  "/goals": "Goals",
  "/competitions": "Competitions",
  "/reports": "Reports",
};

export default function TopBar() {
  const pathname = usePathname();
  const title = Object.entries(titles).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] ?? "DancePath";

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-navy-900/95 backdrop-blur-md">
      <div className="mx-auto max-w-2xl px-4 h-14 flex items-center">
        <h1 className="font-display text-lg font-bold text-white">{title}</h1>
      </div>
    </header>
  );
}
