import { getFirestore } from "firebase-admin/firestore";
import { WebhookMessageStatusPayload } from "./types";

const db = getFirestore();

/**
 * Update message status in Firebase based on Twilio webhook data
 * @param payload Webhook payload from Twilio
 * @returns Promise resolving to update result
 */
export async function updateMessageStatus(
  payload: WebhookMessageStatusPayload
) {
  const { MessageSid, MessageStatus } = payload;

  if (!MessageSid) {
    throw new Error("MessageSid is required");
  }

  // Find the message in all wedding collections
  const weddingsSnapshot = await db.collection("weddings").get();

  let messageFound = false;
  let updatedWeddingId = "";

  for (const weddingDoc of weddingsSnapshot.docs) {
    const weddingId = weddingDoc.id;
    const sentMessagesRef = db
      .collection("weddings")
      .doc(weddingId)
      .collection("sentMessages");

    // Query for the message by Twilio SID
    const messageQuery = await sentMessagesRef
      .where("sid", "==", MessageSid)
      .get();

    if (!messageQuery.empty) {
      // Found the message, update it
      const messageDoc = messageQuery.docs[0];
      const updateData: any = {
        status: MessageStatus.toLowerCase(),
        dateUpdated: new Date().toISOString(),
      };
      await messageDoc.ref.update(updateData);

      messageFound = true;
      updatedWeddingId = weddingId;

      console.log(
        `Updated message ${MessageSid} in wedding ${weddingId}:`,
        updateData
      );
      break;
    }
  }

  if (!messageFound) {
    throw new Error(`Message with SID ${MessageSid} not found in any wedding`);
  }

  return {
    success: true,
    messageSid: MessageSid,
    status: MessageStatus,
    weddingId: updatedWeddingId,
  };
}
