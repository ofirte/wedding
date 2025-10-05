import React from "react";
import { Wedding } from "../../api/wedding/weddingApi";
import { Invitee } from "../invitees/InviteList";
import WeddingInvitePhotoCard from "./WeddingInvitePhotoCard";
import WeddingInfoCard from "./WeddingInfoCard";

interface WeddingIntroCardProps {
  weddingInfo: Wedding;
  guestInfo: Invitee;
}

const WeddingIntroCard: React.FC<WeddingIntroCardProps> = ({
  weddingInfo,
  guestInfo,
}) => {
  // If there's an invitation photo, render only the photo card
  if (weddingInfo.invitationPhoto) {
    return <WeddingInvitePhotoCard weddingInfo={weddingInfo} />;
  }

  // Otherwise, render the wedding info card
  return <WeddingInfoCard weddingInfo={weddingInfo} guestInfo={guestInfo} />;
};

export default WeddingIntroCard;
