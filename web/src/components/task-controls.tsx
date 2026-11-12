"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  STATUS_LABELS,
  TASK_STATUSES,
  type SortOrder,
  type TaskStatus,
} from "@/types/task";

export type StatusFilter = "ALL" | TaskStatus;
/** `null` means "no explicit sort" (the API default, newest first). */
export type DueDateSort = SortOrder | null;

interface TaskControlsProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  dueDateSort: DueDateSort;
  onDueDateSortChange: (value: DueDateSort) => void;
}

/** Cycles through: none -> ascending -> descending -> none. */
function nextSort(current: DueDateSort): DueDateSort {
  if (current === null) return "asc";
  if (current === "asc") return "desc";
  return null;
}

/** Status filter tabs and the due date sort toggle. */
export function TaskControls({
  statusFilter,
  onStatusFilterChange,
  dueDateSort,
  onDueDateSortChange,
}: TaskControlsProps) {
  const SortIcon =
    dueDateSort === "asc"
      ? ArrowUp
      : dueDateSort === "desc"
        ? ArrowDown
        : ArrowUpDown;

  const sortLabel =
    dueDateSort === "asc"
      ? "Due date: earliest first"
      : dueDateSort === "desc"
        ? "Due date: latest first"
        : "Sort by due date";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={statusFilter}
        onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}
      >
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          {TASK_STATUSES.map((status) => (
            <TabsTrigger key={status} value={status}>
              {STATUS_LABELS[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Button
        variant="outline"
        onClick={() => onDueDateSortChange(nextSort(dueDateSort))}
      >
        <SortIcon className="size-4" />
        {sortLabel}
      </Button>
    </div>
  );
}
