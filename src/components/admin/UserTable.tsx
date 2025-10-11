import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { WeddingUser } from "../../api/auth/authApi";
import { useTranslation } from "../../localization/LocalizationContext";
import { UserAvatar } from "./UserAvatar";
import { UserRoleChip } from "./UserRoleChip";

interface UserTableProps {
  users: WeddingUser[];
  onEditUser: (user: WeddingUser) => void;
  isUpdating?: boolean;
}

/**
 * Table component displaying all users with their information and actions
 */
export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  isUpdating = false,
}) => {
  const { t } = useTranslation();

  return (
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
                  <UserAvatar user={user} showDetails />
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <UserRoleChip user={user} />
                </TableCell>
                <TableCell>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : t("common.notAvailable")}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => onEditUser(user)}
                    size="small"
                    disabled={isUpdating}
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
  );
};
