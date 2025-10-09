import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import { useParams } from "react-router";
import {
  useAddUserToWedding,
  useRemoveUserFromWedding,
  useUpdateUserWeddingRole,
  useFindUserByEmail,
} from "../../hooks/auth/useCustomClaims";

const WeddingMemberManagement: React.FC = () => {
  const { weddingId } = useParams<{ weddingId: string }>();

  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"bride" | "groom" | "admin">(
    "admin"
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const addUserMutation = useAddUserToWedding();
  const removeUserMutation = useRemoveUserFromWedding();
  const updateRoleMutation = useUpdateUserWeddingRole();
  const findUserMutation = useFindUserByEmail();

  const handleAddUser = async () => {
    if (!email || !weddingId) return;

    try {
      const result = await addUserMutation.mutateAsync({
        email,
        weddingId,
        role: selectedRole,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: `Successfully added ${email} to the wedding with role: ${selectedRole}`,
        });
        setEmail("");
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to add user to wedding",
      });
    }
  };

  const handleFindUser = async () => {
    if (!email) return;

    try {
      const result = await findUserMutation.mutateAsync(email);

      if (result.success && result.user) {
        setMessage({
          type: "success",
          text: `Found user: ${result.user.displayName || result.user.email}`,
        });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "User not found",
      });
    }
  };

  const isLoading =
    addUserMutation.isPending ||
    removeUserMutation.isPending ||
    updateRoleMutation.isPending ||
    findUserMutation.isPending;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Wedding Member Management
        </Typography>

        {message && (
          <Alert
            severity={message.type}
            onClose={() => setMessage(null)}
            sx={{ mb: 2 }}
          >
            {message.text}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Member
          </Typography>

          <Stack
            spacing={2}
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
          >
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                label="Role"
                onChange={(e) =>
                  setSelectedRole(e.target.value as "bride" | "groom" | "admin")
                }
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="bride">Bride</MenuItem>
                <MenuItem value="groom">Groom</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={handleFindUser}
              disabled={isLoading || !email}
              size="small"
            >
              {findUserMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                "Find User"
              )}
            </Button>

            <Button
              variant="contained"
              onClick={handleAddUser}
              disabled={isLoading || !email || !weddingId}
              size="small"
            >
              {addUserMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                "Add Member"
              )}
            </Button>
          </Stack>
        </Box>

        {findUserMutation.data?.user && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              User Found
            </Typography>
            <Box>
              <Chip
                label={
                  findUserMutation.data.user.displayName ||
                  findUserMutation.data.user.email
                }
                color="primary"
                size="small"
              />
              <Typography variant="caption" sx={{ ml: 1 }}>
                {findUserMutation.data.user.email}
              </Typography>
            </Box>
          </Paper>
        )}

        <Typography variant="body2" color="text.secondary">
          Note: Users must have an account to be added to the wedding. The
          system will look up users by their email address.
        </Typography>
      </Paper>
    </Box>
  );
};

export default WeddingMemberManagement;
