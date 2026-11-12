"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage, listTasks } from "@/lib/api";
import type { SortOrder, Task, TaskStatus } from "@/types/task";

interface UseTasksOptions {
  status?: TaskStatus;
  /** When set, tasks are sorted by due date in this direction. */
  dueDateOrder?: SortOrder;
}

/** Fetches tasks from the API and refetches when filters change. */
export function useTasks({ status, dueDateOrder }: UseTasksOptions) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    listTasks(
      {
        status,
        sortBy: dueDateOrder ? "dueDate" : undefined,
        order: dueDateOrder,
      },
      controller.signal,
    )
      .then((data) => setTasks(data))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [status, dueDateOrder, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  return { tasks, isLoading, error, refetch };
}
