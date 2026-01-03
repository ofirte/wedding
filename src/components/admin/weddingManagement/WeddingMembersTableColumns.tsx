import { Box, Stack } from "@mui/system";
import { UserInfo } from "src/hooks/auth/useUsersInfo";

import { Avatar, Button, Chip, Typography } from "@mui/material";
import { format } from "date-fns";

import { RemoveCircle } from "@mui/icons-material";
import { WeddingMemberInput, WeddingPlans } from "@wedding-plan/types";

export interface MemberTableRow {
  id: string;
  userId: string;
  user?: UserInfo;
  memberInfo: WeddingMemberInput;
}
export const getWeddingMembersTableColumns = (
  onRemoveMember: (userId: string) => void,
  t: (key: string, options?: Record<string, any>) => string
) => {
  return [
    {
      id: "user",
      label: t("weddingManagement.user"),
      render: (row: MemberTableRow) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={row.user?.photoURL}
            alt={row.user?.displayName || row.user?.email}
            sx={{ width: 32, height: 32 }}
          >
            {row.user?.displayName?.[0] || row.user?.email?.[0] || "?"}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {row.user?.displayName || t("userManagement.noDisplayName")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.user?.email}
            </Typography>
          </Box>
        </Stack>
      ),
      mobileLabel: t("weddingManagement.user"),
      showOnMobileCard: true,
    },
    {
      id: "role",
      label: t("userManagement.role"),
      render: (row: MemberTableRow) => (
        <Chip
          label={row.user?.role || "user"}
          size="small"
          variant="outlined"
          color={row.user?.role === "admin" ? "primary" : "default"}
        />
      ),
      mobileLabel: t("userManagement.role"),
      showOnMobileCard: true,
    },
    {
      id: "plan",
      label: t("weddingManagement.membershipPlan"),
      render: (row: MemberTableRow) => (
        <Chip
          label={t(`weddingManagement.plans.${row.memberInfo.plan}`)}
          size="small"
          variant="filled"
          color={
            row.memberInfo.plan === WeddingPlans.PAID ? "success" : "default"
          }
        />
      ),
      mobileLabel: t("weddingManagement.membershipPlan"),
      showOnMobileCard: true,
    },
    {
      id: "addedAt",
      label: t("userManagement.joinedAt"),
      render: (row: MemberTableRow) => (
        <Typography variant="body2" color="text.secondary">
          {format(new Date(row.memberInfo.addedAt), "PPP")}
        </Typography>
      ),
      mobileLabel: t("userManagement.joinedAt"),
      hideOnMobile: true,
    },
    {
      id: "actions",
      label: t("common.actions"),
      render: (row: MemberTableRow) => (
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<RemoveCircle />}
          onClick={() => {
            // Handle remove member action
            onRemoveMember?.(row.userId);
          }}
        >
          {t("common.delete")}
        </Button>
      ),
      mobileLabel: t("common.actions"),
      hideOnMobile: true,
    },
  ];
};
