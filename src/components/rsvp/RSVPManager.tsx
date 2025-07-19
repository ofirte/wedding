import React, { FC } from "react";
import { useSendMessage } from "../../hooks/messages/useSendMessage";

const RSVPManager: FC = () => {
  const { mutate: sendMessage, isPending, error } = useSendMessage();

  const handleSendMessage = () => {
    sendMessage({
      to: "whatsapp:+972587170296",
      contentSid: "HX1e2a82319f77d62848d6f0c353cd41b5",
      contentVariables: { "guest": "יסמין" },
    });
  };
  return (
    <div>
      <h1>RSVP Manager</h1>
      <p>This is the RSVP management page.</p>
      <button onClick={handleSendMessage} disabled={isPending}>
        {isPending ? "Sending..." : "Send RSVP Message"}
      </button>
    </div>
  );
};
export default RSVPManager;
