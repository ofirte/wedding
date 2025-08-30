import { useMemo } from "react";
import { Box, Typography, Chip } from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Group as GroupIcon,
  Hotel as HotelIcon,
  DirectionsBus as BusIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { Column } from "../common/DSTable";
import { RSVPStatus } from "../../api/rsvp/rsvpStatusTypes";
import { Invitee } from "../invitees/InviteList";
import { isNil } from "lodash";
import { useTranslation } from "../../localization/LocalizationContext";

export type InviteeWithRSVP = Invitee & {
  rsvpStatus?: RSVPStatus;
  templateSent?: "sent" | "notSent" | "all";
};

interface UseRSVPTableColumnsProps {
  selectedTemplates: string[];
  sentMessages: any[];
}

/**
 * useRSVPTableColumns - The blueprint for RSVP data presentation
 *
 * This hook tells the story of what matters in RSVP management:
 * 1. Guest Identity (name, phone) - Who are we tracking?
 * 2. Attendance Status - Are they coming?
 * 3. Event Details (guest count, sleepover, transport) - What are their needs?
 * 4. Process Status (submitted, messages sent) - Where are we in the workflow?
 *
 * Each column is crafted to tell part of the wedding planning story.
 */
export const useRSVPTableColumns = ({
  selectedTemplates,
  sentMessages,
}: UseRSVPTableColumnsProps): Column<InviteeWithRSVP>[] => {
  const { t } = useTranslation();

  return useMemo(
    (): Column<InviteeWithRSVP>[] => [
      // Guest Identity Section
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
      {
        id: "phone",
        label: t("rsvpStatusTab.phone"),
        sortable: true,
        render: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.cellphone || "-"}
          </Typography>
        ),
      },

      // Attendance Decision Section
      {
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
            { value: null, label: t("rsvpStatusTab.pending") },
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
      },

      // Event Planning Details Section
      {
        id: "guestCount",
        label: t("rsvpStatusTab.guestCount"),
        render: (row) => {
          const status = row.rsvpStatus;
          if (isNil(status?.amount)) return "-";
          return (
            <Box display="flex" alignItems="center" gap={0.5}>
              <GroupIcon fontSize="small" color="action" />
              <Typography variant="body2">{status?.amount || 0}</Typography>
            </Box>
          );
        },
        sortable: true,
        sortFn: (a, b) => {
          const aCount = a.rsvpStatus?.amount || 0;
          const bCount = b.rsvpStatus?.amount || 0;
          return aCount - bCount;
        },
      },
      {
        id: "sleepover",
        label: t("rsvpStatusTab.sleepoverColumn"),
        sortable: true,
        filterConfig: {
          id: "sleepover",
          type: "multiple",
          label: t("rsvpStatusTab.sleepoverColumn"),
          options: [
            { value: true, label: t("common.yes") },
            { value: false, label: t("common.no") },
            { value: null, label: "-" },
          ],
        },
        sortFn: (a, b) => {
          const aSleepover = a.rsvpStatus?.sleepover;
          const bSleepover = b.rsvpStatus?.sleepover;

          if (aSleepover === bSleepover) return 0;
          if (aSleepover === true && bSleepover !== true) return -1;
          if (bSleepover === true && aSleepover !== true) return 1;
          if (aSleepover === false && isNil(bSleepover)) return -1;
          if (bSleepover === false && isNil(aSleepover)) return 1;
          return 0;
        },
        render: (row) => {
          const status = row.rsvpStatus;
          if (isNil(status?.sleepover)) return "-";
          return status?.sleepover ? (
            <HotelIcon color="primary" fontSize="small" />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("rsvpStatusTab.noData")}
            </Typography>
          );
        },
      },
      {
        id: "ride",
        label: t("rsvpStatusTab.transportationColumn"),
        sortable: true,
        filterConfig: {
          id: "ride",
          type: "multiple",
          label: t("rsvpStatusTab.transportationColumn"),
          options: [
            { value: true, label: t("common.yes") },
            { value: false, label: t("common.no") },
            { value: null, label: "-" },
          ],
        },
        sortFn: (a, b) => {
          const aRide = a.rsvpStatus?.rideFromTelAviv;
          const bRide = b.rsvpStatus?.rideFromTelAviv;

          if (aRide === bRide) return 0;
          if (aRide === true && bRide !== true) return -1;
          if (bRide === true && aRide !== true) return 1;
          if (aRide === false && isNil(bRide)) return -1;
          if (bRide === false && isNil(aRide)) return 1;
          return 0;
        },
        render: (row) => {
          const status = row.rsvpStatus;
          if (isNil(status?.rideFromTelAviv)) return "-";
          return status?.rideFromTelAviv ? (
            <BusIcon color="primary" fontSize="small" />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("rsvpStatusTab.noData")}
            </Typography>
          );
        },
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
      },
    ],
    [t, selectedTemplates, sentMessages]
  );
};
