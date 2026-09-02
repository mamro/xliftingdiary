import { format, parseISO } from "date-fns";

import { getWorkoutDates, getWorkoutsForDate } from "@/data/workouts";

import { DashboardView } from "./dashboard-view";

const DATE_KEY_FORMAT = "yyyy-MM-dd";

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const { date: dateParam } = await searchParams;
  const date = Array.isArray(dateParam) ? dateParam[0] : dateParam;
  const selectedDate =
    date && !Number.isNaN(parseISO(date).getTime()) ? parseISO(date) : new Date();
  const dateKey = format(selectedDate, DATE_KEY_FORMAT);

  const [workouts, workoutDates] = await Promise.all([
    getWorkoutsForDate(dateKey),
    getWorkoutDates(),
  ]);

  return (
    <DashboardView
      selectedDate={selectedDate}
      workouts={workouts}
      workoutDates={workoutDates}
    />
  );
}
