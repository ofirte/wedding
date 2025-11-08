import { fetchLayoutElements } from "../../api/seating/seatingApi";
import { useWeddingQuery } from "../common";

/**
 * Hook to fetch layout elements data
 * @returns Query result object containing layout elements data and query state
 */
export const useLayoutElements = () => {
  return useWeddingQuery({
    queryKey: ["layoutElements"],
    queryFn: fetchLayoutElements,
    options: { refetchOnWindowFocus: false },
  });
};
