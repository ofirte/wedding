import React from "react";
import { Chip, Box, Typography, Avatar, Stack } from "@mui/material";
import { DSTable } from "../common";
import { Column } from "../common/DSTable";
import { useUsersByIds } from "../../hooks/auth/useUsersByIds";
import { UserInfo } from "../../hooks/auth/useUsersInfo";
import {
  WeddingMembers,
  WeddingMemberInput,
  WeddingPlans,
} from "../../api/wedding/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { format } from "date-fns";

interface WeddingMembersTableProps {
  members: WeddingMembers;
}

interface MemberTableRow {
  id: string;
  userId: string;
  user?: UserInfo;
  memberInfo: WeddingMemberInput;
}

export const WeddingMembersTable: React.FC<WeddingMembersTableProps> = ({
  members,
}) => {
  const { t } = useTranslation();

  // Extract user IDs from members
  const userIds = Object.keys(members);
  const { data: users = [], isLoading } = useUsersByIds(userIds);

  // Transform members data for table
  const tableData: MemberTableRow[] = React.useMemo(() => {
    return userIds.map((userId) => ({
      id: userId,
      userId,
      user: users.find((user) => user.uid === userId),
      memberInfo: members[userId],
    }));
  }, [userIds, users, members]);

  const columns: Column<MemberTableRow>[] = [
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
  ];

  const renderMobileCard = (row: MemberTableRow) => (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <Avatar
          src={row.user?.photoURL}
          alt={row.user?.displayName || row.user?.email}
          sx={{ width: 40, height: 40 }}
        >
          {row.user?.displayName?.[0] || row.user?.email?.[0] || "?"}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" fontWeight="medium">
            {row.user?.displayName || t("userManagement.noDisplayName")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.user?.email}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Chip
          label={row.user?.role || "user"}
          size="small"
          variant="outlined"
          color={row.user?.role === "admin" ? "primary" : "default"}
        />
        <Chip
          label={t(`weddingManagement.plans.${row.memberInfo.plan}`)}
          size="small"
          variant="filled"
          color={
            row.memberInfo.plan === WeddingPlans.PAID ? "success" : "default"
          }
        />
      </Stack>
    </Box>
  );

  if (isLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("common.loading")}
      </Typography>
    );
  }

  if (tableData.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("weddingManagement.noWeddings")}
      </Typography>
    );
  }

  return (
    <DSTable
      columns={columns}
      data={tableData}
      renderMobileCard={renderMobileCard}
      mobileCardTitle={(row) =>
        row.user?.displayName || row.user?.email || row.userId
      }
    />
  );
};
