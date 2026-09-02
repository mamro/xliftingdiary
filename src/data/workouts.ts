import { auth } from "@clerk/nextjs/server";

import { db } from "@/db";

export async function getWorkoutsForDate(date: string) {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  return db.query.workoutsTable.findMany({
    where: {
      userId,
      date,
    },
    with: {
      exercises: {
        orderBy: { order: "asc" },
        with: {
          exercise: true,
          sets: {
            orderBy: { setNumber: "asc" },
          },
        },
      },
    },
    orderBy: { startedAt: "asc" },
  });
}

export type WorkoutForDate = Awaited<
  ReturnType<typeof getWorkoutsForDate>
>[number];

export async function getWorkoutDates() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const rows = await db.query.workoutsTable.findMany({
    where: { userId },
    columns: { date: true },
  });

  return rows.map((row) => row.date);
}
