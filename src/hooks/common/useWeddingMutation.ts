import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { useWedding } from "../../context/WeddingContext";

/**
 * A wrapper around React Query's useMutation that automatically includes the wedding ID
 * in the mutation function and invalidation keys
 *
 * @param mutationFn - Function that accepts the mutation variables and wedding ID
 * @param invalidateQueryKeys - Query keys to invalidate on success (wedding ID will be appended)
 * @param options - Additional useMutation options
 * @returns Standard React Query mutation result
 */
export function useWeddingMutation<
  TData = unknown,
  TVariables = unknown,
  TError = unknown,
  TContext = unknown
>({
  mutationFn,
  options,
}: {
  mutationFn: (variables: TVariables, weddingId?: string) => Promise<TData>;
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn"
  >;
}): UseMutationResult<TData, TError, TVariables, TContext> {
  const { currentWeddingId } = useWedding();
  return useMutation({
    mutationFn: (variables: TVariables) =>
      mutationFn(variables, currentWeddingId || undefined),
    ...options,
  });
}
