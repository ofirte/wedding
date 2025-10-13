import { CallableRequest, HttpsError } from "firebase-functions/https";
import { WeddingRole } from "./types";
import { AuthData } from "firebase-functions/tasks";

export const isAuthenticated: (
  request: CallableRequest<any>
) => asserts request is CallableRequest & { auth: AuthData } = (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
};

export const isSufficientWeddingRole = ({
  userRole,
  neededRole,
}: {
  userRole: WeddingRole;
  neededRole: WeddingRole;
}): boolean => {
  const roleHierarchy = ["user", "producer", "admin"];
  return roleHierarchy.indexOf(userRole) >= roleHierarchy.indexOf(neededRole);
};
