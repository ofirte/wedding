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
import { useBudgetItems } from "../../hooks/budget/useBudgetItems";
import { useTotalBudget } from "../../hooks/budget/useTotalBudget";
import { useTranslation } from "../../localization/LocalizationContext";

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

const BudgetOverviewCard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: budget } = useBudgetItems();
  const { data: totalBudget } = useTotalBudget();

  const totalSpent =
    budget?.reduce((acc, i) => acc + parseInt(i.actualPrice.toString()), 0) ||
    0;
  const remainingBudget = totalBudget?.amount
    ? totalBudget?.amount - totalSpent
    : 0;

  const budgetStats = {
    total: totalBudget?.amount ?? 0,
    spent: totalSpent,
    remaining: remainingBudget,
  };

  const spentPercentage =
    budgetStats.total > 0 ? (budgetStats.spent / budgetStats.total) * 100 : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            fontSize: "1.1rem",
          }}
        >
          {t("budget.overview")}
        </Typography>
        <Button
          size="small"
          endIcon={<ArrowIcon />}
          onClick={() => navigate("../budget")}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 2,
          }}
        >
          {t("common.details")}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={1.5}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {t("budget.budgetSpent")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color:
                spentPercentage >= 100
                  ? "error.main"
                  : spentPercentage >= 80
                  ? "warning.main"
                  : "primary.main",
            }}
          >
            {formatCurrency(budgetStats.spent)} /{" "}
            {formatCurrency(budgetStats.total)}
          </Typography>
        </Box>
        <StyledLinearProgress
          variant="determinate"
          value={spentPercentage}
          color={
            spentPercentage >= 100
              ? "error"
              : spentPercentage >= 80
              ? "warning"
              : "primary"
          }
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background:
                spentPercentage >= 100
                  ? `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.light})`
                  : spentPercentage >= 80
                  ? `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`
                  : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 2, opacity: 0.3 }} />

      <Stack direction="row" spacing={2}>
        <Box
          flex={1}
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: theme.shadows[2],
              borderColor: theme.palette.primary.main,
            },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ fontWeight: 500, fontSize: "0.8rem" }}
          >
            {t("budget.totalBudget")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              color: theme.palette.text.primary,
            }}
          >
            {formatCurrency(budgetStats.total)}
          </Typography>
        </Box>

        <Box
          flex={1}
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${
              budgetStats.remaining > 0
                ? theme.palette.success.light
                : theme.palette.error.light
            }`,
            background:
              budgetStats.remaining > 0
                ? `linear-gradient(135deg, ${theme.palette.success.main}08 0%, ${theme.palette.success.light}08 100%)`
                : `linear-gradient(135deg, ${theme.palette.error.main}08 0%, ${theme.palette.error.light}08 100%)`,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: theme.shadows[2],
              borderColor:
                budgetStats.remaining > 0
                  ? theme.palette.success.main
                  : theme.palette.error.main,
            },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ fontWeight: 500, fontSize: "0.8rem" }}
          >
            {t("budget.remaining")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              color: budgetStats.remaining > 0 ? "success.main" : "error.main",
            }}
          >
            {formatCurrency(budgetStats.remaining)}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default BudgetOverviewCard;
