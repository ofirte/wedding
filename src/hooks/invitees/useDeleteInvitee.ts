import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteInvitee } from "../../api/invitees/inviteesApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to delete an invitee
 * @returns Mutation result object for deleting invitees
 */
export const useDeleteInvitee = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (id: string) => deleteInvitee(id),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["invitees"] });
      },
    },
  });
};
