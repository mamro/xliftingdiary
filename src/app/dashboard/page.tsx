"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const DATE_FORMAT = "do MMM yyyy";

type MockSet = {
  id: number;
  setNumber: number;
  reps: number;
  weight: number;
};

type MockWorkoutExercise = {
  id: number;
  exerciseName: string;
  sets: MockSet[];
};

type MockWorkout = {
  id: number;
  name: string;
  completed: boolean;
  exercises: MockWorkoutExercise[];
};

const mockWorkouts: MockWorkout[] = [
  {
    id: 1,
    name: "Push Day",
    completed: true,
    exercises: [
      {
        id: 1,
        exerciseName: "Bench Press",
        sets: [
          { id: 1, setNumber: 1, reps: 8, weight: 60 },
          { id: 2, setNumber: 2, reps: 8, weight: 60 },
          { id: 3, setNumber: 3, reps: 6, weight: 65 },
        ],
      },
      {
        id: 2,
        exerciseName: "Overhead Press",
        sets: [
          { id: 4, setNumber: 1, reps: 8, weight: 35 },
          { id: 5, setNumber: 2, reps: 8, weight: 35 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Pull Day",
    completed: false,
    exercises: [
      {
        id: 3,
        exerciseName: "Barbell Row",
        sets: [
          { id: 6, setNumber: 1, reps: 10, weight: 50 },
          { id: 7, setNumber: 2, reps: 10, weight: 50 },
        ],
      },
    ],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>

          <Popover>
            <PopoverTrigger
              className={buttonVariants({
                variant: "outline",
                className: "w-[220px] justify-start text-left font-normal",
              })}
            >
              <CalendarIcon />
              {format(date, DATE_FORMAT)}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(nextDate) => nextDate && setDate(nextDate)}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {mockWorkouts.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No workouts logged on {format(date, DATE_FORMAT)}.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {mockWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{workout.name}</CardTitle>
                  <Badge variant={workout.completed ? "default" : "secondary"}>
                    {workout.completed ? "Completed" : "In progress"}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {workout.exercises.map((exercise, index) => (
                    <div key={exercise.id}>
                      {index > 0 && <Separator className="mb-4" />}
                      <h3 className="mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {exercise.exerciseName}
                      </h3>
                      <ul className="flex flex-col gap-0.5">
                        {exercise.sets.map((set) => (
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
  );
}
