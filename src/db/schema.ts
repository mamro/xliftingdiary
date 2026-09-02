import { defineRelations } from "drizzle-orm";
import {
  date,
  integer,
  numeric,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const exercisesTable = pgTable("exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const workoutsTable = pgTable("workouts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }),
  date: date().notNull().defaultNow(),
  startedAt: timestamp().notNull().defaultNow(),
  completedAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const workoutExercisesTable = pgTable("workout_exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer()
    .notNull()
    .references(() => workoutsTable.id, { onDelete: "cascade" }),
  exerciseId: integer()
    .notNull()
    .references(() => exercisesTable.id, { onDelete: "restrict" }),
  order: integer().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const setsTable = pgTable("sets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutExerciseId: integer()
    .notNull()
    .references(() => workoutExercisesTable.id, { onDelete: "cascade" }),
  setNumber: integer().notNull(),
  reps: integer().notNull(),
  weight: numeric({ precision: 6, scale: 2 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const schemaRelations = defineRelations(
  {
    exercisesTable,
    workoutsTable,
    workoutExercisesTable,
    setsTable,
  },
  (r) => ({
    exercisesTable: {
      workoutExercises: r.many.workoutExercisesTable(),
    },
    workoutsTable: {
      exercises: r.many.workoutExercisesTable(),
    },
    workoutExercisesTable: {
      workout: r.one.workoutsTable({
        from: r.workoutExercisesTable.workoutId,
        to: r.workoutsTable.id,
      }),
      exercise: r.one.exercisesTable({
        from: r.workoutExercisesTable.exerciseId,
        to: r.exercisesTable.id,
      }),
      sets: r.many.setsTable(),
    },
    setsTable: {
      workoutExercise: r.one.workoutExercisesTable({
        from: r.setsTable.workoutExerciseId,
        to: r.workoutExercisesTable.id,
      }),
    },
  })
);
