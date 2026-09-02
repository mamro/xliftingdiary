"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { WorkoutForDate } from "@/data/workouts";

const DATE_FORMAT = "do MMM yyyy";
const DATE_KEY_FORMAT = "yyyy-MM-dd";

type DashboardViewProps = {
  selectedDate: Date;
  workouts: WorkoutForDate[];
  workoutDates: string[];
};

export function DashboardView({
  selectedDate,
  workouts,
  workoutDates,
}: DashboardViewProps) {
  const router = useRouter();

  const daysWithWorkouts = useMemo(
    () => workoutDates.map((date) => parseISO(date)),
    [workoutDates]
  );

  const handleSelectDate = (nextDate: Date | undefined) => {
    if (!nextDate) return;
    router.push(`/dashboard?date=${format(nextDate, DATE_KEY_FORMAT)}`);
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 md:flex-row">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDate}
            modifiers={{ hasWorkout: daysWithWorkouts }}
            modifiersClassNames={{
              hasWorkout:
                "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary data-[selected-single=true]:after:bg-primary-foreground",
            }}
            className="rounded-lg border bg-white dark:bg-zinc-950"
          />
        </div>

        <div className="flex-1">
          <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {format(selectedDate, DATE_FORMAT)}
          </h2>

          {workouts.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No workouts logged on {format(selectedDate, DATE_FORMAT)}.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {workouts.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{workout.name}</CardTitle>
                    <Badge
                      variant={workout.completedAt ? "default" : "secondary"}
                    >
                      {workout.completedAt ? "Completed" : "In progress"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {workout.exercises.map((workoutExercise, index) => (
                      <div key={workoutExercise.id}>
                        {index > 0 && <Separator className="mb-4" />}
                        <h3 className="mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          {workoutExercise.exercise?.name}
                        </h3>
                        <ul className="flex flex-col gap-0.5">
                          {workoutExercise.sets.map((set) => (
                            <li
                              key={set.id}
                              className="text-sm text-zinc-600 dark:text-zinc-400"
                            >
                              Set {set.setNumber}: {set.reps} reps @{" "}
                              {set.weight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
