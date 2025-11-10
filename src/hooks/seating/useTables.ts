import { fetchTables } from "../../api/seating/seatingApi";
import { useWeddingQuery } from "../common";

/**
 * Hook to fetch tables data
 * @returns Query result object containing tables data and query state
 */
export const useTables = () => {
  return useWeddingQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
    options: { refetchOnWindowFocus: false },
  });
};
