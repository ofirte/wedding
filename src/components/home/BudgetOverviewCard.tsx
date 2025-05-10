import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  useTheme,
  Stack,
  LinearProgress,
  styled,
} from "@mui/material";
import { ArrowForward as ArrowIcon } from "@mui/icons-material";
import { useNavigate } from "react-router";
// Styled LinearProgress for better visualization
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 5,
  },
}));

// Format currency for budget display
const formatCurrency = (amount: number): string => {
  return "₪" + amount.toLocaleString();
};

interface BudgetOverviewCardProps {
  budgetStats: {
    total: number;
    spent: number;
    remaining: number;
  };
}

const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  budgetStats,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Budget Overview</Typography>
        <Button
          size="small"
          endIcon={<ArrowIcon />}
          onClick={() => navigate("/budget")}
        >
          Details
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Budget Spent
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {formatCurrency(budgetStats.spent)} /{" "}
            {formatCurrency(budgetStats.total)}
          </Typography>
        </Box>
        <StyledLinearProgress
          variant="determinate"
          value={(budgetStats.spent / budgetStats.total) * 100}
          color="secondary"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={2}>
        <Box flex={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total Budget
          </Typography>
          <Typography variant="h6" fontWeight="medium">
            {formatCurrency(budgetStats.total)}
          </Typography>
        </Box>

        <Box flex={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Remaining
          </Typography>
          <Typography
            variant="h6"
            fontWeight="medium"
            color={budgetStats.remaining > 0 ? "success.main" : "error.main"}
          >
            {formatCurrency(budgetStats.remaining)}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default BudgetOverviewCard;
