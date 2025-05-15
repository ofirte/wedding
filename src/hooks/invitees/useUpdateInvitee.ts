import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInvitee } from "../../api/invitees/inviteesApi";
import { Invitee } from "../../components/invitees/InviteList";

/**
 * Hook to update an invitee
 * @returns Mutation result object for updating invitees
 */
export const useUpdateInvitee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invitee> }) =>
      updateInvitee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitees"] });
    },
  });
};
