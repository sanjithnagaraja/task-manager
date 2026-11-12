"use client";

import { useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { DeleteAlert } from "@/components/delete-alert";
import { TaskDialog } from "@/components/task-dialog";
import {
  TaskControls,
  type DueDateSort,
  type StatusFilter,
} from "@/components/task-controls";
import { TaskTable } from "@/components/task-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import { createTask, deleteTask, getErrorMessage, updateTask } from "@/lib/api";
import type { CreateTaskInput, Task } from "@/types/task";

/** Which task the form dialog is working on. `null` task means "create". */
interface FormState {
  open: boolean;
  task: Task | null;
}

export default function HomePage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dueDateSort, setDueDateSort] = useState<DueDateSort>(null);
  const [form, setForm] = useState<FormState>({ open: false, task: null });
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { tasks, isLoading, error, refetch } = useTasks({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    dueDateOrder: dueDateSort ?? undefined,
  });

  const hasActiveFilter = statusFilter !== "ALL";

  async function handleSubmit(payload: CreateTaskInput) {
    const editing = form.task;
    try {
      if (editing) {
        await updateTask(editing.id, payload);
        toast.success("Task updated");
      } else {
        await createTask(payload);
        toast.success("Task created");
      }
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err; // Keeps the dialog open so the user can retry.
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      toast.success("Task deleted");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Keep track of what needs to get done.
          </p>
        </div>
        <Button onClick={() => setForm({ open: true, task: null })}>
          <Plus className="size-4" />
          New Task
        </Button>
      </header>

      <TaskControls
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dueDateSort={dueDateSort}
        onDueDateSortChange={setDueDateSort}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Couldn&apos;t load tasks</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-foreground"
              onClick={refetch}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : !isLoading && tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            {hasActiveFilter
              ? "No tasks match this filter."
              : "No tasks yet. Create your first task to get started."}
          </p>
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          isLoading={isLoading}
          onEdit={(task) => setForm({ open: true, task })}
          onDelete={setDeleteTarget}
        />
      )}

      <TaskDialog
        open={form.open}
        onOpenChange={(open) => setForm((current) => ({ ...current, open }))}
        task={form.task}
        onSubmit={handleSubmit}
      />

      <DeleteAlert
        task={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}
