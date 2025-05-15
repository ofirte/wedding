import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useWedding } from "../../context/WeddingContext";

/**
 * A wrapper around React Query's useQuery that automatically includes the wedding ID in the query key
 * and passes it to the queryFn if needed
 *
 * @param baseQueryKey - The base query key (without wedding ID)
 * @param queryFn - Function that accepts a wedding ID and returns a promise with data
 * @param options - Additional useQuery options
 * @returns Standard React Query result with wedding context
 */
export function useWeddingQuery<TData = unknown, TError = unknown>({
  queryFn,
  queryKey,
  options,
}: {
  queryKey: string | readonly unknown[];
  queryFn: (weddingId?: string) => Promise<TData>;
  options?: Omit<UseQueryOptions<TData, TError, TData>, "queryKey" | "queryFn">;
}): UseQueryResult<TData, TError> {
  const { currentWeddingId } = useWedding();
  const expandedQueryKey = Array.isArray(queryKey)
    ? [...queryKey, currentWeddingId]
    : [queryKey, currentWeddingId];

  return useQuery<TData, TError>({
    queryKey: expandedQueryKey,
    queryFn: () => queryFn(currentWeddingId || undefined),
    ...options,
    enabled: !!currentWeddingId && options?.enabled !== false,
  });
}
