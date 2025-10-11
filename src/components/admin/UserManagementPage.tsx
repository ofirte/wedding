import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { WeddingUser } from "../../api/auth/authApi";
import { useTranslation } from "../../localization/LocalizationContext";
import { useAllUsers } from "../../hooks/auth/useAllUsers";
import { useUpdateUserRole } from "../../hooks/auth/useUpdateUserRole";
import { UserTable } from "./UserTable";
import { EditUserDialog } from "./EditUserDialog";

const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [editingUser, setEditingUser] = useState<WeddingUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch all users using the custom hook
  const { data: users = [], isLoading, error } = useAllUsers();

  // Update user role mutation using the custom hook
  const updateUserRoleMutation = useUpdateUserRole({
    onSuccess: () => {
      setEditDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      console.error("Error updating user:", error);
    },
  });

  const handleEditUser = (user: WeddingUser) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleSaveUser = (userId: string, role: string) => {
    updateUserRoleMutation.mutate({ userId, role });
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{t("userManagement.errorLoadingUsers")}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("userManagement.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("userManagement.description")}
        </Typography>
      </Box>

      <UserTable
        users={users}
        onEditUser={handleEditUser}
        isUpdating={updateUserRoleMutation.isPending}
      />

      <EditUserDialog
        open={editDialogOpen}
        user={editingUser}
        onClose={handleCloseDialog}
        onSave={handleSaveUser}
        isLoading={updateUserRoleMutation.isPending}
      />

      {updateUserRoleMutation.isPending && (
        <Box position="fixed" top={16} right={16}>
          <Alert severity="info" icon={<CircularProgress size={20} />}>
            {t("userManagement.updating")}
          </Alert>
        </Box>
      )}

      {updateUserRoleMutation.isSuccess && (
        <Box position="fixed" top={16} right={16}>
          <Alert severity="success">{t("userManagement.updateSuccess")}</Alert>
        </Box>
      )}

      {updateUserRoleMutation.isError && (
        <Box position="fixed" top={16} right={16}>
          <Alert severity="error">{t("userManagement.updateError")}</Alert>
        </Box>
      )}
    </Container>
  );
};

export default UserManagementPage;
