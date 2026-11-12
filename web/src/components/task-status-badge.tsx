import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, type TaskStatus } from "@/types/task";

const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO: "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  IN_PROGRESS:
    "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  DONE: "border-transparent bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

/** Color-coded badge for a task status. */
export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
