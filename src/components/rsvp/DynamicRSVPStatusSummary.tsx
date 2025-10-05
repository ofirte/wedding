import React, { useMemo } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { useResponsive, responsivePatterns } from "../../utils/ResponsiveUtils";
import { InviteeRSVP } from "../../api/rsvp/rsvpQuestionsTypes";
import { Invitee } from "../invitees/InviteList";
import { useRSVPFormQuestions } from "../../hooks/rsvp/useRSVPFormQuestions";

type InviteeWithDynamicRSVP = Invitee & {
  rsvpStatus?: InviteeRSVP;
};

interface DynamicRSVPStatusSummaryProps {
  inviteesWithRSVP: InviteeWithDynamicRSVP[];
  onFilterClick?: (filterType: string, value: any) => void;
  activeFilter?: { type: string; value: any } | null;
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactElement;
  color?: string;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ title, value, icon, color = "primary", onClick, isActive = false }) => {
  const { isMobile } = useResponsive();

  return (
    <Card
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        border: isActive ? 2 : 1,
        borderColor: isActive ? `${color}.main` : "divider",
        bgcolor: isActive ? `${color}.50` : "background.paper",
        boxShadow: isActive ? 3 : 1,
        "&:hover": onClick
          ? {
              transform: isMobile ? "none" : "translateY(-2px)",
              boxShadow: isActive ? 4 : 2,
              borderColor: `${color}.main`,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={responsivePatterns.cardPadding}>
        <Box
          display="flex"
          alignItems="center"
          gap={isMobile ? 1.5 : 2}
          flexDirection={isMobile ? "column" : "row"}
          textAlign={isMobile ? "center" : "left"}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
              borderRadius: 2,
              bgcolor: isActive ? `${color}.main` : `${color}.light`,
              color: isActive ? "white" : `${color}.main`,
              boxShadow: isActive ? 2 : 0,
              mb: isMobile ? 1 : 0,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight="bold"
              color={isActive ? `${color}.main` : color}
              sx={{
                textShadow: isActive ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const DynamicRSVPStatusSummary: React.FC<DynamicRSVPStatusSummaryProps> = ({
  inviteesWithRSVP,
  onFilterClick,
  activeFilter,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const { questions } = useRSVPFormQuestions();

  // Calculate statistics dynamically based on enabled questions
  const stats = useMemo(() => {
    const result: Array<{
      id: string;
      title: string;
      value: number;
      icon: React.ReactElement;
      color: string;
      filterType: string;
      filterValue: any;
    }> = [];

    // Always include attendance if it exists
    const attendanceQuestion = questions.find((q) => q.id === "attendance");
    if (attendanceQuestion) {
      let attendingCount = 0;
      let notAttendingCount = 0;

      inviteesWithRSVP.forEach((invitee) => {
        const rsvpStatus = invitee.rsvpStatus;
        if (rsvpStatus?.attendance === true) {
          // Handle guest count - convert string to number
          const guestCountValue = rsvpStatus["amount"];
          const guestCount =
            typeof guestCountValue === "string"
              ? parseInt(guestCountValue) || 1
              : typeof guestCountValue === "number"
              ? guestCountValue
              : 1;
          attendingCount += guestCount;
        } else if (rsvpStatus?.attendance === false) {
          notAttendingCount += 1;
        }
      });

      result.push({
        id: "attending",
        title: t("rsvpStatusTab.arriving"),
        value: attendingCount,
        icon: <CheckIcon />,
        color: "success",
        filterType: "attendance",
        filterValue: true,
      });

      result.push({
        id: "notAttending",
        title: t("rsvpStatusTab.notArriving"),
        value: notAttendingCount,
        icon: <CancelIcon />,
        color: "error",
        filterType: "attendance",
        filterValue: false,
      });
    }

    // Process other boolean questions dynamically
    questions.forEach((question) => {
      if (question.id === "attendance") return; // Already handled above

      if (question.type === "boolean") {
        let trueCount = 0;

        inviteesWithRSVP.forEach((invitee) => {
          const rsvpStatus = invitee.rsvpStatus;
          // Only count if attending (if attendance question exists)
          if (attendanceQuestion && rsvpStatus?.attendance !== true) return;

          if (rsvpStatus?.[question.id] === true) {
            // Handle guest count for boolean questions
            const guestCountValue = rsvpStatus["amount"];
            const guestCount =
              typeof guestCountValue === "string"
                ? parseInt(guestCountValue) || 1
                : typeof guestCountValue === "number"
                ? guestCountValue
                : 1;
            trueCount += guestCount;
          }
        });

        // Only show if there are positive counts or it's a key question
        if (
          trueCount > 0 ||
          ["sleepover", "transportation", "amount"].includes(question.id)
        ) {
          result.push({
            id: question.id,
            title: question.displayName || question.questionText,
            value: trueCount,
            icon: <PeopleIcon />,
            color: "info",
            filterType: question.id,
            filterValue: true,
          });
        }
      }
    });

    return result;
  }, [inviteesWithRSVP, questions, t]);

  return (
    <Box sx={responsivePatterns.containerPadding}>
      <Typography
        variant={isMobile ? "h6" : "h5"}
        gutterBottom
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        {t("rsvpStatusTab.statistics")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr", // 2 columns on mobile
            sm: "1fr 1fr", // 2 columns on tablet
            md: `repeat(${Math.min(stats.length, 4)}, 1fr)`, // Dynamic columns on desktop
          },
          gap: { xs: 2, sm: 2, md: 3 },
          width: "100%",
        }}
      >
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            onClick={() => onFilterClick?.(stat.filterType, stat.filterValue)}
            isActive={
              activeFilter?.type === stat.filterType &&
              activeFilter?.value === stat.filterValue
            }
          />
        ))}
      </Box>
    </Box>
  );
};

export default DynamicRSVPStatusSummary;
