"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Exercise } from "@/data/exercises";

import { createWorkout } from "./actions";

const DATE_KEY_FORMAT = "yyyy-MM-dd";

const formSchema = z.object({
  name: z.string().trim().max(255).optional(),
  date: z.string().date(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string().min(1, "Select an exercise"),
        sets: z
          .array(
            z.object({
              reps: z.coerce.number().int().positive("Reps must be > 0"),
              weight: z.coerce.number().nonnegative("Weight must be ≥ 0"),
            })
          )
          .min(1),
      })
    )
    .min(1, "Add at least one exercise"),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

type NewWorkoutFormProps = {
  exercises: Exercise[];
};

export function NewWorkoutForm({ exercises }: NewWorkoutFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      date: format(new Date(), DATE_KEY_FORMAT),
      exercises: [],
    },
  });

  const {
    fields: exerciseFields,
    append: appendExercise,
    remove: removeExercise,
  } = useFieldArray({
    control,
    name: "exercises",
  });

  const watchedExercises = watch("exercises");

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);

    try {
      const workout = await createWorkout({
        name: values.name || undefined,
        date: values.date,
        exercises: values.exercises.map((exercise) => ({
          exerciseId: Number(exercise.exerciseId),
          sets: exercise.sets.map((set) => ({
            reps: set.reps,
            weight: set.weight,
          })),
        })),
      });

      router.push(`/dashboard?date=${workout.date}`);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Workout name</Label>
        <Input id="name" placeholder="e.g. Push day" {...register("name")} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {exerciseFields.map((field, exerciseIndex) => (
          <Card key={field.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex-1">
                <Select
                  value={watchedExercises?.[exerciseIndex]?.exerciseId ?? ""}
                  onValueChange={(value) =>
                    setValue(
                      `exercises.${exerciseIndex}.exerciseId`,
                      value as string
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises.map((exercise) => (
                      <SelectItem
                        key={exercise.id}
                        value={String(exercise.id)}
                      >
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.exercises?.[exerciseIndex]?.exerciseId && (
                  <p className="mt-1 text-sm font-normal text-destructive">
                    {errors.exercises[exerciseIndex]?.exerciseId?.message}
                  </p>
                )}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeExercise(exerciseIndex)}
              >
                <Trash2Icon />
              </Button>
            </CardHeader>
            <CardContent>
              <SetsFieldArray
                control={control}
                register={register}
                exerciseIndex={exerciseIndex}
                errors={errors}
              />
            </CardContent>
          </Card>
        ))}

        {errors.exercises?.root && (
          <p className="text-sm text-destructive">
            {errors.exercises.root.message}
          </p>
        )}
        {errors.exercises?.message && (
          <p className="text-sm text-destructive">
            {errors.exercises.message}
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            appendExercise({
              exerciseId: "",
              sets: [{ reps: 0, weight: 0 }],
            })
          }
        >
          <PlusIcon /> Add exercise
        </Button>
      </div>

      {submitError && (
        <p className="text-sm text-destructive">{submitError}</p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save workout"}
      </Button>
    </form>
  );
}

type SetsFieldArrayProps = {
  control: ReturnType<typeof useForm<FormInput, unknown, FormValues>>["control"];
  register: ReturnType<typeof useForm<FormInput, unknown, FormValues>>["register"];
  exerciseIndex: number;
  errors: ReturnType<
    typeof useForm<FormInput, unknown, FormValues>
  >["formState"]["errors"];
};

function SetsFieldArray({
  control,
  register,
  exerciseIndex,
  errors,
}: SetsFieldArrayProps) {
  const {
    fields: setFields,
    append: appendSet,
    remove: removeSet,
  } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  return (
    <div className="flex flex-col gap-3">
      {setFields.map((field, setIndex) => (
        <div key={field.id}>
          {setIndex > 0 && <Separator className="mb-3" />}
          <div className="flex items-end gap-3">
            <span className="pb-2 text-sm text-muted-foreground">
              Set {setIndex + 1}
            </span>
            <div className="flex flex-1 flex-col gap-1">
              <Label htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}>
                Reps
              </Label>
              <Input
                id={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}
                type="number"
                min={0}
                {...register(
                  `exercises.${exerciseIndex}.sets.${setIndex}.reps`
                )}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <Label htmlFor={`exercises.${exerciseIndex}.sets.${setIndex}.weight`}>
                Weight
              </Label>
              <Input
                id={`exercises.${exerciseIndex}.sets.${setIndex}.weight`}
                type="number"
                min={0}
                step="0.5"
                {...register(
                  `exercises.${exerciseIndex}.sets.${setIndex}.weight`
                )}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSet(setIndex)}
              disabled={setFields.length === 1}
            >
              <Trash2Icon />
            </Button>
          </div>
          {errors.exercises?.[exerciseIndex]?.sets?.[setIndex]?.reps && (
            <p className="mt-1 text-sm text-destructive">
              {errors.exercises[exerciseIndex]?.sets?.[setIndex]?.reps?.message}
            </p>
          )}
          {errors.exercises?.[exerciseIndex]?.sets?.[setIndex]?.weight && (
            <p className="mt-1 text-sm text-destructive">
              {
                errors.exercises[exerciseIndex]?.sets?.[setIndex]?.weight
                  ?.message
              }
            </p>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => appendSet({ reps: 0, weight: 0 })}
        className="self-start"
      >
        <PlusIcon /> Add set
      </Button>
    </div>
  );
}
