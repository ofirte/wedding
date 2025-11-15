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
    onSuccess: () => {
      console.log("Lead created successfully");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => {
      console.error("Error creating lead:", error);
    },
  });
};
