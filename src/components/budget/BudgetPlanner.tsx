import React, { useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  Stack,
} from "@mui/material";
import { useBudgetItems } from "../../hooks/budget/useBudgetItems";
import { useTotalBudget } from "../../hooks/budget/useTotalBudget";
import { useCreateBudgetItem } from "../../hooks/budget/useCreateBudgetItem";
import { useUpdateBudgetItem } from "../../hooks/budget/useUpdateBudgetItem";
import { useDeleteBudgetItem } from "../../hooks/budget/useDeleteBudgetItem";
import BudgetSummary from "./BudgetSummary";
import BudgetTable from "./BudgetTable";
import TotalBudgetEditor from "./TotalBudgetEditor";
import { useUpdateTotalBudget } from "../../hooks/budget/useUpdateTotalBudget";
import { useTranslation } from "../../localization/LocalizationContext";
import { responsivePatterns } from "../../utils/ResponsiveUtils";
import { BudgetItem } from "@wedding-plan/types";

const BudgetPlanner = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Fetch budget items using TanStack Query
  const { data: budgetItems, isLoading, isError } = useBudgetItems();

  const { data: totalBudget, isLoading: isTotalBudgetLoading } =
    useTotalBudget();
  const { mutate: updateTotalBudget } = useUpdateTotalBudget();

  // Budget mutations for create, update, and delete operations
  const { mutate: createBudgetItem } = useCreateBudgetItem();
  const { mutate: updateBudgetItem } = useUpdateBudgetItem();
  const { mutate: deleteBudgetItem } = useDeleteBudgetItem();

  // Handle inline cell updates
  const handleCellUpdate = useCallback(
    (rowId: string | number, field: string, value: any, row: BudgetItem) => {
      updateBudgetItem({
        id: String(rowId),
        data: {
          [field]: value,
        },
      });
    },
    [updateBudgetItem]
  );

  // Handle inline add
  const handleAddRow = useCallback(
    (newRow: Omit<BudgetItem, "id">) => {
      createBudgetItem({
        name: newRow.name,
        group: newRow.group,
        expectedPrice: newRow.expectedPrice,
        actualPrice: newRow.actualPrice,
        downPayment: newRow.downPayment,
        contractsUrls: newRow.contractsUrls || [],
      });
    },
    [createBudgetItem]
  );

  const totals = useMemo(() => {
    const calculateTotals = () => {
      if (!budgetItems || budgetItems.length === 0) {
        return { expected: 0, actual: 0, downPayment: 0, remaining: 0 };
      }

      return budgetItems.reduce(
        (acc, item) => {
          acc.expected += item.expectedPrice || 0;
          acc.actual += item.actualPrice || 0;
          acc.downPayment += item.downPayment || 0;
          acc.remaining += (item.actualPrice || 0) - (item.downPayment || 0);
          return acc;
        },
        { expected: 0, actual: 0, downPayment: 0, remaining: 0 }
      );
    };
    return calculateTotals();
  }, [budgetItems]);

  // Render loading, error, or content
  return (
    <Box sx={responsivePatterns.containerPadding}>
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          ...responsivePatterns.cardPadding,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Stack spacing={4}>
          <Box sx={responsivePatterns.flexColumn}>
            <Typography
              variant="h4"
              component="h1"
              sx={responsivePatterns.headingFont}
            >
              {t("budget.planning")}
            </Typography>
            <TotalBudgetEditor
              totalBudget={totalBudget?.amount ?? 0}
              isLoading={isTotalBudgetLoading}
              onSaveTotalBudget={updateTotalBudget}
            />
          </Box>

          <BudgetSummary
            totals={totals}
            totalBudget={totalBudget?.amount ?? 0}
          />

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
              <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
          ) : isError ? (
            <Typography color="error" align="center">
              {t("budget.errorLoadingBudget")}
            </Typography>
          ) : (
            <BudgetTable
              items={budgetItems || []}
              onCellUpdate={handleCellUpdate}
              onDelete={deleteBudgetItem}
              onAddRow={handleAddRow}
            />
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default BudgetPlanner;
