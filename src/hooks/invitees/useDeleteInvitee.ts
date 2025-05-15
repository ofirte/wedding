import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteInvitee } from "../../api/invitees/inviteesApi";

/**
 * Hook to delete an invitee
 * @returns Mutation result object for deleting invitees
 */
export const useDeleteInvitee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInvitee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitees"] });
    },
  });
};
