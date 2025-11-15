import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLead, createLeadEvent } from "../../api/leads/leadsApi";
import { Lead } from "@wedding-plan/types";

/**
 * Hook to update a lead
 * Automatically logs events for status changes and field updates
 * @returns Mutation result object for updating leads
 */
export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      previousData,
    }: {
      id: string;
      data: Partial<Lead>;
      previousData?: Lead;
    }) => {
      // Update the lead
      await updateLead(id, data);

      // Log events for significant changes
      if (data.status && previousData && data.status !== previousData.status) {
        await createLeadEvent(id, {
          type: "status_changed",
          description: `Status changed from ${previousData.status} to ${data.status}`,
          metadata: {
            oldValue: previousData.status,
            newValue: data.status,
            field: "status",
          },
        });
      }

      if (data.followUpDate && data.followUpDate !== previousData?.followUpDate) {
        await createLeadEvent(id, {
          type: "follow_up_set",
          description: `Follow-up date set to ${new Date(
            data.followUpDate
          ).toLocaleDateString()}`,
          metadata: {
            newValue: data.followUpDate,
          },
        });
      }

      // Log other field updates
      const updatedFields = Object.keys(data).filter(
        (key) =>
          key !== "status" &&
          key !== "followUpDate" &&
          key !== "updatedAt" &&
          previousData &&
          (data as any)[key] !== (previousData as any)[key]
      );

      if (updatedFields.length > 0) {
        await createLeadEvent(id, {
          type: "field_updated",
          description: `Updated: ${updatedFields.join(", ")}`,
          metadata: {
            fields: updatedFields,
          },
        });
      }
    },
    onSuccess: () => {
      console.log("Lead updated successfully");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => {
      console.error("Error updating lead:", error);
    },
  });
};
