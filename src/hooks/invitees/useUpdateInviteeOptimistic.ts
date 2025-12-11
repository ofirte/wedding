import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { updateInvitee } from "../../api/invitees/inviteesApi";
import { Invitee } from "@wedding-plan/types";
import { useWeddingMutation } from "../common";

/**
 * Hook to update an invitee with optimistic updates
 * Updates the UI immediately while the server request happens in the background
 * @returns Mutation result object for updating invitees
 */
export const useUpdateInviteeOptimistic = () => {
  const queryClient = useQueryClient();
  const { weddingId } = useParams<{ weddingId: string }>();

  return useWeddingMutation<
    void,
    { id: string; data: Partial<Invitee> },
    Error,
    { previousInvitees: Invitee[] | undefined }
  >({
    mutationFn: (
      { id, data }: { id: string; data: Partial<Invitee> },
      weddingId?: string
    ) => updateInvitee(id, data, weddingId),
    options: {
      // Optimistic update - apply changes immediately
      onMutate: async ({ id, data }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ["invitees", weddingId] });

        // Snapshot current value for rollback
        const previousInvitees = queryClient.getQueryData<Invitee[]>([
          "invitees",
          weddingId,
        ]);

        // Optimistically update the cache
        queryClient.setQueryData<Invitee[]>(["invitees", weddingId], (old) =>
          old?.map((invitee) =>
            invitee.id === id ? { ...invitee, ...data } : invitee
          )
        );

        return { previousInvitees };
      },
      // Rollback on error
      onError: (_err, _variables, context) => {
        if (context?.previousInvitees) {
          queryClient.setQueryData(
            ["invitees", weddingId],
            context.previousInvitees
          );
        }
      },
      // Refetch after mutation to ensure sync with server
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["invitees", weddingId] });
      },
    },
  });
};
