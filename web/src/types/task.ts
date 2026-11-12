export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Human-readable labels for each status. */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

/** A task as returned by the API. Dates are ISO 8601 strings. */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
}

/** Payload for POST /tasks. */
export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  /** "YYYY-MM-DD" or a full ISO datetime. `null` means no due date. */
  dueDate?: string | null;
}

/** Payload for PATCH /tasks/:id. */
export type UpdateTaskInput = Partial<CreateTaskInput>;

export type SortOrder = "asc" | "desc";

/** Query options for GET /tasks. */
export interface TaskQuery {
  status?: TaskStatus;
  sortBy?: "dueDate" | "createdAt";
  order?: SortOrder;
}
