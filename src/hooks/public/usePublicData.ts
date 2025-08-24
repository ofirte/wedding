import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPublicWeddingDetails,
  getPublicInvitee,
  getPublicRSVPStatus,
  updatePublicRSVPStatus,
} from "../../api/public/publicApi";
import { RSVPStatus } from "../../api/rsvp/rsvpStatusTypes";

/**
 * Hook to fetch wedding details for public/guest access (no authentication required)
 * @param weddingId The wedding ID
 * @returns Query result with wedding details
 */
export const usePublicWeddingDetails = (weddingId: string) => {
  return useQuery({
    queryKey: ["publicWeddingDetails", weddingId],
    queryFn: () => getPublicWeddingDetails(weddingId),
    enabled: !!weddingId,
  });
};

/**
 * Hook to fetch invitee details for public/guest access (no authentication required)
 * @param weddingId The wedding ID
 * @param inviteeId The invitee ID
 * @returns Query result with invitee details
 */
export const usePublicInvitee = (weddingId: string, inviteeId: string) => {
  return useQuery({
    queryKey: ["publicInvitee", weddingId, inviteeId],
    queryFn: () => getPublicInvitee(weddingId, inviteeId),
    enabled: !!weddingId && !!inviteeId,
  });
};

/**
 * Hook to fetch RSVP status for public/guest access (no authentication required)
 * @param weddingId The wedding ID
 * @param inviteeId The invitee ID
 * @returns Query result with RSVP status
 */
export const usePublicRSVPStatus = (weddingId: string, inviteeId: string) => {
  return useQuery({
    queryKey: ["publicRSVPStatus", weddingId, inviteeId],
    queryFn: () => getPublicRSVPStatus(weddingId, inviteeId),
    enabled: !!weddingId && !!inviteeId,
  });
};

/**
 * Hook to update RSVP status for public/guest access (no authentication required)
 * @param weddingId The wedding ID
 * @param inviteeId The invitee ID
 * @returns Mutation function to update RSVP status
 */
export const usePublicUpdateRSVPStatus = (weddingId: string, inviteeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rsvpStatus: Partial<RSVPStatus>) =>
      updatePublicRSVPStatus(weddingId, inviteeId, rsvpStatus),
    onSuccess: () => {
      // Invalidate and refetch RSVP status after successful update
      queryClient.invalidateQueries({
        queryKey: ["publicRSVPStatus", weddingId, inviteeId],
      });
    },
  });
};