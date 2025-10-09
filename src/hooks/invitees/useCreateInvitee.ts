import {  useQueryClient } from "@tanstack/react-query";
import { createInvitee } from "../../api/invitees/inviteesApi";
import { Invitee } from "../../components/invitees/InviteList";
import { useWeddingMutation } from "../common";

/**
 * Hook to create an invitee
 * @returns Mutation result object for creating invitees
 */
export const useCreateInvitee = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (invitee: Omit<Invitee, "id">) => createInvitee(invitee),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["invitees"] });
      },
    },
  });
};
