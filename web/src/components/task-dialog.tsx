"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toDateInputValue } from "@/lib/format";
import {
  STATUS_LABELS,
  TASK_STATUSES,
  type CreateTaskInput,
  type Task,
} from "@/types/task";

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer"),
  status: z.enum(TASK_STATUSES),
  dueDate: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

function toFormValues(task?: Task | null): FormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "TODO",
    dueDate: toDateInputValue(task?.dueDate ?? null),
  };
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the dialog edits this task; otherwise it creates one. */
  task?: Task | null;
  /** Should throw on failure so the dialog stays open. */
  onSubmit: (payload: CreateTaskInput) => Promise<void>;
}

/** Reusable dialog for creating and editing tasks. */
export function TaskDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
}: TaskDialogProps) {
  const isEditing = Boolean(task);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(task),
  });

  // Reset the form whenever the dialog opens or switches to another task.
  useEffect(() => {
    if (open) reset(toFormValues(task));
  }, [open, task, reset]);

  async function submit(values: FormValues) {
    try {
      await onSubmit({
        title: values.title,
        description: values.description.trim() || null,
        status: values.status,
        dueDate: values.dueDate || null,
      });
      onOpenChange(false);
    } catch {
      // The parent shows an error toast; keep the dialog open for a retry.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this task."
              : "Add a new task to your list."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Write project proposal"
              aria-invalid={Boolean(errors.title)}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Add some details..."
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date (optional)</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
