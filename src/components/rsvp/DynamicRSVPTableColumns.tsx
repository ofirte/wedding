import { useMemo } from "react";
import { Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { Column } from "../common/DSTable";
import { InviteeRSVP } from "../../api/rsvp/rsvpQuestionsTypes";
import { Invitee } from "../invitees/InviteList";
import { isNil } from "lodash";
import { useTranslation } from "../../localization/LocalizationContext";
import { useWeddingDetails } from "../../hooks/wedding/useWeddingDetails";
import { useRSVPFormQuestions } from "../../hooks/rsvp/useRSVPFormQuestions";

export type InviteeWithDynamicRSVP = Invitee & {
  rsvpStatus?: InviteeRSVP;
  templateSent?: "sent" | "notSent" | "all";
};

interface UseDynamicRSVPTableColumnsProps {
  selectedTemplates: string[];
  sentMessages: any[];
}

/**
 * useDynamicRSVPTableColumns - Dynamic RSVP table columns based on enabled questions
 *
 * This hook creates table columns dynamically based on the questions configured
 * in the RSVP form, ensuring the table always reflects the current form structure.
 */
export const useDynamicRSVPTableColumns = ({
  selectedTemplates,
  sentMessages,
}: UseDynamicRSVPTableColumnsProps): Column<InviteeWithDynamicRSVP>[] => {
  const { t } = useTranslation();
  const { data: wedding } = useWeddingDetails();
  const { questions } = useRSVPFormQuestions();

  return useMemo((): Column<InviteeWithDynamicRSVP>[] => {
    const handleLinkClick = (guestId: string) => {
      if (!wedding?.id) return;
      const url = `/guest-rsvp/${wedding.id}/${guestId}`;
      window.open(url, "_blank");
    };

    const handleCopyLink = async (guestId: string) => {
      if (!wedding?.id) return;
      const url = `${window.location.origin}/guest-rsvp/${wedding.id}/${guestId}`;
      try {
        await navigator.clipboard.writeText(url);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    };

    const columns: Column<InviteeWithDynamicRSVP>[] = [
      // Guest Identity Section - Always first
      {
        id: "name",
        label: t("rsvpStatusTab.name"),
        render: (row) => (
          <Typography variant="body2" fontWeight="medium">
            {row.name}
          </Typography>
        ),
        sortable: true,
      },
    ];

    // Dynamic columns based on enabled questions
    questions.forEach((question) => {
      if (question.id === "attendance") {
        // Special handling for attendance question
        columns.push({
          id: "attendance",
          label: t("rsvpStatusTab.attendance"),
          sortable: true,
          filterConfig: {
            id: "attendance",
            type: "multiple",
            label: t("rsvpStatusTab.attendance"),
            options: [
              { value: true, label: t("rsvpStatusTab.arriving") },
              { value: false, label: t("rsvpStatusTab.notArriving") },
              { value: undefined, label: t("rsvpStatusTab.pending") },
            ],
          },
          sortFn: (a, b) => {
            const aAttendance = a.rsvpStatus?.attendance;
            const bAttendance = b.rsvpStatus?.attendance;

            if (aAttendance === bAttendance) return 0;
            if (aAttendance === true && bAttendance !== true) return -1;
            if (bAttendance === true && aAttendance !== true) return 1;
            if (aAttendance === false && isNil(bAttendance)) return -1;
            if (bAttendance === false && isNil(aAttendance)) return 1;
            return 0;
          },
          render: (row) => {
            const status = row.rsvpStatus;
            if (isNil(status?.attendance)) {
              return (
                <Chip
                  icon={<PendingIcon />}
                  label={t("rsvpStatusTab.pending")}
                  size="small"
                  color="default"
                  variant="outlined"
                />
              );
            }
            if (status?.attendance) {
              return (
                <Chip
                  icon={<CheckIcon />}
                  label={t("rsvpStatusTab.arriving")}
                  size="small"
                  color="success"
                />
              );
            }
            return (
              <Chip
                icon={<CancelIcon />}
                label={t("rsvpStatusTab.notArriving")}
                size="small"
                color="error"
              />
            );
          },
        });
      } else if (question.id === "amount") {
        // Special handling for guest count
        columns.push({
          id: "amount",
          label: question.displayName || t("rsvpStatusTab.guestCount"),
          render: (row) => {
            const status = row.rsvpStatus;
            const guestCountValue = status?.[question.id];

            if (isNil(guestCountValue)) return "-";

            // Convert string to number if needed
            const guestCount =
              typeof guestCountValue === "string"
                ? parseInt(guestCountValue) || 0
                : typeof guestCountValue === "number"
                ? guestCountValue
                : 0;

            return (
              <Box display="flex" alignItems="center" gap={0.5}>
                <GroupIcon fontSize="small" color="action" />
                <Typography variant="body2">{guestCount}</Typography>
              </Box>
            );
          },
          sortable: true,
          sortFn: (a, b) => {
            const aValue = a.rsvpStatus?.[question.id];
            const bValue = b.rsvpStatus?.[question.id];

            const aCount =
              typeof aValue === "string"
                ? parseInt(aValue) || 0
                : typeof aValue === "number"
                ? aValue
                : 0;
            const bCount =
              typeof bValue === "string"
                ? parseInt(bValue) || 0
                : typeof bValue === "number"
                ? bValue
                : 0;

            return aCount - bCount;
          },
        });
      } else if (question.type === "boolean") {
        // Dynamic boolean columns
        columns.push({
          id: question.id,
          label: question.displayName || question.questionText,
          sortable: true,
          filterConfig: {
            id: question.id,
            type: "multiple",
            label: question.displayName || question.questionText,
            options: [
              {
                value: true,
                label: question.booleanOptions?.trueOption || t("common.yes"),
              },
              {
                value: false,
                label: question.booleanOptions?.falseOption || t("common.no"),
              },
              { value: undefined, label: "-" },
            ],
          },
          sortFn: (a, b) => {
            const aValue = a.rsvpStatus?.[question.id];
            const bValue = b.rsvpStatus?.[question.id];

            if (aValue === bValue) return 0;
            if (aValue === true && bValue !== true) return -1;
            if (bValue === true && aValue !== true) return 1;
            if (aValue === false && isNil(bValue)) return -1;
            if (bValue === false && isNil(aValue)) return 1;
            return 0;
          },
          render: (row) => {
            const status = row.rsvpStatus;
            const value = status?.[question.id];

            if (isNil(value)) return "-";

            if (value === true) {
              return (
                <Chip
                  label={question.booleanOptions?.trueOption || t("common.yes")}
                  size="small"
                  color="primary"
                />
              );
            }

            return (
              <Chip
                label={question.booleanOptions?.falseOption || t("common.no")}
                size="small"
                color="default"
                variant="outlined"
              />
            );
          },
        });
      } else if (question.type === "select") {
        // Dynamic select columns
        columns.push({
          id: question.id,
          label: question.displayName || question.questionText,
          sortable: true,
          filterConfig: {
            id: question.id,
            type: "multiple",
            label: question.displayName || question.questionText,
            options: [
              ...(question.options?.map((option) => ({
                value: option,
                label: option,
              })) || []),
              { value: undefined, label: "-" },
            ],
          },
          render: (row) => {
            const status = row.rsvpStatus;
            const value = status?.[question.id];

            if (isNil(value) || value === "") return "-";

            return <Chip label={value as string} size="small" color="info" />;
          },
        });
      }
    });

    // Always add management columns at the end
    columns.push(
      // Guest Link Section
      {
        id: "guestLink",
        label: t("rsvpStatusTab.invitationLink"),
        render: (row) => (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Tooltip title={t("rsvpStatusTab.invitationLink")}>
              <IconButton
                size="small"
                onClick={() => handleLinkClick(row.id)}
                disabled={!wedding?.id}
                color="primary"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("rsvpStatusTab.copyInvitationLink")}>
              <IconButton
                size="small"
                onClick={() => handleCopyLink(row.id)}
                disabled={!wedding?.id}
                color="primary"
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },

      // Process Management Section
      {
        id: "submitted",
        label: t("rsvpStatusTab.status"),
        sortable: true,
        filterConfig: {
          id: "submitted",
          type: "multiple",
          label: t("rsvpStatusTab.status"),
          options: [
            { value: true, label: t("rsvpStatusTab.submitted") },
            { value: false, label: t("rsvpStatusTab.draft") },
          ],
        },
        sortFn: (a, b) => {
          const aSubmitted = a.rsvpStatus?.isSubmitted;
          const bSubmitted = b.rsvpStatus?.isSubmitted;

          if (aSubmitted === bSubmitted) return 0;
          if (aSubmitted === true && bSubmitted !== true) return -1;
          if (bSubmitted === true && aSubmitted !== true) return 1;
          if (aSubmitted === false && isNil(bSubmitted)) return -1;
          if (bSubmitted === false && isNil(aSubmitted)) return 1;
          return 0;
        },
        render: (row) => {
          const status = row.rsvpStatus;
          return status?.isSubmitted ? (
            <Chip
              label={t("rsvpStatusTab.submitted")}
              size="small"
              color="info"
            />
          ) : (
            <Chip
              label={t("rsvpStatusTab.draft")}
              size="small"
              color="warning"
              variant="outlined"
            />
          );
        },
      },

      {
        id: "templateSent",
        label: t("rsvpStatusTab.sent"),
        sortable: true,
        sortFn: (a, b) => {
          const aSent = a.templateSent === "sent";
          const bSent = b.templateSent === "sent";
          return aSent === bSent ? 0 : aSent ? -1 : 1;
        },
        filterConfig: {
          id: "templateSent",
          type: "single",
          label: t("rsvpStatusTab.sent"),
          options: [
            { value: "sent", label: t("rsvpStatusTab.sent") },
            { value: "notSent", label: t("rsvpStatusTab.notSent") },
          ],
        },
        render: (row) => {
          if (selectedTemplates.length === 0) {
            return (
              <Typography variant="body2" color="text.disabled">
                {t("rsvpStatusTab.selectTemplateFirst")}
              </Typography>
            );
          }
          return row.templateSent === "sent" ? (
            <Chip
              icon={<MessageIcon />}
              label={t("rsvpStatusTab.sent")}
              size="small"
              color="success"
            />
          ) : (
            <Chip
              icon={<MessageIcon />}
              label={t("rsvpStatusTab.notSent")}
              size="small"
              color="default"
              variant="outlined"
            />
          );
        },
      }
    );

    return columns;
  }, [t, questions, selectedTemplates, wedding?.id]);
};
