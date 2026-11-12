import type {
  CreateTaskInput,
  Task,
  TaskQuery,
  UpdateTaskInput,
} from "@/types/task";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Error thrown for any failed API request. `status` is 0 for network failures. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Extracts a user-friendly message from any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/** Pulls a readable message out of a NestJS error body (string or string[]). */
async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(", ");
    if (body.message) return body.message;
  } catch {
    // Body was empty or not JSON; fall through to the generic message.
  }
  return `Request failed with status ${res.status}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch (error) {
    // Let callers handle cancelled requests themselves.
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      "Unable to reach the server. Check that the API is running.",
      0,
    );
  }

  if (!res.ok) {
    throw new ApiError(await readErrorMessage(res), res.status);
  }

  // DELETE responds with 204 No Content.
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

export function listTasks(
  query: TaskQuery = {},
  signal?: AbortSignal,
): Promise<Task[]> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.order) params.set("order", query.order);

  const qs = params.toString();
  return request<Task[]>(`/tasks${qs ? `?${qs}` : ""}`, { signal });
}

export function createTask(input: CreateTaskInput): Promise<Task> {
  return request<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  return request<Task>(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteTask(id: string): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: "DELETE" });
}
