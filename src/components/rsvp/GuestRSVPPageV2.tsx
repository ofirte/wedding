import React, { useState, useEffect, useCallback } from "react";
import { Box, Container, CircularProgress, Typography } from "@mui/material";
import { useParams } from "react-router";
import isNil from "lodash/isNil";
import { useRSVPFormQuestions } from "../../hooks/rsvp/useRSVPQuestions";
import { InviteeRSVP } from "../../api/rsvp/rsvpQuestionsTypes";
import WeddingIntroCard from "./WeddingIntroCard";
import DynamicRSVPForm from "./DynamicRSVPForm";
import ThankYouCard from "./ThankYouCard";
import WeddingDetailsCard from "./WeddingDetailsCard";
import { useWeddingDetails } from "../../hooks/auth";
import {
  useInvitee,
  useInviteeRSVP,
  useUpdateInviteeRSVP,
} from "../../hooks/invitees";
import { deleteField } from "firebase/firestore";

const GuestRSVPPageV2: React.FC = () => {
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

  // Fetch enabled RSVP form questions dynamically based on config
  const { questions, isLoading: isLoadingQuestions } =
    useRSVPFormQuestions(weddingId);

  // Fetch existing RSVP status
  const { data: rsvpStatus } = useInviteeRSVP(guestId as string);
  const updateRSVPStatus = useUpdateInviteeRSVP();

  // Initialize formData with existing RSVP data or defaults
  const [formData, setFormData] = useState<Partial<InviteeRSVP>>({});

  // Initialize form data with existing RSVP data (only using new dynamic format)
  useEffect(() => {
    if (rsvpStatus) {
      // Convert from any format to InviteeRSVP
      const converted = rsvpStatus as unknown as Partial<InviteeRSVP>;
      setFormData(converted);
    } else {
      setFormData({});
    }
  }, [rsvpStatus]);
  useEffect(() => {
    // Loading is complete when we have all the necessary data
    if (weddingInfo && guestInfo && !isLoadingQuestions) {
      setLoading(false);
    }
  }, [weddingInfo, guestInfo, isLoadingQuestions]);

  // Utility function to filter out undefined values and questions not in current config
  const cleanRSVPData = useCallback(
    (data: Partial<InviteeRSVP>): Partial<InviteeRSVP> => {
      const result: Partial<InviteeRSVP> = {};

      // Always include isSubmitted and submittedAt if they exist
      if (!isNil(data.isSubmitted)) {
        result.isSubmitted = data.isSubmitted;
      }
      if (!isNil(data.submittedAt)) {
        result.submittedAt = data.submittedAt;
      }

      // Get current question IDs from the config
      const currentQuestionIds = questions.map((q) => q.id);

      // Only include answers for questions that are currently enabled in the config
      Object.keys(data).forEach((key) => {
        if (!["isSubmitted", "submittedAt"].includes(key)) {
          const value = data[key as keyof InviteeRSVP];
          // Only include if the question is in the current config and has a valid value
          if (
            currentQuestionIds.includes(key) &&
            !isNil(value) &&
            value !== ""
          ) {
            result[key as keyof InviteeRSVP] = value;
          }
        }
      });

      if (result["attendance"] === false) {
        // When not attending, keep attendance and delete all other fields
        const attendanceOnlyResult: Record<string, any> = {
          attendance: false,
        };

        // Add deleteField() for all other questions that exist in the result
        Object.entries(result).forEach(([key, value]) => {
          if (
            key !== "attendance" &&
            key !== "isSubmitted" &&
            key !== "submittedAt"
          ) {
            attendanceOnlyResult[key] = deleteField();
          }
        });

        // Preserve system fields
        if (!isNil(result.isSubmitted)) {
          attendanceOnlyResult.isSubmitted = result.isSubmitted;
        }
        if (!isNil(result.submittedAt)) {
          attendanceOnlyResult.submittedAt = result.submittedAt;
        }

        console.log("Cleaned RSVP Data (Not Attending):", attendanceOnlyResult);
        return attendanceOnlyResult;
      }

      return result;
    },
    [questions]
  );

  // Auto-save function for intermediate updates (like V1)
  const handleFormDataChange = useCallback(
    (newFormData: Partial<InviteeRSVP>) => {
      setFormData((prevFormData) => {
        const updatedFormData = { ...prevFormData, ...newFormData };

        // Only update if there are actual changes
        const hasChanges = Object.keys(newFormData).some(
          (key) =>
            newFormData[key as keyof InviteeRSVP] !==
            prevFormData[key as keyof InviteeRSVP]
        );

        if (hasChanges && guestId) {
          const cleanedData = cleanRSVPData(updatedFormData);
          updateRSVPStatus.mutate({
            inviteeId: guestId,
            rsvpStatus: {
              ...cleanedData,
              isSubmitted: rsvpStatus?.isSubmitted || false,
            },
          });
        }

        return updatedFormData;
      });
    },
    [guestId, rsvpStatus?.isSubmitted, updateRSVPStatus, cleanRSVPData]
  );

  const handleFormSubmit = async (data: InviteeRSVP) => {
    setSubmitting(true);
    setError(null);

    try {
      if (guestId) {
        // Clean the data to remove undefined values before submission
        const cleanedData = cleanRSVPData({
          ...data,
          isSubmitted: true,
          submittedAt: new Date(),
        });

        await updateRSVPStatus.mutateAsync({
          inviteeId: guestId,
          rsvpStatus: cleanedData,
        });
      }

      console.log("RSVP submitted successfully:", { guestId, ...data });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit RSVP:", err);
      setError("שגיאה בשליחת אישור ההגעה. אנא נסו שוב.");
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while fetching data
  if (loading) {
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

  // Show error if essential data is missing
  if (!weddingInfo || !guestInfo) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #FFF8E7, #D1E4C4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Box textAlign="center">
          <Typography variant="h5" color="error" gutterBottom>
            שגיאה בטעינת הנתונים
          </Typography>
          <Typography variant="body1" color="text.secondary">
            לא ניתן לטעון את פרטי החתונה או האורח. אנא נסו שוב מאוחר יותר.
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show thank you message after successful RSVP submission
  if (submitted) {
    return (
      <ThankYouCard
        formData={{
          attending: formData["attendance"] ? "yes" : "no",
          guestCount: (() => {
            const guestCountValue = formData["guest_count"];
            if (typeof guestCountValue === "number") {
              return guestCountValue;
            }
            if (typeof guestCountValue === "string") {
              const parsed = parseInt(guestCountValue);
              return isNaN(parsed) ? 1 : parsed;
            }
            return 1;
          })(),
          sleepover: formData["sleepover"] ? "yes" : "no",
          needsRideFromTelAviv: formData["ride_from_tel_aviv"] ? "yes" : "no",
        }}
        weddingInfo={weddingInfo}
        guestInfo={guestInfo}
        onUpdateInfo={() => setSubmitted(false)}
      />
    );
  }

  // Main RSVP form flow: Introduction → Dynamic Questions → Details
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

        {/* Step 2: Dynamic RSVP Questions Form */}
        {questions.length > 0 ? (
          <DynamicRSVPForm
            guestName={guestInfo.name}
            questions={questions}
            initialData={formData}
            onSubmit={handleFormSubmit}
            onFormDataChange={handleFormDataChange}
            submitting={submitting}
            error={error}
            isSubmitted={rsvpStatus?.isSubmitted || false}
          />
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              טוען שאלות...
            </Typography>
            <CircularProgress sx={{ mt: 2, color: "#9BBB9B" }} />
          </Box>
        )}

        {/* Step 3: Provide additional wedding details */}
        <WeddingDetailsCard weddingInfo={weddingInfo} />
      </Container>
    </Box>
  );
};

export default GuestRSVPPageV2;
