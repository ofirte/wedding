import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
} from "@mui/material";
import { CreateWeddingForm, WeddingFormValues } from "./CreateWeddingForm";
import { Wedding } from "@shared/src/models/wedding";
import { useTranslation } from "src/localization/LocalizationContext";
import CloseIcon from "@mui/icons-material/Close";
import { useCreateWedding } from "src/hooks/wedding/useCreateWedding";
import { useCurrentUser, useUpdateUser } from "src/hooks/auth";

export function CreateWeddingDialog({
  open,
  onClose,
  onAccept,
  initialValues,
}: {
  open: boolean;
  onClose: () => void;
  onAccept: (newWeddingId: string) => void;
  initialValues?: Partial<WeddingFormValues>;
}) {
  const { mutateAsync: updateUser } = useUpdateUser();
  const { data: currentUser } = useCurrentUser();

  const { mutate: createWedding } = useCreateWedding({
    onSuccess: async (weddingId) => {
      await updateUser({
        userData: {
          weddingIds: [...(currentUser?.weddingIds || []), weddingId],
        },
      });
      onAccept(weddingId);
    },
  });
  const handleFormSubmit = (
    weddingData: Omit<Wedding, "id" | "createdAt" | "userIds" | "members">,
    userId: string
  ) => {
    console.log(userId, "Creating wedding with data:", weddingData);
    createWedding({ weddingData, userId });
    onClose();
  };
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 1,
        }}
      >
        <DialogTitle>{t("weddingSettings.title")}</DialogTitle>
        <DialogActions>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
      </Box>
      <DialogContent dividers>
        <CreateWeddingForm
          onSubmit={handleFormSubmit}
          defaultValues={initialValues}
        />
      </DialogContent>
    </Dialog>
  );
}
