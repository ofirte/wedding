import { useQuery } from "@tanstack/react-query";
import { getWeddingDetails } from "../../api/wedding/weddingApi";
import { useParams } from "react-router";

export const useWeddingDetails = (weddingId?: string) => {
  const { weddingId: paramsWeddingId } = useParams<{ weddingId: string }>();
  return useQuery({
    queryKey: ["weddingDetails", weddingId],
    queryFn: () => getWeddingDetails(weddingId || paramsWeddingId || ""),
    enabled: !!(weddingId || paramsWeddingId), // Only run the query if weddingId is present
  });
};
