import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useCurrentUser } from "../auth";

export function useWeddingsQuery<TData = unknown, TError = unknown>({
  queryFn,
  queryKey,
  options,
}: {
  queryKey: string | readonly unknown[];
  queryFn: (weddingIds: string[]) => Promise<TData>;
  options?: Omit<UseQueryOptions<TData, TError, TData>, "queryKey" | "queryFn">;
}): UseQueryResult<TData, TError> {
  const { data: currentUser, isLoading: isLoadingCurrentUser } =
    useCurrentUser();
  const userWeddingIds = currentUser?.weddingIds || [];
  const expandedQueryKey = Array.isArray(queryKey)
    ? [...queryKey, userWeddingIds]
    : [queryKey, userWeddingIds];

  return useQuery<TData, TError>({
    queryKey: expandedQueryKey,
    queryFn: () => queryFn(userWeddingIds),
    ...options,
    enabled: !isLoadingCurrentUser && options?.enabled !== false,
  });
}
