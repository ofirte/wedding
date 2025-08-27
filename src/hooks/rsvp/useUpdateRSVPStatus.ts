import { updateRSVPStatus } from "../../api/rsvp/rsvpStatusApi";
import { RSVPStatus } from "../../api/rsvp/rsvpStatusTypes";
import { useWeddingMutation } from "../common";
import { useParams } from "react-router";

/**
 * Hook to update RSVP status for an invitee
 * @returns Mutation result object for updating RSVP status
 */
export const useUpdateRSVPStatus = () => {
  const { weddingId } = useParams<{ weddingId: string }>();
  return useWeddingMutation({
    mutationFn: ({
      inviteeId,
      rsvpStatus,
    }: {
      inviteeId: string;
      rsvpStatus: Partial<RSVPStatus> | Record<string, any>;
    }) => updateRSVPStatus(inviteeId, rsvpStatus, weddingId),
  });
};
