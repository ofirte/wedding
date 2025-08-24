import React, { useState, useEffect } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import { useParams } from "react-router";
import { RSVPFormData } from "./guestRSVPTypes";
import WeddingIntroCard from "./WeddingIntroCard";
import RSVPQuestionsForm from "./RSVPQuestionsForm";
import ThankYouCard from "./ThankYouCard";
import WeddingDetailsCard from "./WeddingDetailsCard";
import { useWeddingDetails } from "../../hooks/auth";
import { useInvitee } from "../../hooks/invitees";
import { Wedding } from "../../api/wedding/weddingApi";
import { Invitee } from "../invitees/InviteList";

const GuestRSVPPage: React.FC = () => {
  const { guestId } = useParams<{ guestId: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data - in real implementation, fetch based on guestId
  const { data: weddingInfo } = useWeddingDetails();

  const { data: guestInfo } = useInvitee(guestId as string);
  console.log(guestInfo, weddingInfo, guestId);
  const [formData, setFormData] = useState<RSVPFormData>({
    attending: "",
    guestCount: 1,
    sleepover: "",
    needsRideFromTelAviv: "",
    dietaryRestrictions: "",
    specialRequests: "",
    plusOneName: "",
    phone: guestInfo?.cellphone || "",
  });

  useEffect(() => {
    // Simulate loading guest data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [guestId]);

  const handleFormDataChange = (newFormData: Partial<RSVPFormData>) => {
    setFormData((prev) => ({ ...prev, ...newFormData }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.attending) {
      setError("אנא ציינו האם תגיעו לחתונה");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Here you would submit the RSVP data to your backend
      console.log("Submitting RSVP:", { guestId, ...formData });
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Mock API call
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit RSVP:", err);
      setError("שגיאה בשליחת אישור ההגעה. אנא נסו שוב.");
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while fetching guest information
  if (loading || !weddingInfo || !guestInfo) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #FFF8E7, #D1E4C4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#9BBB9B" }} />
      </Box>
    );
  }

  // Show thank you message after successful RSVP submission
  if (submitted) {
    return (
      <ThankYouCard
        formData={formData}
        weddingInfo={weddingInfo}
        guestInfo={guestInfo}
      />
    );
  }

  // Main RSVP form flow: Introduction → Questions → Details
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FFF8E7, #D1E4C4)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Step 1: Welcome the guest with wedding information */}
        <WeddingIntroCard weddingInfo={weddingInfo} guestInfo={guestInfo} />

        {/* Step 2: Collect RSVP response */}
        <RSVPQuestionsForm
          guestInfo={guestInfo}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
        />

        {/* Step 3: Provide additional wedding details */}
        <WeddingDetailsCard weddingInfo={weddingInfo} />
      </Container>
    </Box>
  );
};

export default GuestRSVPPage;
