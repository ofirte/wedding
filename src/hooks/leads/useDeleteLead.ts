import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLead } from "../../api/leads/leadsApi";

/**
 * Hook to delete a lead
 * @returns Mutation result object for deleting leads
 */
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId: string) => deleteLead(leadId),
    onSuccess: () => {
      console.log("Lead deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => {
      console.error("Error deleting lead:", error);
    },
  });
};
