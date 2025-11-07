import { useQuery } from "@tanstack/react-query";
import { validateInvitationToken } from "../../api/firebaseFunctions";

/**
 * Hook to validate an invitation token
 */
export const useValidateInvitationToken = (token: string | null) => {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => {
      if (!token) {
        return { valid: false, message: "No token provided" };
      }

      const result = await validateInvitationToken({ token });
      return result.data;
    },
    enabled: !!token,
    retry: false,
  });
};
