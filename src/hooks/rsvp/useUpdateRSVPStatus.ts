import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRSVPStatus } from "../../api/rsvp/rsvpStatusApi";
import { RSVPStatus } from "../../api/rsvp/rsvpStatusTypes";
import { useWeddingMutation } from "../common";

/**
 * Hook to update RSVP status for an invitee
 * @returns Mutation result object for updating RSVP status
 */
export const useUpdateRSVPStatus = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: ({
      inviteeId,
      rsvpStatus,
    }: {
      inviteeId: string;
      rsvpStatus: Partial<RSVPStatus> | Record<string, any>;
    }) => updateRSVPStatus(inviteeId, rsvpStatus),
    options: {
      onSuccess: (_, variables) => {
        // Invalidate the specific RSVP status query for this invitee
        queryClient.invalidateQueries({
          queryKey: ["rsvpStatus", variables.inviteeId],
        });
        // Also invalidate invitees query in case we need to refresh the main list
        queryClient.invalidateQueries({ queryKey: ["invitees"] });
      },
    },
  });
};
