import { useQueryClient } from "@tanstack/react-query";
import { createInvitee } from "../../api/invitees/inviteesApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to create an invitee
 * @returns Mutation result object for creating invitees
 */
export const useCreateInvitee = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: createInvitee,
    options: {
      onSuccess: () => {
        console.log("Invitee created successfully");
        queryClient.invalidateQueries({ queryKey: ["invitees"] });
      },
      onError: (error) => {
        console.error("Error creating invitee:", error);
      },
    },
  });
};
