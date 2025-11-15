import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLead } from "../../api/leads/leadsApi";
import { Lead } from "@wedding-plan/types";

/**
 * Hook to delete a lead
 * @returns Mutation result object for deleting leads
 */
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId: string) => deleteLead(leadId),
    // Optimistically remove the lead from the cache
    onMutate: async (leadId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["leads"] });

      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData<Lead[]>(["leads"]);

      // Optimistically update the cache
      if (previousLeads) {
        queryClient.setQueryData<Lead[]>(
          ["leads"],
          previousLeads.filter((lead) => lead.id !== leadId)
        );
      }

      // Return context for rollback
      return { previousLeads };
    },
    onSuccess: () => {
      console.log("Lead deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error, variables, context) => {
      console.error("Error deleting lead:", error);
      // Rollback to the previous value on error
      if (context?.previousLeads) {
        queryClient.setQueryData(["leads"], context.previousLeads);
      }
    },
  });
};
