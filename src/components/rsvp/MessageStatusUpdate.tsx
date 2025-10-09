import { FC, useEffect } from "react";
import { useCheckMessageStatus } from "../../hooks/rsvp/useCheckMessageStatus";
import { useUpdateMessageStatus } from "../../hooks/rsvp/useUpdateMessageStatus";
type MessageStatusUpdateProps = {
  messageSid: string;
  messageId: string;
  originalStatus: string;
};
const MessageStatusUpdate: FC<MessageStatusUpdateProps> = ({
  messageSid,
  messageId,
  originalStatus,
}) => {
  const { mutate: updateMessageStatus } = useUpdateMessageStatus();
  const { data: messageStatus } = useCheckMessageStatus(messageSid);
  useEffect(() => {
    if (messageStatus && messageStatus.messageInfo.status !== originalStatus) {
      updateMessageStatus({
        messageId: messageId,
        status: messageStatus.messageInfo.status,
      });
    }
  }, [messageStatus, originalStatus, messageSid, updateMessageStatus, messageId]);

  return null;
};

export default MessageStatusUpdate;
