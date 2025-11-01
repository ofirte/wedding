export type ViewType = "calendar" | "list" | "stats";

export interface TaskFilter {
  wedding: string | null;
  priority: ("high" | "medium" | "low")[] | null;
  status: "pending" | "completed" | "all";
  searchText: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}
