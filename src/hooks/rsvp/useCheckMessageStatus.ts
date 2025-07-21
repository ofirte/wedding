import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  checkMessageStatus,
  TwilioMessageStatus,
} from "../../api/rsvp/rsvpApi";
import { useWeddingQuery } from "../common";

/**
 * Hook to check message status from Twilio using useWeddingQuery pattern
 * @param messageSid The message SID to check (optional, can be set later)
 * @returns Query result with checkStatus function
 */
export const useCheckMessageStatus = (messageSid?: string) => {
  return useWeddingQuery<TwilioMessageStatus>({
    queryKey: ["messageStatus", messageSid],
    queryFn: () => {
      if (!messageSid) {
        throw new Error("Message SID is required");
      }
      return checkMessageStatus(messageSid);
    },
    options: {
      enabled: !!messageSid,
    },
  });
};
