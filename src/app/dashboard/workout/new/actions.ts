"use server";

import { z } from "zod";

import { createWorkoutForUser } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().trim().max(255).optional(),
  date: z.string().date(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.number().int().positive(),
        sets: z
          .array(
            z.object({
              reps: z.number().int().positive(),
              weight: z.number().nonnegative(),
            })
          )
          .min(1, "Add at least one set"),
      })
    )
    .min(1, "Add at least one exercise"),
});

export async function createWorkout(
  input: z.infer<typeof createWorkoutSchema>
) {
  const parsed = createWorkoutSchema.parse(input);

  const workout = await createWorkoutForUser(parsed);

  return { id: workout.id, date: workout.date };
}
