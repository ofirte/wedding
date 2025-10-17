import { useCallback } from "react";
import { Invitee, Wedding } from "@wedding-plan/types";
import { savePersonalWhatsAppMessage } from "../../api/rsvp/rsvpApi";

interface Template {
  sid: string;
  friendlyName?: string;
  types?: Record<string, any>;
}

/**
 * usePersonalWhatsApp - Hook for sending messages via personal WhatsApp
 *
 * This hook handles opening WhatsApp web/app with pre-filled messages
 * for bulk sending through personal WhatsApp account
 */
export const usePersonalWhatsApp = () => {
  // Helper function to extract body text from template types
  const getTemplateBody = useCallback((template: Template): string => {
    if (!template.types) return "No message content available";

    // Look for WhatsApp template body
    const whatsappType =
      template.types["twilio/text"] || template.types["whatsapp"];
    if (
      whatsappType &&
      typeof whatsappType === "object" &&
      whatsappType !== null
    ) {
      const body = (whatsappType as any).body;
      if (body) return body;
    }

    // Fallback to any available body
    const firstType = Object.values(template.types)[0];
    if (firstType && typeof firstType === "object" && "body" in firstType) {
      return (firstType as any).body || "No message content available";
    }

    return "No message content available";
  }, []);

  // Generate personalized message for a guest
  const generatePersonalizedMessage = useCallback(
    (template: Template, guest: Invitee, wedding?: Wedding | null): string => {
      let message = getTemplateBody(template);

      // Replace variables with guest's information
      const guestName = guest.name;
      const weddingId = wedding?.id ?? "";

      // Replace various variable formats
      message = message.replace(/\{\{1\}\}/g, guestName);
      message = message.replace(/\{\{guestName\}\}/g, guestName);
      message = message.replace(/\{\{weddingId\}\}/g, weddingId);
      message = message.replace(/\{\{guestId\}\}/g, guest.id);

      return message;
    },
    [getTemplateBody]
  );

  // Clean phone number for WhatsApp
  const cleanPhoneNumber = useCallback((phoneNumber: string): string => {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, "");

    // If doesn't start with +, assume Israeli number and add +972
    if (!cleaned.startsWith("+")) {
      cleaned = `+972${cleaned}`;
    }

    return cleaned;
  }, []);

  // Generate WhatsApp URL for a guest
  const generateWhatsAppURL = useCallback(
    (guest: Invitee, message: string): string => {
      const cleanNumber = cleanPhoneNumber(guest.cellphone);
      console.log(message);
      const encodedMessage = encodeURIComponent(message);
      console.log(`https://wa.me/${cleanNumber}?text=${encodedMessage}`);
      return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    },
    [cleanPhoneNumber]
  );

  // Send to multiple guests with delay between each
  const sendToMultipleGuests = useCallback(
    async (
      guests: Invitee[],
      template: Template,
      wedding?: Wedding | null,
      onProgress?: (current: number, total: number, guestName: string) => void
    ): Promise<void> => {
      for (let i = 0; i < guests.length; i++) {
        const guest = guests[i];

        // Notify progress
        onProgress?.(i + 1, guests.length, guest.name);

        // Generate personalized message
        const message = generatePersonalizedMessage(template, guest, wedding);

        // Generate WhatsApp URL
        const whatsappURL = generateWhatsAppURL(guest, message);

        // Open WhatsApp in new tab/window
        window.open(whatsappURL, "_blank");

        // Save to Firebase as sent message for tracking
        try {
          const cleanNumber = cleanPhoneNumber(guest.cellphone);
          const contentVariables = {
            guestName: guest.name,
            guestId: guest.id,
            weddingId: wedding?.id ?? "",
          };

          await savePersonalWhatsAppMessage(
            template.sid,
            contentVariables,
            guest.id,
            cleanNumber,
            wedding?.id
          );
        } catch (error) {
          console.error(
            `Error saving personal WhatsApp message for ${guest.name}:`,
            error
          );
          // Continue with other guests even if saving fails
        }

        // Add delay between opens to prevent overwhelming the browser
        if (i < guests.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    },
    [generatePersonalizedMessage, generateWhatsAppURL, cleanPhoneNumber]
  );

  // Mark messages as sent (for user confirmation)
  const markMessagesAsSent = useCallback(
    async (
      guests: Invitee[],
      template: Template,
      wedding?: Wedding | null
    ): Promise<void> => {
      const savePromises = guests.map(async (guest) => {
        try {
          const cleanNumber = cleanPhoneNumber(guest.cellphone);
          const contentVariables = {
            guestName: guest.name,
            guestId: guest.id,
            weddingId: wedding?.id ?? "",
          };

          return savePersonalWhatsAppMessage(
            template.sid,
            contentVariables,
            guest.id,
            cleanNumber,
            wedding?.id
          );
        } catch (error) {
          console.error(
            `Error saving personal WhatsApp message for ${guest.name}:`,
            error
          );
          throw error;
        }
      });

      await Promise.all(savePromises);
    },
    [cleanPhoneNumber]
  );

  return {
    generatePersonalizedMessage,
    generateWhatsAppURL,
    sendToMultipleGuests,
    markMessagesAsSent,
    cleanPhoneNumber,
  };
};
