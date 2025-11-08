import { fetchSeatingArrangements } from "../../api/seating/seatingApi";
import { useWeddingQuery } from "../common";

/**
 * Hook to fetch seating arrangements data
 * @returns Query result object containing seating arrangements data and query state
 */
export const useSeatingArrangements = () => {
  return useWeddingQuery({
    queryKey: ["seating"],
    queryFn: fetchSeatingArrangements,
    options: { refetchOnWindowFocus: false },
  });
};
