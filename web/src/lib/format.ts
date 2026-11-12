/** Formats an ISO due date for display, e.g. "Dec 1, 2026". */
export function formatDueDate(iso: string | null): string {
  if (!iso) return "No due date";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Converts an ISO datetime to the "YYYY-MM-DD" value a date input expects. */
export function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}
