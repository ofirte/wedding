import { useMemo } from "react";
import { useInvitees } from "../invitees";
import { useWeddingDetails } from "../wedding/useWeddingDetails";
import {
  populateVariables,
  replaceVariables,
} from "../../utils/messageVariables";

interface UsePreviewTextOptions {
  messageText: string;
  language: "en" | "he";
}

export const usePreviewText = ({
  messageText,
  language,
}: UsePreviewTextOptions) => {
  const { data: invitees } = useInvitees();
  const { data: wedding } = useWeddingDetails();

  const previewText = useMemo(() => {
    if (!messageText) return "";

    let message = messageText;
    const guest = invitees?.[0]; // Use first guest for preview context

    if (guest && wedding) {
      const variables = populateVariables(guest, wedding, language);
      message = replaceVariables(message, variables);
    }

    return message;
  }, [messageText, invitees, wedding, language]);

  return previewText;
};
