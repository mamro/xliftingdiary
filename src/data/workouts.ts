import { auth } from "@clerk/nextjs/server";

import { db } from "@/db";
import {
  setsTable,
  workoutExercisesTable,
  workoutsTable,
} from "@/db/schema";

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

export type NewWorkoutInput = {
  name?: string;
  date: string;
  exercises: {
    exerciseId: number;
    sets: {
      reps: number;
      weight: number;
    }[];
  }[];
};

export async function createWorkoutForUser(input: NewWorkoutInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const [workout] = await db
    .insert(workoutsTable)
    .values({
      userId,
      name: input.name,
      date: input.date,
    })
    .returning();

  for (const [index, exercise] of input.exercises.entries()) {
    const [workoutExercise] = await db
      .insert(workoutExercisesTable)
      .values({
        workoutId: workout.id,
        exerciseId: exercise.exerciseId,
        order: index,
      })
      .returning();

    await db.insert(setsTable).values(
      exercise.sets.map((set, setIndex) => ({
        workoutExerciseId: workoutExercise.id,
        setNumber: setIndex + 1,
        reps: set.reps,
        weight: set.weight.toString(),
      }))
    );
  }

  return workout;
}
