import { useQueryClient } from "@tanstack/react-query";
import { updateInvitee } from "../../api/invitees/inviteesApi";
import { Invitee } from "../../components/invitees/InviteList";
import { useWeddingMutation } from "../common";

/**
 * Hook to update an invitee
 * @returns Mutation result object for updating invitees
 */
export const useUpdateInvitee = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (
      { id, data }: { id: string; data: Partial<Invitee> },
      weddingId?: string
    ) => updateInvitee(id, data, weddingId),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["invitees"] });
      },
    },
  });
};
