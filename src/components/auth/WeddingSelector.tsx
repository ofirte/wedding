import React, { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useWedding } from "../../context/WeddingContext";
import { useQuery } from "@tanstack/react-query";
import { Wedding } from "../../api/auth/authApi";

interface WeddingSelectorProps {
  userId: string;
  onlyShowForAdmins?: boolean;
}

// This would be implemented in API to fetch all weddings a user has access to
const fetchUserWeddings = async (userId: string): Promise<Wedding[]> => {
  // This would be implemented to fetch from Firebase
  // For now, returning an empty array as placeholder
  return [];
};

/**
 * A component that allows users with access to multiple weddings to switch between them
 * Only shown for admin users by default
 */
export const WeddingSelector: React.FC<WeddingSelectorProps> = ({
  userId,
  onlyShowForAdmins = true,
}) => {
  const { currentWeddingId, setCurrentWeddingId } = useWedding();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Fetch weddings this user has access to
  const { data: weddings, isLoading } = useQuery({
    queryKey: ["userWeddings", userId],
    queryFn: () => fetchUserWeddings(userId),
    enabled: !!userId,
  });

  // Check if user is an admin (has access to multiple weddings)
  React.useEffect(() => {
    if (weddings && weddings.length > 1) {
      setIsAdmin(true);
    }
  }, [weddings]);

  // If not an admin and we're only showing for admins, don't render anything
  if (onlyShowForAdmins && !isAdmin) {
    return null;
  }

  const handleChange = (event: SelectChangeEvent) => {
    const weddingId = event.target.value;
    setCurrentWeddingId(weddingId);
  };

  if (isLoading) {
    return <CircularProgress size={20} />;
  }

  // If user only has access to one wedding, just show the name
  if (weddings && weddings.length <= 1) {
    const wedding = weddings?.[0];
    return (
      <Box sx={{ minWidth: 120, p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Current Wedding: {wedding?.name || "None"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 200, p: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="wedding-selector-label">Wedding</InputLabel>
        <Select
          labelId="wedding-selector-label"
          id="wedding-selector"
          value={currentWeddingId || ""}
          label="Wedding"
          onChange={handleChange}
        >
          {weddings?.map((wedding) => (
            <MenuItem key={wedding.id} value={wedding.id}>
              {wedding.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default WeddingSelector;
