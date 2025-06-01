import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkDeleteInvitees } from "../../api/invitees/inviteesApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to bulk delete invitees
 * @returns Mutation result object for bulk deleting invitees
 */
export const useBulkDeleteInvitees = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (inviteeIds: string[]) => bulkDeleteInvitees(inviteeIds),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["invitees"] });
      },
    },
  });
};
