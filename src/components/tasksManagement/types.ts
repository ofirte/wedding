export type ViewType = "table" | "calendar" | "list" | "stats";

export interface TaskFilter {
  wedding: string | null;
  priority: ("High" | "Medium" | "Low")[] | null;
  status: "unassigned" | "inProgress" | "completed" | "all";
  searchText: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}
