import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

import { useTranslation } from "src/localization/LocalizationContext";
import { useUpdateUserRole } from "src/hooks/auth/useUpdateUserRole";
import { UserTable } from "./UserTable";
import { EditUserDialog } from "./EditUserDialog";
import { useUsersInfo } from "src/hooks/auth";
import { UserInfo } from "src/hooks/auth/useUsersInfo";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteUserDialog } from "./deleteUserDialog";
import { useDeleteUser } from "src/hooks/auth/useDeleteUser";


const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserInfo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  // Fetch all users using the custom hook
  const { data: users, isLoading, error } = useUsersInfo();

  const { mutate: deleteUser, isPending: isPendingUserDelete } = useDeleteUser({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersInfo"] });
      handleCloseDeleteDialog();
    },
  });
  const { mutate: updateUser, isPending: isPendingUserUpdate } =
    useUpdateUserRole({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["usersInfo"] });
        handleCloseDialog();
      },
      onError: (error) => {
        console.error("Error updating user:", error);
      },
    });

  const handleSelectEditUser = (user: UserInfo) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleSelectDeleteUser = (user: UserInfo) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSaveUser = (userId: string, role: string) => {
    updateUser({ userId, role });
  };

  const handleDeleteUser = (userId: string) => {
    console.log("here");
    deleteUser(userId);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingUser(null);
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
  if (!users) {
    return null;
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
        users={users.users}
        onEditUser={handleSelectEditUser}
        onDeleteUser={handleSelectDeleteUser}
        isUpdating={isPendingUserUpdate}
      />

      <EditUserDialog
        open={editDialogOpen}
        user={editingUser}
        onClose={handleCloseDialog}
        onSave={handleSaveUser}
        isLoading={isPendingUserUpdate}
      />
      <DeleteUserDialog
        open={deleteDialogOpen}
        user={deletingUser}
        onClose={handleCloseDeleteDialog}
        onDelete={handleDeleteUser}
        isLoading={isPendingUserDelete}
      />
    </Container>
  );
};

export default UserManagementPage;
