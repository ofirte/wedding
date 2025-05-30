import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  styled,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../api/firebaseConfig";
import { useTranslation } from "../../localization/LocalizationContext";

// Styled component for the file input
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface UploadFileProps {
  onUploadComplete?: (url: string) => void;
  uploadPath?: string;
  buttonText?: string;
  fileTypes?: string;
  existingFileUrl?: string;
  buttonColor?: string;
  buttonHoverColor?: string;
  disabled?: boolean;
}

export const UploadFile: React.FC<UploadFileProps> = ({
  onUploadComplete,
  uploadPath = "contracts",
  buttonText = "Upload File",
  fileTypes = ".pdf,.doc,.docx,.jpg,.png",
  buttonColor = "#9c88ff",
  buttonHoverColor = "#8c78ef",
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const timestamp = new Date().getTime();
      const fileRef = ref(storage, `${uploadPath}/${timestamp}_${file.name}`);
      const metadata = {
        contentType: file.type,
        customMetadata: {
          "Access-Control-Allow-Origin":
            "http://localhost:3000,https://wedding-c89a1.firebaseapp.com,https://wedding-c89a1.web.app",
        },
      };
      await uploadBytes(fileRef, file, metadata);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      throw new Error(
        `Failed to upload file to Firebase Storage: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");

    try {
      const url = await handleFileUpload(file);
      if (onUploadComplete) {
        onUploadComplete(url);
      }
    } catch (error) {
      setUploadError(t("common.uploadError"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{
            bgcolor: buttonColor,
            "&:hover": {
              bgcolor: buttonHoverColor,
            },
          }}
          disabled={disabled || uploading}
        >
          {buttonText}
          <VisuallyHiddenInput
            type="file"
            onChange={handleFileChange}
            accept={fileTypes}
          />
        </Button>
        {uploading && <CircularProgress size={24} />}
        {uploadError && (
          <Typography variant="body2" color="error">
            {uploadError}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
