import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOutUser } from "../../api/auth/authApi";
import { useNavigate, useParams } from "react-router";

/**
 * Hook to handle user sign-out
 * @returns Mutation result for user sign-out
 */
export const useSignOut = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: signOutUser,
    onSuccess: () => {
      navigate("/login", {replace: true});
    },
  });
};
