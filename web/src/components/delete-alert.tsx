"use client";

import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Task } from "@/types/task";

interface DeleteAlertProps {
  /** The task pending deletion. The dialog is open while this is set. */
  task: Task | null;
  isDeleting: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

/** Asks for confirmation before a task is deleted. */
export function DeleteAlert({
  task,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteAlertProps) {
  return (
    <AlertDialog
      open={task !== null}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{task?.title}&quot; will be permanently deleted. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(event) => {
              // Keep the dialog open until the request finishes.
              event.preventDefault();
              void onConfirm();
            }}
          >
            {isDeleting && <Loader2 className="size-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
