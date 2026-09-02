"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function DateNav({ date }: { date: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setDate(nextDate: string) {
    const params = new URLSearchParams(searchParams);
    params.set("date", nextDate);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <input
      type="date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
    />
  );
}
