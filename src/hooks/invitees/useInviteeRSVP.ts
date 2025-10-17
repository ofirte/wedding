import { useWeddingQuery, useWeddingMutation } from "../common";
import {
  fetchInviteeRSVP,
  updateInvitee,
} from "../../api/invitees/inviteesApi";
import { RSVPStatus } from "../../api/rsvp/rsvpStatusTypes";

/**
 * Hook to fetch RSVP status for an invitee using denormalized data
 * @param inviteeId The ID of the invitee to fetch RSVP status for
 * @returns Query result object containing RSVP status data and query state
 */
export const useInviteeRSVP = (inviteeId: string) => {
  return useWeddingQuery({
    queryKey: ["invitee-rsvp", inviteeId],
    queryFn: (weddingId) => fetchInviteeRSVP(inviteeId, weddingId),
    options: {
      refetchOnWindowFocus: false,
      // Enable query only if inviteeId is provided
      enabled: !!inviteeId,
    },
  });
};

/**
 * Hook to update RSVP status for an invitee using denormalized data
 * Converts rsvpStatus object to dot-separated syntax for Firebase updates
 * @returns Mutation result object for updating RSVP status
 */
export const useUpdateInviteeRSVP = () => {
  return useWeddingMutation({
    mutationFn: (
      {
        inviteeId,
        rsvpStatus,
      }: {
        inviteeId: string;
        rsvpStatus: Partial<RSVPStatus> | Record<string, any>;
      },
      weddingId?: string
    ) => {
      // Convert rsvpStatus object to dot-separated syntax
      const dotSeparatedData: Record<string, any> = {};

      Object.entries(rsvpStatus).forEach(([key, value]) => {
        dotSeparatedData[`rsvpStatus.${key}`] = value;
      });

      // Use updateInvitee with dot-separated data for proper Firebase field updates
      return updateInvitee(inviteeId, dotSeparatedData, weddingId);
    },
    options: {
      onSuccess: () => {
        console.log("RSVP status updated successfully");
      },
      onError: (error) => {
        console.error("Error updating RSVP status:", error);
      },
    },
  });
};
