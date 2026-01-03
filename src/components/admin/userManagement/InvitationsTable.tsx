import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import { Send as SendIcon, Block as BlockIcon } from "@mui/icons-material";
import { InvitationData } from "@wedding-plan/types";
import { format } from "date-fns";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useResendInvitation } from "../../../hooks/invitations/useResendInvitation";
import { useRevokeInvitation } from "../../../hooks/invitations/useRevokeInvitation";
import { useQueryClient } from "@tanstack/react-query";

interface InvitationsTableProps {
  invitations: InvitationData[];
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const InvitationsTable: React.FC<InvitationsTableProps> = ({
  invitations,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: resendInvitation, isPending: isResending } =
    useResendInvitation({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["invitations"] });
        onSuccess?.(t("invitations.resendSuccess"));
      },
      onError: (error: any) => {
        onError?.(error.message || t("invitations.invitationError"));
      },
    });

  const { mutate: revokeInvitation, isPending: isRevoking } =
    useRevokeInvitation({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["invitations"] });
        onSuccess?.(t("invitations.revokeSuccess"));
      },
      onError: (error: any) => {
        onError?.(error.message || t("invitations.invitationError"));
      },
    });

  const handleResend = (invitationId: string) => {
    resendInvitation({ invitationId });
  };

  const handleRevoke = (invitationId: string) => {
    revokeInvitation({ invitationId });
  };

  const getStatusColor = (
    status: string
  ): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case "pending":
        return "warning";
      case "used":
        return "success";
      case "expired":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "pending":
        return t("invitations.statuses.pending");
      case "used":
        return t("invitations.statuses.used");
      case "expired":
        return t("invitations.statuses.expired");
      default:
        return status;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const isLoading = isResending || isRevoking;

  if (invitations.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {t("invitations.noInvitations")}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "grey.50" }}>
            <TableCell><strong>{t("invitations.email")}</strong></TableCell>
            <TableCell><strong>{t("invitations.status")}</strong></TableCell>
            <TableCell><strong>{t("invitations.invitedBy")}</strong></TableCell>
            <TableCell><strong>{t("invitations.sentAt")}</strong></TableCell>
            <TableCell><strong>{t("invitations.expiresAt")}</strong></TableCell>
            <TableCell align="right"><strong>{t("invitations.actions")}</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {invitation.email}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(invitation.status)}
                  color={getStatusColor(invitation.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {invitation.inviterName || t("common.unknown")}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(invitation.createdAt)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(invitation.expiresAt)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  {invitation.status === "pending" && (
                    <>
                      <Tooltip title={t("invitations.resendTooltip")}>
                        <IconButton
                          size="small"
                          onClick={() => handleResend(invitation.id)}
                          disabled={isLoading}
                          color="primary"
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("invitations.revokeTooltip")}>
                        <IconButton
                          size="small"
                          onClick={() => handleRevoke(invitation.id)}
                          disabled={isLoading}
                          color="error"
                        >
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {invitation.status === "used" && (
                    <Typography variant="caption" color="success.main">
                      {t("invitations.statuses.used")} {invitation.usedAt ? formatDate(invitation.usedAt) : ""}
                    </Typography>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
