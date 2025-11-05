import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router";
import { manualUpdateAutomationStatuses } from "../../api/firebaseFunctions/sendAutomations";

/**
 * Hook to manually update automation statuses
 */
export const useManualUpdateAutomationStatuses = () => {
  const { weddingId } = useParams<{ weddingId: string }>();

  return useMutation({
    mutationFn: async () => {
      const result = await manualUpdateAutomationStatuses({ weddingId: weddingId! });
      return result.data;
    },
    onSuccess: () => {
      console.log("Manual automation status update completed successfully");
    },
    onError: (error) => {
      console.error("Error during manual automation status update:", error);
    },
  });
};
