import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { useResponsive, responsivePatterns } from "../../utils/ResponsiveUtils";
import { InviteeRSVP } from "../../api/rsvp/rsvpQuestionsTypes";
import { Invitee } from "../invitees/InviteList";
import { useRSVPFormQuestions } from "../../hooks/rsvp/useRSVPFormQuestions";
import ResponseRateRatio from "./ResponseRateRatio";
import CustomQuestionsStats from "./CustomQuestionsStats";

type InviteeWithDynamicRSVP = Invitee & {
  rsvpStatus?: InviteeRSVP;
};

interface DynamicRSVPStatusSummaryProps {
  inviteesWithRSVP: InviteeWithDynamicRSVP[];
  onFilterClick?: (filterType: string, value: any) => void;
  activeFilter?: { type: string; value: any } | null;
}

const DynamicRSVPStatusSummary: React.FC<DynamicRSVPStatusSummaryProps> = ({
  inviteesWithRSVP,
  onFilterClick,
  activeFilter,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const { questions } = useRSVPFormQuestions();

  // Calculate response rate statistics based on attendance
  const responseStats = useMemo(() => {
    const attendanceQuestion = questions.find((q) => q.id === "attendance");
    if (!attendanceQuestion) return null;

    let respondedCount = 0;
    let notRespondedCount = 0;

    inviteesWithRSVP.forEach((invitee) => {
      const rsvpStatus = invitee.rsvpStatus;
      if (rsvpStatus?.attendance !== undefined) {
        respondedCount += 1;
      } else {
        notRespondedCount += 1;
      }
    });

    const totalInvitees = respondedCount + notRespondedCount;
    const responseRate =
      totalInvitees > 0
        ? Math.round((respondedCount / totalInvitees) * 100)
        : 0;

    return {
      responded: respondedCount,
      notResponded: notRespondedCount,
      total: totalInvitees,
      rate: responseRate,
    };
  }, [inviteesWithRSVP, questions]);

  // Calculate attendance stats only (core required questions)
  const attendanceStats = useMemo(() => {
    const result: Array<{
      id: string;
      title: string;
      value: number;
      icon: React.ReactElement;
      color: string;
      filterType: string;
      filterValue: any;
    }> = [];

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

    return result;
  }, [inviteesWithRSVP, questions, t]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          mb: { xs: 2, sm: 3 },
          gap: 2,
        }}
      >
        <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 0 }}>
          {t("rsvpStatusTab.statistics")}
        </Typography>

        {/* Response Rate Ratio - aligned with title */}
        {responseStats && (
          <ResponseRateRatio
            responded={responseStats.responded}
            notResponded={responseStats.notResponded}
            total={responseStats.total}
            rate={responseStats.rate}
          />
        )}
      </Box>

      {/* All Stats in Single Grid - up to 4 cards per row */}
      <CustomQuestionsStats
        inviteesWithRSVP={inviteesWithRSVP}
        customQuestions={questions}
        attendanceStats={attendanceStats}
        onFilterClick={onFilterClick}
        activeFilter={activeFilter}
      />
    </Box>
  );
};

export default DynamicRSVPStatusSummary;
