import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { FC } from "react";
import { useTranslation } from "src/localization/LocalizationContext";
import {
  useUpdateUser,
  useUsersByIds,
} from "src/hooks/auth";
import { UserInfo } from "src/hooks/auth/useUsersInfo";
import { arrayRemove } from "firebase/firestore";
import { useRemoveUserFromWedding } from "src/hooks/wedding/userRemoveUserFromWedding";

type WeddingMembersDeleteDialogProps = {
  open: boolean;
  memberId: string;
  weddingId: string;
  onClose: () => void;
};

export const WeddingMembersDeleteDialog: FC<
  WeddingMembersDeleteDialogProps
> = ({ open, memberId, weddingId, onClose }) => {
  const { t } = useTranslation();
  const { data: userInfoData } = useUsersByIds([memberId]);
  const { mutate: removeUserFromWedding } = useRemoveUserFromWedding({
    onSuccess: () => {
      onClose();
    },
  });
  const userInfo = (userInfoData ?? []).find(
    (user: UserInfo) => user.uid === memberId
  );
  const { mutate: updateUser } = useUpdateUser({
    onSuccess: () => {
      removeUserFromWedding({ userId: memberId, weddingId });
    },
  });
  const handleDeleteUser = () => {
    updateUser({
      userId: memberId,
      userData: {
        weddingIds: arrayRemove(memberId),
      },
    });
  };
  return (
    <Dialog open={open}>
      <DialogTitle>{t("weddingManagement.deleteMember")}</DialogTitle>
      <DialogContent>
        <Typography>{t("weddingManagement.confirmDeleteMember")}</Typography>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          {userInfo?.displayName || userInfo?.email || memberId}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDeleteUser} color="primary">
          {t("weddingManagement.confirm")}
        </Button>
        <Button onClick={onClose} color="secondary">
          {t("weddingManagement.cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
