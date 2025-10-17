import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";

import { useTranslation } from "../../localization/LocalizationContext";
import { UserSelect } from "../common/UserSelect";
import { WeddingMembersTable } from "./WeddingMembersTable";
import { ExpandMore, PersonAdd } from "@mui/icons-material";
import { useWeddingDetails } from "../../hooks/auth";
import { WeddingPlans } from "@wedding-plan/types";

interface WeddingDetailsDialogProps {
  open: boolean;
  weddingId: string;
  onClose: () => void;
  onSave: (weddingId: string, userId: string, plan: string) => void;
  isLoading?: boolean;
}

/**
 * Dialog component for adding a user to a wedding
 */
export const WeddingDetailsDialog: React.FC<WeddingDetailsDialogProps> = ({
  open,
  weddingId,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const { data: wedding } = useWeddingDetails(weddingId);

  const { t } = useTranslation();
  const [userId, setUserId] = useState("");
  const [plan, setPlan] = useState(WeddingPlans.FREE);
  const weddingMembers = useMemo(() => {
    return wedding?.members ?? {};
  }, [wedding]);
  useEffect(() => {
    if (wedding) {
      setUserId("");
      setPlan(WeddingPlans.FREE);
    }
  }, [wedding]);

  const handleSave = () => {
    if (wedding && userId) {
      onSave(wedding.id, userId, plan);
    }
  };

  if (!wedding) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h4">{wedding.name}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
              mx: 4,
            }}
          >
            <Box sx={{ flex: 0.8 }}>
              <UserSelect
                value={userId}
                onChange={setUserId}
                disabled={isLoading}
                label={t("weddingManagement.selectUser")}
                helperText={t("weddingManagement.userIdHelper")}
              />
            </Box>

            <Box
              sx={{ flex: 0.2, display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={isLoading || !userId}
                sx={{ height: 50 }}
                startIcon={<PersonAdd />}
                fullWidth
              >
                {t("weddingManagement.addUserToWedding")}
              </Button>
            </Box>
          </Box>

          <WeddingMembersTable
            weddingId={wedding.id}
            members={weddingMembers}
          />
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  {t("weddingManagement.weddingInfo")}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {t("weddingManagement.weddingName")}: {wedding.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("weddingManagement.weddingId")}: {wedding.id}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t("weddingManagement.currentMembers")}:{" "}
                {wedding.members ? Object.keys(wedding.members).length : 0}
              </Typography>
              {wedding.invitationCode && (
                <Typography variant="body2" color="text.secondary">
                  {t("weddingManagement.invitationCode")}:{" "}
                  {wedding.invitationCode}
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
