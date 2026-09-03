import { db } from "@/db";

export async function getExercises() {
  return db.query.exercisesTable.findMany({
    orderBy: { name: "asc" },
  });
}

export type Exercise = Awaited<ReturnType<typeof getExercises>>[number];
