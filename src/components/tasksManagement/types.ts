export type ViewType = "table" | "calendar" | "list";

export interface TaskFilter {
  status: ("not_started" | "in_progress" | "completed")[] | null;
  priority: ("High" | "Medium" | "Low")[] | null;
  wedding: string | null;
  searchText: string;
}
