import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { DateNav } from "./DateNav";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { date: dateParam } = await searchParams;
  const date = typeof dateParam === "string" ? dateParam : todayIsoDate();

  const workouts = await db.query.workoutsTable.findMany({
    where: { userId, date },
    orderBy: { startedAt: "asc" },
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
  });

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <DateNav date={date} />
        </div>

        {workouts.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No workouts logged on {date}.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                    {workout.name ?? "Workout"}
                  </h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {workout.completedAt ? "Completed" : "In progress"}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {workout.exercises.map((workoutExercise) => (
                    <div key={workoutExercise.id}>
                      <h3 className="mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {workoutExercise.exercise?.name ?? "Unknown exercise"}
                      </h3>
                      <ul className="flex flex-col gap-0.5">
                        {workoutExercise.sets.map((set) => (
                          <li
                            key={set.id}
                            className="text-sm text-zinc-600 dark:text-zinc-400"
                          >
                            Set {set.setNumber}: {set.reps} reps @ {set.weight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
