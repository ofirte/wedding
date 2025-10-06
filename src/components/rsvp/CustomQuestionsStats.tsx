import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { People as PeopleIcon } from "@mui/icons-material";
import { InviteeRSVP } from "../../api/rsvp/rsvpQuestionsTypes";
import { Invitee } from "../invitees/InviteList";
import { RSVPQuestion } from "../../api/rsvp/rsvpQuestionsTypes";
import YesNoStatsCard from "./YesNoStatsCard";
import SelectStatsCard from "./SelectStatsCard";

type InviteeWithDynamicRSVP = Invitee & {
  rsvpStatus?: InviteeRSVP;
};

interface CustomQuestionsStatsProps {
  inviteesWithRSVP: InviteeWithDynamicRSVP[];
  customQuestions: RSVPQuestion[];
  attendanceStats?: Array<{
    id: string;
    title: string;
    value: number;
    icon: React.ReactElement;
    color: string;
    filterType: string;
    filterValue: any;
  }>;
  onFilterClick?: (filterType: string, value: any) => void;
  activeFilter?: { type: string; value: any } | null;
}

const CustomQuestionsStats: React.FC<CustomQuestionsStatsProps> = ({
  inviteesWithRSVP,
  customQuestions,
  attendanceStats = [],
  onFilterClick,
  activeFilter,
}) => {
  // Filter custom questions (exclude attendance and amount)
  const filteredCustomQuestions = useMemo(() => {
    return customQuestions.filter(
      (q) => q.id !== "attendance" && q.id !== "amount"
    );
  }, [customQuestions]);

  // Calculate boolean question stats
  const booleanStats = useMemo(() => {
    const result: Array<{
      id: string;
      title: string;
      value: number;
      icon: React.ReactElement;
      color: string;
      filterType: string;
      filterValue: any;
    }> = [];

    // Check if attendance is enabled to filter by attending guests
    const attendanceQuestion = customQuestions.find(
      (q) => q.id === "attendance"
    );

    filteredCustomQuestions.forEach((question) => {
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
          ["sleepover", "transportation"].includes(question.id)
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
  }, [inviteesWithRSVP, filteredCustomQuestions, customQuestions]);

  // Calculate select question stats
  const selectStats = useMemo(() => {
    const selectQuestions = filteredCustomQuestions.filter(
      (q) => q.type === "select"
    );
    const result: Array<{
      questionId: string;
      questionTitle: string;
      options: Array<{ label: string; count: number; guestCount: number }>;
      totalResponses: number;
    }> = [];

    const attendanceQuestion = customQuestions.find(
      (q) => q.id === "attendance"
    );

    selectQuestions.forEach((question) => {
      const optionCounts: {
        [key: string]: { count: number; guestCount: number };
      } = {};

      // Initialize all options
      question.options?.forEach((option: string) => {
        optionCounts[option] = { count: 0, guestCount: 0 };
      });

      inviteesWithRSVP.forEach((invitee) => {
        const rsvpStatus = invitee.rsvpStatus;
        // Only count if attending (if attendance question exists)
        if (attendanceQuestion && rsvpStatus?.attendance !== true) return;

        const selectedValue = rsvpStatus?.[question.id];
        if (selectedValue && optionCounts[selectedValue] !== undefined) {
          const guestCountValue = rsvpStatus["amount"];
          const guestCount =
            typeof guestCountValue === "string"
              ? parseInt(guestCountValue) || 1
              : typeof guestCountValue === "number"
              ? guestCountValue
              : 1;

          optionCounts[selectedValue].count += 1;
          optionCounts[selectedValue].guestCount += guestCount;
        }
      });

      // Convert to array with labels
      const options =
        question.options?.map((option: string) => ({
          label: option,
          count: optionCounts[option].count,
          guestCount: optionCounts[option].guestCount,
        })) || [];

      const totalResponses = options.reduce(
        (sum: number, opt: any) => sum + opt.count,
        0
      );

      // Only include if there are selections
      if (options.some((opt: any) => opt.count > 0)) {
        result.push({
          questionId: question.id,
          questionTitle: question.displayName || question.questionText,
          options,
          totalResponses,
        });
      }
    });

    return result;
  }, [inviteesWithRSVP, filteredCustomQuestions, customQuestions]);

  // Calculate total number of cards (attendance + custom)
  const totalCards =
    attendanceStats.length + booleanStats.length + selectStats.length;

  // Don't render anything if no cards at all
  if (totalCards === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr 1fr", // 2 columns on mobile
          sm: "1fr 1fr", // 2 columns on tablet
          md: `repeat(${Math.min(totalCards, 4)}, 1fr)`, // Up to 4 columns on desktop
        },
        gap: { xs: 2, sm: 2, md: 3 },
        width: "100%",
      }}
    >
      {/* Attendance Stats Cards (rendered first) */}
      {attendanceStats.map((stat) => (
        <YesNoStatsCard
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

      {/* Boolean Stats Cards */}
      {booleanStats.map((stat) => (
        <YesNoStatsCard
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

      {/* Select Stats Cards with Distribution */}
      {selectStats.map((questionStat) => {
        return (
          <SelectStatsCard
            key={questionStat.questionId}
            title={questionStat.questionTitle}
            options={questionStat.options}
            color="info"
            onClick={() => onFilterClick?.(questionStat.questionId, "select")}
            isActive={
              activeFilter?.type === questionStat.questionId &&
              activeFilter?.value === "select"
            }
          />
        );
      })}
    </Box>
  );
};

export default CustomQuestionsStats;
