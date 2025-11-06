import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Snackbar,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";

import { useTranslation } from "src/localization/LocalizationContext";
import { useUpdateUserRole } from "src/hooks/auth/useUpdateUserRole";
import { UserTable } from "./UserTable";
import { EditUserDialog } from "./EditUserDialog";
import { useUsersInfo } from "src/hooks/auth";
import { UserInfo } from "src/hooks/auth/useUsersInfo";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteUserDialog } from "./deleteUserDialog";
import { useDeleteUser } from "src/hooks/auth/useDeleteUser";
import { InviteProducerDialog } from "./InviteProducerDialog";
import { InvitationsTable } from "./InvitationsTable";
import { useSendProducerInvitation } from "src/hooks/invitations/useSendProducerInvitation";
import { useListInvitations } from "src/hooks/invitations/useListInvitations";


const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserInfo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all users using the custom hook
  const { data: users, isLoading, error } = useUsersInfo();

  // Fetch invitations
  const { data: invitationsData, isLoading: isLoadingInvitations } = useListInvitations("all");

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

  // Invitation handlers
  const { mutate: sendInvitation, isPending: isSendingInvitation } =
    useSendProducerInvitation({
      onSuccess: (data) => {
        setInviteDialogOpen(false);
        setInvitationError(null);
        setSnackbarMessage(`Invitation sent successfully to ${data.email}`);
        setSnackbarOpen(true);
        queryClient.invalidateQueries({ queryKey: ["invitations"] });
      },
      onError: (error: any) => {
        setInvitationError(error.message || "Failed to send invitation");
      },
    });

  const handleSendInvitation = (email: string, language: "en" | "he") => {
    setInvitationError(null);
    sendInvitation({ email, language });
  };

  const handleOpenInviteDialog = () => {
    setInvitationError(null);
    setInviteDialogOpen(true);
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
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t("userManagement.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("userManagement.description")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={handleOpenInviteDialog}
          sx={{ height: "fit-content" }}
        >
          Invite Producer
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Users" />
          <Tab label="Invitations" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <UserTable
          users={users.users}
          onEditUser={handleSelectEditUser}
          onDeleteUser={handleSelectDeleteUser}
          isUpdating={isPendingUserUpdate}
        />
      )}

      {activeTab === 1 && (
        <>
          {isLoadingInvitations ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <InvitationsTable
              invitations={invitationsData?.invitations || []}
              onSuccess={(message) => {
                setSnackbarMessage(message);
                setSnackbarOpen(true);
              }}
              onError={(message) => {
                setSnackbarMessage(message);
                setSnackbarOpen(true);
              }}
            />
          )}
        </>
      )}

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
      <InviteProducerDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        onSend={handleSendInvitation}
        isLoading={isSendingInvitation}
        error={invitationError}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default UserManagementPage;
