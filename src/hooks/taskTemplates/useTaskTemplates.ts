import { useQuery } from "@tanstack/react-query";
import { fetchUserTaskTemplates } from "../../api/taskTemplates/taskTemplatesApi";

/**
 * Hook to fetch all task templates for the current user
 * @returns Query result object containing task templates data and query state
 */
export const useTaskTemplates = () => {
  return useQuery({
    queryKey: ["taskTemplates"],
    queryFn: fetchUserTaskTemplates,
  });
};
