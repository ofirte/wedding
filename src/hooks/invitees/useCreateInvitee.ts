import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { createInvitee } from "../../api/invitees/inviteesApi";
import { Invitee } from "../../components/invitees/InviteList";
import { useWeddingMutation } from "../common";

export const useCreateInvitee = (
  options?: Omit<
    UseMutationOptions<unknown, unknown, unknown, unknown>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (invitee: Omit<Invitee, "id">) => createInvitee(invitee),
    options: {
      onSuccess: (data, variables, context) => {
        console.log("Invitee created successfully");
        queryClient.invalidateQueries({ queryKey: ["invitees"] });
        options?.onSuccess?.(data, variables, context);
      },
    },
    ...options,
  });
};
