import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInvitee } from "../../api/invitees/inviteesApi";
import { Invitee } from "../../components/invitees/InviteList";

/**
 * Hook to create an invitee
 * @returns Mutation result object for creating invitees
 */
export const useCreateInvitee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitee: Omit<Invitee, "id">) => createInvitee(invitee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitees"] });
    },
  });
};
