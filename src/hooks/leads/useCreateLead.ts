import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLead } from "../../api/leads/leadsApi";
import { Lead } from "@wedding-plan/types";

/**
 * Hook to create a new lead
 * @returns Mutation result object for creating leads
 */
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadData: Omit<Lead, "id" | "producerId" | "createdAt">) =>
      createLead(leadData),
    // Optimistically add the new lead to the cache
    onMutate: async (newLead) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["leads"] });

      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData<Lead[]>(["leads"]);

      // Optimistically update the cache with a temporary ID
      if (previousLeads) {
        const optimisticLead: Lead = {
          ...newLead,
          id: `temp-${Date.now()}`, // Temporary ID
          producerId: "current-user", // Will be replaced by server
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Lead;

        queryClient.setQueryData<Lead[]>(["leads"], [...previousLeads, optimisticLead]);
      }

      // Return context for rollback
      return { previousLeads };
    },
    onSuccess: () => {
      console.log("Lead created successfully");
      // Refetch to get the real ID from the server
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error, variables, context) => {
      console.error("Error creating lead:", error);
      // Rollback to the previous value on error
      if (context?.previousLeads) {
        queryClient.setQueryData(["leads"], context.previousLeads);
      }
    },
  });
};
