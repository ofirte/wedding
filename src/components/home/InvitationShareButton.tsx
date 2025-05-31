import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useTheme,
} from "@mui/material";
import { Share as ShareIcon, Close as CloseIcon } from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import InvitationShareCard from "./InvitationShareCard";

const InvitationShareButton: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<ShareIcon />}
        onClick={handleOpenModal}
        size="small"
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
          color: "white",
          fontWeight: "bold",
          borderRadius: 2,
          textTransform: "none",
          px: 2,
          py: 1,
          fontSize: "0.875rem",
          boxShadow: 2,
          "&:hover": {
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
            boxShadow: 3,
          },
        }}
      >
        {t("common.shareWedding")}
      </Button>

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: `linear-gradient(135deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
            color: "white",
            fontWeight: "bold",
            py: 2,
          }}
        >
          {t("common.shareWedding")}
          <IconButton
            onClick={handleCloseModal}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <InvitationShareCard isModal />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvitationShareButton;
