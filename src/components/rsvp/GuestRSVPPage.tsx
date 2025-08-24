import React, { useState, useEffect } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import { useParams } from "react-router";
import isNil from "lodash/isNil";
import { RSVPFormData } from "./guestRSVPTypes";
import WeddingIntroCard from "./WeddingIntroCard";
import RSVPQuestionsForm from "./RSVPQuestionsForm";
import ThankYouCard from "./ThankYouCard";
import WeddingDetailsCard from "./WeddingDetailsCard";
import { useWeddingDetails } from "../../hooks/auth";
import { useInvitee } from "../../hooks/invitees";
import { useRSVPStatus, useUpdateRSVPStatus } from "../../hooks/rsvp";
import {
  formDataToRSVPStatus,
  rsvpStatusToFormData,
} from "../../api/rsvp/rsvpStatusTypes";

const GuestRSVPPage: React.FC = () => {
  const { guestId, weddingId } = useParams<{
    guestId: string;
    weddingId: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wedding info and guest info
  const { data: weddingInfo } = useWeddingDetails(weddingId as string);
  const { data: guestInfo } = useInvitee(guestId as string);

  // Fetch existing RSVP status
  const { data: rsvpStatus } = useRSVPStatus(guestId as string);
  const updateRSVPStatus = useUpdateRSVPStatus();

  // Initialize form data with existing RSVP status or defaults
  const [formData, setFormData] = useState<RSVPFormData>({
    attending: undefined,
    guestCount: undefined,
    sleepover: undefined,
    needsRideFromTelAviv: undefined,
  });

  useEffect(() => {
    // Initialize form data from existing RSVP status when it loads
    if (rsvpStatus) {
      const convertedFormData = rsvpStatusToFormData(rsvpStatus);
      setFormData((prev) => ({
        ...prev,
        ...convertedFormData,
      }));
    }
  }, [rsvpStatus]);

  useEffect(() => {
    // Simulate loading guest data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [guestId]);

  const handleFormDataChange = (newFormData: Partial<RSVPFormData>) => {
    const updatedFormData = { ...formData, ...newFormData };
    if (updatedFormData.attending === "no") {
      updatedFormData.guestCount = undefined;
      updatedFormData.sleepover = undefined;
      updatedFormData.needsRideFromTelAviv = undefined;
    }
    setFormData(updatedFormData);

    // Update database with current form state using the utility function
    if (guestId) {
      const rsvpUpdate = formDataToRSVPStatus(updatedFormData);
      updateRSVPStatus.mutate({
        inviteeId: guestId,
        rsvpStatus: {
          ...rsvpUpdate,
          isSubmitted: rsvpStatus?.isSubmitted || false,
        },
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isNil(formData.attending)) {
      setError("אנא ציינו האם תגיעו לחתונה");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Mark RSVP as officially submitted using the existing hook
      if (guestId) {
        const rsvpUpdate = formDataToRSVPStatus(formData);
        await updateRSVPStatus.mutateAsync({
          inviteeId: guestId,
          rsvpStatus: { ...rsvpUpdate, isSubmitted: true },
        });
      }

      console.log("RSVP submitted successfully:", { guestId, ...formData });
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
          isSubmitted={rsvpStatus?.isSubmitted || false}
        />

        {/* Step 3: Provide additional wedding details */}
        <WeddingDetailsCard weddingInfo={weddingInfo} />
      </Container>
    </Box>
  );
};

export default GuestRSVPPage;
