import { useQuery, Query } from "@tanstack/react-query";
import { getWeddingDetails } from "../../api/wedding/weddingApi";
import { useParams } from "react-router";
import { Wedding } from "@wedding-plan/types";

type RefetchIntervalFn = (
  query: Query<Wedding | null>
) => number | false | undefined;

interface UseWeddingDetailsOptions {
  refetchInterval?: number | false | RefetchIntervalFn;
}

export const useWeddingDetails = (
  weddingId?: string,
  options?: UseWeddingDetailsOptions
) => {
  const { weddingId: paramsWeddingId } = useParams<{ weddingId: string }>();
  return useQuery({
    queryKey: ["weddingDetails", weddingId],
    queryFn: () => getWeddingDetails(weddingId || paramsWeddingId || ""),
    enabled: !!(weddingId || paramsWeddingId), // Only run the query if weddingId is present
    refetchInterval: options?.refetchInterval,
  });
};
