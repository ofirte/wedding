// Export all auth hooks for easier imports
export { useCurrentUser } from "./useCurrentUser";
export { useSignUp } from "./useSignUp";
export { useSignIn } from "./useSignIn";
export { useSignOut } from "./useSignOut";
export { useUpdateUser } from "./useUpdateUser";
export { useCreateWedding } from "../wedding/useCreateWedding";
export { useJoinWedding } from "../wedding/useJoinWedding";
export { useWeddingDetails } from "../wedding/useWeddingDetails";
export { useUpdateWedding } from "../wedding/useUpdateWedding";
export { useCurrentUserWeddingId } from "./useCurrentUserWeddingId";
export { default as useInitializeUserRole } from "./useInitializeUserRole";

// Also export types from authApi for convenience
export type { WeddingUser } from "../../api/auth/authApi";
