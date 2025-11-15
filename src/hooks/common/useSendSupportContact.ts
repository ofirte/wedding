import { useMutation } from "@tanstack/react-query";
import {
  sendSupportContact,
  SendSupportContactRequest,
  SendSupportContactResponse,
} from "../../api/firebaseFunctions";

/**
 * Hook to send a support contact email
 */
export const useSendSupportContact = (options?: {
  onSuccess?: (data: SendSupportContactResponse) => void;
  onError?: (error: any) => void;
}) => {
  return useMutation({
    mutationFn: async (data: SendSupportContactRequest) => {
      const result = await sendSupportContact(data);
      return result.data;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
