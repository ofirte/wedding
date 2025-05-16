import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { updateInvitee } from "../../api/invitees/inviteesApi";
import { Invitee } from "../../components/invitees/InviteList";
import { useWeddingMutation } from "../common";

/**
 * Hook to update an invitee
 * @returns Mutation result object for updating invitees
 */
export const useUpdateInvitee = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invitee> }) =>
      updateInvitee(id, data),
    options: {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["invitees"] });
        options?.onSuccess?.(data, variables, context);
      },
      ...options,
    },
  });
};
