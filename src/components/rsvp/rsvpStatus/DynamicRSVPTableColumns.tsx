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
  Error as ErrorIcon,
} from "@mui/icons-material";
import { Column } from "../../common/DSTable";
import { InviteeRSVP } from "../../../api/rsvp/rsvpQuestionsTypes";
import { Invitee } from "@wedding-plan/types";
import { isNil } from "lodash";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useWeddingDetails } from "../../../hooks/wedding/useWeddingDetails";
import { useRSVPFormQuestions } from "../../../hooks/rsvp/useRSVPFormQuestions";

export type InviteeWithDynamicRSVP = Invitee & {
  rsvpStatus?: InviteeRSVP;
  templateSent?: "sent" | "failed" | "notSent" | "all";
};

interface UseDynamicRSVPTableColumnsProps {
  selectedTemplate: string | undefined;
  sentMessages: any[];
  isAdmin?: boolean;
}

/**
 * useDynamicRSVPTableColumns - Dynamic RSVP table columns based on enabled questions
 *
 * This hook creates table columns dynamically based on the questions configured
 * in the RSVP form, ensuring the table always reflects the current form structure.
 */
export const useDynamicRSVPTableColumns = ({
  selectedTemplate,
  sentMessages,
  isAdmin,
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
      // Hidden columns for filtering/sorting only
      {
        id: "side",
        label: "Side",
        render: () => null, // Not displayed
        sortable: true,
        hidden: true,
        filterConfig: {
          id: "side",
          type: "multiple",
          label: t("guests.side"),
          options: [
            { value: "חתן", label: t("guests.groom") },
            { value: "כלה", label: t("guests.bride") },
          ],
        },
      },
      {
        id: "relation",
        label: "Relation",
        render: () => null, // Not displayed
        sortable: true,
        hidden: true,
        filterConfig: {
          id: "relation",
          type: "multiple",
          label: t("guests.relation"),
          options: [
            // These are commonly used relation values - can be extended
            { value: "משפחה", label: "משפחה" },
            { value: "חברים", label: "חברים" },
            { value: "עבודה", label: "עבודה" },
            { value: "אחר", label: "אחר" },
          ],
        },
      },
      {
        id: "amount",
        label: "Amount",
        render: () => null, // Not displayed
        sortable: true,
        hidden: true,
        sortFn: (a, b) => (a.amount || 0) - (b.amount || 0),
      },
      {
        id: "percentage",
        label: "Percentage",
        render: () => null, // Not displayed
        sortable: true,
        hidden: true,
        sortFn: (a, b) => (a.percentage || 0) - (b.percentage || 0),
        filterConfig: {
          id: "percentage",
          type: "multiple",
          label: t("guests.attendance"),
          options: [
            { value: "0", label: "0%" },
            { value: "25", label: "25%" },
            { value: "50", label: "50%" },
            { value: "75", label: "75%" },
            { value: "100", label: "100%" },
          ],
        },
      },
      {
        id: "cellphone",
        label: "Phone",
        render: () => null, // Not displayed
        sortable: true,
        hidden: true,
        filterConfig: {
          id: "cellphone",
          type: "multiple",
          label: t("guests.cellphone"),
          options: [
            { value: "has_phone", label: "Has Phone" },
            { value: "no_phone", label: "No Phone" },
          ],
        },
      },
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
      }
    );

    // Only show sent status column for admins
    if (isAdmin) {
      columns.push({
        id: "templateSent",
        label: t("rsvpStatusTab.sent"),
        sortable: true,
        sortFn: (a, b) => {
          const statusOrder = { sent: 4, failed: 3, notSent: 2, all: 1 };
          const aOrder =
            statusOrder[a.templateSent as keyof typeof statusOrder] || 2;
          const bOrder =
            statusOrder[b.templateSent as keyof typeof statusOrder] || 2;
          return aOrder - bOrder;
        },
        filterConfig: {
          id: "templateSent",
          type: "single",
          label: t("rsvpStatusTab.sent"),
          options: [
            { value: "sent", label: t("rsvpStatusTab.sent") },
            { value: "failed", label: t("rsvpStatusTab.failed") },
            { value: "notSent", label: t("rsvpStatusTab.notSent") },
          ],
        },
        render: (row) => {
          if (!selectedTemplate) {
            return (
              <Typography variant="body2" color="text.disabled">
                {t("rsvpStatusTab.selectTemplateFirst")}
              </Typography>
            );
          }
          if (row.templateSent === "sent") {
            // Show message type in a single elegant chip
            const messageTypes = (row as any).sentMessageTypes || [];
            const hasWhatsApp = messageTypes.includes("whatsapp");
            const hasSMS = messageTypes.includes("sms");
            const hasPersonalWhatsApp =
              messageTypes.includes("personal-whatsapp");

            let label = t("rsvpStatusTab.sent");

            // Determine the appropriate label based on message types
            const totalTypes = [
              hasWhatsApp,
              hasSMS,
              hasPersonalWhatsApp,
            ].filter(Boolean).length;

            if (totalTypes > 1) {
              label = `${t("rsvpStatusTab.sent")} (Multiple)`;
            } else if (hasSMS) {
              label = `${t("rsvpStatusTab.sent")} (SMS)`;
            } else if (hasPersonalWhatsApp) {
              label = `${t("rsvpStatusTab.sent")} (Personal WA)`;
            } else if (hasWhatsApp) {
              label = `${t("rsvpStatusTab.sent")} (WA)`;
            }

            return (
              <Chip
                icon={<MessageIcon />}
                label={label}
                size="small"
                color="success"
                sx={{
                  maxWidth: "none",
                  "& .MuiChip-label": {
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    textOverflow: "unset",
                    fontSize: "0.75rem",
                  },
                }}
              />
            );
          } else if (row.templateSent === "failed") {
            // Show failed message with message type information
            const messageTypes = (row as any).sentMessageTypes || [];
            const hasWhatsApp = messageTypes.includes("whatsapp");
            const hasSMS = messageTypes.includes("sms");
            const hasPersonalWhatsApp =
              messageTypes.includes("personal-whatsapp");

            let label = t("rsvpStatusTab.failed");

            // Add message type to failed label for context
            if (hasSMS) {
              label = `${t("rsvpStatusTab.failed")} (SMS)`;
            } else if (hasPersonalWhatsApp) {
              label = `${t("rsvpStatusTab.failed")} (Personal WA)`;
            } else if (hasWhatsApp) {
              label = `${t("rsvpStatusTab.failed")} (WA)`;
            }

            return (
              <Chip
                icon={<ErrorIcon />}
                label={label}
                size="small"
                color="error"
                sx={{
                  maxWidth: "none",
                  "& .MuiChip-label": {
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    textOverflow: "unset",
                    fontSize: "0.75rem",
                  },
                }}
              />
            );
          } else {
            return (
              <Chip
                icon={<MessageIcon />}
                label={t("rsvpStatusTab.notSent")}
                size="small"
                color="default"
                variant="outlined"
              />
            );
          }
        },
      });
    }

    return columns;
  }, [t, questions, selectedTemplate, wedding?.id, isAdmin]);
};
