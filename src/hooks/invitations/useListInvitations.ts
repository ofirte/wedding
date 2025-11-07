import { useQuery } from "@tanstack/react-query";
import { listInvitations } from "../../api/firebaseFunctions";

/**
 * Hook to list all invitations (admin only)
 */
export const useListInvitations = (
  status?: "pending" | "used" | "expired" | "all"
) => {
  return useQuery({
    queryKey: ["invitations", status],
    queryFn: async () => {
      const result = await listInvitations({ status });
      return result.data;
    },
  });
};
