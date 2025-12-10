import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { UploadFile } from "../common/UploadFile";
import { useTranslation } from "../../localization/LocalizationContext";

interface ContractManageDialogProps {
  open: boolean;
  onClose: () => void;
  contracts: string[];
  onUpload: (url: string) => void;
  onDelete: (url: string) => void;
}

// Extract filename from Firebase Storage URL
const extractFilename = (url: string): string => {
  try {
    // URL format: .../contracts%2F[timestamp]_[filename]?...
    const decodedUrl = decodeURIComponent(url);
    const match = decodedUrl.match(/contracts\/\d+_(.+?)(?:\?|$)/);
    if (match && match[1]) {
      return match[1];
    }
    // Fallback: get last segment
    const segments = url.split("/");
    const lastSegment = segments[segments.length - 1].split("?")[0];
    return lastSegment;
  } catch {
    return "Contract";
  }
};

const ContractManageDialog: React.FC<ContractManageDialogProps> = ({
  open,
  onClose,
  contracts,
  onUpload,
  onDelete,
}) => {
  const { t } = useTranslation();

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("budget.manageContracts")}</DialogTitle>
      <DialogContent>
        {contracts.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            {t("budget.noContracts")}
          </Typography>
        ) : (
          <List dense>
            {contracts.map((url, index) => (
              <ListItem
                key={index}
                sx={{
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <PictureAsPdfIcon sx={{ mr: 1, color: "error.main" }} />
                <ListItemText
                  primary={extractFilename(url)}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { maxWidth: 250 },
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(url)}
                    color="primary"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(url)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        <Box sx={{ mt: 2 }}>
          <UploadFile
            onUploadComplete={onUpload}
            uploadPath="contracts"
            buttonText={t("budget.addContract")}
            fileTypes=".pdf,.doc,.docx,.jpg,.png"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractManageDialog;
