import { getExercises } from "@/data/exercises";

import { NewWorkoutForm } from "./new-workout-form";

export default async function NewWorkoutPage() {
  const exercises = await getExercises();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          New workout
        </h1>

        <NewWorkoutForm exercises={exercises} />
      </div>
    </div>
  );
}
