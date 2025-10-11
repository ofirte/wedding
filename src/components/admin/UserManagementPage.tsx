import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, WeddingUser } from "../../api/auth/authApi";
import { setUserRole, setGlobalAdmin } from "../../api/firebaseFunctions";
import { useTranslation } from "../../localization/LocalizationContext";

interface EditUserDialogProps {
  open: boolean;
  user: WeddingUser | null;
  onClose: () => void;
  onSave: (userId: string, role: string, isAdmin: boolean) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  user,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [role, setRole] = useState(user?.role || "user");
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin || false);

  React.useEffect(() => {
    if (user) {
      setRole(user.role || "user");
      setIsAdmin(user.isAdmin || false);
    }
  }, [user]);

  const handleSave = () => {
    if (user) {
      onSave(user.uid, role, isAdmin);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("userManagement.editUser")} - {user.displayName || user.email}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("userManagement.userInfo")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("common.emailAddress")}: {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("userManagement.userId")}: {user.uid}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("userManagement.joinedAt")}:{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : t("common.notAvailable")}
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel>{t("userManagement.defaultRole")}</InputLabel>
            <Select
              value={role}
              label={t("userManagement.defaultRole")}
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="user">{t("userManagement.roles.user")}</MenuItem>
              <MenuItem value="producer">
                {t("userManagement.roles.producer")}
              </MenuItem>
              <MenuItem value="admin">
                {t("userManagement.roles.admin")}
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>{t("userManagement.globalAdmin")}</InputLabel>
            <Select
              value={isAdmin ? "true" : "false"}
              label={t("userManagement.globalAdmin")}
              onChange={(e) => setIsAdmin(e.target.value === "true")}
            >
              <MenuItem value="false">{t("common.no")}</MenuItem>
              <MenuItem value="true">{t("common.yes")}</MenuItem>
            </Select>
          </FormControl>

          <Alert severity="info">{t("userManagement.editUserWarning")}</Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={handleSave} variant="contained">
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<WeddingUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch all users
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", "all"],
    queryFn: () => authApi.fetchAll(),
    refetchOnWindowFocus: false,
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
      isAdmin,
    }: {
      userId: string;
      role: string;
      isAdmin: boolean;
    }) => {
      // Update both role and admin status
      await Promise.all([
        setUserRole({ userId: userId, role }),
        setGlobalAdmin({ userId, isAdmin }),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
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

  const handleSaveUser = (userId: string, role: string, isAdmin: boolean) => {
    updateUserRoleMutation.mutate({ userId, role, isAdmin });
  };

  const getRoleChip = (user: WeddingUser) => {
    const role = user.role || "user";
    const isAdmin = user.isAdmin || false;

    if (isAdmin) {
      return (
        <Chip
          icon={<AdminIcon />}
          label={t("userManagement.globalAdmin")}
          color="error"
          size="small"
        />
      );
    }

    const roleColors = {
      admin: "warning" as const,
      producer: "info" as const,
      user: "default" as const,
    };

    return (
      <Chip
        icon={<UserIcon />}
        label={t(`userManagement.roles.${role}`)}
        color={roleColors[role as keyof typeof roleColors] || "default"}
        size="small"
      />
    );
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

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t("userManagement.user")}</TableCell>
                <TableCell>{t("common.emailAddress")}</TableCell>
                <TableCell>{t("userManagement.role")}</TableCell>
                <TableCell>{t("userManagement.joinedAt")}</TableCell>
                <TableCell align="center">{t("common.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        alt={user.displayName || "User"}
                        src={user.photoURL || undefined}
                        sx={{ width: 32, height: 32 }}
                      >
                        {user.displayName?.[0] || user.email?.[0] || "U"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.displayName ||
                            t("userManagement.noDisplayName")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.uid.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleChip(user)}</TableCell>
                  <TableCell>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : t("common.notAvailable")}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleEditUser(user)}
                      size="small"
                      disabled={updateUserRoleMutation.isPending}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {users.length === 0 && (
          <Box p={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              {t("userManagement.noUsers")}
            </Typography>
          </Box>
        )}
      </Paper>

      <EditUserDialog
        open={editDialogOpen}
        user={editingUser}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
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
