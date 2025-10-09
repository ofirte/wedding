import {  useQueryClient } from "@tanstack/react-query";
import { bulkUpdateInvitees } from "../../api/invitees/inviteesApi";
import { Invitee } from "../../components/invitees/InviteList";
import { useWeddingMutation } from "../common";

/**
 * Hook to bulk update invitees
 * @returns Mutation result object for bulk updating invitees
 */
export const useBulkUpdateInvitees = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (updates: Array<{ id: string; data: Partial<Invitee> }>) =>
      bulkUpdateInvitees(updates),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["invitees"] });
      },
    },
  });
};
