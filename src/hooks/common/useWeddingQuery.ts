import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useParams } from "react-router";

export function useWeddingQuery<TData = unknown, TError = unknown>({
  queryFn,
  queryKey,
  options,
}: {
  queryKey: string | readonly unknown[];
  queryFn: (weddingId?: string) => Promise<TData>;
  options?: Omit<UseQueryOptions<TData, TError, TData>, "queryKey" | "queryFn">;
}): UseQueryResult<TData, TError> {
  const { weddingId: paramsWeddingId } = useParams<{ weddingId: string }>();
  const expandedQueryKey = Array.isArray(queryKey)
    ? [...queryKey, paramsWeddingId]
    : [queryKey, paramsWeddingId];

  return useQuery<TData, TError>({
    queryKey: expandedQueryKey,
    queryFn: () => queryFn(paramsWeddingId || undefined),
    ...options,
    enabled: !!paramsWeddingId && options?.enabled !== false,
  });
}
