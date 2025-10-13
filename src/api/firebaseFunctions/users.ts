import { httpsCallable } from "firebase/functions";
import { UsersFunctions } from "./types";
import { functions } from "../firebaseConfig";

export const USERS_FUNCTIONS = {
  [UsersFunctions.DELETE_USER_AUTH]: httpsCallable(
    functions,
    UsersFunctions.DELETE_USER_AUTH
  ),
};

export const deleteUserAuth = USERS_FUNCTIONS[UsersFunctions.DELETE_USER_AUTH];

export { UsersFunctions };
