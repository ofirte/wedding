import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { deleteInvitee } from "../../api/invitees/inviteesApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to delete an invitee
 * @returns Mutation result object for deleting invitees
 */
export const useDeleteInvitee = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (id: string) => deleteInvitee(id),
    options: {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["invitees"] });
        options?.onSuccess?.(data, variables, context);
      },
    },
    ...options,
  });
};
