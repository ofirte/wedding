import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Fade,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { useRSVPFormQuestions } from "../../../hooks/rsvp/useRSVPFormQuestions";
import { useUpdateEnabledQuestions } from "../../../hooks/rsvp/useUpdateEnabledQuestions";
import { useRSVPConfig } from "../../../hooks/rsvp/useRSVPConfig";
import { useWeddingDetails, useUpdateWedding } from "../../../hooks/auth";
import { UploadFile } from "../../common/UploadFile";
import RSVPFormQuestionCard from "../../rsvpGuestForm/RSVPFormQuestionCard";
import WeddingIntroCard from "../../rsvpGuestForm/WeddingIntroCard";
import { useTranslation } from "../../../localization/LocalizationContext";
import { Invitee } from "@wedding-plan/types";

const RsvpFormPreview: React.FC = () => {
  const { t } = useTranslation();
  const { questions, isLoading, error } = useRSVPFormQuestions();
  const { data: rsvpConfig } = useRSVPConfig();
  const { mutate: updateEnabledQuestions } = useUpdateEnabledQuestions();
  const { data: weddingDetails } = useWeddingDetails();
  const { mutate: updateWedding } = useUpdateWedding();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const [hoveredQuestion, setHoveredQuestion] = useState<string | null>(null);
  const [isIntroHovered, setIsIntroHovered] = useState(false);

  // Refs for scrolling functionality
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastQuestionRef = useRef<HTMLDivElement>(null);
  const prevQuestionsLengthRef = useRef<number>(0);

  const handleValueChange = (questionId: string, value: boolean | string) => {
    setFormValues((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCardClick = (questionId: string) => {
    setOpenQuestionId(openQuestionId === questionId ? null : questionId);
  };

  const handleScrollToQuestions = () => {
    // Placeholder for scroll functionality if needed
  };

  const handleRemoveQuestion = (questionId: string) => {
    if (!rsvpConfig?.enabledQuestionIds) return;

    const updatedQuestionIds = rsvpConfig.enabledQuestionIds.filter(
      (id) => id !== questionId
    );
    updateEnabledQuestions(updatedQuestionIds);
  };

  const handlePhotoUpload = (url: string) => {
    if (!weddingDetails?.id) return;

    updateWedding({
      weddingId: weddingDetails.id,
      data: { invitationPhoto: url },
    });
  };

  const handleRemovePhoto = () => {
    if (!weddingDetails?.id) return;

    updateWedding({
      weddingId: weddingDetails.id,
      data: { invitationPhoto: "" },
    });
  };

  const dummyGuestInfo: Invitee = {
    id: "preview-guest",
    name: t("rsvp.preview.guestName"),
    rsvp: "pending",
    percentage: 0,
    side: t("rsvp.preview.guestSide"),
    relation: t("rsvp.preview.guestRelation"),
    amount: 2,
    amountConfirm: 0,
    cellphone: "+1234567890",
  };

  // Auto-scroll to last question when questions are added
  useEffect(() => {
    if (!questions || questions.length === 0) {
      prevQuestionsLengthRef.current = 0;
      return;
    }

    const currentQuestionsLength = questions.length;
    const prevQuestionsLength = prevQuestionsLengthRef.current;

    // Only scroll if questions were actually added (not on initial load or removal)
    if (
      currentQuestionsLength > prevQuestionsLength &&
      prevQuestionsLength > 0
    ) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        if (lastQuestionRef.current && scrollContainerRef.current) {
          lastQuestionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }

    prevQuestionsLengthRef.current = currentQuestionsLength;
  }, [questions]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t("rsvp.errors.loadingQuestions")}</Alert>
      </Box>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {t("rsvp.noQuestionsConfigured")}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t("rsvp.addQuestionsFromSidebar")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #FFF8E7, #D1E4C4)",
      }}
    >
      {/* Form Questions - Scrollable */}
      <Box ref={scrollContainerRef} sx={{ flex: 1, overflow: "auto", p: 3 }}>
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
          {/* Wedding Intro Card with Upload Overlay */}
          <Box
            onMouseEnter={() => setIsIntroHovered(true)}
            onMouseLeave={() => setIsIntroHovered(false)}
            sx={{ position: "relative" }}
          >
            <WeddingIntroCard
              weddingInfo={weddingDetails!}
              guestInfo={dummyGuestInfo}
            />

            {/* Photo Upload Overlay */}
            {weddingDetails && (
              <Fade in={isIntroHovered}>
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    zIndex: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      p: 3,
                      backgroundColor: "background.paper",
                      borderRadius: 2,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    }}
                  >
                    <PhotoCameraIcon
                      sx={{ fontSize: 48, color: "primary.main" }}
                    />
                    <Typography
                      variant="h6"
                      color="text.primary"
                      textAlign="center"
                    >
                      {weddingDetails.invitationPhoto
                        ? t("rsvp.changeInvitationPhoto")
                        : t("rsvp.addInvitationPhoto")}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      <UploadFile
                        onUploadComplete={handlePhotoUpload}
                        uploadPath={`weddings/${weddingDetails.id}/invitation-photos`}
                        buttonText={
                          weddingDetails.invitationPhoto
                            ? t("rsvp.changePhoto")
                            : t("rsvp.addPhoto")
                        }
                        fileTypes=".jpg,.jpeg,.png,.gif,.webp"
                        buttonColor="#9c88ff"
                        buttonHoverColor="#8c78ef"
                      />
                      {weddingDetails.invitationPhoto && (
                        <IconButton
                          onClick={handleRemovePhoto}
                          sx={{
                            backgroundColor: "error.main",
                            color: "error.contrastText",
                            "&:hover": {
                              backgroundColor: "error.dark",
                            },
                            minWidth: 40,
                            height: 40,
                          }}
                          title={t("rsvp.removePhoto")}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Fade>
            )}
          </Box>

          {/* Questions */}
          {questions.map((question, index) => (
            <Box
              key={question.id}
              ref={index === questions.length - 1 ? lastQuestionRef : undefined}
              onMouseEnter={() => setHoveredQuestion(question.id)}
              onMouseLeave={() => setHoveredQuestion(null)}
              sx={{ position: "relative" }}
            >
              <RSVPFormQuestionCard
                question={question}
                value={formValues[question.id]}
                isOpen={openQuestionId === question.id}
                isClickable={true}
                onCardClick={() => handleCardClick(question.id)}
                onValueChange={handleValueChange}
                onScrollToQuestions={handleScrollToQuestions}
              />

              {/* Delete Icon - Only show on hover and for non-required questions */}
              {hoveredQuestion === question.id && !question.required && (
                <IconButton
                  size="small"
                  onClick={() => handleRemoveQuestion(question.id)}
                  sx={{
                    position: "absolute",
                    top: 20,
                    right: 8,
                    backgroundColor: "error.main",
                    color: "error.contrastText",
                    "&:hover": {
                      backgroundColor: "error.dark",
                    },
                    zIndex: 1,
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default RsvpFormPreview;
